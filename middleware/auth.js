const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided. Authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, 'Uday');
        
        // Add user data to request
        req.user = decoded;
        next();
        
    } catch (error) {
        res.status(401).json({ message: "Invalid token. Authorization denied" });
    }
};

const authorizeAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin rights required" });
        }
        next();
    } catch (error) {
        res.status(403).json({ message: "Authorization failed" });
    }
};

module.exports = { auth, authorizeAdmin };
