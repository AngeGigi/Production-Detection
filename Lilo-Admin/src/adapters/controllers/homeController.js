const {
    GetEmployeesUseCase,
    CheckEmployeeIdUseCase,
    AddEmployeeUseCase,
    GetEmployeeByIdUseCase,
    GetEmployeeByIdEmpUseCase,
    GetDepartmentsUseCase,
    UpdateEmployeeStatusUseCase,
    UpdateEmployeeDetailsUseCase,
    UpdateEmployeeUseCase,
    DeleteEmployeeUseCase,
    SearchEmployeesUseCase,
    SortEmployeesUseCase,
    ImportEmployeesUseCase,
} = require("../../application/usecases/EmployeeUseCase");
const locationService = require("../../application/services/locationService");
const NoticeService = require("../../application/services/NoticeService");
const getLayoutForPath = require('../views/helper/adminlayoutHelper'); 

const home_get = async (req, res) => {
    const currentView = req.query.view || "card";
    const compCode = req.session.user?.compCode;

    try {
        const getEmployeesUseCase = new GetEmployeesUseCase();
        const employees = await getEmployeesUseCase.execute(compCode);

        const locations = await locationService.fetchLocations(compCode);

        function calculateTimeAgo(time) {
                    // Convert the time into a format JavaScript's Date object can parse
                    const timeParsed = new Date(
                        time.replace(
                            /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w{2})/,
                            "$1"
                        )
                    ); // remove AM/PM
        
                    // Handle invalid date
                    if (isNaN(timeParsed)) {
                        return "Invalid time format";
                    }
        
                    const now = new Date();
                    const diff = now - timeParsed;
                    const minutes = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
        
                    if (minutes < 60) return `${minutes} min(s) ago`;
                    else if (hours < 24) return `${hours} hour(s) ago`;
                    else return `${Math.floor(hours / 24)} day(s) ago`;
                }
        
                const notices = await NoticeService.getNoticesByCompCode(compCode);
        
                const noticesWithTimeAgo = notices.map((notice) => ({
                    ...notice,
                    timeAgo: calculateTimeAgo(notice.createdAt),
                }));
        
                const noticeCount = notices.length;

        res.render("admin/layouts/main-layout", {
            layout: getLayoutForPath("Employees"),
            role: "admin",
            title: "Employees",
            pagetitle: "Employees",
            employees,
            currentView,
            locations,
            compCode,
            notices: noticesWithTimeAgo,
            noticeCount,
        });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const check_empid_emp = async (req, res) => {
    const { empID } = req.query;
    const compCode = req.session.user?.compCode;

    try {
        const checkEmployeeIdUseCase = new CheckEmployeeIdUseCase();
        const exists = await checkEmployeeIdUseCase.execute(empID, compCode);

        return res.json({ exists });
    } catch (error) {
        console.error("Error checking Employee ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const add_emp_page = async (req, res) => {
    const compCode = req.session.user?.compCode;
    try {
        const locations = await locationService.fetchLocations(compCode);
        res.render("add-emp", {
            title: "Add a New Employee Page",
            locations,
            compCode,
        });
    } catch (error) {
        console.error("Error fetching locations:", error);
        res.status(500).send("Internal Server Error");
    }
};

const dept_emp = async (req, res) => {
    const compCode = req.query.compCode; // Get the company code from query params
    const getDepartmentsUseCase = new GetDepartmentsUseCase();
 
    try {
        const depts = await getDepartmentsUseCase.execute(compCode);
        res.json(depts);
    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ message: "Failed to fetch departments." });
    }
}
const add_emp = async (req, res) => {
    console.log("Received request for adding employee:", req.body);
 
    const { empID, fname, mname, lname, dept, email, empPic, loc_assign } = req.body;
 
    const compCode = req.session.user?.compCode;
   
    try {
        const addEmployeeUseCase = new AddEmployeeUseCase();
 
        console.log("Executing AddEmployeeUseCase with the provided data...");
        const newEmployee = await addEmployeeUseCase.execute({
            compCode,
            empID,
            fname,
            mname,
            lname,
            dept,
            email,
            empPic,
            loc_assign,
        });
 
        res.status(201).json({
            message: "Employee registered successfully",
            newEmployee,
        });
    } catch (error) {
        console.error("Error while creating employee:", error);
 
        res.status(500).json({
            message: "Failed to register employee",
            error: error.message,
        });
    }
};


const view_emp = async (req, res) => {
    const eid = req.params.id;
    const compCode = req.session.user?.compCode;

    try {
        const getEmployeeByIdUseCase = new GetEmployeeByIdEmpUseCase();
        const employee = await getEmployeeByIdUseCase.execute(eid, compCode);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const locations = await locationService.fetchLocations(compCode);

        const getDepartmentsUseCase = new GetDepartmentsUseCase();
        const departments = await getDepartmentsUseCase.execute(compCode);

        res.json({
            title: "Employee Information",
            employees: employee,
            locations,
            departments,
        });
    } catch (err) {
        console.error("Error fetching employee data:", err);
        res.status(500).send("Server Error");
    }
};

const edit_emp = async (req, res) => {
    const eid = req.params.id;
    const { empStat, empID, fname, mname, lname, dept, email, loc_assign } = req.body;
    const compCode = req.session.user?.compCode;

    if (!eid || !compCode) {
        return res.status(400).json({ message: "Invalid request data" });
    }

    try {
        if (empStat) {
            const updateEmployeeStatusUseCase = new UpdateEmployeeStatusUseCase();
            const updatedEmployeeStatus = await updateEmployeeStatusUseCase.execute({
                id: eid,
                empStat,
                compCode,
            });

            return res.status(200).json({
                message: "Employee status updated successfully",
                updatedEmployee: updatedEmployeeStatus,
            });
        }

        if (empID || fname || lname || dept || email || loc_assign) {
            const updateEmployeeDetailsUseCase = new UpdateEmployeeDetailsUseCase();
            const updatedEmployeeDetails = await updateEmployeeDetailsUseCase.execute({
                eid,
                empID,
                fname,
                mname,
                lname,
                dept,
                email,
                loc_assign,
                compCode,
            });

            return res.status(200).json({
                message: "Employee details updated successfully",
                updatedEmployee: updatedEmployeeDetails,
            });
        }

        return res.status(400).json({
            message: "No valid fields to update",
        });
    } catch (error) {
        console.error("Error updating employee:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

const del_emp = async (req, res) => {
    const id = req.params.id;
    const compCode = req.session.user?.compCode;

    try {
        const deleteEmployeeUseCase = new DeleteEmployeeUseCase();
        await deleteEmployeeUseCase.execute(id, compCode);

        res.json({ redirect: "/homepage?view=list" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};

const search_emp = async (req, res) => {
    const { searchQuery } = req.query;
    const compCode = req.session.user?.compCode;

    try {
        const searchEmployeesUseCase = new SearchEmployeesUseCase();
        const employees = await searchEmployeesUseCase.execute(searchQuery, compCode);

        res.render("../views/employees/card-view", {
            title: "Homepage",
            employees,
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Server Error");
    }
};

const sort_emp = async (req, res) => {
    const { searchQuery, sortBy } = req.query;
    const compCode = req.session.user?.compCode;

    try {
        const sortEmployeesUseCase = new SortEmployeesUseCase();
        const employees = await sortEmployeesUseCase.execute(searchQuery, sortBy, compCode);

        res.render("../views/partials/employees-card-container", {
            title: "Homepage",
            employees,
        });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Server Error");
    }
};

const import_employees_emp = async (req, res) => {
    try {
        const importEmployeesUseCase = new ImportEmployeesUseCase();
        await importEmployeesUseCase.execute(req.body, req.session.user?.compCode);

        res.status(200).json({ message: "Employees imported successfully" });
    } catch (error) {
        console.error("Error while importing employees:", error);
        res.status(500).json({ message: "Error importing employees", error });
    }
};

module.exports = {
    home_get,
    check_empid_emp,
    add_emp_page,
    dept_emp,
    add_emp,
    view_emp,
    edit_emp,
    del_emp,
    search_emp,
    sort_emp,
    import_employees_emp,
};
