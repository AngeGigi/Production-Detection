const cron = require('node-cron');
const moment = require('moment-timezone');
const NotificationService = require('./NotificationService');

const notificationService = new NotificationService();

function startCronJobs(io) {
    cron.schedule('0 0 * * *', async () => {
        const notificationsSentToday = await notificationService.checkExpirations();
        
        const date = moment().tz('Asia/Manila').format('YYYY-MM-DD');
        const reportMessage = notificationsSentToday 
            ? `Notifications about expiration have been sent today (${date})`
            : `Notifications haven't been sent today (${date})`;

        io.emit('notifications-status', reportMessage); 
    });
}

module.exports = startCronJobs;
