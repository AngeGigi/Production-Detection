const AdminService = require("../../application/services/AdminService");
const AdminEntity = require("../../entities/AdminEntity");
const AdminRepository = require("../repositories/adminRepository");
const RecordService = require("../../application/services/RecordService");
const NoticeService = require("../../application/services/NoticeService");
const moment = require("moment");
const getLayoutForPath = require('../views/helper/adminlayoutHelper');

const login_view = (req, res) => {
    res.render("admin/layouts/auth-layout", { title: "Log In" });
};

async function login_post(req, res) {
    try {
        const { username, password } = req.body;
        console.log("Received login request", { username });

        const { token, admin, expirationTime } = await AdminService.login(
            username,
            password
        );

        req.session.user = {
            username: admin.username,
            compCode: admin.compCode,
        };
        req.session.token = token;
        req.session.expiration = expirationTime;

        console.log("Session user set to:", req.session.user);
        console.log("Session token set:", req.session.token);
        console.log("Session expiration set:", req.session.expiration);

        return res.json({
            isSuccess: true,
            detail: "Admin logged in successfully",
            compCode: admin.compCode,
            token,
            expiration: expirationTime,
        });
    } catch (error) {
        console.error(error);

        if (
            error.message === "Username Not Found" ||
            error.message === "Incorrect Password"
        ) {
            return res.json({
                isSuccessful: false,
                message: error.message, // Returns the specific error message
            });
        }

        return res.render("admin/layout", { error: "Something went wrong!" });
    }
}

const register_view = (req, res) => {
    res.render("admin/layout", { title: "Register" });
};

async function register_post(req, res) {
    try {
        const { username, password, email, compCode } = req.body;
        const adminEntity = new AdminEntity({ compCode, username, email, password });

        await AdminService.register(adminEntity);

        res.status(201).send({ message: "Company registered successfully." });

    } catch (err) {
        console.error("Error registering admin:", err);
        res.status(500).send({
            message: "Error registering admin.",
            error: err.message,
        });
    }
}

const analytics_view = async (req, res) => {
    try {
        const user = req.session.user;
        const token = req.session.token;
        const exp = req.session.expiration;
        const compCode = req.session.user?.compCode;

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

        console.log("Token:", token);
        console.log("Token Expiry:", exp);
        const analyticsData = await AdminService.getAnalyticsData(compCode);
        const startRecords = await RecordService.getStartRecordsByDate(
            compCode
        );
        const data = await RecordService.getStartRecordsByDate(compCode);
        res.render("admin/layouts/main-layout", {
            layout: getLayoutForPath(req.path),
            role: "admin",
            title: "Dashboard",
            user: user,
            token,
            exp,
            compCode,
            pagetitle: "Dashboard",
            ...analyticsData,
            startRecords,
            Records: JSON.stringify(data),
            notices: noticesWithTimeAgo,
            noticeCount,
        });
    } catch (error) {
        console.error("Error rendering analytics view:", error);
        res.status(500).send("Internal Server Error");
    }
};

const forgotPassword_view = (req, res) => {
    res.render("admin/layouts/auth-layout", { title: "Forgot Password" });
};

const forgotPassword_post = async (req, res) => {
    try {
        const { username, email } = req.body;
        const response = await AdminService.forgotPassword(username, email);
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
        const admin = await AdminRepository.findByResetToken(token);

        if (!admin) {
            return res.status(400).send("Invalid or expired token.");
        }

        return res.render("admin/layouts/auth-layout", { title: "Reset Password", token });
    } catch (error) {
        console.error(error);
        return res.status(500).send("An error occurred.");
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;
        const response = await AdminService.resetPassword(token, newPassword);
        res.redirect("/admin/login");
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

async function getAllFilteredNotices(req, res) {
    const compCode = req.session.user?.compCode;

    try {
        const notices = await NoticeService.getNoticesByCompCode(compCode);
        notices.forEach((notice) => {
            const momentDate = moment(
                notice.createdAt,
                "YYYY-MM-DD hh:mm:ss A"
            );
            notice.timeAgo = momentDate.fromNow();
        });
        res.status(200).json({
            message: "Notices fetched successfully",
            data: notices,
        });
        // res.render('layout', { data:notices, compName, noticeCount: notices.length });
    } catch (error) {
        console.error("Error fetching notices:", error);
        res.status(500).json({ error: "Failed to fetch notices" });
    }
}

async function findCompNameByCompCode(req, res) {
    const compCode = req.session.user?.compCode;
    if (!compCode) {
        throw new Error("Company code not found in session");
    }
    try {
        const compName = await NoticeService.findCompNameByCompCode(compCode);
        console.log("Name", compName);
        console.log("Code", compCode);
        res.status(200).json({ compName });
    } catch (error) {
        console.error("Error fetching company codes:", error);
        res.status(500).json({ error: "Failed to fetch company codes" });
    }
}

module.exports = {
    login_view,
    login_post,
    register_view,
    register_post,
    analytics_view,
    forgotPassword_view,
    forgotPassword_post,
    resetPassword_view,
    resetPassword,
    getAllFilteredNotices,
    findCompNameByCompCode,
};
