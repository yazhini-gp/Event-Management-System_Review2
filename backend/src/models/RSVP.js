const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  email: { type: String },
  status: { type: String, enum: ["going", "maybe", "not_going"], required: true },
  note: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("RSVP", rsvpSchema);



