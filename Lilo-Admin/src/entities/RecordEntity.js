class RecordEntity {
    constructor({ id, empID, time, date, act, img, address, long, lat, createdAt, updatedAt }) {
      this.id = id;
      this.empID = empID;
      this.time = time;
      this.date = date;
      this.act = act;
      this.img = img;
      this.address = address;
      this.long = long;
      this.lat = lat;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    // Example: Validate record activity
    validateActivity() {
      if (!['in', 'out'].includes(this.act)) {
        throw new Error('Invalid activity type.');
      }
    }
  }
  
  module.exports = RecordEntity;
  