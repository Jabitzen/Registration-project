const mongoose = require("mongoose");

// Define the schema for a Site
const siteSchema = new mongoose.Schema({
  SiteID: { type: String, required: true },
  ParentName: { type: String, required: true },
  BuildingSiteName: { type: String, required: true },
  SiteType: { type: String, required: true },
  Capacity: { type: String, required: true },
  FullStreetAddress: { type: String, required: true },
  SubAddress: String,
  City: { type: String, required: true },
  State: { type: String, required: true },
  PostCode: { type: String, required: true },
  Directions: { type: String, required: true },
  Description: { type: String, required: true },
  SpecialInstructions: { type: String, required: true },
  RentalRequirements: String,
  SignatureURL: String,
  ImageURL: String,
});

const Site = mongoose.model("Site", siteSchema);

module.exports = Site;
