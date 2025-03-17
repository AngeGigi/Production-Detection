const CompanyEntity = require("../../entities/CompanyEntity");
const moment = require("moment");
class CompanyService {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async getAllCompanies() {
        return await this.companyRepository.fetchAllCompanies();
    }

    async registerCompany(companyData) {
        try {
            const newCompany = await  this.companyRepository.save(companyData);
            return newCompany;
        } catch (error) {
            throw new Error(error.message || 'Error while adding employee record');
        }
    }


    async updateCompany(compCode, updatedEntity) {
        try {
            console.log("service", compCode, updatedEntity)
          const result = await this.companyRepository.update(compCode, updatedEntity); 
          console.log(result)
          return result > 0; 
         
        } catch (err) {
          throw new Error('Error updating company: ' + err.message);
        }
      }
    

    async deleteCompany(compCode) {
        try {
            const deletedRows = await this.companyRepository.delete(compCode);
            return deletedRows > 0;
        } catch (err) {
            throw new Error('Error deleting company: ' + err.message);
        }
    }

    async getCompanyByCompCode(compCode) {
        try {
            return await this.companyRepository.findByCompCode(compCode);
        } catch (err) {
            throw new Error('Error fetching company: ' + err.message);
        }
    }

    async getAnalyticsData(){
        try {
           const currentDate = moment().format('dddd, MMMM D, YYYY');
            const currentTime = moment().format('h:mm:ss A'); 

            const today = new Date().toISOString().split('T')[0];
            const CompanyCount = await this.companyRepository.getCountCompanies();
            const TotalTrial = await this.companyRepository.getAllTrial();
            const TotalPro = await this.companyRepository.getAllPro();
            const TotalPremium = await this.companyRepository.getAllPremium();
            const TotalHome = await this.companyRepository.getAllHome();
            const TotalOffice = await this.companyRepository.getAllOffice();
            const TotalFeat = await this.companyRepository.getAllFeat();
            const TotalVer = await this.companyRepository.getAllVer();
            const TotalGPS = await this.companyRepository.getAllGPS();
            const TotalExt = await this.companyRepository.getAllExt();
            const TotalApi = await this.companyRepository.getAllApi();
            const TotalLoc = await this.companyRepository.getAllLoc();

            const recentUsers = await this.companyRepository.getRecentlyAdded();
            const latestCompany = await this.companyRepository.getCompaniesNearExpiration();
            const chartData = await this.companyRepository.getCompaniesByActivity();

            return {
                currentDate,
                currentTime,
                today,
                CompanyCount,
                TotalTrial,
                TotalPro,
                TotalPremium,
                TotalHome,
                TotalOffice,
                TotalFeat,
                TotalVer,
                TotalGPS,
                TotalExt,
                TotalApi,
                TotalLoc,
                recentUsers,
                latestCompany,
                chartData
            }
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            throw error;
          }
    }

   

    async ReportCompanies() {
        return await this.companyRepository.ReportCompanies();
    }
   
}

module.exports = CompanyService;
