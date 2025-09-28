const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  recipient: { type: String, required: true },
  type: { type: String, enum: ["email"], default: "email" },
  sendAt: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "sent", "failed"], default: "scheduled" },
  error: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);



