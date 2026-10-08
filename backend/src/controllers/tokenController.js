const mongoose = require("mongoose");
const Token = require("../models/Token");
const Appointment = require("../models/Appointment");
const Department = require("../models/Department");
const Service = require("../models/Service");
const Counter = require("../models/Counter");
const Officer = require("../models/Officer");
const { notifyQueueUpdate } = require("../sockets/socket");
const {
  notifyTokenGenerated,
  notifyTokenNear,
  notifyTokenCalled,
  notifyServiceStarted,
  notifyServiceCompleted,
} = require("../services/notificationService");

// Helper to get today's start and end timestamps
const getDayBounds = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

// =====================================================
// GENERATE TOKEN (Walk-in or Appointment)
// =====================================================
const generateToken = async (req, res) => {
  try {
    const { appointmentId, department: deptParam, service: serviceParam } = req.body;
    const citizenId = req.user ? req.user._id : req.body.citizen;

    if (!citizenId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    let targetDepartmentId = deptParam;
    let targetServiceId = serviceParam;
    let linkedAppointment = null;

    // Flow 1: From Appointment
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      if (appointment.citizen.toString() !== citizenId.toString() && req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to check in for this appointment",
        });
      }

      if (appointment.status !== "booked" && appointment.status !== "confirmed") {
        return res.status(400).json({
          success: false,
          message: `Cannot generate token for appointment with status: ${appointment.status}`,
        });
      }

      const existingToken = await Token.findOne({ appointment: appointmentId });
      if (existingToken) {
        return res.status(400).json({
          success: false,
          message: "Token already generated for this appointment",
          token: existingToken,
        });
      }

      targetDepartmentId = appointment.department;
      targetServiceId = appointment.service;
      linkedAppointment = appointment;
    }

    // Validation for Department and Service
    if (!targetDepartmentId || !targetServiceId) {
      return res.status(400).json({
        success: false,
        message: "Department and service are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetDepartmentId) || !mongoose.Types.ObjectId.isValid(targetServiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or service ID",
      });
    }

    const department = await Department.findById(targetDepartmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({
        success: false,
        message: "Department not found or inactive",
      });
    }

    const service = await Service.findById(targetServiceId);
    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: "Service not found or inactive",
      });
    }

    if (service.department.toString() !== department._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Service does not belong to the selected department",
      });
    }

    // Check if citizen already has an active token today for this department
    const existingActiveToken = await Token.findOne({
      citizen: citizenId,
      department: department._id,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["waiting", "called", "serving"] },
    });

    if (existingActiveToken) {
      return res.status(400).json({
        success: false,
        message: "You already have an active token for this department today",
        token: existingActiveToken,
      });
    }

    // Calculate next token number for this department today
    const lastToken = await Token.findOne({
      department: department._id,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ tokenNumber: -1 });

    const nextTokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    // Token display format: Department code prefix + 3-digit number (e.g. REV001, ADM002)
    const deptPrefix = department.code
      ? department.code.substring(0, 3).toUpperCase()
      : department.name.replace(/[^a-zA-Z]/g, "").substring(0, 3).toUpperCase() || "TOK";

    const tokenDisplay = `${deptPrefix}${String(nextTokenNumber).padStart(3, "0")}`;

    // Priority handling
    const rawPriority = req.body.priorityType || (linkedAppointment ? linkedAppointment.priorityType : "normal");
    const validPriorities = ["normal", "senior_citizen", "differently_abled", "pregnant_woman", "emergency"];
    const pType = validPriorities.includes(rawPriority) ? rawPriority : "normal";
    const isStaff = req.user && ["officer", "admin"].includes(req.user.role);
    const isPriorityVerified = isStaff && pType !== "normal";

    // Create the token
    const token = await Token.create({
      tokenNumber: nextTokenNumber,
      tokenDisplay,
      citizen: citizenId,
      department: department._id,
      service: service._id,
      office: req.body.office || department.office || null,
      appointment: linkedAppointment ? linkedAppointment._id : null,
      priorityType: pType,
      priorityVerified: isPriorityVerified,
      priorityApprovedBy: isPriorityVerified ? req.user._id : null,
      queueDate: new Date(),
      status: "waiting",
    });

    // If linked to appointment, update appointment status
    if (linkedAppointment) {
      linkedAppointment.status = "checked_in";
      linkedAppointment.checkedInAt = new Date();
      await linkedAppointment.save();
    }

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName email phone")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    // Real-time notification via Socket.IO
    notifyQueueUpdate(department._id, "tokenCreated", populatedToken);

    // Multi-channel notification to citizen
    notifyTokenGenerated(populatedToken, citizenId).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Token generated successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Generate Token Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// =====================================================
