const db = require('../database');
const { DateTime } = require('luxon'); 
const moment = require('moment-timezone');

class DBNoticeRepository {
    async createNotice(data) {
        console.log(data)
        const query = `
            INSERT INTO Notice (subject, message, type, image, file, compCodes, createdAt, STime)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        const createdAt = DateTime.now()
        .setZone('Asia/Manila')
        .toFormat('yyyy-MM-dd hh:mm:ss a');
        const params = [
            data.subject,
            data.message,
            data.type,
            data.image,
            data.file,
            JSON.stringify(data.compCodes),
            createdAt,
            data.STime,
         ];

        try {
            return await db.runAsync(query, params);
        } catch (error) {
            console.error('Error inserting notice:', error);
            throw error;
        }
    }

    async getDistinctCompCodes() {
        const sql = 'SELECT DISTINCT compCode, compName FROM Company'; 
    
        try {
            const compCodes = await db.allAsync(sql); 
            return compCodes;
        } catch (error) {
            console.error('Error fetching distinct company codes:', error);
            throw new Error('Failed to fetch distinct company codes');
        }
    }

    async getAllNotices() {
        const query = `
            SELECT *
            FROM Notice
            WHERE STime IS NULL OR datetime(STime, '+8 hours') <= datetime(CURRENT_TIMESTAMP, '+8 hours')
            ORDER BY createdAt DESC;
        `;
        try {
            return await db.allAsync(query); 
        } catch (error) {
            console.error('Error fetching notices from database:', error);
            throw error;
        }
    };

    async getNoticesWithCompNames() {
        try {
            const notices = await db.allAsync(`
                SELECT *
                FROM Notice
                WHERE STime IS NULL OR datetime(STime, '+8 hours') <= datetime(CURRENT_TIMESTAMP, '+8 hours')
                ORDER BY createdAt DESC
            `);
    
            const sql = `
                SELECT Company.compCode, Company.compName
                FROM Company
                WHERE Company.compCode IN (
                    SELECT value 
                    FROM Notice, json_each(Notice.compCodes)
                );
            `;
            const companies = await db.allAsync(sql);
    
            const compNamesMap = companies.reduce((acc, company) => {
                if (company.compCode) {
                    acc[company.compCode] = company.compName;
                }
                return acc;
            }, {});
    
            const noticesWithCompNames = notices.map(notice => {
                const compCodesArray = JSON.parse(notice.compCodes); 
                const compNamesArray = compCodesArray.map(code => {
                    return compNamesMap[code] || 'Unknown';  
                });
                return {
                    ...notice,
                    compNames: compNamesArray
                };
            });
    
            return noticesWithCompNames;
        } catch (error) {
            console.error('Error fetching notices with compNames:', error);
            throw error;
        }
    }
      
    
    async getNoticesByCompCode(compCode) {
        const sql = `
            SELECT *
            FROM Notice
            WHERE 
                (STime IS NULL OR datetime(STime, '+8 hours') <= datetime(CURRENT_TIMESTAMP, '+8 hours'))
                AND EXISTS (
                    SELECT 1
                    FROM json_each(Notice.compCodes)
                    WHERE json_each.value = ?
                )
            ORDER BY createdAt DESC;
        `;
        
        try {
            const allnotices = await db.allAsync(sql, [compCode]);  
    
            const notices = allnotices.map(notice => {
                const compCodes = JSON.parse(notice.compCodes); 
                if (compCodes.includes(compCode)) {
                    const message = notice.message;
    
                    const regex = new RegExp(`Account for ${compCode} has expired as of (.+?)\\.`); 
                    const match = message.match(regex);
    
                    if (match) {
                        const expirationDate = match[1]; 
    
                        const expirationMoment = moment(expirationDate, 'YYYY-MM-DD hh:mm A');
                        const currentDate = moment();
                        const expirationDiff = currentDate.diff(expirationMoment, 'days'); 
    
                        notice.message = `${match[0]} Expiration was ${Math.abs(expirationDiff)} days ago.`;
                    }
    
                    return notice; 
                }
            }).filter(Boolean); 
    
            return notices;
        } catch (error) {
            console.error('Error fetching notices by compCode:', error);
            throw new Error('Failed to fetch notices by compCode');
        }
    }
    
    

    async findCompNameByCompCode(compCode) {
        const sql = `
            SELECT compName 
            FROM Company 
            WHERE compCode = ?;
        `;
        try {
            const result = await db.getAsync(sql, [compCode]);
            return result ? result.compName : null;
    
        } catch (error) {
            console.error('Error in getCompNameByCompCode:', error);
            throw error;
        }
    }    

    async getUpcomingScheduledNotices() {
        const query = `
            SELECT *
            FROM Notice
            WHERE datetime(STime, '+8 hours') > datetime(CURRENT_TIMESTAMP, '+8 hours')
            ORDER BY STime ASC;
        `;
        try {
            return await db.allAsync(query);
        } catch (error) {
            console.error('Error fetching upcoming notices from database:', error);
            throw error;
        }
    }

    async insertNotices(notices) {
        const insertQuery = `
            INSERT INTO Notice (compCodes, subject, type, message, image, file, STime, createdAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        notices.forEach(notice => {
            const formattedCompCodes = notice.compCodes;
            const createdAt = moment().tz('Asia/Manila').format('YYYY-MM-DD hh:mm:ss A'); // Correct format for insertion
            
            db.run(insertQuery, [
                formattedCompCodes,
                notice.subject,
                notice.type,
                notice.message,
                notice.image,
                notice.file,
                notice.STime,
                createdAt 
            ], (err) => {
                if (err) console.error('Error inserting notice: ', err);
            });
        });
    }
    
}

module.exports = new DBNoticeRepository();
