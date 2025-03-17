const SuperAdminService = require("../../application/services/SuperAdminService");
const DatabaseCompanyRepository = require("../../infrastructure/database/dbCompanyRepository");
const CompanyService = require("../../application/services/CompanyService");
const { DateTime } = require("luxon");
const SuperAdminRepository = require("../repositories/superadminRepository");
const companyRepository = new DatabaseCompanyRepository();
const companyService = new CompanyService(companyRepository);
const NoticeService = require("../../application/services/NoticeService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const moment = require("moment");
const AdminEntity = require("../../entities/AdminEntity");
const { runNotificationCheck } = require("../../application/services/runNotificationCheck")
const getLayoutForPath = require('../views/helper/superadminlayoutHelper');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "public/notice/files")); // Save files in 'public/notice/files'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp for unique filenames
    },
});

const upload = multer({ storage: storage });

const superlogin_view = (req, res) => {
    res.render("superadmin/layouts/auth-layout", { title: "Log In" });
};

const superlogin_post = async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Received login request", { username });

        const { supertoken, superadmin, expirationTime } =
            await SuperAdminService.login(username, password);

        req.session.superuser = superadmin.username;
        req.session.supertoken = supertoken;
        req.session.superexpiration = expirationTime;

        console.log("Session user set to:", req.session.superuser);
        console.log("Session token set:", req.session.supertoken);
        console.log("Session expiration set:", req.session.superexpiration);

        if (!res.headersSent) {
            return res.json({
                isSuccess: true,
                detail: "Super Admin logged in successfully",
                supertoken,
                expiration: expirationTime,
            });
        }
    } catch (error) {
        console.error("Login error:", error);

        if (!res.headersSent) {
            return res.render("superadmin/login", {
                error: error.message || "Something went wrong!",
            });
        }
    }
};

