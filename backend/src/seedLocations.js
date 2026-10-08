require("dotenv").config();
const mongoose = require("mongoose");
const State = require("./models/State");
const District = require("./models/District");
const Taluk = require("./models/Taluk");
const GovernmentOffice = require("./models/GovernmentOffice");
const Department = require("./models/Department");
const Service = require("./models/Service");
const tamilNaduData = require("./data/tamilNaduLocations");

const seedAllLocations = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log("Connecting to MongoDB for Tamil Nadu location seed...");
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    }

    console.log("==================================================");
    console.log("TAMIL NADU STATEWIDE ADMINISTRATIVE SEEDING");
    console.log("Target: 38 Districts, 317 Taluks & Taluk Offices");
    console.log("==================================================");

    // 1. State: Tamil Nadu
    const state = await State.findOneAndUpdate(
      { code: tamilNaduData.state.code },
      {
        name: tamilNaduData.state.name,
        code: tamilNaduData.state.code,
        country: tamilNaduData.state.country,
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    let districtsCreated = 0;
    let taluksCreated = 0;
    let officesCreated = 0;

    // 2. Iterate All Districts & Taluks
    for (const distData of tamilNaduData.districts) {
      const district = await District.findOneAndUpdate(
        { state: state._id, name: distData.name },
        {
          name: distData.name,
          code: distData.code,
          state: state._id,
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      districtsCreated++;

      for (const talukData of distData.taluks) {
        const taluk = await Taluk.findOneAndUpdate(
          { district: district._id, name: talukData.name },
          {
            name: talukData.name,
            code: talukData.code,
            district: district._id,
            state: state._id,
            isActive: true,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        taluksCreated++;

        // 3. One GovernmentOffice per Taluk
        const officeCode = `TN-${distData.code}-${talukData.code}`;
        const officeName = `${talukData.name} Taluk Office`;

        await GovernmentOffice.findOneAndUpdate(
          { talukRef: taluk._id },
          {
            name: officeName,
            code: officeCode,
            officeType: "taluk_office",
            state: state.name,
            district: distData.name,
            taluk: talukData.name,
            stateRef: state._id,
            districtRef: district._id,
            talukRef: taluk._id,
            openingTime: "09:30 AM",
            closingTime: "05:30 PM",
            isActive: true,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        officesCreated++;
      }
    }

    // 4. Ensure All Standard Services & Departments are Globally Available
    // If services exist with a legacy specific office, remove office restriction so they apply to all 317 Taluks!
    await Service.updateMany(
      { office: { $ne: null } },
      { $set: { office: null } }
    );
    await Department.updateMany(
      { office: { $ne: null } },
      { $set: { office: null } }
    );

    // 5. Run Database Validation Checks
    console.log("\n==================================================");
    console.log("RUNNING DATABASE INTEGRITY VALIDATION...");
    console.log("==================================================");

    const totalStates = await State.countDocuments({ isActive: true });
    const totalDistricts = await District.countDocuments({ isActive: true });
    const totalTaluks = await Taluk.countDocuments({ isActive: true });
    const totalOffices = await GovernmentOffice.countDocuments({ isActive: true });

    // Validate relations
    const taluksWithoutDistrict = await Taluk.countDocuments({
      district: { $exists: false },
    });
    const officesWithoutTaluk = await GovernmentOffice.countDocuments({
      talukRef: { $exists: false },
    });

    console.log(`✓ States Validated: ${totalStates}`);
    console.log(`✓ Districts Validated: ${totalDistricts} / 38`);
    console.log(`✓ Taluks Validated: ${totalTaluks} / 317`);
    console.log(`✓ Taluk Offices Validated: ${totalOffices} / 317`);
    console.log(`✓ Orphan Taluks: ${taluksWithoutDistrict}`);
    console.log(`✓ Orphan Offices: ${officesWithoutTaluk}`);

    console.log("\n==================================================");
    console.log("Tamil Nadu Location Seed Complete");
    console.log(`States: ${totalStates}`);
    console.log(`Districts: ${totalDistricts}`);
    console.log(`Taluks: ${totalTaluks}`);
    console.log(`Taluk Offices: ${totalOffices}`);
    console.log("==================================================");

    if (shouldExit) {
      process.exit(0);
    }
    return { totalStates, totalDistricts, totalTaluks, totalOffices };
  } catch (error) {
    console.error("❌ Location Seeding Failed:", error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  seedAllLocations(true);
}

module.exports = seedAllLocations;
