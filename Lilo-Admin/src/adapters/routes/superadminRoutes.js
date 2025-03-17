const express = require("express");
const router = express.Router();
const superadminController = require("../controllers/superadminController");
const { SuperSessionAuthenticated, SuperTokenAuthenticated } = require("../../frameworks/web/middleware/superauthMiddleware"); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../../public/notices/files'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for unique filenames
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Unsupported file type'), false);
        }
        cb(null, true);
    }
});
router.get("/dashboard", SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.dashboard_view); 
router.get("/login", superadminController.superlogin_view);
router.post("/login", superadminController.superlogin_post);

//home
router.get("/home", SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.home_view); 
router.get('/view-company/:compCode', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.company_view); // View by compCode
router.post('/update-company/:compCode', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.update_company); // Update by compCode
router.delete('/delete-company/:compCode', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.delete_company); // Delete by compCode

//subs
router.get("/subs", SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.subs_view); 
router.post('/register-company', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.register_company);
// router.get("/register-admin", superadminController.register_view);
// router.post("/register-admin", superadminController.register_post);

//reports
router.get("/reports", SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.reports_view); 


//settings
router.get('/settings', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.settings_view);
router.get('/profile', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.getProfile);
router.post('/profile/update', SuperSessionAuthenticated, SuperTokenAuthenticated, superadminController.updateProfile);
// router.get("/register", superadminController.register_view);
// router.post("/register", superadminController.register_post);
// router.get('/:token', adminController.getToken);


//forgot password
router.get('/forgot-password',superadminController.forgotPassword_view);
router.post('/forgot-password', superadminController.forgotPassword_post);
router.get('/reset-password', superadminController.resetPassword_view); 
router.post('/reset-password', superadminController.resetPassword);

//notice
router.post('/subs', superadminController.createNotice);
router.post('/notice/create',  upload.single('file'), superadminController.createNotice);
router.get('/notice/compCodes', superadminController.getDistinctCompCodes);
router.get('/allnotices', superadminController.getAllNotices);

module.exports = router;
