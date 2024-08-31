// config/db.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
const password = process.env.MONGODB_PASSWORD;
const mongodbUrl = `mongodb+srv://owaissyedsgoc:${password}@cluster0.4rv9u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

async function connectDB() {
    try {
        await mongoose.connect(mongodbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit process with failure
    }
}

module.exports = { connectDB };
