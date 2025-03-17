const db = require('../../infrastructure/database');
const moment = require('moment-timezone');
 
class NotificationService {
    constructor(db, dbNoticeRepository) {
        this.db = db;
        this.dbNoticeRepository = dbNoticeRepository;
    }
 
    async checkExpirations() {
        const query = `SELECT * FROM Company WHERE compExp IS NOT NULL`;
        const companies = await db.allAsync(query);
   
        const currentDate = moment().tz('Asia/Manila');
        let noticeData = [];
        let notificationsSentToday = false;
   
        const expiringCompanies = { '7': [], '5': [], '1': [] };
        const expiredCompanies = {};
   
        companies.forEach(company => {
            const createdAt = moment(company.createdAt, 'YYYY-MM-DD hh:mm A', true);
            if (!createdAt.isValid()) {
                console.error(`Invalid createdAt format for company ${company.compCode}: ${company.createdAt}`);
                return;
            }
   
            const expirationDate = createdAt.add(company.compExp, 'days');
            const daysLeft = expirationDate.diff(currentDate, 'days');
            const suspensionTime = expirationDate.format('hh:mm A');
   
            if ([7, 5, 1].includes(daysLeft)) {
                expiringCompanies[daysLeft].push({ code: company.compCode, suspensionTime });
            }
   
            const expirationDiff = Math.abs(expirationDate.diff(currentDate, 'days'));
   
            if (daysLeft < 0) {
                if (!expiredCompanies[company.compCode]) {
                    expiredCompanies[company.compCode] = { ...company, suspensionTime, expirationDiff };
                }
            }
        });
   
        for (const [daysLeft, companies] of Object.entries(expiringCompanies)) {
            if (companies.length > 0) {
                const compCodes = companies.map(c => c.code);
                const compCodesStr = JSON.stringify(compCodes);
                const expDateKey = currentDate.clone().add(parseInt(daysLeft, 10), 'days').format('YYYY-MM-DD');
                const subject = `Expiring Reminder in ${daysLeft} Days`;
   
                const existingNotificationQuery = `
                    SELECT * FROM Notice
                    WHERE subject = ?
                    AND createdAt LIKE ?
                    AND compCodes = ?
                `;
                const existingNotifications = await db.allAsync(existingNotificationQuery, [subject, `${currentDate.format('YYYY-MM-DD')}%`, compCodesStr]);
   
                if (existingNotifications.length === 0) {
                    const message = companies.map(c =>
                        `Account for ${c.code} will expire in ${daysLeft} days on ${expDateKey} at ${c.suspensionTime}.`
                    ).join('\n');
   
                    noticeData.push({
                        compCodes: compCodesStr,
                        subject,
                        type: 'Reminder',
                        message,
                        image: '',
                        file: '',
                    });
                } else {
                    notificationsSentToday = true;
                }
            }
        }
   
        if (Object.keys(expiredCompanies).length > 0) {
            const expiredCompCodes = Object.keys(expiredCompanies);
            const expiredMessage = Object.values(expiredCompanies).map(c => {
                const expirationDate = currentDate.clone().subtract(c.expirationDiff, 'days').format('YYYY-MM-DD');
               
                return `Account for ${c.compCode} has expired as of ${expirationDate} at ${c.suspensionTime}. ` +
                       `Expiration was ${c.expirationDiff} days ago.`;
            }).join('\n');
           
            const compCodesStrng = JSON.stringify(expiredCompCodes);
            const subject = 'Expired Reminder';
       
            const existingExpiredNotificationQuery = `
                SELECT * FROM Notice
                WHERE subject = ?
                AND createdAt LIKE ?
                AND compCodes = ?
            `;
            const existingExpiredNotifications = await db.allAsync(existingExpiredNotificationQuery, [subject, `${currentDate.format('YYYY-MM-DD')}%`, compCodesStrng]);
       
            if (existingExpiredNotifications.length === 0) {
                noticeData.push({
                    compCodes: compCodesStrng,
                    subject,
                    type: 'Reminder',
                    message: expiredMessage,
                    image: '',
                    file: '',
                });
            } else {
                notificationsSentToday = true;
            }
        }
       
   
        if (notificationsSentToday) {
            return {
                notificationsSentToday,
                message: `Reminder about notifications has been sent today (${currentDate.format('YYYY-MM-DD')})`,
            };
        }
   
        if (noticeData.length > 0) {
            await this.dbNoticeRepository.insertNotices(noticeData);
        }
   
        return {
            notificationsSentToday,
            message: noticeData.length > 0
                ? 'Notifications sent successfully.'
                : 'No notifications to send.',
        };
    }
   
}
 
module.exports = NotificationService;