require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Department = require("./models/Department");
const Service = require("./models/Service");
const Officer = require("./models/Officer");
const Counter = require("./models/Counter");

const seedDatabase = async () => {
  try {
    console.log("🌱 Connecting to MongoDB Atlas for seeding...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database");

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
      departmentMap[d.name] = dept;
    }

    // 3. Services
    const servicesData = [
      // Revenue Services
      {
        departmentName: "Revenue",
        name: "Income Certificate",
        description: "Verification and processing of official family income certificate",
        averageServiceTime: 10,
      },
      {
        departmentName: "Revenue",
        name: "Patta Related Service",
        description: "Patta transfer, sub-division, name correction, and chitta extract",
        averageServiceTime: 15,
      },
      {
        departmentName: "Revenue",
        name: "Revenue Petition",
        description: "Submission and hearing of public revenue grievance petitions",
        averageServiceTime: 12,
      },

      // Certificates Services
      {
        departmentName: "Certificates",
        name: "Community Certificate",
        description: "Official verification and issuance of caste/community certificate",
        averageServiceTime: 10,
      },
      {
        departmentName: "Certificates",
        name: "Nativity Certificate",
        description: "Proof of nativity and permanent domicile verification",
        averageServiceTime: 8,
      },
      {
        departmentName: "Certificates",
        name: "Residence Certificate",
        description: "Proof of address and continuous residency verification",
        averageServiceTime: 8,
      },

      // Social Welfare Services
      {
        departmentName: "Social Welfare",
        name: "Old Age Pension Scheme",
        description: "Application and verification for monthly old age pension benefits",
        averageServiceTime: 15,
      },
      {
        departmentName: "Social Welfare",
        name: "Disability Welfare Assistance",
        description: "Aids, appliances and disability pension verification",
        averageServiceTime: 12,
      },

      // Taluk Administration Services
      {
        departmentName: "Taluk Administration",
        name: "Grievance Redressal",
        description: "Public petition submission to Tahsildar / Taluk Officers",
        averageServiceTime: 15,
      },
      {
        departmentName: "Taluk Administration",
        name: "Other Government Services",
        description: "Enquiry and guidance for miscellaneous taluk services",
        averageServiceTime: 10,
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
          description: s.description,
          department: dept._id,
          averageServiceTime: s.averageServiceTime,
          isActive: true,
        });
        console.log(`✅ Created Service: ${s.name} under ${s.departmentName}`);
      } else {
        console.log(`ℹ️ Service already exists: ${s.name}`);
      }
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
