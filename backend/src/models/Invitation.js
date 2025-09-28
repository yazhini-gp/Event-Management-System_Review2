const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" },
  sentAt: { type: Date },
  respondedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Invitation", invitationSchema);



