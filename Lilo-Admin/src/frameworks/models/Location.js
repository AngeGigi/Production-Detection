class Location {
    constructor(id, name, long, lat, compCode, createdAt, updatedAt) {
      this.id = id;
      this.name = name;
      this.long = long;
      this.lat = lat;
      this.compCode = compCode;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  }
  
  module.exports = Location;
  