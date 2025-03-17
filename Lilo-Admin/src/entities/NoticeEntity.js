class NoticeEntity {
    constructor(id, compCodes, subject, type, message, image = null, file = null, STime, createdAt, updatedAt) {
        this.id = id;
        this.compCodes = compCodes;
        this.subject = subject;
        this.type = type;
        this.message = message;
        this.image = image;
        this.file = file;
        this.STime = STime;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Method to convert the entity to a plain object
    toPlainObject() {
        return {
            id: this.id,
            compCode: this.compCode,
            subject: this.subject,
            type: this.type,
            message: this.message,
            image: this.image,
            file: this.file,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = NoticeEntity;
