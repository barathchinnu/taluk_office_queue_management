const mongoose = require("mongoose");
const State = require("../models/State");
const District = require("../models/District");
const Taluk = require("../models/Taluk");
const GovernmentOffice = require("../models/GovernmentOffice");
const Department = require("../models/Department");
const Service = require("../models/Service");

const seedAllLocations = require("../seedLocations");

const seedInitialLocations = async () => {
  try {
    const existingState = await State.findOne({ code: "TN" });
    const count = await Taluk.countDocuments();
    if (existingState && count >= 317) return existingState;

    console.log("📍 Initializing authoritative Tamil Nadu 38-District 317-Taluk hierarchy...");
    await seedAllLocations(false);
    return await State.findOne({ code: "TN" });
  } catch (err) {
    console.error("Location Seeding Error:", err);
  }
};

    console.log("✅ Tamil Nadu location hierarchy initialized successfully!");
    return tnState;
  } catch (err) {
    console.error("Location Seeding Error:", err);
  }
};

// =====================================================
// GET STATES
// =====================================================
const getStates = async (req, res) => {
  try {
    let states = await State.find({ isActive: true }).sort({ name: 1 });

    if (states.length === 0) {
      await seedInitialLocations();
      states = await State.find({ isActive: true }).sort({ name: 1 });
    }

    return res.status(200).json({
      success: true,
      count: states.length,
      data: states,
      states,
    });
  } catch (error) {
    console.error("Get States Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET DISTRICTS BY STATE
// =====================================================
const getDistrictsByState = async (req, res) => {
  try {
    const { stateId } = req.params;

    let query = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(stateId)) {
      query.state = stateId;
    } else {
      // Allow searching by state code or name
      const stateDoc = await State.findOne({
        $or: [{ code: stateId.toUpperCase() }, { name: new RegExp(`^${stateId}$`, "i") }],
      });
      if (stateDoc) {
        query.state = stateDoc._id;
      }
    }

    const districts = await District.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: districts.length,
      data: districts,
      districts,
    });
  } catch (error) {
    console.error("Get Districts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET TALUKS BY DISTRICT
// =====================================================
const getTaluksByDistrict = async (req, res) => {
  try {
    const { districtId } = req.params;

    let query = { isActive: true };
    if (mongoose.Types.ObjectId.isValid(districtId)) {
      query.district = districtId;
    } else {
      const distDoc = await District.findOne({
        $or: [{ code: districtId.toUpperCase() }, { name: new RegExp(`^${districtId}$`, "i") }],
      });
      if (distDoc) {
        query.district = distDoc._id;
      }
    }

    const taluks = await Taluk.find(query).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: taluks.length,
      data: taluks,
      taluks,
    });
  } catch (error) {
    console.error("Get Taluks Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// GET OFFICES BY TALUK
// =====================================================
const getOfficesByTaluk = async (req, res) => {
  try {
    const { talukId } = req.params;

    let query = { isActive: true };

    if (mongoose.Types.ObjectId.isValid(talukId)) {
      const talukDoc = await Taluk.findById(talukId);
      if (talukDoc) {
        query.$or = [
          { talukRef: talukDoc._id },
          { taluk: new RegExp(`^${talukDoc.name}$`, "i") },
        ];
      } else {
        query.talukRef = talukId;
      }
    } else {
      query.taluk = new RegExp(`^${talukId}$`, "i");
    }

    let offices = await GovernmentOffice.find(query).sort({ name: 1 });

    if (offices.length === 0 && mongoose.Types.ObjectId.isValid(talukId)) {
      const talukDoc = await Taluk.findById(talukId).populate("district state");
      if (talukDoc) {
        const officeCode = `TN-${talukDoc.district?.code || "DIST"}-${talukDoc.code}`;
        const newOffice = await GovernmentOffice.create({
          name: `${talukDoc.name} Taluk Office`,
          code: officeCode,
          officeType: "taluk_office",
          state: talukDoc.state?.name || "Tamil Nadu",
          district: talukDoc.district?.name || "",
          taluk: talukDoc.name,
          stateRef: talukDoc.state?._id,
          districtRef: talukDoc.district?._id,
          talukRef: talukDoc._id,
          openingTime: "09:30 AM",
          closingTime: "05:30 PM",
          isActive: true,
        });
        offices = [newOffice];
      }
    }

    return res.status(200).json({
      success: true,
      count: offices.length,
      data: offices,
      offices,
    });
  } catch (error) {
    console.error("Get Offices by Taluk Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =====================================================
// CREATE STATE (Admin)
// =====================================================
const createState = async (req, res) => {
  try {
    const { name, code, country } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Name and code are required" });
    }

    const existing = await State.findOne({
      $or: [{ code: code.trim().toUpperCase() }, { name: name.trim() }],
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "State already exists" });
    }

    const state = await State.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      country: country || "India",
      isActive: true,
    });

    return res.status(201).json({ success: true, message: "State created", state });
  } catch (error) {
    console.error("Create State Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// =====================================================
// CREATE DISTRICT (Admin)
// =====================================================
const createDistrict = async (req, res) => {
  try {
    const { name, code, stateId } = req.body;
    if (!name || !code || !stateId) {
      return res.status(400).json({ success: false, message: "Name, code and stateId are required" });
    }

    const district = await District.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      state: stateId,
      isActive: true,
    });

    return res.status(201).json({ success: true, message: "District created", district });
  } catch (error) {
    console.error("Create District Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// =====================================================
// CREATE TALUK (Admin)
// =====================================================
const createTaluk = async (req, res) => {
  try {
    const { name, code, districtId, stateId } = req.body;
    if (!name || !code || !districtId) {
      return res.status(400).json({ success: false, message: "Name, code and districtId are required" });
    }

    let resolvedStateId = stateId;
    if (!resolvedStateId) {
      const dist = await District.findById(districtId);
      if (dist) resolvedStateId = dist.state;
    }

    const taluk = await Taluk.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      district: districtId,
      state: resolvedStateId,
      isActive: true,
    });

    return res.status(201).json({ success: true, message: "Taluk created", taluk });
  } catch (error) {
    console.error("Create Taluk Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

module.exports = {
  getStates,
  getDistrictsByState,
  getTaluksByDistrict,
  getOfficesByTaluk,
  createState,
  createDistrict,
  createTaluk,
  seedInitialLocations,
};
