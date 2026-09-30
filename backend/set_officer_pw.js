require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function setOfficerPass() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashed = await bcrypt.hash("officer123", 10);
  const res = await mongoose.connection.db.collection("users").updateOne(
    { email: "officer@test.com" },
    { $set: { password: hashed } }
  );
  console.log("Updated password for officer@test.com:", res.modifiedCount);
  await mongoose.disconnect();
}

setOfficerPass();
