const NoticeRepository = require('../../adapters/repositories/noticeRepository');
const EmployeeEntity = require('../../entities/EmployeeEntity');
const NoticeEntity = require('../../entities/NoticeEntity');

class NoticeService {
    async createNotice(notice) {
        return await NoticeRepository.createNotice(notice); 
    }

    async getDistinctCompCodes() {
        try {
            return await NoticeRepository.getDistinctCompCodes();
        } catch (error) {
            console.error('Error in service:', error);  
            throw error;  
        }
    }

    async getAllNotices() {
        try {
            return await NoticeRepository.getAllNotices();
        } catch (error) {
            console.error('Error in Notice Service:', error);
            throw error;
        }
    };

    async getNoticesWithCompNames() {
        try {
            return await NoticeRepository.getNoticesWithCompNames();
        } catch (error) {
            console.error('Error in Notice Service:', error);
            throw error;
        }
    };

    async getNoticesByCompCode(compCode) {
        try {
            return await NoticeRepository.getNoticesByCompCode(compCode);
        } catch (error) {
            console.error('Error in Notice Service:', error);
            throw error;
        }
    };

    async findCompNameByCompCode(compCode) {
        try {
            return await NoticeRepository.findCompNameByCompCode(compCode);
        } catch (error) {
            console.error('Error in Notice Service:', error);
            throw error;
        }
    };

    async getUpcomingScheduledNotices() {
        try {
            return await NoticeRepository.getUpcomingScheduledNotices();
        } catch (error) {
            console.error('Error in Notice Service:', error);
            throw error;
        }
    };

    async checkExpirations() {
        const query = `SELECT * FROM Company WHERE compExp IS NOT NULL`;
        const companies = await db.all(query);

        const currentDate = moment().tz('Asia/Manila');
        let noticeData = [];
        let notificationsSentToday = false;

        companies.forEach(company => {
            const expirationDate = moment(company.createdAt).add(company.compExp, 'days');
            const daysLeft = expirationDate.diff(currentDate, 'days');

            // Check for specific expiration conditions
            if (daysLeft <= 7 && daysLeft > 3) {
                noticeData.push({
                    compCodes: company.compCode,
                    subject: 'Expiration for 7 days',
                    message: `Your account will expire on ${expirationDate.format('YYYY-MM-DD')}.`
                });
            } else if (daysLeft <= 3 && daysLeft > 1) {
                noticeData.push({
                    compCodes: company.compCode,
                    subject: 'Expiration for 3 days',
                    message: `Your account will expire in 3 days on ${expirationDate.format('YYYY-MM-DD')}.`
                });
            } else if (daysLeft <= 1 && daysLeft > 0) {
                noticeData.push({
                    compCodes: company.compCode,
                    subject: 'Expiration for 24 hours',
                    message: `Your account will expire in 24 hours on ${expirationDate.format('YYYY-MM-DD')}.`
                });
            } else if (daysLeft <= 0) {
                noticeData.push({
                    compCodes: company.compCode,
                    subject: 'Expired account',
                    message: 'Your account has expired.'
                });
            }

            if (noticeData.length > 0) {
                notificationsSentToday = true;
            }
        });

        // Insert notices into the Notice table using repository
        if (noticeData.length > 0) {
            await this.dbNoticeRepository.insertNotices(noticeData);
        }

        return notificationsSentToday;
    }
}

module.exports = new NoticeService();
