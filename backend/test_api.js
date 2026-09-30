const http = require("http");
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { initSocket } = require("./src/sockets/socket");

const TEST_PORT = 5001;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
    };
    if (dataString) {
      headers["Content-Length"] = Buffer.byteLength(dataString);
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: TEST_PORT,
        path,
        method,
        headers,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(rawData);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on("error", (e) => reject(e));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log("🚀 Starting Comprehensive Backend API Test Suite...\n");

  await connectDB();
  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`📡 Test server running on http://localhost:${TEST_PORT}\n`);

  let testPassed = 0;
  let testFailed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testFailed++;
    }
  }

  try {
    // 1. Root check
    const rootRes = await request("GET", "/");
    assert(rootRes.status === 200 && rootRes.body.success, "Root API health check");

    // 2. Admin Login
    const adminLoginRes = await request("POST", "/api/auth/login", {
      email: "admin@talukoffice.com",
      password: "admin123",
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.token, "Admin login successful");
    const adminToken = adminLoginRes.body.token;

    // 3. Officer Login
    const officerLoginRes = await request("POST", "/api/auth/login", {
      email: "officer@test.com",
      password: "officer123",
    });
    assert(officerLoginRes.status === 200 && officerLoginRes.body.token, "Officer login successful");
    const officerToken = officerLoginRes.body.token;

    // 4. Citizen Registration / Login
    const uniqueEmail = `citizen_${Date.now()}@example.com`;
    const uniquePhone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
    const citizenRegRes = await request("POST", "/api/auth/register", {
      fullName: "Test Citizen",
      email: uniqueEmail,
      phone: uniquePhone,
      password: "password123",
      role: "citizen",
    });
    assert(citizenRegRes.status === 201 && citizenRegRes.body.token, "Citizen registration successful");
    const citizenToken = citizenRegRes.body.token;

    // 5. Citizen Profile
    const profileRes = await request("GET", "/api/citizens/profile", null, citizenToken);
    assert(profileRes.status === 200 && profileRes.body.user.email === uniqueEmail, "Citizen profile fetched");

    // 6. Departments list
    const deptsRes = await request("GET", "/api/departments");
    assert(deptsRes.status === 200 && deptsRes.body.departments.length > 0, "Departments list fetched");
    const revenueDept = deptsRes.body.departments.find((d) => d.name === "Revenue");
    assert(!!revenueDept, "Revenue department exists");

    // 7. Services list by Department
    const servicesRes = await request("GET", `/api/services/department/${revenueDept._id}`);
    assert(servicesRes.status === 200 && servicesRes.body.services.length > 0, "Services for Revenue fetched");
    const incomeService = servicesRes.body.services[0];
    assert(!!incomeService, `Service '${incomeService?.name}' found`);

    // 8. Walk-in Token Generation
    const tokenGenRes = await request(
      "POST",
      "/api/tokens",
      {
        department: revenueDept._id,
        service: incomeService._id,
      },
      citizenToken
    );
    assert(
      tokenGenRes.status === 201 && tokenGenRes.body.token.status === "waiting",
      `Walk-in token generated: ${tokenGenRes.body?.token?.tokenDisplay} (status: waiting)`
    );
    const walkInToken = tokenGenRes.body.token;

    // 9. Citizen View Active Token (my-token)
    const myTokenRes = await request("GET", "/api/tokens/my-token", null, citizenToken);
    assert(
      myTokenRes.status === 200 && myTokenRes.body.token.tokenDisplay === walkInToken.tokenDisplay,
      "Citizen active token fetched with peopleAhead & estimatedWaitTime"
    );

    // 10. Public Queue Display
    const publicQueueRes = await request("GET", `/api/tokens/public/queue/${revenueDept._id}`);
    assert(
      publicQueueRes.status === 200 && Array.isArray(publicQueueRes.body.nextTokens),
      "Public queue display fetched (safe without private info)"
    );

    // 11. Officer Dashboard
    const officerDashRes = await request("GET", "/api/officers/dashboard", null, officerToken);
    assert(
      officerDashRes.status === 200 && officerDashRes.body.dashboard.officer,
      `Officer dashboard fetched (Waiting count: ${officerDashRes.body.dashboard.waitingCount})`
    );

    // 12. Officer Call Next Token
    const callNextRes = await request("POST", "/api/tokens/call-next", {}, officerToken);
    assert(
      callNextRes.status === 200 && callNextRes.body.token.status === "called",
      `Officer called next token: ${callNextRes.body.token.tokenDisplay} (status: called)`
    );
    const calledTokenId = callNextRes.body.token._id;

    // 13. Officer Start Service
    const startServiceRes = await request("POST", `/api/tokens/${calledTokenId}/start`, {}, officerToken);
    assert(
      startServiceRes.status === 200 && startServiceRes.body.token.status === "serving",
      `Service started for token (status: serving)`
    );

    // 14. Officer Complete Service
    const completeServiceRes = await request("POST", `/api/tokens/${calledTokenId}/complete`, {}, officerToken);
    assert(
      completeServiceRes.status === 200 && completeServiceRes.body.token.status === "completed",
      `Service completed for token (status: completed)`
    );

    // 15. Citizen Book Appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const apptBookingRes = await request(
      "POST",
      "/api/appointments",
      {
        department: revenueDept._id,
        service: incomeService._id,
        appointmentDate: tomorrow.toISOString(),
        appointmentTime: "11:30 AM",
        purpose: "Income certificate verification",
      },
      citizenToken
    );
    assert(
      apptBookingRes.status === 201 && apptBookingRes.body.appointment.status === "booked",
      "Appointment booked successfully"
    );
    const bookedAppt = apptBookingRes.body.appointment;

    // 16. Citizen Appointment Check-in (Appointment -> Token)
    const checkInRes = await request("POST", `/api/appointments/${bookedAppt._id}/check-in`, {}, citizenToken);
    assert(
      checkInRes.status === 201 && checkInRes.body.token.tokenDisplay,
      `Appointment check-in generated token: ${checkInRes.body.token.tokenDisplay}`
    );
    const apptToken = checkInRes.body.token;

    // 17. Officer Call Next Token
    const callNextApptRes = await request("POST", "/api/tokens/call-next", {}, officerToken);
    assert(
      callNextApptRes.status === 200 && callNextApptRes.body.token.status === "called",
      `Officer called next token in queue: ${callNextApptRes.body.token.tokenDisplay} (status: called)`
    );
    const secondCalledToken = callNextApptRes.body.token;

    // 18. Officer Skip Token
    const skipRes = await request("POST", `/api/tokens/${secondCalledToken._id}/skip`, {}, officerToken);
    assert(
      skipRes.status === 200 && skipRes.body.token.status === "skipped",
      `Officer skipped token ${secondCalledToken.tokenDisplay} successfully (status: skipped)`
    );

    // 19. Admin Dashboard
    const adminDashRes = await request("GET", "/api/admin/dashboard", null, adminToken);
    assert(
      adminDashRes.status === 200 && typeof adminDashRes.body.stats.totalCitizens === "number",
      `Admin dashboard stats fetched: ${adminDashRes.body.stats.totalCitizens} citizens, ${adminDashRes.body.stats.todayTokens} today tokens`
    );

    // 20. Authorization & Security Tests
    const unauthRes = await request("GET", "/api/admin/dashboard");
    assert(unauthRes.status === 401, "Unauthenticated request to admin dashboard rejected with 401");

    const citizenOnAdminRes = await request("GET", "/api/admin/dashboard", null, citizenToken);
    assert(citizenOnAdminRes.status === 403, "Citizen forbidden from admin dashboard (403)");

    const officerOnAdminRes = await request("GET", "/api/admin/dashboard", null, officerToken);
    assert(officerOnAdminRes.status === 403, "Officer forbidden from admin dashboard (403)");

    const citizenCallNextRes = await request("POST", "/api/tokens/call-next", {}, citizenToken);
    assert(citizenCallNextRes.status === 403, "Citizen forbidden from officer call-next (403)");

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${testPassed} Passed, ${testFailed} Failed`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
  } finally {
    server.close();
    process.exit(testFailed > 0 ? 1 : 0);
  }
}

runTests();
