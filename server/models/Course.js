const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  CourseID: String,
  Title: String,
  Description: String,
  Prerequisites: [String],
  InstructorAssignments: [String],
  FacilityUsage: String,
  ConsumablesUsage: String,
  ClassName: String,
  Location: String,
  Capacity: String,
  BringList: String,
  Credits: String,
  Certificates: [String],
  Status: String,
  Duration: String,
  DateFrom: Date,
  DateTo: Date,
  Repeats: Boolean,
  Until: Date,
  NumberOfTimes: String,
  TimeFrom: String,
  TimeTo: String,
  TotalRegistered: String,
  RegisteredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  TotalAttended: String,
  InventoryItemUsed: String,
  Amount: String,
  InstructorPayment: String,
  InstructorTravel: String,
  FacilityCostAssignment: String,
  TotalClassRevenue: String,
  TotalClassCost: String,
  TotalClassGrossProfit: String,
  PostToStateCLEE: Boolean,
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
