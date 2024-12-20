const { default: mongoose } = require("mongoose");
require('dotenv').config();

const Connect = async () => {
    try {
        await mongoose.connect(process.env.database);
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Error while connecting to database:", error.message);
    }
}

module.exports = Connect;