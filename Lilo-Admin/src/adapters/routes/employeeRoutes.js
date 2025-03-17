const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');
const employeeController = new EmployeeController();

// Sign in and token management
router.post('/signin', employeeController.signIn);
router.get('/:token', employeeController.getTokenForUser);

// Record management (requires token authentication)
router.post('/add-record', employeeController.authenticateToken, employeeController.addRecord);
router.post('/records', employeeController.authenticateToken, employeeController.fetchRecords);

// Employee main page (secured)
router.get("/main", employeeController.checkAuth, (req, res) => {
    const { compCode, empID } = req.user;
    res.json({ success: true, compCode, empID });
});

module.exports = router;
