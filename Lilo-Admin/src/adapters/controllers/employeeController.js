    const jwt = require('jsonwebtoken');
    const EmployeeService = require('../../application/services/employeeService');
    const employeeService = new EmployeeService();

    class EmployeeController {
        constructor() {
            this.signIn = this.signIn.bind(this);
            this.validateToken = this.validateToken.bind(this);
            this.addRecord = this.addRecord.bind(this);
            this.fetchRecords = this.fetchRecords.bind(this);  
        }

        async signIn(req, res) {
            const { compCode, empID } = req.body;
            try {
                const employee = await employeeService.getEmployeeById(empID, compCode);

                if (employee) {
                    req.session.compCode = compCode;
                    req.session.empID = empID;

                    const token = jwt.sign({ compCode, empID }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    const decoded = jwt.decode(token);

                    return res.status(200).json({
                        status: 'success',
                        employee: { empID: employee.empID, fname: employee.fname, lname: employee.lname },
                        token,
                        expiration: decoded.exp,
                    });
                }
                return res.status(404).json({ status: 'error', message: 'Employee not found.' });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ status: 'error', message: 'Log In Failed. Try Again.' });
            }
        }

        validateToken(token) {
            if (!token) {
                console.error('Token is missing');
                return null;
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded.exp < Math.floor(Date.now() / 1000)) {
                    console.log('Token has expired');
                    return null;
                }
                return decoded;
            } catch (error) {
                console.error('Token validation error:', error);
                return null;
            }
        }

        async getTokenForUser(req, res) {
            const token = req.params.token;

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const { compCode, empID } = decoded;

                const employee = await employeeService.getEmployeeById(empID, compCode);

                if (employee) {
                    return res.json({
                        status: 'success',
                        employee: {
                            empID: employee.empID,
                            fname: employee.fname,
                            lname: employee.lname,
                        },
                        token,
                        expiration: new Date(decoded.exp * 1000).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }),
                    });
                } else {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Employee not found.',
                    });
                }
            } catch (error) {
                console.error(error);
                return res.status(401).json({ success: false, message: 'Invalid token.' });
            }
        }

        authenticateToken(req, res, next) {
            const token = req.headers['authorization']?.split(' ')[1];

            if (!token) return res.status(401).json({ message: 'Token is missing' });

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) return res.status(403).json({ message: 'Token is invalid' });

                req.user = user;  
                next();
            });
        }

        isTokenExpired(token) {
            const decoded = jwt.decode(token);
            return decoded.exp < Math.floor(Date.now() / 1000);
        }

     
        async addRecord(req, res) {
            const token = req.headers['authorization']?.split(' ')[1];
            const decoded = this.validateToken(token);  
            if (!decoded) return res.status(401).json({ status: 'error', message: 'Invalid token.' });

            const { compCode, empID, time, date, act, img, address, long, lat } = req.body;

            if (!compCode || !empID || !time || !date || !act || !address || long === undefined || lat === undefined) {
                return res.status(400).json({ message: 'All fields are required.' });
            }

            try {
                const employee = await employeeService.getEmployeeById(empID, compCode);
                if (!employee) return res.status(404).json({ message: 'Employee not found.' });

                const newRecord = await employeeService.addEmployeeRecord({
                    empID: employee.id, time, date, act, img, address, long, lat,
                });
                return res.status(201).json(newRecord);
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'An error occurred.' });
            }
        }
    
        async fetchRecords(req, res) {
            const token = req.headers['authorization']?.split(' ')[1];
            const decoded = this.validateToken(token);  
            if (!decoded) {
                console.log('Invalid token or expired');
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid token. Please log in again.',
                });
            }

            const { compCode, empID } = req.body;

            console.log('Request body:', req.body);

            try {
                const employee = await employeeService.getEmployeeById(empID, compCode);
                if (!employee) {
                    console.log('Employee not found:', { compCode, empID });
                    return res.status(404).json({
                        status: 'error',
                        message: 'Employee not found or does not belong to the specified company.',
                    });
                }

                const records = await employeeService.getEmployeeRecords(employee.id);
                const filteredRecords = records.map(record => ({
                    activity: record.activity,
                    time: record.time,
                    date: record.date
                }));

                console.log('Employee records:', filteredRecords);

                return res.json({
                    status: 'success',
                    records: filteredRecords,
                });
            } catch (error) {
                console.error('Error fetching records:', error);
                return res.status(500).json({
                    status: 'error',
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        }

        checkAuth(req, res, next) {
            const token = req.headers['authorization']?.split(' ')[1];
            const { compCode, empID } = req.session || {};

            if (!compCode || !empID || !token) {
                return res.status(401).json({ success: false, message: 'Session expired or token missing.' });
            }

            try {
                jwt.verify(token, process.env.JWT_SECRET);
                req.user = jwt.decode(token); 
                next();
            } catch (error) {
                console.error(error);
                return res.status(400).json({ success: false, message: 'Invalid token.' });
            }
        }
    }

    module.exports = EmployeeController;
