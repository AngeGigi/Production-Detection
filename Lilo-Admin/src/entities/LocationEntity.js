class LocationEntity {
    constructor({ id, name, long, lat, compCode, createdAt, updatedAt }) {
      this.id = id;
      this.name = name;
      this.long = long;
      this.lat = lat;
      this.compCode = compCode;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
    }
  
    validateCoordinates() {
      if (typeof this.long !== 'number' || typeof this.lat !== 'number') {
        throw new Error('Invalid coordinates.');
      }
    }
  }
  
  module.exports = LocationEntity;
  