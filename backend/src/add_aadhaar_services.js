require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Department = require("./models/Department");
const Service = require("./models/Service");
const Officer = require("./models/Officer");
const Counter = require("./models/Counter");

const addAadhaarServices = async () => {
  try {
    console.log("🌱 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("✅ Connected to MongoDB");

    // 1. Department: Aadhaar Services
    let aadhaarDept = await Department.findOne({
      $or: [{ name: "Aadhaar Services" }, { code: "UID" }],
    });

    if (!aadhaarDept) {
      aadhaarDept = await Department.create({
        name: "Aadhaar Services",
        code: "UID",
        description:
          "UIDAI Aadhaar new enrollment, mobile/address update, biometric and demographic corrections",
        isActive: true,
      });
      console.log("✅ Created Department: Aadhaar Services (UID)");
    } else {
      aadhaarDept.name = "Aadhaar Services";
      aadhaarDept.code = "UID";
      aadhaarDept.description =
        "UIDAI Aadhaar new enrollment, mobile/address update, biometric and demographic corrections";
      aadhaarDept.isActive = true;
      await aadhaarDept.save();
      console.log("ℹ️ Updated/Verified Department: Aadhaar Services (UID)");
    }

    // 2. Services under Aadhaar Services
    const aadhaarServicesList = [
      {
        name: "Aadhaar Apply",
        description:
          "Apply for new 12-digit Aadhaar enrollment for citizens and children with biometric capture",
        averageServiceTime: 15,
      },
      {
        name: "Aadhaar Update",
        description:
          "Update mobile number, address, email ID, photo, or biometric details in existing Aadhaar",
        averageServiceTime: 10,
      },
      {
        name: "Aadhaar Correction",
        description:
          "Correction of name spelling, date of birth, gender, and demographic details with documentary proof",
        averageServiceTime: 10,
      },
    ];

    for (const s of aadhaarServicesList) {
      let service = await Service.findOne({
        name: s.name,
        department: aadhaarDept._id,
      });

      if (!service) {
        service = await Service.create({
          name: s.name,
          description: s.description,
          department: aadhaarDept._id,
          averageServiceTime: s.averageServiceTime,
          isActive: true,
        });
        console.log(`✅ Created Service: ${s.name} under Aadhaar Services`);
      } else {
        service.description = s.description;
        service.averageServiceTime = s.averageServiceTime;
        service.isActive = true;
        await service.save();
        console.log(`ℹ️ Verified Service: ${s.name}`);
      }
    }

    // 3. Aadhaar Officer User & Profile
    let aadhaarOfficerUser = await User.findOne({ email: "aadhaar@talukoffice.com" });
    if (!aadhaarOfficerUser) {
      const hashedPassword = await bcrypt.hash("officer123", 10);
      aadhaarOfficerUser = await User.create({
        fullName: "Aadhaar Kendra Officer",
        email: "aadhaar@talukoffice.com",
        phone: "9876543299",
        password: hashedPassword,
        role: "officer",
        isVerified: true,
      });
      console.log("✅ Created Officer user: aadhaar@talukoffice.com / officer123");
    } else {
      console.log("ℹ️ Officer user exists: aadhaar@talukoffice.com");
    }

    let aadhaarOfficerProfile = await Officer.findOne({ employeeId: "UID001" });
    if (!aadhaarOfficerProfile) {
      aadhaarOfficerProfile = await Officer.create({
        user: aadhaarOfficerUser._id,
        department: aadhaarDept._id,
        employeeId: "UID001",
        designation: "UIDAI Kendra Operator",
        isAvailable: true,
        isActive: true,
      });
      console.log("✅ Created Officer profile: UID001 (UIDAI Kendra Operator)");
    } else {
      aadhaarOfficerProfile.department = aadhaarDept._id;
      aadhaarOfficerProfile.designation = "UIDAI Kendra Operator";
      aadhaarOfficerProfile.isAvailable = true;
      aadhaarOfficerProfile.isActive = true;
      await aadhaarOfficerProfile.save();
      console.log("ℹ️ Verified Officer profile: UID001");
    }

    // 4. Counter 5: Aadhaar Kendra Counter 5
    let counter5 = await Counter.findOne({ counterNumber: 5 });
    if (!counter5) {
      counter5 = await Counter.create({
        counterNumber: 5,
        name: "Aadhaar Kendra Counter 5",
        department: aadhaarDept._id,
        officer: aadhaarOfficerProfile._id,
        status: "available",
        isAvailable: true,
        isActive: true,
      });
      console.log("✅ Created Counter: Aadhaar Kendra Counter 5 (#5)");
    } else {
      counter5.name = "Aadhaar Kendra Counter 5";
      counter5.department = aadhaarDept._id;
      counter5.officer = aadhaarOfficerProfile._id;
      counter5.status = "available";
      counter5.isAvailable = true;
      counter5.isActive = true;
      await counter5.save();
      console.log("ℹ️ Verified Counter: #5 assigned to UID001");
    }

    console.log("🎉 Aadhaar Services Department, Services, Officer, and Counter added successfully!");
  } catch (err) {
    console.error("❌ Error adding Aadhaar services:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

addAadhaarServices();
