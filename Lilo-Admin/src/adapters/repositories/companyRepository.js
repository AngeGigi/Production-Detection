const DBCompanyRepository = require('../../infrastructure/database/dbCompanyRepository');

class CompanyRepository {
  async fetchAllCompanies() {
      throw new Error('fetchAllCompanies method not implemented');
  }

  async findByCompcode(id) {
      throw new Error('findById method not implemented');
  }

  async save(companyEntity) {
      throw new Error('save method not implemented');
  }

  async update(compCode, companyEntity) {
      throw new Error('update method not implemented');
  }

  async delete(compCode) {
      throw new Error('delete method not implemented');
  }

  async getCountCompanies() {
          try {
              return await DBCompanyRepository.getCountCompanies();
          } catch (error) {
              console.error('Error in Notice Repository:', error);
              throw error;
          }
      };

      async getAllTrial() {
        try {
            return await DBCompanyRepository.getAllTrial();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllPro() {
        try {
            return await DBCompanyRepository.getAllPro();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllPremium() {
        try {
            return await DBCompanyRepository.getAllPremium();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };


    async getAllome() {
        try {
            return await DBCompanyRepository.getAllHome();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllOffice() {
        try {
            return await DBCompanyRepository.getAllOffice();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllFeat() {
        try {
            return await DBCompanyRepository.getAllFeat();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllVer() {
        try {
            return await DBCompanyRepository.getAllVer();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllGPS() {
        try {
            return await DBCompanyRepository.getAllGPS();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllExt() {
        try {
            return await DBCompanyRepository.getAllExt();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllApi() {
        try {
            return await DBCompanyRepository.getAllApi();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getAllLoc() {
        try {
            return await DBCompanyRepository.getAllLoc();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async getRecentlyAdded() {
        try {
            return await DBCompanyRepository.getRecentlyAdded();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };

    async ReportCompanies() {
        try {
            return await DBCompanyRepository.ReportCompanies();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }   
    };

    async getCompaniesNearExpiration() {
        try {
            return await DBCompanyRepository.getCompaniesNearExpiration();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };
    
    async getCompaniesByActivity() {
        try {
            return await DBCompanyRepository.getCompaniesByActivity();
        } catch (error) {
            console.error('Error in Notice Repository:', error);
            throw error;
        }
    };
}

module.exports = CompanyRepository;
