const NotificationService = require('./NotificationService');
const dbNoticeRepository = require('../../infrastructure/database/dbNoticeRepository');
const db = require('../../infrastructure/database/setupDatabase');
const io = require('socket.io-client');
 
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
 
const notificationService = new NotificationService(db, dbNoticeRepository);
 
async function runNotificationCheck() {
    try {
        const result = await notificationService.checkExpirations();
 
        const statusMessage = result
            ? `Reminder sent on ${getCurrentDate()}`
            : `No reminders sent on ${getCurrentDate()}`;
 
        const superadminNamespace = global.io.of('/superadmin');
        superadminNamespace.emit('superadmin-notification', statusMessage);
 
        return statusMessage;
    } catch (error) {
        console.error('Error running notification check:', error);
        throw error;
    }
}
 
 
runNotificationCheck();
module.exports = { runNotificationCheck };