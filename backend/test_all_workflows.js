const BASE_URL = "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const config = {
    method: options.method || "GET",
    headers,
  };
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${url}`, config);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
};

const runTests = async () => {
  console.log("🚀 Starting Comprehensive End-to-End Platform Verification...\n");
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(
        "   Reason:",
        err.data?.message || err.message || err
      );
      failed++;
    }
  };

  let citizenToken = "";
  let officerToken = "";
  let adminToken = "";
  let testDepartmentId = "";
  let testServiceId = "";
  let generatedTokenId = "";
  let generatedTokenDisplay = "";
  let createdAppId = "";
  let createdAppNumber = "";

  // 1. Health & Offices
  await test("GET /api/offices (Public)", async () => {
    const data = await request("/offices");
    const offices = data.offices || data.data;
    if (!data.success || !offices || !offices.length) throw new Error("No offices found");
  });

  // 2. Service Catalog
  await test("GET /api/service-catalog (Public Service Directory)", async () => {
    const data = await request("/service-catalog");
    const services = data.services || data.data;
    if (!data.success || !services || !services.length) throw new Error("No catalog items");
    const item = services[0];
    testServiceId = item._id;
    testDepartmentId = typeof item.department === "object" ? item.department._id : item.department;
  });

  // 3. Citizen Login
  await test("POST /api/auth/login (Citizen)", async () => {
    const data = await request("/auth/login", {
      method: "POST",
      body: {
        email: "citizen@test.com",
        password: "citizen123",
      },
    });
    if (!data.token) throw new Error("No citizen token returned");
    citizenToken = data.token;
  });

  // 4. Officer Login
  await test("POST /api/auth/login (Officer)", async () => {
    const data = await request("/auth/login", {
      method: "POST",
      body: {
        email: "officer@test.com",
        password: "officer123",
      },
    });
    if (!data.token) throw new Error("No officer token returned");
    officerToken = data.token;
  });

  // 5. Admin Login
  await test("POST /api/auth/login (Admin)", async () => {
    const data = await request("/auth/login", {
      method: "POST",
      body: {
        email: "admin@talukoffice.com",
        password: "admin123",
      },
    });
    if (!data.token) throw new Error("No admin token returned");
    adminToken = data.token;
  });

  // 6. Token Generation with Priority
  await test("POST /api/tokens (Priority Walk-in Token)", async () => {
    try {
      const data = await request("/tokens", {
        method: "POST",
        headers: { Authorization: `Bearer ${citizenToken}` },
        body: {
          department: testDepartmentId,
          service: testServiceId,
          priorityType: "SENIOR_CITIZEN",
        },
      });
      const t = data.token || data.data;
      generatedTokenId = t._id;
      generatedTokenDisplay = t.tokenDisplay;
    } catch (e) {
      // If citizen already has active token, fetch it
      const data = await request("/tokens/my-token", {
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
      const t = data.token || data.data;
      generatedTokenId = t._id;
      generatedTokenDisplay = t.tokenDisplay;
    }
  });

  // 7. Officer Verify Token Priority
  await test("PATCH /api/tokens/:id/verify-priority (Officer Scrutiny)", async () => {
    const data = await request(`/tokens/${generatedTokenId}/verify-priority`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${officerToken}` },
      body: { priorityVerified: true, priorityType: "SENIOR_CITIZEN" },
    });
    if (!data.success) throw new Error("Priority verification failed");
  });

  // 8. Notifications Retrieval & Mark Read
  await test("GET /api/notifications (Citizen In-App Alerts)", async () => {
    const data = await request("/notifications", {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    if (!data.success) throw new Error("Failed to get notifications");
    const notifs = data.data?.notifications || data.notifications || [];
    if (notifs.length > 0) {
      const notifId = notifs[0]._id;
      await request(`/notifications/${notifId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${citizenToken}` },
      });
    }
  });

  // 9. Create Government Service Application
  await test("POST /api/applications (Citizen Online Application)", async () => {
    const data = await request("/applications", {
      method: "POST",
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        department: testDepartmentId,
        service: testServiceId,
        priorityType: "SENIOR_CITIZEN",
        remarks: "Online submission for verification",
      },
    });
    const app = data.data || data.application;
    if (!data.success || !app || !app.applicationNumber) {
      throw new Error("Application creation failed");
    }
    createdAppId = app._id;
    createdAppNumber = app.applicationNumber;
  });

  // 10. Public Tracking Endpoint
  await test("GET /api/applications/track/:query (Public Stepper Tracking)", async () => {
    const data = await request(`/applications/track/${createdAppNumber}`);
    if (!data.success || data.data?.applicationNumber !== createdAppNumber) {
      throw new Error("Tracking query failed");
    }
  });

  // 11. Officer Updates Application Status
  await test("PATCH /api/applications/:id/status (Officer Approval)", async () => {
    const data = await request(`/applications/${createdAppId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${officerToken}` },
      body: { status: "DOCUMENT_VERIFICATION", remarks: "Scrutinizing documents" },
    });
    const app = data.data || data.application;
    if (!data.success || app?.status !== "DOCUMENT_VERIFICATION") {
      throw new Error("Status update failed");
    }
  });

  // 12. Submit Feedback
  await test("POST /api/feedback (Citizen 5-Star Rating)", async () => {
    const data = await request("/feedback", {
      method: "POST",
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        rating: 5,
        comment: "Excellent digital queue management! Fast counter service.",
        department: testDepartmentId,
        service: testServiceId,
      },
    });
    if (!data.success) throw new Error("Feedback submission failed");
  });

  // 13. Admin Feedback Analytics
  await test("GET /api/feedback/analytics (Admin Satisfaction Metrics)", async () => {
    const data = await request("/feedback/analytics", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const summary = data.data?.summary || data.summary;
    if (!data.success || !summary) {
      throw new Error("Feedback analytics retrieval failed");
    }
  });

  console.log(`\n========================================`);
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
};

runTests();
