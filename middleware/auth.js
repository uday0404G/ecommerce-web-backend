const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        console.log("Auth headers:", req.headers);
        
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
        res.status(401).json({ message: "Invalid token. Authorization denied",error });
    }
};

const authorizeAdmin = (req, res, next) => {
    try {
        console.log("Checking admin authorization:", req.user);
        
        if (!req.user) {
            return res.status(401).json({ message: "No user data found" });
        }

        if (req.user.role !== "admin") {
            console.log("User role is not admin:", req.user.role);
            return res.status(403).json({ message: "Access denied. Admin rights required" });
        }

        console.log("Admin authorization successful");
        next();
    } catch (error) {
        console.error("Admin authorization error:", error);
        res.status(403).json({ message: "Authorization failed", error: error.message });
    }
};

module.exports = { auth, authorizeAdmin };
