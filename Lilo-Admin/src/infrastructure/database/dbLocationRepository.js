const db = require('../database');
const LocationRepository = require("../../adapters/repositories/locationRepository");

class DBLocationRepository extends LocationRepository {
    constructor() {
        super();
        this.db = db; // Assign the database object
    }

    async findLocationsByCompany(compCode) {
        const query = `
            SELECT * FROM Location
            WHERE compCode = ?
            ORDER BY createdAt DESC
        `;
        return await this.db.allAsync(query, [compCode]);
    }

    async getLocationIDByName(name, compCode) {
        const query = `SELECT id FROM Location WHERE name = ? AND compCode = ?;`;
        const result = await db.getAsync(query, [name, compCode]);
        return result;
    }

    async getLocationByName(eid, compCode) {
        const query = `SELECT * FROM Location WHERE id = ? AND compCode = ?`;
        try {
            console.log("Executing query:", query, [eid, compCode]);
            const location = await this.db.getAsync(query, [eid, compCode]);
    
            if (!location) {
                console.error(`Location '${eid}' not found for company code '${compCode}'`);
                throw new Error(`Location '${eid}' not found`);
            }
    
            return location;
        } catch (error) {
            console.error("Error querying database:", error.message);
            throw error;
        }
    }
    

    async createLocation(locationEntity) {
        const { name, lat, long, compCode } = locationEntity;
        const query = `
            INSERT INTO Location (name, lat, long, compCode)
            VALUES (?, ?, ?, ?)
        `;
        const result = await this.db.runAsync(query, [name, lat, long, compCode]);
        return { id: result.lastID, ...locationEntity };
    }

    async locationExists({ name, lat, long, compCode }) {
        const query = `
            SELECT * FROM Location
            WHERE compCode = ?
            AND (name = ? OR (lat = ? AND long = ?))
            LIMIT 1
        `;
        return await this.db.getAsync(query, [compCode, name, lat, long]);
    }

    async updateLocation(locationEntity) {
        const { id, name, lat, long, compCode } = locationEntity;
        const query = `
            UPDATE Location
            SET name = ?, lat = ?, long = ?
            WHERE id = ? AND compCode = ?
        `;
        const result = await this.db.runAsync(query, [name, lat, long, id, compCode]);
        if (result.changes === 0) {
            throw new Error("Location not found or unauthorized access.");
        }
        return { id, name, lat, long, compCode };
    }

    async deleteLocation(id, compCode) {
        const query = `
            DELETE FROM Location
            WHERE id = ? AND compCode = ?
        `;
        const result = await this.db.runAsync(query, [id, compCode]);
        if (result.changes === 0) {
            throw new Error("Location not found or unauthorized access.");
        }
        return { message: "Location deleted successfully!" };
    }
}

module.exports = DBLocationRepository;
