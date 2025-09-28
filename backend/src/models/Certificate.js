const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  certificateNo: { type: String, required: true, unique: true },
  certificateType: { type: String, enum: ["participation", "winner", "achievement"], default: "participation" },
  issuedAt: { type: Date, default: Date.now },
  fileUrl: { type: String },
  // For winner certificates
  position: { type: String }, // "1st Place", "2nd Place", "Winner", etc.
  achievement: { type: String }, // "Best Performance", "Outstanding Contribution", etc.
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);



