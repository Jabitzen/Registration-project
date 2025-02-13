const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const siteRoutes = require("./routes/siteRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Initialize Express app
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON request bodies

// Database connection
mongoose
  .connect("mongodb://localhost:27017/site-db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/sites", siteRoutes);
app.use("/courses", courseRoutes);
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
