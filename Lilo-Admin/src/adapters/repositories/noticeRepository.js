const DBNoticeRepository = require('../../infrastructure/database/dbNoticeRepository');

class NoticeRepository {
    async createNotice(notice) {
        return await DBNoticeRepository.createNotice(notice);
    }

    async getDistinctCompCodes() {
        return await DBNoticeRepository.getDistinctCompCodes();
    }

    async getAllNotices() {
        try {
            return await DBNoticeRepository.getAllNotices();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getNoticesWithCompNames() {
        try {
            return await DBNoticeRepository.getNoticesWithCompNames();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    
    async getNoticesByCompCode(compCode) {
        try {
            return await DBNoticeRepository.getNoticesByCompCode(compCode);
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async findCompNameByCompCode(compCode) {
        try {
            return await DBNoticeRepository.findCompNameByCompCode(compCode);
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        
        }
    };

    async getUpcomingScheduledNotices() {
        try {
            return await DBNoticeRepository.getUpcomingScheduledNotices();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    

}

module.exports = new NoticeRepository();
