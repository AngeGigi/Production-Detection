
// REGISTRATION
const registration_view = async (req, res) => {

    const compCode = req.session.user?.compCode;

    try {
        const locations = await Location.findAll({
            order: [["createdAt", "DESC"]],
        }); 

        res.render('layout', { title: "Review Registration", pagetitle: "Registration", locations, compCode });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// MISMATCH LOCATION
const mismatch_loc_view = async (req, res) => {
    const compCode = req.session.user?.compCode;

    try {
        const locations = await Location.findAll({
            where: {
                compCode: compCode 
            },    
            order: [["createdAt", "DESC"]],
        }); 

        res.render('layout', { title: "Mismatch Location", pagetitle: "Mismatch Location", locations, compCode });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

// REGISTRATION
const logs_view = async (req, res) => {
    const compCode = req.session.user?.compCode;

    try {
        const locations = await Location.findAll({
            where: {
                compCode: compCode 
            },   
            order: [["createdAt", "DESC"]],
        }); 

        res.render('layout', { title: "Review Logs", pagetitle: "Logs", locations, compCode });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    registration_view,
    mismatch_loc_view,
    logs_view
};