// GET CITIZEN'S ACTIVE TOKEN (MY TOKEN)
// =====================================================
const getMyToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startOfDay, endOfDay } = getDayBounds();

    const token = await Token.findOne({
      citizen: userId,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["waiting", "called", "serving"] },
    })
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name")
      .sort({ createdAt: -1 });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: "No active token found",
      });
    }

    // People ahead: verified priority tokens ahead or lower tokenNumber among same priority status
    const isPriority = Boolean(token.priorityVerified);
    const peopleAhead = await Token.countDocuments({
      department: token.department._id,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: "waiting",
      ...(isPriority
        ? { priorityVerified: true, tokenNumber: { $lt: token.tokenNumber } }
        : {
            $or: [
              { priorityVerified: true },
              { priorityVerified: false, tokenNumber: { $lt: token.tokenNumber } },
            ],
          }),
    });

    const averageTime = token.service?.averageServiceTime || 10;
    const estimatedWaitTime = peopleAhead * averageTime;

    return res.status(200).json({
      success: true,
      token: {
        _id: token._id,
        tokenNumber: token.tokenNumber,
        tokenDisplay: token.tokenDisplay,
        status: token.status,
        department: token.department,
        service: token.service,
        counter: token.counter,
        priorityType: token.priorityType || "normal",
        priorityVerified: token.priorityVerified || false,
        calledAt: token.calledAt,
        servingAt: token.servingAt,
        createdAt: token.createdAt,
        peopleAhead,
        estimatedWaitTime,
      },
    });
  } catch (error) {
    console.error("Get My Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET CURRENT QUEUE FOR A DEPARTMENT
// =====================================================
const getQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!departmentId || !mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Valid Department ID is required",
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    const queue = await Token.find({
      department: departmentId,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["waiting", "called", "serving"] },
    })
      .populate("citizen", "fullName phone")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name")
      .sort({ tokenNumber: 1 });

    const currentlyServing = queue.find((t) => t.status === "serving");
    const currentlyCalled = queue.find((t) => t.status === "called");
    const waitingTokens = queue.filter((t) => t.status === "waiting");

    return res.status(200).json({
      success: true,
      count: queue.length,
      currentToken: currentlyServing ? currentlyServing.tokenDisplay : currentlyCalled ? currentlyCalled.tokenDisplay : null,
      currentlyServing: currentlyServing || null,
      currentlyCalled: currentlyCalled || null,
      waitingCount: waitingTokens.length,
      queue,
    });
  } catch (error) {
    console.error("Get Queue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET PUBLIC QUEUE (No private data exposed)
// =====================================================
const getPublicQueue = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const isAll = !departmentId || departmentId === "all";

    const { startOfDay, endOfDay } = getDayBounds();

    let deptFilter = {};
    let targetDept = null;

    if (!isAll) {
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({
          success: false,
          message: "Valid Department ID is required",
        });
      }

      targetDept = await Department.findById(departmentId).select("name code");
      if (!targetDept) {
        return res.status(404).json({
          success: false,
          message: "Department not found",
        });
      }
      deptFilter = { department: departmentId };
    }

    // 1. Fetch active counters
    const counterFilter = { isActive: true };
    if (!isAll) {
      counterFilter.department = departmentId;
    }

    const allCounters = await Counter.find(counterFilter)
      .populate("department", "name code")
      .populate({
        path: "officer",
        select: "designation employeeId",
      })
      .sort({ counterNumber: 1 });

    // 2. Fetch active tokens today
    const tokens = await Token.find({
      ...deptFilter,
      queueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["waiting", "called", "serving"] },
    })
      .select("tokenNumber tokenDisplay status counter service department calledAt servingAt createdAt")
      .populate("counter", "counterNumber name")
      .populate("service", "name averageServiceTime")
      .populate("department", "name code")
      .sort({ tokenNumber: 1 });

    const servingTokens = tokens.filter((t) => t.status === "serving");
    const calledTokens = tokens.filter((t) => t.status === "called");
    const waitingTokens = tokens.filter((t) => t.status === "waiting");

    // Most recently called or updated token
    const latestCalled = calledTokens.length > 0
      ? calledTokens.sort((a, b) => new Date(b.calledAt || 0) - new Date(a.calledAt || 0))[0]
      : null;

    // Attach active token to each counter for the multi-counter board
    const countersWithTokens = allCounters.map((c) => {
      const activeForCounter = tokens.find(
        (t) => t.counter && t.counter._id.toString() === c._id.toString() && (t.status === "called" || t.status === "serving")
      );

      return {
        _id: c._id,
        counterNumber: c.counterNumber,
        name: c.name,
        department: c.department,
        officer: c.officer,
        status: c.status,
        currentToken: activeForCounter
          ? {
              tokenDisplay: activeForCounter.tokenDisplay,
              status: activeForCounter.status,
              serviceName: activeForCounter.service?.name,
              calledAt: activeForCounter.calledAt,
              servingAt: activeForCounter.servingAt,
            }
          : null,
      };
    });

    const averageWait = waitingTokens.length > 0
      ? waitingTokens.length * (tokens[0]?.service?.averageServiceTime || 10)
      : 0;

    return res.status(200).json({
      success: true,
      department: targetDept
        ? { id: targetDept._id, name: targetDept.name, code: targetDept.code }
        : { id: "all", name: "All Taluk Counters", code: "ALL" },
      latestCalled: latestCalled
        ? {
            tokenDisplay: latestCalled.tokenDisplay,
            counterNumber: latestCalled.counter?.counterNumber || "—",
            counterName: latestCalled.counter?.name || "Counter",
            departmentName: latestCalled.department?.name,
            serviceName: latestCalled.service?.name,
            calledAt: latestCalled.calledAt,
          }
        : null,
      nowServing: servingTokens.map((t) => ({
        tokenDisplay: t.tokenDisplay,
        counterNumber: t.counter?.counterNumber || "—",
        counterName: t.counter?.name || "Counter",
        departmentName: t.department?.name,
        serviceName: t.service?.name,
      })),
      nowCalled: calledTokens.map((t) => ({
        tokenDisplay: t.tokenDisplay,
        counterNumber: t.counter?.counterNumber || "—",
        counterName: t.counter?.name || "Counter",
        departmentName: t.department?.name,
        serviceName: t.service?.name,
      })),
      nextTokens: waitingTokens.slice(0, 12).map((t) => ({
        tokenDisplay: t.tokenDisplay,
        departmentName: t.department?.name,
        departmentCode: t.department?.code,
        serviceName: t.service?.name,
        tokenNumber: t.tokenNumber,
      })),
      counters: countersWithTokens,
      waitingCount: waitingTokens.length,
      estimatedWaitMinutes: averageWait,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Public Queue Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// CALL NEXT TOKEN (Officer calls first waiting token)
// =====================================================
const callNextToken = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Identify Officer
    const officer = await Officer.findOne({ user: userId });
    if (!officer || !officer.isActive) {
      return res.status(403).json({
        success: false,
        message: "Active officer profile required",
      });
    }

    if (!officer.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Officer is currently marked as unavailable. Set status to available first.",
      });
    }

    // 2. Identify Assigned Active Counter
    const counter = await Counter.findOne({
      officer: officer._id,
      isActive: true,
    });

    if (!counter) {
      return res.status(400).json({
        success: false,
        message: "No active counter assigned to you. Please contact admin or select a counter.",
      });
    }

    const { startOfDay, endOfDay } = getDayBounds();

    // 3. Ensure Officer/Counter doesn't already have an active called or serving token
    const activeToken = await Token.findOne({
      counter: counter._id,
      status: { $in: ["called", "serving"] },
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    });

    if (activeToken) {
      return res.status(400).json({
        success: false,
        message: `Counter ${counter.counterNumber} currently has an active token (${activeToken.tokenDisplay} - ${activeToken.status}). Complete or skip it before calling the next one.`,
        token: activeToken,
      });
    }

    // 4. Find first waiting token for officer's department (priority verified tokens first, then FIFO)
    const nextToken = await Token.findOne({
      department: officer.department,
      status: "waiting",
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ priorityVerified: -1, tokenNumber: 1 });

    if (!nextToken) {
      return res.status(200).json({
        success: false,
        message: "No waiting tokens",
      });
    }

    // 5. Assign to counter and change status to 'called'
    nextToken.status = "called";
    nextToken.counter = counter._id;
    nextToken.calledAt = new Date();
    await nextToken.save();

    // Mark counter status busy
    counter.status = "busy";
    await counter.save();

    const populatedToken = await Token.findById(nextToken._id)
      .populate("citizen", "fullName phone email")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(officer.department, "tokenCalled", populatedToken);

    // Send instant notification to citizen
    notifyTokenCalled(populatedToken, counter).catch(() => {});

    // Notify citizens next in line (e.g. 1 or 2 ahead)
    Token.find({
      department: officer.department,
      status: "waiting",
      queueDate: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ priorityVerified: -1, tokenNumber: 1 })
      .limit(2)
      .then((upcoming) => {
        upcoming.forEach((ut, idx) => {
          notifyTokenNear(ut, idx + 1).catch(() => {});
        });
      })
      .catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Token called successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Call Next Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// START SERVICE (called -> serving)
