const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bookRoutes = require('./routes/AdminbookRoutes');
const { connectDB } = require('./config/db');
const bodyParser = require('body-parser'); 
const userBookRoutes = require('./routes/userBookRoutes')
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: '500mb' })); 
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));

app.use(cookieParser());


// Middleware
app.use(bodyParser.json({ limit: '100mb' })); // Adjust as needed
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


// Routes
app.use('/api/books', bookRoutes);
app.use('/', userBookRoutes)

// Connect to MongoDB
connectDB().then(() => {
    console.log('Database connected successfully');
}).catch(err => {
    console.error('Database connection error:', err);
});

module.exports = { app };
