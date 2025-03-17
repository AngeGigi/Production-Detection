const express = require("express");
const morgan = require("morgan");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const rateLimit = require('express-rate-limit');
const path = require("path");
const cors = require("cors");
const initializeDatabase = require('../../infrastructure/database/setupDatabase');
const { SessionAuthenticated } = require('./middleware/authMiddleware');
const http = require('http');
const socketIo = require('socket.io');
const startCronJobs = require('../../application/services/cronTasks');
const adminRoutes = require('../../adapters/routes/adminRoutes');
const superadminRoutes = require('../../adapters/routes/superadminRoutes');
const homeRoutes = require('../../adapters/routes/homeRoutes');
const settingsRoutes = require('../../adapters/routes/settingsRoutes');
const reportsRoutes = require('../../adapters/routes/reportRoutes');
const employeeRoutes = require('../../adapters/routes/employeeRoutes');
const reviewRoutes = require("../../adapters/routes/reviewRoutes");
 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
global.io = io;
 
const superadminNamespace = io.of('/superadmin');
 
superadminNamespace.on('connection', (socket) => {
    console.log('Superadmin connected to reports namespace');
 
    socket.emit('superadmin-notification', 'Welcome to Superadmin Reports.');
 
    socket.on('request-report-status', () => {
        socket.emit('superadmin-notification', 'Report generation in progress...');
    });
 
    socket.on('disconnect', () => {
        console.log('Superadmin disconnected from reports namespace');
    });
});
 
 
app.use(express.static(path.join(__dirname, '../../../public')));
 
app.use(session({
    store: new FileStore({ path: './sessions', ttl: 3600 }),
    secret: process.env.SESSION_SECRET || "12345678",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000,
        httpOnly: true,
        secure: false
    }
}));
 
initializeDatabase();
 
app.use(
    cors({
        origin: "http://localhost:2023",
        methods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
 
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
    message: "Too many requests from this IP, please try again later."
});
 
app.use(limiter);
 
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
 
app.set('views', path.join(__dirname, '../../adapters/views'));
app.set("view engine", "ejs");
 
app.get("/", SessionAuthenticated, (req, res) => {
    res.redirect("/admin/dashboard");
});
 
app.use('/admin', adminRoutes);
app.use("/homepage", homeRoutes);
app.use("/settings", settingsRoutes);
app.use("/reports", reportsRoutes);
app.use("/employee", employeeRoutes);
// app.use("/reviews", reviewRoutes);
 
app.use('/superadmin', superadminRoutes);
 
 
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error destroying session.");
        }
        res.redirect('/admin/login');
    });
});
 
 
app.get('/superlogout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Error destroying session.");
        }
        res.redirect('/superadmin/login');
    });
});
 
 
app.use((req, res) => {
    res.status(404).render("global/404", { title: "404: Page Not Found" });
});
 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
 
 
const start = () => {
    app.listen(2024, () => {
        console.log("Server is running on http://localhost:2024");
    });
};
 
process.on('SIGINT', () => {
    server.close(() => {
        console.log('HTTP server shut down.');
 
        io.close(() => {
            console.log('Socket.IO server shut down.');
            process.exit(0);
        });
    });
});
 
 
module.exports = { start };