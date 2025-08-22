const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  guests: [{ type: String }], // email list
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // <-- for admin dashboard
});

module.exports = mongoose.model("Event", eventSchema);
