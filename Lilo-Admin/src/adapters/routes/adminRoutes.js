const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { SessionAuthenticated, TokenAuthenticated } = require("../../frameworks/web/middleware/authMiddleware"); 

router.get("/login", adminController.login_view);
router.post("/login", adminController.login_post);
// router.get("/register", adminController.register_view);
router.post("/register", adminController.register_post);
// router.get('/:token', adminController.getToken);
router.get("/dashboard", SessionAuthenticated, TokenAuthenticated, adminController.analytics_view); 
router.get('/forgot-password', adminController.forgotPassword_view);
router.post('/forgot-password', adminController.forgotPassword_post);
router.get('/reset-password', adminController.resetPassword_view); 
router.post('/reset-password', adminController.resetPassword); 
router.get('/notices', adminController.getAllFilteredNotices);
router.get('/notices/find', adminController.findCompNameByCompCode);

module.exports = router;
