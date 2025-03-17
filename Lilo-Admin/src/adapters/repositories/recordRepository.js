const RecordEntity = require('../models/RecordEntity');
const dbRecordRepository = require('./dbRecordRepository');

class RecordRepository {
    async getAllRecords() {
        const results = await dbRecordRepository.findAll();
        return results.map((record) => new RecordEntity(record));
    }

    async getRecordById(id) {
        const result = await dbRecordRepository.findById(id);
        if (!result.length) throw new Error('Record not found');
        return new RecordEntity(result[0]);
    }

    async addRecord(recordData) {
        const record = new RecordEntity(recordData);
        record.validateActivity();
        await dbRecordRepository.create(record);
        return record;
    }

    async updateRecord(id, recordData) {
        const record = new RecordEntity(recordData);
        record.validateActivity();
        await dbRecordRepository.update(id, record);
        return record;
    }

    async deleteRecord(id) {
        await dbRecordRepository.delete(id);
    }
}

module.exports = new RecordRepository();
