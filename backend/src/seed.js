require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Department = require("./models/Department");
const Service = require("./models/Service");
const Officer = require("./models/Officer");
const Counter = require("./models/Counter");
const GovernmentOffice = require("./models/GovernmentOffice");

const seedDatabase = async () => {
  try {
    console.log("🌱 Connecting to MongoDB Atlas for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

    // 0. Seed Default Government Office
    let defaultOffice = await GovernmentOffice.findOne({ code: "TALUK_HQ" });
    if (!defaultOffice) {
      defaultOffice = await GovernmentOffice.create({
        name: "Taluk Office - Kovilpatti",
        code: "TALUK_HQ",
        officeType: "TALUK_OFFICE",
        description: "Primary taluk administrative headquarters providing revenue, certificates, and welfare services.",
        address: "Taluk Office Road, Kovilpatti",
        district: "Thoothukudi",
        taluk: "Kovilpatti",
        contactPhone: "04632-220100",
        email: "tahsildar.kvp@tn.gov.in",
        openingTime: "09:30 AM",
        closingTime: "05:30 PM",
        workingDays: "Monday to Friday",
        isActive: true,
      });
      console.log("✅ Created Government Office: Taluk Office - Kovilpatti (TALUK_HQ)");
    } else {
      console.log("ℹ️ Government Office exists: " + defaultOffice.name);
    }

    // 1. Admin User
    let adminUser = await User.findOne({ email: "admin@talukoffice.com" });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      adminUser = await User.create({
        fullName: "Taluk Administrator",
        email: "admin@talukoffice.com",
        phone: "9876543210",
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Created Admin user: admin@talukoffice.com / admin123");
    } else {
      console.log("ℹ️ Admin user already exists: admin@talukoffice.com");
    }

    // 2. Departments
    const departmentsData = [
      {
        name: "Revenue",
        code: "REV",
        description: "Handles land records, patta, income and community certificates, and revenue disputes",
      },
      {
        name: "Taluk Administration",
        code: "ADM",
        description: "General taluk administration, public petitions, elections and grievance redressal",
      },
      {
        name: "Social Welfare",
        code: "WEL",
        description: "Senior citizen pensions, disability assistance, scholarships and welfare schemes",
      },
      {
        name: "Certificates",
        code: "CERT",
        description: "Issuance of nativity, residence, legal heir, first graduate and community certificates",
      },
      {
        name: "Aadhaar Services",
        code: "UID",
        description: "UIDAI Aadhaar new enrollment, mobile/address update, biometric and demographic corrections",
      },
    ];

    const departmentMap = {};

    for (const d of departmentsData) {
      let dept = await Department.findOne({ name: d.name });
      if (!dept) {
        dept = await Department.create({
          name: d.name,
          code: d.code,
          description: d.description,
          isActive: true,
        });
        console.log(`✅ Created Department: ${d.name} (${d.code})`);
      } else {
        // Ensure code is updated if missing
        if (!dept.code) {
          dept.code = d.code;
          await dept.save();
        }
        console.log(`ℹ️ Department already exists: ${d.name} (${dept.code})`);
      }
      dept.office = defaultOffice._id;
      await dept.save();
      departmentMap[d.name] = dept;
    }

    // 3. Services
    const servicesData = [
      // Revenue Services
      {
        departmentName: "Revenue",
        name: "Income Certificate",
        code: "REV_INC",
        description: "Verification and processing of official family income certificate",
        averageServiceTime: 10,
        fee: 60,
        expectedProcessingDays: 3,
        requiredDocuments: ["Aadhaar Card", "Salary Certificate / Pay Slip", "Ration Card", "Self Declaration Affidavit"],
      },
      {
        departmentName: "Revenue",
        name: "Patta Related Service",
        code: "REV_PATTA",
        description: "Patta transfer, sub-division, name correction, and chitta extract",
        averageServiceTime: 15,
        fee: 0,
        expectedProcessingDays: 15,
        requiredDocuments: ["Sale Deed / Registered Document", "Previous Patta Copy", "EC (Encumbrance Certificate)", "Aadhaar Card"],
      },
      {
        departmentName: "Revenue",
        name: "Revenue Petition",
        code: "REV_PET",
        description: "Submission and hearing of public revenue grievance petitions",
        averageServiceTime: 12,
        fee: 0,
        expectedProcessingDays: 14,
        requiredDocuments: ["Petition Representation Letter", "Supporting Property / Identity Proofs"],
      },

      // Certificates Services
      {
        departmentName: "Certificates",
        name: "Community Certificate",
        code: "CERT_COMM",
        description: "Official verification and issuance of caste/community certificate",
        averageServiceTime: 10,
        fee: 60,
        expectedProcessingDays: 7,
        requiredDocuments: ["Father / Mother Community Certificate", "School Transfer Certificate (TC)", "Ration Card", "Aadhaar Card"],
      },
      {
        departmentName: "Certificates",
        name: "Nativity Certificate",
        code: "CERT_NAT",
        description: "Proof of nativity and permanent domicile verification",
        averageServiceTime: 8,
        fee: 60,
        expectedProcessingDays: 5,
        requiredDocuments: ["Birth Certificate", "Parent Proof of Residence (5+ years)", "Aadhaar Card", "Ration Card"],
      },
      {
        departmentName: "Certificates",
        name: "Residence Certificate",
        code: "CERT_RES",
        description: "Proof of address and continuous residency verification",
        averageServiceTime: 8,
        fee: 60,
        expectedProcessingDays: 5,
        requiredDocuments: ["EB Electricity Bill / Water Bill", "Rental Agreement / Property Tax Receipt", "Aadhaar Card"],
      },

      // Social Welfare Services
      {
        departmentName: "Social Welfare",
        name: "Old Age Pension Scheme",
        code: "WEL_OAP",
        description: "Application and verification for monthly old age pension benefits",
        averageServiceTime: 15,
        fee: 0,
        expectedProcessingDays: 30,
        requiredDocuments: ["Age Proof (Aadhaar / Voter ID - 60+ Years)", "Income Certificate (Below Poverty Line)", "Bank Passbook Copy"],
      },
      {
        departmentName: "Social Welfare",
        name: "Disability Welfare Assistance",
        code: "WEL_DIS",
        description: "Aids, appliances and disability pension verification",
        averageServiceTime: 12,
        fee: 0,
        expectedProcessingDays: 21,
        requiredDocuments: ["Medical Board Disability Certificate (40%+)", "Aadhaar Card", "Bank Account Details", "Passport Size Photos"],
      },

      // Taluk Administration Services
      {
        departmentName: "Taluk Administration",
        name: "Grievance Redressal",
        code: "ADM_GRIEV",
        description: "Public petition submission to Tahsildar / Taluk Officers",
        averageServiceTime: 15,
        fee: 0,
        expectedProcessingDays: 15,
        requiredDocuments: ["Grievance Application Letter", "Identity Proof", "Prior Complaint Acknowledgements"],
      },
      {
        departmentName: "Taluk Administration",
        name: "Other Government Services",
        code: "ADM_GEN",
        description: "Enquiry and guidance for miscellaneous taluk services",
        averageServiceTime: 10,
        fee: 0,
        expectedProcessingDays: 7,
        requiredDocuments: ["Aadhaar Card", "Requisition Letter"],
      },

      // Aadhaar Services
      {
        departmentName: "Aadhaar Services",
        name: "Aadhaar Apply",
        code: "UID_ENROLL",
        description: "Apply for new 12-digit Aadhaar enrollment for citizens and children with biometric capture",
        averageServiceTime: 15,
        fee: 0,
        expectedProcessingDays: 15,
        requiredDocuments: ["Proof of Identity (POI)", "Proof of Address (POA)", "Proof of Date of Birth (DOB)"],
      },
      {
        departmentName: "Aadhaar Services",
        name: "Aadhaar Update",
        code: "UID_UPDATE",
        description: "Update mobile number, address, email ID, photo, or biometric details in existing Aadhaar",
        averageServiceTime: 10,
        fee: 50,
        expectedProcessingDays: 7,
        requiredDocuments: ["Existing Aadhaar Card Copy", "Valid Supporting Document for Updated Field", "Active Mobile for OTP"],
      },
      {
        departmentName: "Aadhaar Services",
        name: "Aadhaar Correction",
        code: "UID_CORRECT",
        description: "Correction of name spelling, date of birth, gender, and demographic details with documentary proof",
        averageServiceTime: 10,
        fee: 50,
        expectedProcessingDays: 7,
        requiredDocuments: ["Gazette Notification / Birth Certificate (for name/DOB)", "Valid POI Document", "Existing Aadhaar"],
      },
    ];

    for (const s of servicesData) {
      const dept = departmentMap[s.departmentName];
      if (!dept) continue;

      let service = await Service.findOne({
        name: s.name,
        department: dept._id,
      });

      if (!service) {
        service = await Service.create({
          name: s.name,
          code: s.code,
          description: s.description,
          department: dept._id,
          office: defaultOffice._id,
          averageServiceTime: s.averageServiceTime,
          fee: s.fee,
          expectedProcessingDays: s.expectedProcessingDays,
          requiredDocuments: s.requiredDocuments,
          walkInAvailable: true,
          appointmentAvailable: true,
          priorityEligible: true,
          isActive: true,
        });
        console.log(`✅ Created Service: ${s.name} under ${s.departmentName}`);
      } else {
        service.office = defaultOffice._id;
        service.code = s.code || service.code;
        service.fee = s.fee !== undefined ? s.fee : service.fee;
        service.expectedProcessingDays = s.expectedProcessingDays || 7;
        service.requiredDocuments = s.requiredDocuments || service.requiredDocuments;
        service.walkInAvailable = true;
        service.appointmentAvailable = true;
        service.priorityEligible = true;
        await service.save();
        console.log(`ℹ️ Service updated with catalog metadata: ${s.name}`);
      }
    }

    // 4. Test Citizen User (Arun Kumar)
    let testCitizen = await User.findOne({ email: "citizen@test.com" });
    if (!testCitizen) {
      const hashedCitizenPassword = await bcrypt.hash("citizen123", 10);
      testCitizen = await User.create({
        fullName: "Arun Kumar",
        email: "citizen@test.com",
        phone: "9876543222",
        password: hashedCitizenPassword,
        role: "citizen",
        isVerified: true,
      });
      console.log("✅ Created Test Citizen user: citizen@test.com / citizen123");
    } else {
      console.log("ℹ️ Test Citizen exists: citizen@test.com");
    }

    // 4. Test Officer Check & Assignment
    // Check if Test Officer (officer@test.com) exists
    let testOfficerUser = await User.findOne({ email: "officer@test.com" });
    if (!testOfficerUser) {
      const hashedOfficerPassword = await bcrypt.hash("officer123", 10);
      testOfficerUser = await User.create({
        fullName: "Test Officer",
        email: "officer@test.com",
        phone: "9876543211",
        password: hashedOfficerPassword,
        role: "officer",
        isVerified: true,
      });
      console.log("✅ Created Test Officer user: officer@test.com / officer123");
    }

    let testOfficerProfile = await Officer.findOne({ employeeId: "OFF002" });
    if (!testOfficerProfile) {
      testOfficerProfile = await Officer.create({
        user: testOfficerUser._id,
        department: departmentMap["Revenue"]._id,
        employeeId: "OFF002",
        designation: "Revenue Officer",
        isAvailable: true,
        isActive: true,
      });
      console.log("✅ Created Test Officer profile: OFF002");
    } else {
      // Ensure officer is marked available and active
      testOfficerProfile.isAvailable = true;
      testOfficerProfile.isActive = true;
      await testOfficerProfile.save();
      console.log("ℹ️ Test Officer profile verified: OFF002");
    }

    // Check Aadhaar Kendra Officer (aadhaar@talukoffice.com)
    let aadhaarOfficerUser = await User.findOne({ email: "aadhaar@talukoffice.com" });
    if (!aadhaarOfficerUser) {
      const hashedAadhaarPassword = await bcrypt.hash("officer123", 10);
      aadhaarOfficerUser = await User.create({
        fullName: "Aadhaar Kendra Officer",
        email: "aadhaar@talukoffice.com",
        phone: "9876543299",
        password: hashedAadhaarPassword,
        role: "officer",
        isVerified: true,
      });
      console.log("✅ Created Aadhaar Officer user: aadhaar@talukoffice.com / officer123");
    }

    let aadhaarOfficerProfile = await Officer.findOne({ employeeId: "UID001" });
    if (!aadhaarOfficerProfile) {
      aadhaarOfficerProfile = await Officer.create({
        user: aadhaarOfficerUser._id,
        department: departmentMap["Aadhaar Services"]._id,
        employeeId: "UID001",
        designation: "UIDAI Kendra Operator",
        isAvailable: true,
        isActive: true,
      });
      console.log("✅ Created Aadhaar Officer profile: UID001");
    } else {
      aadhaarOfficerProfile.isAvailable = true;
      aadhaarOfficerProfile.isActive = true;
      await aadhaarOfficerProfile.save();
      console.log("ℹ️ Aadhaar Officer profile verified: UID001");
    }

    // 5. Counters
    const countersData = [
      {
        counterNumber: 1,
        name: "Revenue Counter 1",
        departmentName: "Revenue",
        assignOfficerId: testOfficerProfile._id,
      },
      {
        counterNumber: 2,
        name: "Taluk Admin Counter 2",
        departmentName: "Taluk Administration",
      },
      {
        counterNumber: 3,
        name: "Social Welfare Counter 3",
        departmentName: "Social Welfare",
      },
      {
        counterNumber: 4,
        name: "Certificates Counter 4",
        departmentName: "Certificates",
      },
      {
        counterNumber: 5,
        name: "Aadhaar Kendra Counter 5",
        departmentName: "Aadhaar Services",
        assignOfficerId: aadhaarOfficerProfile._id,
      },
    ];

    for (const c of countersData) {
      const dept = departmentMap[c.departmentName];
      if (!dept) continue;

      let counter = await Counter.findOne({ counterNumber: c.counterNumber });
      if (!counter) {
        counter = await Counter.create({
          counterNumber: c.counterNumber,
          name: c.name,
          department: dept._id,
          officer: c.assignOfficerId || null,
          status: c.assignOfficerId ? "available" : "closed",
          isAvailable: true,
          isActive: true,
        });
        console.log(`✅ Created Counter: ${c.name} (#${c.counterNumber})`);
      } else {
        // Ensure Counter 1 is assigned to Test Officer if it was empty or unassigned
        if (c.counterNumber === 1 && (!counter.officer || counter.officer.toString() !== testOfficerProfile._id.toString())) {
          counter.officer = testOfficerProfile._id;
          counter.status = "available";
          counter.isAvailable = true;
          await counter.save();
          console.log(`✅ Assigned Test Officer (OFF002) to Counter 1`);
        }
        console.log(`ℹ️ Counter already exists: #${counter.counterNumber}`);
      }
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seed Database Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
