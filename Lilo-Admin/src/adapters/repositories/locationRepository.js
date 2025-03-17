class LocationRepository {
    async findLocationsByCompany(compCode) {
      throw new Error("findLocationsByCompany method not implemented");
    }
  
    async getLocationByName(locationName, compCode) {
      throw new Error("getLocationByName method not implemented");
    }


    async createLocation(locationEntity) {
      throw new Error("createLocation method not implemented");
    }
  
    async locationExists({ name, lat, long, compCode }) {
      throw new Error("locationExists method not implemented");
    }
  
    async updateLocation(locationEntity) {
      throw new Error("updateLocation method not implemented");
    }
  
    async deleteLocation(id, compCode) {
      throw new Error("deleteLocation method not implemented");
    }
  }
  
  module.exports = LocationRepository;
  