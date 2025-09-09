const mysql = require('mysql2/promise');
const { db: dbConfig } = require('../config');

let pool;


async function initializeDatabase() {
  try {
   
    const initialConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    const dbName = dbConfig.database;
    console.log(`Checking if database '${dbName}' exists...`);
    
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists.`);
    
    await initialConnection.end();
    
    if (!pool) {
      pool = mysql.createPool(dbConfig);
    }
    
    const connection = await pool.getConnection();
    try {
      console.log('Database pool created and connection verified.');
      
      await createTablesIfNotExist(connection);
      
      const { applyDatabaseModifications } = require('./modifydatabase');
      await applyDatabaseModifications(connection);
      
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}


async function createTablesIfNotExist(connection) {

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      destination VARCHAR(100) NOT NULL,
      destination_iata_code VARCHAR(3),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      budget DECIMAL(10, 2) NOT NULL,
      group_size INT NOT NULL DEFAULT 1,
      transport VARCHAR(50),
      activities JSON,
      other_activity TEXT,
      special_needs TEXT,
      name VARCHAR(100),
      packing_list JSON,
      country_info JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      leg_number INT DEFAULT 1,
      flight_type ENUM('one-way', 'round-trip', 'multi-trip') DEFAULT 'one-way',
      airline VARCHAR(100),
      flight_number VARCHAR(20),
      from_city VARCHAR(100),
      to_city VARCHAR(100),
      departure_time TIME,
      departure_date DATE,
      arrival_time TIME,
      arrival_date DATE,
      duration VARCHAR(20),
      price DECIMAL(10,2),
      currency VARCHAR(3) DEFAULT 'THB',
      stops INT DEFAULT 0,
      traveler_type VARCHAR(50),
      fare_class VARCHAR(50),
      baggage_quantity INT DEFAULT 0,
      bag_weight VARCHAR(20),
      bag_weight_unit VARCHAR(20),
      aircraft_code VARCHAR(50),
      fare_basis VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'THB',
      description TEXT,
      image_url VARCHAR(255),
      location VARCHAR(255),
      rating INT,
      amenities JSON,
      check_in_date DATE,
      check_out_date DATE,
      stops INT DEFAULT 0,
      city_code VARCHAR(3),
      number_of_adults INT DEFAULT 1,
      room JSON,
      policies JSON,
      room_type VARCHAR(50),
      room_beds INT,
      room_bed_type VARCHAR(50),
      cancellation_policy TEXT,
      payment_methods JSON,
      contact_phone VARCHAR(50),
      contact_email VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS daily_schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      day INT NOT NULL,
      date DATE,
      activities JSON,
      day_name VARCHAR(100),
      activity_count INT DEFAULT 0,
      day_cost DECIMAL(10, 2) DEFAULT 0,
      full_day_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      total_budget DECIMAL(10, 2) NOT NULL,
      planned_expenses DECIMAL(10, 2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS saved_trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS trip_packing_lists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      items JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY (trip_id)
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS weather (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      destination VARCHAR(100) NOT NULL,
      weather_data JSON,
      forecast_data JSON,
      temperature_avg DECIMAL(5,2),
      temperature_min DECIMAL(5,2),
      temperature_max DECIMAL(5,2),
      humidity INT,
      precipitation DECIMAL(5,2),
      wind_speed DECIMAL(5,2),
      weather_condition VARCHAR(100),
      forecast_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  await connection.query(`
    CREATE TABLE IF NOT EXISTS local_recommendations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trip_id INT NOT NULL,
      destination VARCHAR(100) NOT NULL,
      place_name VARCHAR(200) NOT NULL,
      description TEXT,
      image_url VARCHAR(255),
      category VARCHAR(100),
      location VARCHAR(255),
      rating DECIMAL(3,2),
      price_range VARCHAR(50),
      opening_hours VARCHAR(200),
      contact_info JSON,
      coordinates JSON,
      recommended_duration VARCHAR(50),
      best_time_to_visit VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);
  
  console.log('Database tables created if they didn\'t exist.');
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

module.exports = { initializeDatabase, getPool };