const locationService = require("../../application/services/locationService");

const fetchLocations = async (req, res) => {
  const { compCode } = req.user;
  try {
    const locations = await locationService.fetchLocations(compCode);

    // Check if this is an API request
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // Send JSON response for API calls
      return res.status(200).json({ locations });
    }

    // Otherwise, render the settings view
    res.render("settings", { locations });
  } catch (error) {
    console.error("Error fetching locations:", error);

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      // Send JSON error response for API calls
      return res.status(500).json({ error: "Failed to fetch locations." });
    }

    res.status(500).render("404");
  }
};

const addLocation = async (req, res) => {
  const { name, lat, long } = req.body;
  const { compCode } = req.user;
  try {
    const newLocation = await locationService.addLocation({ name, lat, long, compCode });
    res.status(201).json({ message: "Location created successfully", newLocation });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ error: "An error occurred while creating the location" });
  }
};

const checkLocation = async (req, res) => {
  const { name, lat, long } = req.query;
  const { compCode } = req.user;
  try {
    const exists = await locationService.checkLocation({ name, lat, long, compCode });
    res.json({ exists });
  } catch (error) {
    console.error("Error checking location:", error);
    res.status(500).json({ error: "An error occurred while checking location." });
  }
};

const updateLocation = async (req, res) => {
  const id = req.params.id;
  const { name, lat, long } = req.body;
  const { compCode } = req.user;
  try {
    const updatedLocation = await locationService.updateLocation({ id, name, lat, long, compCode });
    res.status(200).json({ message: "Location updated successfully", updatedLocation });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteLocation = async (req, res) => {
  const id = req.params.id;
  const { compCode } = req.user;
  try {
    await locationService.deleteLocation({ id, compCode });
    res.json({ message: "Location deleted successfully!" });
  } catch (error) {
    console.error("Error deleting location:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  fetchLocations,
  addLocation,
  checkLocation,
  updateLocation,
  deleteLocation,
};
