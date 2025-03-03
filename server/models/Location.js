const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  site: { type: mongoose.Schema.Types.ObjectId, ref: "Site", required: true },
  name: { type: String, required: true }, // e.g., "Building A", "Room 101"
  locationType: { type: String, required: true }, // e.g., "Building", "Room"
  capacity: { type: String, required: true },
  description: { type: String },
  specialInstructions: { type: String },
  availability: [{ type: mongoose.Schema.Types.ObjectId, ref: "Availability" }], // Availability slots
});

const Location = mongoose.model("Location", locationSchema);
module.exports = Location;