const dashboard_view = async (req, res) => {
    const user = req.session.superuser;
    const token = req.session.supertoken;
    const exp = req.session.superexpiration;

    // Function to calculate time ago (e.g., 3 mins ago, 1 hour ago)
    function calculateTimeAgo(time) {
        // Convert the time into a format JavaScript's Date object can parse
        const timeParsed = new Date(
            time.replace(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w{2})/, "$1")
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

    const notices = await NoticeService.getNoticesWithCompNames();

    const noticesWithTimeAgo = notices.map((notice) => ({
        ...notice,
        timeAgo: calculateTimeAgo(notice.createdAt),
    }));
    const noticeCount = notices.length;
    const schNotices = await NoticeService.getUpcomingScheduledNotices();

    schNotices.forEach((notice) => {
        if (notice.STime) {
            const formattedSTime = moment(notice.STime).format(
                "YYYY-MM-DD hh:mm:ss A"
            );
            notice.STime = formattedSTime; 
        }
    });

    const analyticsData = await companyService.getAnalyticsData();
    console.log("Token:", token);
    console.log("Token Expiry:", exp);

    res.render("superadmin/layouts/main-layout", {
        title: "Dashboard",
        user,
        token,
        exp,
        pagetitle: "Super Admin Dashboard",
        role: "superadmin",
        notices: noticesWithTimeAgo,
        noticeCount,
        schNotices,
        ...analyticsData,
    });
};

const register_view = (req, res) => {
    res.render("superadmin/layout", { title: "Register" });
};

async function register_post(req, res) {
    try {
        const { username, password, email, compCode } = req.body;
        const adminEntity = new AdminEntity({ compCode, username, email, password });

        await AdminService.register(adminEntity);

        res.render("superadmin/layout", {
            message: "Admin registered successfully",
        });
    } catch (error) {
        console.error(error);
        return res.render("superadmin/layout", { error: error.message });
    }
}


const home_view = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        function calculateTimeAgo(time) {
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

        const notices = await NoticeService.getNoticesWithCompNames();

        const noticesWithTimeAgo = notices.map((notice) => ({
            ...notice,
            timeAgo: calculateTimeAgo(notice.createdAt),
        }));
        const noticeCount = notices.length;
        const schNotices = await NoticeService.getUpcomingScheduledNotices();

        schNotices.forEach((notice) => {
            if (notice.STime) {
                // Convert to moment, then format to desired output
                const formattedSTime = moment(notice.STime).format(
                    "YYYY-MM-DD hh:mm:ss A"
                );
                notice.STime = formattedSTime; // Update STime with formatted value
            }
        });

        res.render("superadmin/layouts/main-layout", {
            layout: getLayoutForPath(req.path),     
            title: "Company List",
            companies,
            pagetitle: "Company List",
            role: "superadmin",
            notices: noticesWithTimeAgo,
            noticeCount,
            schNotices,
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("An error occurred while fetching company data.");
    }
};

const subs_view = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        // Function to calculate time ago (e.g., 3 mins ago, 1 hour ago)
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

        const notices = await NoticeService.getNoticesWithCompNames();

        const noticesWithTimeAgo = notices.map((notice) => ({
            ...notice,
            timeAgo: calculateTimeAgo(notice.createdAt),
        }));
        const noticeCount = notices.length;

        res.render("superadmin/layouts/main-layout", {
            layout: getLayoutForPath(req.path),     
            title: "Subscribers List",
            companies,
            pagetitle: "Subscribers List",
            role: "superadmin",
            notices: noticesWithTimeAgo,
            noticeCount,
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("An error occurred while fetching company data.");
    }
};

const register_company = async (req, res) => {
    try {
        const newCompany = req.body;
        if (newCompany.compVer && newCompany.compVer.includes("All")) {
            newCompany.compVer = ["All"];
        }
        if (newCompany.compFeat && newCompany.compFeat.includes("All")) {
            newCompany.compFeat = ["All"];
        }

        const response = await companyService.registerCompany(newCompany);

        if (response && response.errors) {
            console.error("Validation errors:", response.errors);
            return res.status(400).json({ errors: response.errors });
        }

        res.status(201).send({ message: "Company registered successfully." });
    } catch (err) {
        console.error("Error registering company:", err);
        res.status(500).send({
            message: "Error registering company.",
            error: err.message,
        });
    }
};

const company_view = async (req, res) => {
    try {
        const company = await companyService.getCompanyByCompCode(
            req.params.compCode
        );
        if (!company) {
            return res.status(404).send({ message: "Company not found." });
        }
        res.status(200).send({ company });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Error fetching company details.",
            error: err.message,
        });
    }
};

