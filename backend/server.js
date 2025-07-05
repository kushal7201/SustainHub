const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Set trust proxy for Azure
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : process.env.NODE_ENV === 'production' 
        ? ['https://sustainhub-frontend.pages.dev'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('MongoDB connected successfully');
    console.log('Environment:', process.env.NODE_ENV || 'development');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.get('/', (req, res) => {
    const healthStatus = {
        service: 'SustainHub Backend API',
        status: 'healthy',
        environment: process.env.NODE_ENV || 'development',
    };

    // Set status based on database connection
    if (mongoose.connection.readyState !== 1) {
        healthStatus.status = 'unhealthy';
        return res.status(503).json(healthStatus);
    }

    res.json(healthStatus);
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/upload', require('./routes/upload'));

// Health check route
app.get('/api/health', (req, res) => {
    const healthCheck = {
        message: 'SustainHub Backend is running!',
        status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        uptime: process.uptime() + ' seconds'
    };

    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json(healthCheck);
    }

    res.json(healthCheck);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
