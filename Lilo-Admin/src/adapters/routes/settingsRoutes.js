const express = require("express");
const router = express.Router();
const locationController = require("../controllers/settingsController");
const { SessionAuthenticated, TokenAuthenticated } = require("../../frameworks/web/middleware/authMiddleware");

router.use(SessionAuthenticated, TokenAuthenticated);
router.get("/", locationController.fetchLocations);
router.post("/location-settings", locationController.addLocation);
router.get("/location-check", locationController.checkLocation);
router.put("/location-settings/:id", locationController.updateLocation);
router.delete("/location-settings/:id", locationController.deleteLocation);

module.exports = router;
