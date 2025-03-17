const RecordService = require('../../application/services/RecordService');
const DBEmployeeRepository = require('../../infrastructure/database/dbEmployeeRepository')
const { GetDepartmentsUseCase } = require('../../application/usecases/EmployeeUseCase');
const NoticeService = require("../../application/services/NoticeService");
const getLayoutForPath = require('../views/helper/adminlayoutHelper'); 

class ReportController {
    async dtrsDate(req, res) {
        const currentView = req.query.view || "card";
        const compCode = req.session.user?.compCode;
        if (!compCode) {
            return res.status(400).send("Company code is required");
        }

        try {
            const records = await RecordService.getRecordsByDate(compCode) || [];
            const recordslist = await RecordService.allRecords(compCode) || [];
            const locations = await RecordService.getLocations();
            const departments = await RecordService.getDepartments(compCode);

            const empIDs = records.map((record) => record.empID);
            const listempIDs = recordslist.map((recordlist) => recordlist.empID);

            const employees = await RecordService.getEmployeesByIds(empIDs);
            const employeeslist = await RecordService.getEmployeesByIds(listempIDs);

            const employeeMap = {};
            employees.forEach((employee) => {
                employeeMap[employee.id] = employee;
            });

            const employeelistMap = {};
            employeeslist.forEach((employeelist) => {
                employeelistMap[employeelist.id] = employeelist;
            });

            const recordsWithEmployeeInfo = records.map((record) => ({
                ...record,
                employee: employeeMap[record.empID] || {},
            }));

            const recordslistWithEmployeeInfo = recordslist.map((recordlist) => ({
                ...recordlist,
                employee: employeelistMap[recordlist.empID] || {},
            }));

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
                layout: getLayoutForPath(req.path),
                role: "admin",
                title: "DTRS",
                pagetitle: "DTRS",
                recordslist: recordslistWithEmployeeInfo,
                records: recordsWithEmployeeInfo,
                locations,
                departments,
                currentView,
                notices: noticesWithTimeAgo,
                noticeCount,
            });
        } catch (error) {
            console.error("Error fetching records by date:", error);
            res.status(500).send("Server Error");
        }
    }

    async dtrsFilter(req, res) {
        const { dateFrom, dateTo } = req.body;
        const compCode = req.session.user?.compCode;

        const query = `
            SELECT r.*, e.fname, e.lname, e.dept
            FROM Records r
            JOIN Employees e ON r.empID = e.id
            WHERE r.date BETWEEN ? AND ? AND e.compCode = ?;
        `;

        db.all(query, [dateFrom, dateTo, compCode], (err, rows) => {
            if (err) {
                console.error("Database error:", err);
                res.status(500).send("Error fetching data");
                return;
            }
            console.log("Fetching records from:", dateFrom, "to:", dateTo);
            res.json({ records: rows });
        });
    }

    async dtrsList(req, res) {
        try {
            const compCode = req.session.user?.compCode;
            if (!compCode) {
                return res.status(403).send("Unauthorized access: Missing compCode");
            }

            const recordslist = await RecordService.allRecords(compCode);
            const html = await renderPartial("reports/dtrs-list.ejs", {
                recordslist,
            });

            res.json({ html });
        } catch (error) {
            console.error("Error fetching records for list view:", error);
            res.status(500).send("Server Error");
        }
    }

    async dtrsSort(req, res) {
        const sortBy = req.query.sortBy || "default"; 
        const compCode = req.session.user?.compCode;
    
        if (!compCode) {
            return res.status(403).send("Unauthorized access: Missing compCode");
        }
    
        try {
            const sortedRecords = await RecordService.getSortedRecords(sortBy, compCode);
            res.render("reports/dtrs-card-container", { records: sortedRecords });
        } catch (err) {
            console.error("Error sorting records:", err);
            res.status(500).send("Internal Server Error");
        }
    }
    
    async dtrsSearch(req, res) {
        const searchQuery = req.query.searchQuery || "";
        const compCode = req.session.user?.compCode;

        if (!compCode) {
            return res.status(403).send("Unauthorized access: Missing compCode");
        }

        try {
            const records = await RecordService.getFilteredRecords(searchQuery, compCode);
            res.render("reports/dtrs-card-container", { records });
        } catch (error) {
            console.error("Error searching records:", error);
            res.status(500).send("Server Error");
        }
    }

    async dtrsGetRecords(req, res) {
        const dateFrom = req.query.dateFrom || null;
        const dateTo = req.query.dateTo || null;
        const compCode = req.session.user?.compCode; 
    
        if (!compCode) {
            return res.status(403).send("Unauthorized access: Missing company code");
        }
    
        try {
            const records = await RecordService.getRecordsByDateFilter(compCode, dateFrom, dateTo);
    
            if (records.length === 0) {
                return res.status(404).json({ message: "No records found for the given date range" });
            }
    
            res.json({ records });
        } catch (err) {
            console.error("Error querying database:", err);
            res.status(500).json({ error: "Failed to retrieve records. Please try again later." });
        }
    }

    async startDay(req, res) {
        try {
            const compCode = req.session.user?.compCode; 
            if (!compCode) {
                return res.status(403).send("Unauthorized access: Missing compCode");
            }

            const [departments, locations, totalEmployees, startRecords, notRecords] = await Promise.all([
                RecordService.getDepartments(compCode),
                RecordService.getLocations(compCode),
                RecordService.getTotalEmployees(compCode),
                RecordService.getStartRecordsByDate(compCode),
                RecordService.getNotRecordsByDate(compCode),
            ]);

            const totalLoggedIn = startRecords.length;
            const totalNotLoggedIn = notRecords.length;

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
                layout: getLayoutForPath(req.path),
                role: "admin",
                title: "Start of Day",
                pagetitle: "Start of Day",
                totalLoggedIn,
                startRecords,
                notRecords,
                totalNotLoggedIn,
                totalEmployees,
                departments,
                locations,
                currentView: "",
                notices: noticesWithTimeAgo,
                noticeCount,
            });
        } catch (error) {
            console.error("Error fetching start-of-day records:", error);
            res.status(500).send("Server Error");
        }
    }

    async endDay(req, res) {
        try {
            const compCode = req.session.user?.compCode;
            const currentDate = new Date().toISOString().split("T")[0];
   
            if (!compCode) {
                return res.status(403).send("Unauthorized access: Missing compCode");
            }
   
            const [
                departments,
                locations,
                locationsWithEmployeeCount,
                lateEmployees,
                employeesWithoutLogout,
                employeesWithoutLogin,
            ] = await Promise.all([
                RecordService.getDepartments(compCode),
                RecordService.getLocations(compCode),
                RecordService.getEmployeeCountsByLocation(compCode),
                RecordService.getLateEmployees(compCode),
                RecordService.getEmployeesWithoutLogout(compCode),
                RecordService.getEmployeesWithoutLogin(compCode),
            ]);
 
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
                layout: getLayoutForPath(req.path),
                role: "admin",
                title: "End of Day",
                pagetitle: "End of Day",
                departments,
                locations,
                locationsWithEmployeeCount,
                lateEmployees,
                employeesWithoutLogout,
                employeesWithoutLogin,
                currentDate,
                notices: noticesWithTimeAgo,
                noticeCount,
            });
        } catch (error) {
            console.error("Error generating end-of-day report:", error);
            res.status(500).send("Server Error");
        }
    }
       
    async sortEndDay(req, res) {
        try {
            const compCode = req.session.user?.compCode;
            const currentDate = new Date().toISOString().split("T")[0];
            const { dept } = req.query; // Retrieve department from query parameters
    
            if (!compCode) {
                return res.status(403).send("Unauthorized access: Missing compCode");
            }
    
            // Fetch the sorted records for each category based on the selected department
            const [
                locationsWithEmployeeCount,
                lateEmployees,
                employeesWithoutLogout,
                employeesWithoutLogin,
            ] = await Promise.all([
                RecordService.getEmployeeCountsByLocation(currentDate, compCode, dept),
                RecordService.getLateEmployees(currentDate, compCode, dept),
                RecordService.getEmployeesWithoutLogout(currentDate, compCode, dept),
                RecordService.getEmployeesWithoutLogin(currentDate, compCode, dept),
            ]);
    
            // Return the filtered data as JSON response
            res.json({
                locationsWithEmployeeCount,
                lateEmployees,
                employeesWithoutLogout,
                employeesWithoutLogin,
            });
        } catch (error) {
            console.error("Error filtering by department:", error);
            res.status(500).send("Server Error");
        }
    }
    
    

    async rejectedLogs(req, res) {
        const { compCode } = req.user; 
        console.log("Session compCode:", compCode);
        console.log("Session data:", req.session.user);

        if (!compCode) {
            return res.status(403).send("Unauthorized access: Missing compCode");
        }

        try {
            const rejectedRecords = await RecordService.getRejectedLogs(compCode);

            const employeeRepository = new DBEmployeeRepository();
            const getDepartmentsUseCase = new GetDepartmentsUseCase(employeeRepository);
            const departments = await getDepartmentsUseCase.execute(compCode)
            ;

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
                layout: getLayoutForPath(req.path),
                role: "admin",
                title: "Rejected Logs",
                pagetitle: "Rejected Logs",
                logs: Array.isArray(rejectedRecords) ? rejectedRecords : [rejectedRecords], // Ensure it's an array
                departments,
                notices: noticesWithTimeAgo,
                noticeCount,
                currentView: "",
            });

        } catch (error) {
            console.error("Error fetching records:", error);
            res.status(500).send("Server Error");
        }
    }
}

module.exports = new ReportController();