// =====================================================
const startService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    const token = await Token.findById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // State machine check
    if (token.status !== "called") {
      return res.status(400).json({
        success: false,
        message: `Cannot start service. Current token status is '${token.status}' (must be 'called')`,
      });
    }

    token.status = "serving";
    token.servingAt = new Date();
    token.startedAt = new Date();
    await token.save();

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName phone email")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(token.department, "serviceStarted", populatedToken);

    // Notify citizen
    notifyServiceStarted(populatedToken, populatedToken.counter).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Service started successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Start Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// COMPLETE SERVICE (serving -> completed)
// =====================================================
const completeService = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    const token = await Token.findById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // State machine check
    if (token.status !== "serving") {
      return res.status(400).json({
        success: false,
        message: `Cannot complete service. Current token status is '${token.status}' (must be 'serving')`,
      });
    }

    token.status = "completed";
    token.completedAt = new Date();
    await token.save();

    // If counter is associated, set it available
    if (token.counter) {
      await Counter.findByIdAndUpdate(token.counter, { status: "available" });
    }

    // If appointment is associated, update appointment status
    if (token.appointment) {
      await Appointment.findByIdAndUpdate(token.appointment, { status: "completed" });
    }

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName phone email")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(token.department, "serviceCompleted", populatedToken);

    // Notify citizen that service is complete
    notifyServiceCompleted(populatedToken, populatedToken.counter).catch(() => {});

    return res.status(200).json({
      success: true,
      message: "Service completed successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Complete Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// SKIP / NO-SHOW TOKEN (called or serving -> skipped)
// =====================================================
const skipToken = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    const token = await Token.findById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    // Allowed transition: called or serving -> skipped
    if (token.status !== "called" && token.status !== "serving") {
      return res.status(400).json({
        success: false,
        message: `Cannot skip token with status '${token.status}'`,
      });
    }

    token.status = "skipped";
    token.cancelledAt = new Date();
    await token.save();

    // Set counter available
    if (token.counter) {
      await Counter.findByIdAndUpdate(token.counter, { status: "available" });
    }

    // Update appointment if exists
    if (token.appointment) {
      await Appointment.findByIdAndUpdate(token.appointment, { status: "no_show" });
    }

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName phone email")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(token.department, "tokenSkipped", populatedToken);

    return res.status(200).json({
      success: true,
      message: "Token marked as skipped",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Skip Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// VERIFY TOKEN PRIORITY (Officer / Admin)
// =====================================================
const verifyTokenPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priorityVerified, priorityType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid token ID",
      });
    }

    const token = await Token.findById(id);
    if (!token) {
      return res.status(404).json({
        success: false,
        message: "Token not found",
      });
    }

    if (priorityType) {
      token.priorityType = priorityType;
    }
    token.priorityVerified = priorityVerified !== undefined ? Boolean(priorityVerified) : true;
    token.priorityApprovedBy = req.user._id;
    await token.save();

    const populatedToken = await Token.findById(token._id)
      .populate("citizen", "fullName phone email")
      .populate("department", "name code")
      .populate("service", "name averageServiceTime")
      .populate("counter", "counterNumber name");

    notifyQueueUpdate(token.department, "tokenUpdated", populatedToken);

    return res.status(200).json({
      success: true,
      message: "Priority status updated successfully",
      token: populatedToken,
    });
  } catch (error) {
    console.error("Verify Priority Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  generateToken,
  getMyToken,
  getQueue,
  getPublicQueue,
  callNextToken,
  startService,
  completeService,
  skipToken,
  verifyTokenPriority,
};