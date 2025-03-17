const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");
const { SessionAuthenticated, TokenAuthenticated } = require("../../frameworks/web/middleware/authMiddleware"); 

router.use(SessionAuthenticated, TokenAuthenticated);

router.get("/", homeController.home_get);
router.get('/check-empid', homeController.check_empid_emp);
router.get("/add-employee", homeController.add_emp_page);
router.get("/departments", homeController.dept_emp);
router.post("/", homeController.add_emp);
router.get("/employee/:id", homeController.view_emp);
router.put("/edit-employee/:id", homeController.edit_emp);
router.delete("/delete/:id", homeController.del_emp);
router.get("/sort", homeController.sort_emp);
router.get("/search", homeController.search_emp);
router.post("/import-employees", homeController.import_employees_emp);

module.exports = router;
