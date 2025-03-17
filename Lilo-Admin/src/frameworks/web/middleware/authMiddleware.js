const jwt = require('jsonwebtoken'); 

function SessionAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return next(); 
    } else {
        return res.redirect('/admin/login'); 
    }
}

function TokenAuthenticated(req, res, next) {
    let { token } = req.session || {};
    console.log("Session Token:", token); 

    if (!token) {
        req.session.alertMessage = 'Session expired. Please log in again.';
        return res.redirect('/admin/login'); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN); 
        if (decoded.role !== 'admin') {
            throw new Error('Invalid role');
        }
        req.user = decoded; 
        return next(); 

    } catch (error) {
        console.error('Token verification failed:', error);

        if (error.name === 'TokenExpiredError') {
            req.session.alertMessage = 'Your session has expired. Please log in again.';
        } else {
            req.session.alertMessage = 'Authentication failed. Please log in again.';
        }

        req.session.destroy((err) => { 
            if (err) {
                console.error('Session destroy error:', err);
            }
            return res.redirect('/admin/login'); 
        });
    }
}

module.exports = {
    SessionAuthenticated,
    TokenAuthenticated
};
