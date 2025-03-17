// app/frameworks/models/Record.js
class Record {
    constructor(id, empID, time, date, act, img, address, long, lat, createdAt, updatedAt) {
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
  }
  
  module.exports = Record;
  