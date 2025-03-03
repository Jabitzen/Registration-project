const express = require("express");
const router = express.Router();
const Site = require("../models/Site");
const Location = require("../models/Location");
const Availability = require("../models/Availability");
const { authMiddleware } = require("./userRoutes");

// Get all sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sites", error });
  }
});

// Add a location to a site (no default availability)
router.post("/:siteId/locations", async (req, res) => {
  const { siteId } = req.params;
  try {
    const locationData = {
      site: siteId,
      name: req.body.name,
      locationType: req.body.locationType,
      capacity: req.body.capacity,
      description: req.body.description,
      specialInstructions: req.body.specialInstructions,
      availability: [], // No default availability
    };
    const location = new Location(locationData);
    await location.save();

    const site = await Site.findById(siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });
    site.locations.push(location._id);
    await site.save();

    res.status(201).json(location);
  } catch (error) {
    console.error("Error adding location:", error);
    res.status(500).json({ message: "Failed to add location" });
  }
});

// Create a reservation (booked slot) directly
router.post(
  "/:siteId/locations/:locationId/availability",
  authMiddleware,
  async (req, res) => {
    const { siteId, locationId } = req.params;
    const { startDateTime, endDateTime } = req.body;

    try {
      const site = await Site.findById(siteId);
      if (!site || !site.locations.includes(locationId)) {
        return res.status(404).json({ message: "Site or location not found" });
      }

      // Parse dates
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      // Validate reservation is within 6:00 AM - 7:00 PM
      const startOfDay = new Date(start);
      startOfDay.setHours(6, 0, 0, 0);
      const endOfDay = new Date(start);
      endOfDay.setHours(19, 0, 0, 0);

      if (start < startOfDay || end > endOfDay) {
        return res
          .status(400)
          .json({ message: "Reservation must be within 6:00 AM - 7:00 PM" });
      }

      // Check for overlapping bookings
      const location = await Location.findById(locationId).populate(
        "availability"
      );
      const overlap = location.availability.some((avail) => {
        const availStart = new Date(avail.startDateTime);
        const availEnd = new Date(avail.endDateTime);
        return (
          start < availEnd && end > availStart && avail.status === "booked"
        );
      });
      if (overlap) {
        return res
          .status(400)
          .json({ message: "Time slot overlaps with existing booking" });
      }

      // Get user name from req.user (set by authMiddleware)
      const userName = req.user?.username || "Unknown User";

      // Create the reservation (booked slot) directly
      const reservationData = {
        location: locationId,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        status: "booked",
        bookedBy: userName,
      };
      const reservation = new Availability(reservationData);
      await reservation.save();

      location.availability.push(reservation._id);
      await location.save();

      res.status(201).json(reservation);
    } catch (error) {
      console.error("Error creating reservation:", error);
      res.status(500).json({ message: "Failed to create reservation", error });
    }
  }
);

// Get a single site by _id
router.get("/:id", async (req, res) => {
  try {
    const site = await Site.findOne({ _id: req.params.id }).populate({
      path: "locations",
      populate: { path: "availability" },
    });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  } catch (error) {
    console.error("Error fetching site:", error);
    res.status(500).json({ message: "Error fetching site", error });
  }
});

// Create a new site
router.post("/", async (req, res) => {
  try {
    const site = new Site(req.body);
    await site.save();
    res.status(201).json(site);
  } catch (error) {
    res.status(400).json({ message: "Error saving site", error });
  }
});

// Update a site by _id
router.put("/:id", async (req, res) => {
  try {
    const site = await Site.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  } catch (error) {
    res.status(400).json({ message: "Error updating site", error });
  }
});

// Delete a site by _id
router.delete("/:id", async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json({ message: "Site deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting site", error });
  }
});

// Delete a reservation (booked slot)
router.delete(
  "/:siteId/locations/:locationId/availability/:availabilityId",
  async (req, res) => {
    const { siteId, locationId, availabilityId } = req.params;

    try {
      const site = await Site.findById(siteId);
      if (!site || !site.locations.includes(locationId)) {
        return res.status(404).json({ message: "Site or location not found" });
      }

      // Find and delete the reservation
      const availability = await Availability.findByIdAndDelete(availabilityId);
      if (!availability) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update the location to remove the reference to the deleted reservation
      const location = await Location.findById(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      location.availability = location.availability.filter(
        (id) => id.toString() !== availabilityId
      );
      await location.save();

      res.json({ message: "Reservation deleted successfully" });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(500).json({ message: "Failed to delete reservation", error });
    }
  }
);

module.exports = router;
