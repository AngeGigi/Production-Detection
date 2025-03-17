const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewControllers");
const { SessionAuthenticated, TokenAuthenticated } = require("../../frameworks/web/middleware/authMiddleware");

router.use(SessionAuthenticated, TokenAuthenticated);

router.get("/registration", reviewController.registration_view);
router.get("/mismatch-location", reviewController.mismatch_loc_view);
router.get("/logs", reviewController.logs_view);

module.exports = router;
