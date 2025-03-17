const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/reportController");
const { SessionAuthenticated, TokenAuthenticated } = require("../../frameworks/web/middleware/authMiddleware");

router.use(SessionAuthenticated, TokenAuthenticated);
router.get("/dtrs", ReportController.dtrsDate);
router.post("/dtrs", ReportController.dtrsFilter);
router.get("/dtrs/list", ReportController.dtrsList);
router.get('/dtrs/sort', ReportController.dtrsSort);
router.get('/dtrs/search', ReportController.dtrsSearch);
router.get('/dtrs', ReportController.dtrsGetRecords);
router.get('/start-of-day', ReportController.startDay);
router.get('/end-of-day', ReportController.endDay);
router.get("/sort-end-of-day", ReportController.sortEndDay);

router.get('/rejected-logs', ReportController.rejectedLogs);

module.exports = router;