const update_company = async (req, res) => {
    try {
        const { compCode } = req.params;
        const updatedData = req.body;
        console.log("Updated Data", updatedData);

        const company = await companyService.getCompanyByCompCode(compCode);
        if (!company) {
            return res.status(404).send({ message: "Company not found." });
        }

        const updatedAt = DateTime.now()
            .setZone("Asia/Manila")
            .toFormat("yyyy-MM-dd hh:mm:ss a"); // Converts to Asia/Manila time zone with AM/PM format

        const updatedEntity = {
            compUser: updatedData.compUser,
            compName: updatedData.compName,
            compEmail: updatedData.compEmail,
            compAddress: updatedData.compAddress,
            compCountEmp: updatedData.compCountEmp || company.compCountEmp,
            compNum: updatedData.compNum,
            subType: updatedData.subType,
            compExp: updatedData.compExp,
            compVer: updatedData.compVer,
            compFeat: updatedData.compFeat,
            updatedAt,
        };

        console.log("updatedEntity", updatedEntity);
        const result = await companyService.updateCompany(
            compCode,
            updatedEntity
        );
        if (result) {
            res.status(200).json({ message: "Updated Successfully", result });
        } else {
            res.status(400).send({ message: "No changes were made." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Error updating company.",
            error: err.message,
        });
    }
};

const delete_company = async (req, res) => {
    try {
        const { compCode } = req.params;

        const company = await companyService.getCompanyByCompCode(compCode);
        if (!company) {
            return res.status(404).send({ message: "Company not found." });
        }

        const result = await companyService.deleteCompany(compCode);

        if (result) {
            res.json({
                message: "Company deleted successfully.",
                redirect: "/home",
            });
        } else {
            res.status(400).send({ message: "Unable to delete company." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({
            message: "Error deleting company.",
            error: err.message,
        });
    }
};

const reports_view = async (req, res) => {
    try {
        const companies = await companyService.ReportCompanies();
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

        const notices = await NoticeService.getNoticesWithCompNames();

        const noticesWithTimeAgo = notices.map((notice) => ({
            ...notice,
            timeAgo: calculateTimeAgo(notice.createdAt),
        }));
        const noticeCount = notices.length;
        const schNotices = await NoticeService.getUpcomingScheduledNotices();

        schNotices.forEach((notice) => {
            if (notice.STime) {
                // Convert to moment, then format to desired output
                const formattedSTime = moment(notice.STime).format(
                    "YYYY-MM-DD hh:mm:ss A"
                );
                notice.STime = formattedSTime; // Update STime with formatted value
            }
        });
        const statusMessage = await runNotificationCheck();

            console.log(statusMessage)
        res.render("superadmin/layouts/main-layout", {
            layout: getLayoutForPath(req.path),     
            title: "Reports Logs",
            companies,
            pagetitle: "Reports Logs",
            role: "superadmin",
            notices: noticesWithTimeAgo,
            noticeCount,
            statusMessage
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("An error occurred while fetching company data.");
    }
};

const settings_view = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();

        // Function to calculate time ago (e.g., 3 mins ago, 1 hour ago)
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

        const notices = await NoticeService.getAllNotices();

        const noticesWithTimeAgo = notices.map((notice) => ({
            ...notice,
            timeAgo: calculateTimeAgo(notice.createdAt),
        }));
        const noticeCount = notices.length;
        
        res.render("superadmin/layouts/main-layout", {
            layout: getLayoutForPath(req.path),     
            title: "Settings",
            companies,
            pagetitle: "Settings",
            role: "superadmin",
            notices: noticesWithTimeAgo,
            noticeCount,
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("An error occurred while fetching company data.");
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await SuperAdminService.getProfile(
            req.session.superuser
        );
        res.json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ errors: ["Error fetching profile."] });
    }
};

const updateProfile = async (req, res) => {
    const { username, password } = req.body;

    if (!req.session.superuser) {
        console.error("No superuser in session.");
        return res
            .status(401)
            .json({ errors: ["User not logged in or session expired."] });
    }

    if (!username || !password) {
        return res
            .status(400)
            .json({ errors: ["Username and password are required."] });
    }

    try {
        const updatedProfile = await SuperAdminService.updateProfile(
            req.session.superuser,
            { username, password }
        );

        if (req.session.superuser !== username) {
            req.session.superuser = username;
            console.log("Session superuser updated:", req.session.superuser);
        }

        res.json({ message: "Profile updated successfully." });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ errors: ["Error updating profile."] });
    }
};

const forgotPassword_view = (req, res) => {
    res.render("superadmin/layouts/auth-layout", { title: "Forgot Password" });
};

const forgotPassword_post = async (req, res) => {
    try {
        const { username, email } = req.body;
        console.log(req.body);
        const response = await SuperAdminService.forgotPassword(
            username,
            email
        );

        res.status(200).json(response);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

async function resetPassword_view(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send("Token is missing.");
    }

    try {
        const admin = await SuperAdminRepository.findByResetToken(token);

        if (!admin) {
            return res.status(400).send("Invalid or expired token.");
        }

        return res.render("superadmin/layouts/auth-layout", { title: "Reset Password", token });
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred.");
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        const response = await SuperAdminService.resetPassword(
            token,
            newPassword
        );
        res.redirect("/superadmin/login");
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function createNotice(req, res) {
    try {
        const { subject, message, type, compCodes, STime, imageBase64 } = req.body;

        if (!subject || !message || !type || !compCodes) {
            return res.status(400).json({ error: "All fields are required except optional fields." });
        }
 
        let parsedCompCodes = [];
        if (compCodes) {
            try {
                parsedCompCodes = Array.isArray(compCodes)
                    ? compCodes
                    : JSON.parse(compCodes);
            } catch (error) {
                console.error("Invalid compCodes format:", error);
                return res
                    .status(400)
                    .json({
                        error: "Invalid compCodes format. Please send a JSON string.",
                    });
            }
        }

        if (!Array.isArray(parsedCompCodes) || parsedCompCodes.length === 0) {
            return res
                .status(400)
                .json({ error: "Please select at least one company code." });
        }
        let fileData = '';
        if (req.file && req.file.filename) {
            fileData = `/files/${req.file.filename}`;
        }


        const data = {
            subject,
            message,
            type,
            image: imageBase64,
            file: fileData,
            compCodes: parsedCompCodes,
            STime: STime || null,
        };

        const result = await NoticeService.createNotice(data);

        res.status(200).json({
            message: "Notice created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error creating notice:", error);
        res.status(500).json({ error: "Failed to create notice" });
    }
}

async function getDistinctCompCodes(req, res) {
    try {
        const compCodes = await NoticeService.getDistinctCompCodes();

        res.status(200).json({ compCodes });
    } catch (error) {
        console.error("Error fetching company codes:", error);
        res.status(500).json({ error: "Failed to fetch company codes" });
    }
}

async function getAllNotices(req, res) {
    try {
        const notices = await NoticeService.getNoticesWithCompNames();
        const schNotices = await NoticeService.getUpcomingScheduledNotices();

        notices.forEach((notice) => {
            const momentDate = moment(
                notice.createdAt,
                "YYYY-MM-DD hh:mm:ss A"
            );
            notice.timeAgo = momentDate.fromNow();
        });

        schNotices.forEach((notice) => {
            if (notice.STime) {
                // Convert to moment, then format to desired output
                const formattedSTime = moment(notice.STime).format(
                    "YYYY-MM-DD hh:mm:ss A"
                );
                notice.STime = formattedSTime; // Update STime with formatted value
            }
        });

        res.status(200).json({
            message: "Notices fetched successfully",
            data: notices,
            schNotices,
        });
    } catch (error) {
        console.error("Error fetching notices:", error);
        res.status(500).json({ error: "Failed to fetch notices" });
    }
}

const report_view = async (req, res) => {
    try {
        const companies = await companyService.getAllCompanies();
        function calculateTimeAgo(time) {
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

        const notices = await NoticeService.getNoticesWithCompNames();

        const noticesWithTimeAgo = notices.map((notice) => ({
            ...notice,
            timeAgo: calculateTimeAgo(notice.createdAt),
        }));
        const noticeCount = notices.length;
        const schNotices = await NoticeService.getUpcomingScheduledNotices();

        schNotices.forEach((notice) => {
            if (notice.STime) {
                // Convert to moment, then format to desired output
                const formattedSTime = moment(notice.STime).format(
                    "YYYY-MM-DD hh:mm:ss A"
                );
                notice.STime = formattedSTime; // Update STime with formatted value
            }
        });

        res.render("superadmin/layouts/main-layout", {
            title: "Company List",
            companies,
            pagetitle: "Company List",
            role: "superadmin",
            notices: noticesWithTimeAgo,
            noticeCount,
            schNotices,
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send("An error occurred while fetching company data.");
    }
};

module.exports = {
    superlogin_view,
    superlogin_post,
    dashboard_view,
    home_view,
    subs_view,
    register_view,
    register_post,
    register_company,
    update_company,
    company_view,
    delete_company,
    reports_view,
    settings_view,
    getProfile,
    updateProfile,
    forgotPassword_view,
    forgotPassword_post,
    resetPassword_view,
    resetPassword,
    createNotice,
    getDistinctCompCodes,
    getAllNotices,
    report_view
};
