const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  status: { type: String, enum: ["booked"], default: "booked" },
  bookedBy: { type: String, required: true },
});

const Availability = mongoose.model("Availability", availabilitySchema);
module.exports = Availability;
