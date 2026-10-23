require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("./models/Department");
const Service = require("./models/Service");
const GovernmentOffice = require("./models/GovernmentOffice");

const newServices = [
  {
    departmentName: "Certificates",
    name: "Legal Heir Certificate",
    code: "CERT_HEIR",
    description:
      "Verification and issuance of official legal heir certificate for succession, family property transfer, insurance, and bank claim settlements",
    averageServiceTime: 15,
    fee: 60,
    expectedProcessingDays: 15,
    requiredDocuments: [
      "Deceased Person Death Certificate (Original)",
      "Aadhaar Card & Photo ID of all Legal Heirs",
      "Smart Family Ration Card / Civil Supplies Proof",
      "Legal Heir Application with Self-Declaration Affidavit",
      "Birth / Marriage Certificates establishing relationship",
    ],
  },
  {
    departmentName: "Certificates",
    name: "First Graduate Certificate",
    code: "CERT_GRAD",
    description:
      "Certification for eligible students who are the first generation in their family to pursue higher education for government college tuition fee concessions",
    averageServiceTime: 10,
    fee: 60,
    expectedProcessingDays: 7,
    requiredDocuments: [
      "Applicant Transfer Certificate (TC) & 10th/12th Marksheets",
      "Parents Transfer Certificate / Educational Qualification Proof",
      "Family Smart Ration Card",
      "Applicant & Parents Aadhaar Cards",
      "Self-Declaration regarding no prior graduate in family",
    ],
  },
  {
    departmentName: "Social Welfare",
    name: "Destitute Widow Certificate",
    code: "WEL_WIDOW",
    description:
      "Verification and issuance of Destitute Widow status certificate for government social assistance, priority employment, and pension benefits",
    averageServiceTime: 12,
    fee: 0,
    expectedProcessingDays: 14,
    requiredDocuments: [
      "Husband's Official Death Certificate",
      "Applicant Age Proof (Aadhaar / Voter ID)",
      "Income Certificate (Below Poverty Line proof)",
      "Legal Heir Certificate / Family Smart Card",
      "Recent Passport Size Photographs",
    ],
  },
  {
    departmentName: "Revenue",
    name: "Patta Transfer - Name Change & Sub-division",
    code: "REV_TRANS",
    description:
      "Application for updating registered land owner name in revenue records, title mutation, and field measurement sub-division",
    averageServiceTime: 15,
    fee: 100,
    expectedProcessingDays: 21,
    requiredDocuments: [
      "Registered Sale Deed / Title Deed Copy",
      "Previous Patta & Chitta Extract",
      "Encumbrance Certificate (EC) for 30 years",
      "FMB (Field Measurement Book) Sketch Copy",
      "Applicant Aadhaar & Property Tax Receipt",
    ],
  },
  {
    departmentName: "Social Welfare",
    name: "Inter-Caste Marriage Assistance Scheme",
    code: "WEL_MARR",
    description:
      "Financial assistance, 8g gold coin incentive, and welfare certificate for inter-caste married couples under Dr. Muthulakshmi Reddy Ninaivu Scheme",
    averageServiceTime: 12,
    fee: 0,
    expectedProcessingDays: 30,
    requiredDocuments: [
      "Marriage Registration Certificate",
      "Community Certificates of Bride & Groom",
      "Joint Bank Savings Account Passbook",
      "Age Proof (18+ Bride, 21+ Groom - 10th TC / Aadhaar)",
      "Joint Wedding Photograph",
    ],
  },
];

async function run() {
  try {
    console.log("🌱 Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!");

    const defaultOffice = await GovernmentOffice.findOne({ code: "TALUK_HQ" });

    for (const s of newServices) {
      const dept = await Department.findOne({ name: s.departmentName });
      if (!dept) {
        console.warn(`⚠️ Department not found: ${s.departmentName}`);
        continue;
      }

      let existing = await Service.findOne({
        name: s.name,
        department: dept._id,
      });

      if (!existing) {
        existing = await Service.create({
          name: s.name,
          code: s.code,
          description: s.description,
          department: dept._id,
          office: defaultOffice ? defaultOffice._id : null,
          averageServiceTime: s.averageServiceTime,
          fee: s.fee,
          expectedProcessingDays: s.expectedProcessingDays,
          requiredDocuments: s.requiredDocuments,
          walkInAvailable: true,
          appointmentAvailable: true,
          priorityEligible: true,
          isActive: true,
        });
        console.log(`✅ Created Service: "${s.name}" (${s.code}) under [${s.departmentName}]`);
      } else {
        existing.code = s.code;
        existing.description = s.description;
        existing.averageServiceTime = s.averageServiceTime;
        existing.fee = s.fee;
        existing.expectedProcessingDays = s.expectedProcessingDays;
        existing.requiredDocuments = s.requiredDocuments;
        existing.walkInAvailable = true;
        existing.appointmentAvailable = true;
        existing.priorityEligible = true;
        existing.isActive = true;
        if (defaultOffice && !existing.office) {
          existing.office = defaultOffice._id;
        }
        await existing.save();
        console.log(`ℹ️ Updated Service: "${s.name}" (${s.code}) under [${s.departmentName}]`);
      }
    }

    const total = await Service.countDocuments({ isActive: true });
    console.log(`\n🎉 Success! Total active government services now in catalog: ${total}`);
  } catch (err) {
    console.error("❌ Error adding services:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

run();
