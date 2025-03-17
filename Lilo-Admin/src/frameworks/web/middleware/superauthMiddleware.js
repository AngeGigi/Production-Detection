const jwt = require('jsonwebtoken'); 

function SuperSessionAuthenticated(req, res, next) {
    if (req.session &&  req.session.superuser) {
        return next(); 
    } else {
        return res.redirect('/superadmin/login'); 
    }
}

function SuperTokenAuthenticated(req, res, next) {
    let { supertoken } = req.session || {};
    console.log("Session Token:", supertoken); 

    if (!supertoken) {
        return res.redirect('/superadmin/login'); 
    }

    try {
        const decoded = jwt.verify(supertoken, process.env.JWT_SECRET_SUPERADMIN); 
        if (decoded.role !== 'superadmin') {
            throw new Error('Invalid role');
          }
        req.user = decoded; 
        return next(); 

    } catch (error) {
        console.error('Token verification failed:', error);

        req.session.destroy((err) => { 
            if (err) {
                console.error('Session destroy error:', err);
            }
            return res.redirect('/superadmin/login'); 
        });
    }
}

module.exports = {
    SuperSessionAuthenticated,
    SuperTokenAuthenticated
};
