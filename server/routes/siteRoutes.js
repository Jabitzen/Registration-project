const express = require("express");
const router = express.Router();
const Site = require("../models/Site");

// Get all sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find();
    res.json(sites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sites", error });
  }
});

// Get a single site by ID
router.get("/:id", async (req, res) => {
  try {
    const site = await Site.find({ SiteID: req.params.id });
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  } catch (error) {
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

// Update a site by ID
router.put("/:id", async (req, res) => {
  try {
    const site = await Site.findOneAndUpdate(
      { SiteID: req.params.id },
      { $set: req.body },
      {
        new: true,
      }
    );

    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  } catch (error) {
    res.status(400).json({ message: "Error updating site", error });
  }
});

// Delete a site by ID
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

module.exports = router;
