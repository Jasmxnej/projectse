require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db/createdatabase');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const tripRoutes = require('./routes/trips');
const tripFlightRoutes = require('./routes/trip-flights');
const tripHotelRoutes = require('./routes/trip-hotels');
const tripScheduleRoutes = require('./routes/trip-schedule');
const tripBudgetRoutes = require('./routes/trip-budget');
const tripPackingListRoutes = require('./routes/trip-packing-list');
const contactRoutes = require('./routes/contact');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error processing request: ${err.message}`);
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

async function startServer() {
  try {
    console.log('Initializing database connection...');
    await initializeDatabase();
    console.log('Database initialized successfully, starting server...');

    app.use('/api/auth', authRoutes);
    app.use('/api/trips/:tripId/flights', tripFlightRoutes);
    app.use('/api/trips/:tripId/hotel', tripHotelRoutes);
    app.use('/api/trips/:tripId/schedule', tripScheduleRoutes);
    app.use('/api/trips/:tripId/budget', tripBudgetRoutes);
    app.use('/api/trips/:tripId/packing-list', tripPackingListRoutes);
    app.use('/api/trips', tripRoutes);
    app.use('/api', apiRoutes);
    app.use('/api/contact', contactRoutes);

    app.get('/api/status', (req, res) => {
      res.status(200).send({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: process.env.DB_DATABASE || 'tripplanners'
      });
    });
    
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`API available at http://localhost:${port}/api`);
      console.log(`Database: ${process.env.DB_DATABASE || 'tripplanners'}`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:');
    console.error(error);
    
    if (error.message && error.message.includes('Unknown database')) {
      console.error('\nERROR: Database does not exist. The application will attempt to create it on next startup.');
      console.error('Please check your .env file and make sure DB_DATABASE is set correctly.');
      console.error('Current DB_DATABASE value:', process.env.DB_DATABASE);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nERROR: Could not connect to MySQL server.');
      console.error('Please make sure MySQL is running and check your connection settings in .env:');
      console.error(`Host: ${process.env.DB_HOST || '127.0.0.1'}`);
      console.error(`Port: ${process.env.DB_PORT || '3306'}`);
      console.error(`User: ${process.env.DB_USER || 'root'}`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nERROR: Access denied to MySQL server.');
      console.error('Please check your username and password in .env:');
      console.error(`User: ${process.env.DB_USER || 'root'}`);
      console.error('Password: [hidden for security]');
    }
    
    process.exit(1);
  }
}

startServer();
