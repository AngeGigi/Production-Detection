const DBLocationRepository = require("../../infrastructure/database/dbLocationRepository");
const locationRepository = new DBLocationRepository();

const fetchLocations = async (compCode) => {
  return await locationRepository.findLocationsByCompany(compCode);
};

const addLocation = async (locationEntity) => {
  return await locationRepository.createLocation(locationEntity);
};

const checkLocation = async (criteria) => {
  return await locationRepository.locationExists(criteria);
};

const updateLocation = async (locationEntity) => {
  return await locationRepository.updateLocation(locationEntity);
};

const deleteLocation = async ({ id, compCode }) => {
  return await locationRepository.deleteLocation(id, compCode);
};

module.exports = {
  fetchLocations,
  addLocation,
  checkLocation,
  updateLocation,
  deleteLocation,
};
