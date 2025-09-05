const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router();
const packingListRouter = require('./trip-packing-list');

// Get all trips for a user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const pool = getPool();
    const [trips] = await pool.query("SELECT * FROM trips WHERE user_id = ?", [userId]);
    res.status(200).send(trips);
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).send({ message: "Error fetching trips", error: err.message });
  }
});

// Get a single trip by ID
router.get('/by-id/:tripId', async (req, res) => {
  const { tripId } = req.params;
  try {
    const pool = getPool();
    const [trips] = await pool.query("SELECT * FROM trips WHERE id = ?", [tripId]);
    if (trips.length === 0) {
      return res.status(404).send({ message: "Trip not found" });
    }
    const trip = trips[0];
    if (trip.activities) {
      try {
        // Check if activities is already an array
        if (Array.isArray(trip.activities)) {
          // Already an array, no need to parse
        }
        // Check if activities is a string that looks like a comma-separated list
        else if (typeof trip.activities === 'string' && trip.activities.includes(',') && !trip.activities.includes('{')) {
          // Convert comma-separated string to array
          trip.activities = trip.activities.split(',').map(item => item.trim());
        }
        // Check if it's a string that starts with a bracket (likely JSON array)
        else if (typeof trip.activities === 'string' &&
                (trip.activities.trim().startsWith('[') || trip.activities.trim().startsWith('{'))) {
          // Try to parse as JSON
          trip.activities = JSON.parse(trip.activities);
        }
        // Handle other string formats that might not be valid JSON
        else if (typeof trip.activities === 'string') {
          // Check if it's a single word or phrase (not JSON)
          if (!trip.activities.includes('"') && !trip.activities.includes("'") &&
              !trip.activities.includes(':') && !trip.activities.includes('{')) {
            // Treat as a single item array
            trip.activities = [trip.activities.trim()];
          } else {
            // Try to parse as JSON with extra safety
            try {
              trip.activities = JSON.parse(trip.activities);
            } catch (innerError) {
              console.error("Inner error parsing activities:", innerError);
              // If all else fails, store as a single item array
              trip.activities = [trip.activities];
            }
          }
        }
      } catch (e) {
        console.error("Error parsing activities JSON:", e);
        // If parsing fails, make a best effort to salvage the data
        if (typeof trip.activities === 'string') {
          // If it contains commas, treat as comma-separated list
          if (trip.activities.includes(',')) {
            trip.activities = trip.activities.split(',').map(item => item.trim());
          } else {
            // Otherwise treat as a single item
            trip.activities = [trip.activities.trim()];
          }
        } else {
          // Last resort, empty array
          trip.activities = [];
        }
      }
    } else {
      trip.activities = [];
    }
    res.status(200).send(trip);
  } catch (err) {
    res.status(500).send({ message: "Error fetching trip" });
  }
});

// Get the latest trip for a user
router.get('/latest/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const pool = getPool();
      const [trips] = await pool.query("SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId]);
      if (trips.length === 0) {
        return res.status(404).send({ message: "No trips found for this user" });
      }
      const trip = trips[0];
      if (trip.activities) {
        try {
          // Check if activities is already an array
          if (Array.isArray(trip.activities)) {
            // Already an array, no need to parse
          }
          // Check if activities is a string that looks like a comma-separated list
          else if (typeof trip.activities === 'string' && trip.activities.includes(',') && !trip.activities.includes('{')) {
            // Convert comma-separated string to array
            trip.activities = trip.activities.split(',').map(item => item.trim());
          }
          // Check if it's a string that starts with a bracket (likely JSON array)
          else if (typeof trip.activities === 'string' &&
                  (trip.activities.trim().startsWith('[') || trip.activities.trim().startsWith('{'))) {
            // Try to parse as JSON
            trip.activities = JSON.parse(trip.activities);
          }
          // Handle other string formats that might not be valid JSON
          else if (typeof trip.activities === 'string') {
            // Check if it's a single word or phrase (not JSON)
            if (!trip.activities.includes('"') && !trip.activities.includes("'") &&
                !trip.activities.includes(':') && !trip.activities.includes('{')) {
              // Treat as a single item array
              trip.activities = [trip.activities.trim()];
            } else {
              // Try to parse as JSON with extra safety
              try {
                trip.activities = JSON.parse(trip.activities);
              } catch (innerError) {
                console.error("Inner error parsing activities:", innerError);
                // If all else fails, store as a single item array
                trip.activities = [trip.activities];
              }
            }
          }
        } catch (e) {
          console.error("Error parsing activities JSON:", e);
          // If parsing fails, make a best effort to salvage the data
          if (typeof trip.activities === 'string') {
            // If it contains commas, treat as comma-separated list
            if (trip.activities.includes(',')) {
              trip.activities = trip.activities.split(',').map(item => item.trim());
            } else {
              // Otherwise treat as a single item
              trip.activities = [trip.activities.trim()];
            }
          } else {
            // Last resort, empty array
            trip.activities = [];
          }
        }
      } else {
        trip.activities = [];
      }
      res.status(200).send(trip);
    } catch (err) {
      res.status(500).send({ message: "Error fetching latest trip" });
    }
});

// Get saved trips for a user
router.get('/saved/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
      const pool = getPool();
      
      // First, get all saved trips for this user
      const [savedTrips] = await pool.query(
        `SELECT DISTINCT trip_id FROM saved_trips WHERE trip_id IN (
          SELECT id FROM trips WHERE user_id = ?
        )`,
        [userId]
      );
      
      if (savedTrips.length === 0) {
        return res.status(200).send([]);
      }
      
      // Extract trip IDs
      const tripIds = savedTrips.map(trip => trip.trip_id);
      
      // For each unique trip (based on name), get only the most recent version
      const [trips] = await pool.query(
        `SELECT t.*, COALESCE(st.name, t.name) as name
         FROM trips t
         JOIN saved_trips st ON t.id = st.trip_id
         JOIN (
           SELECT name, MAX(id) as max_id
           FROM (
             SELECT t.id, COALESCE(st.name, t.name) as name
             FROM trips t
             JOIN saved_trips st ON t.id = st.trip_id
             WHERE t.user_id = ? AND t.id IN (?)
           ) as named_trips
           GROUP BY name
         ) latest ON t.id = latest.max_id
         WHERE t.user_id = ? AND t.id IN (?)
         ORDER BY t.id DESC`,
        [userId, tripIds, userId, tripIds]
      );
      
      res.status(200).send(trips);
    } catch (err) {
      console.error('Error fetching saved trips:', err);
      res.status(500).send({ message: "Error fetching saved trips", error: err.message });
    }
});

// Create a new trip
router.post('/', async (req, res) => {
  const {
    user_id,
    destination,
    destination_iata_code,
    start_date,
    end_date,
    budget,
    group_size,
    transport,
    activities,
    other_activity,
    special_needs,
    name
  } = req.body;
  try {
    const pool = getPool();
    
    // Format dates properly for MySQL
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const formattedStartDate = formatDateForMySQL(start_date);
    const formattedEndDate = formatDateForMySQL(end_date);
    
    const [result] = await pool.query(
      `INSERT INTO trips (user_id, destination, destination_iata_code, start_date, end_date, budget, group_size, transport, activities, other_activity, special_needs, name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, destination, destination_iata_code, formattedStartDate, formattedEndDate, budget, group_size, transport, JSON.stringify(activities), other_activity, special_needs, name]
    );
    
    // Get the inserted ID or use a generated ID if needed
    let tripId = result.insertId;
    if (!tripId) {
      // If insertId is not available, use the provided ID or generate a unique one
      tripId = user_id + '-' + Date.now();
      console.log(`Generated trip ID: ${tripId}`);
    }
    
    await pool.query(
      `INSERT INTO budgets (trip_id, total_budget, planned_expenses) VALUES (?, ?, ?)`,
      [tripId, budget, 0]
    );
    res.status(201).send({ id: tripId, message: "Trip saved successfully" });
  } catch (err) {
    console.error('Error saving trip:', err);
    res.status(500).send({ message: "Error saving trip", error: err.message });
  }
});

// Update a trip
router.put('/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const {
    destination,
    destination_iata_code,
    start_date,
    end_date,
    budget,
    group_size,
    transport,
    activities,
    other_activity,
    special_needs,
    name
  } = req.body;
  try {
    const pool = getPool();
    
    // Format dates properly for MySQL
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toISOString().slice(0, 19).replace('T', ' ');
    };
    
    const formattedStartDate = formatDateForMySQL(start_date);
    const formattedEndDate = formatDateForMySQL(end_date);
    
    await pool.query(
      `UPDATE trips SET destination = ?, destination_iata_code = ?, start_date = ?, end_date = ?, budget = ?, group_size = ?, transport = ?, activities = ?, other_activity = ?, special_needs = ?, name = ? WHERE id = ?`,
      [destination, destination_iata_code, formattedStartDate, formattedEndDate, budget, group_size, transport, JSON.stringify(activities), other_activity, special_needs, name, tripId]
    );
    res.status(200).send({ message: "Trip updated successfully" });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).send({ message: "Error updating trip", error: err.message });
  }
});

// Delete a trip
router.delete('/:tripId', async (req, res) => {
  const { tripId } = req.params;
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM flights WHERE trip_id = ?", [tripId]);
    await connection.query("DELETE FROM hotels WHERE trip_id = ?", [tripId]);
    await connection.query("DELETE FROM trips WHERE id = ?", [tripId]);
    await connection.commit();
    res.status(200).send({ message: "Trip deleted successfully" });
  } catch (err) {
    await connection.rollback();
    console.error('Error deleting trip:', err);
    res.status(500).send({ message: "Error deleting trip", error: err.message });
  } finally {
    connection.release();
  }
});

// Save a trip
router.post('/:tripId/save', async (req, res) => {
    const { tripId } = req.params;
    const { name } = req.body;
    try {
      const pool = getPool();
      
      // First, update the name in the trips table
      await pool.query("UPDATE trips SET name = ? WHERE id = ?", [name, tripId]);
      
      // Then, insert or update in saved_trips table
      await pool.query(
        "INSERT INTO saved_trips (trip_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?, updated_at = CURRENT_TIMESTAMP",
        [tripId, name, name]
      );
      
      res.status(200).send({ message: "Trip saved successfully" });
    } catch (err) {
      console.error('Error saving trip:', err);
      res.status(500).send({ message: "Error saving trip", error: err.message });
    }
});

// Update trip name
router.put('/:tripId/name', async (req, res) => {
    const { tripId } = req.params;
    const { name } = req.body;
    try {
      const pool = getPool();
      await pool.query("UPDATE trips SET name = ? WHERE id = ?", [name, tripId]);
      // Also update saved_trips if it exists
      await pool.query("UPDATE saved_trips SET name = ? WHERE trip_id = ?", [name, tripId]);
      res.status(200).send({ message: "Trip name updated successfully" });
    } catch (err) {
      console.error('Error updating trip name:', err);
      res.status(500).send({ message: "Error updating trip name" });
    }
});

// Get trip summary (all data for a trip)
router.get('/summary/:tripId', async (req, res) => {
    const { tripId } = req.params;
    try {
        const pool = getPool();
        const connection = await pool.getConnection();
        
        try {
            // Get trip details
            const [trips] = await connection.query("SELECT * FROM trips WHERE id = ?", [tripId]);
            if (trips.length === 0) {
                return res.status(404).send({ message: "Trip not found" });
            }
            
            const trip = trips[0];
            if (trip.activities) {
                try {
                    // Check if activities is already an array
                    if (Array.isArray(trip.activities)) {
                        // Already an array, no need to parse
                    }
                    // Check if activities is a string that looks like a comma-separated list
                    else if (typeof trip.activities === 'string' && trip.activities.includes(',') && !trip.activities.includes('{')) {
                        // Convert comma-separated string to array
                        trip.activities = trip.activities.split(',').map(item => item.trim());
                    }
                    // Check if it's a string that starts with a bracket (likely JSON array)
                    else if (typeof trip.activities === 'string' &&
                            (trip.activities.trim().startsWith('[') || trip.activities.trim().startsWith('{'))) {
                        // Try to parse as JSON
                        trip.activities = JSON.parse(trip.activities);
                    }
                    // Handle other string formats that might not be valid JSON
                    else if (typeof trip.activities === 'string') {
                        // Check if it's a single word or phrase (not JSON)
                        if (!trip.activities.includes('"') && !trip.activities.includes("'") &&
                            !trip.activities.includes(':') && !trip.activities.includes('{')) {
                            // Treat as a single item array
                            trip.activities = [trip.activities.trim()];
                        } else {
                            // Try to parse as JSON with extra safety
                            try {
                                trip.activities = JSON.parse(trip.activities);
                            } catch (innerError) {
                                console.error("Inner error parsing activities:", innerError);
                                // If all else fails, store as a single item array
                                trip.activities = [trip.activities];
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error parsing activities JSON:", e);
                    // If parsing fails, make a best effort to salvage the data
                    if (typeof trip.activities === 'string') {
                        // If it contains commas, treat as comma-separated list
                        if (trip.activities.includes(',')) {
                            trip.activities = trip.activities.split(',').map(item => item.trim());
                        } else {
                            // Otherwise treat as a single item
                            trip.activities = [trip.activities.trim()];
                        }
                    } else {
                        // Last resort, empty array
                        trip.activities = [];
                    }
                }
            } else {
                trip.activities = [];
            }
            
            // Get flight details - now returns all flights for multi-leg support
            const [flights] = await connection.query("SELECT * FROM flights WHERE trip_id = ? ORDER BY leg_number", [tripId]);
            const flight = flights.length > 0 ? flights : null;
            
            // Get hotel details
            const [hotels] = await connection.query("SELECT * FROM hotels WHERE trip_id = ?", [tripId]);
            let hotel = hotels.length > 0 ? hotels[0] : null;
            
            if (hotel) {
                // Parse JSON fields
                if (hotel.amenities) {
                    try {
                        // Handle empty string or null
                        if (!hotel.amenities || hotel.amenities === '') {
                            hotel.amenities = [];
                        }
                        // Handle already parsed object
                        else if (typeof hotel.amenities === 'object') {
                            // Already an object, no need to parse
                        }
                        // Try to parse JSON string
                        else {
                            hotel.amenities = JSON.parse(hotel.amenities);
                        }
                    } catch (e) {
                        console.error("Error parsing hotel amenities JSON:", e);
                        hotel.amenities = [];
                    }
                } else {
                    hotel.amenities = [];
                }
                
                if (hotel.room) {
                    try {
                        // Check if it's already an object
                        if (typeof hotel.room === 'object') {
                            // Already parsed, no need to parse again
                        } else if (typeof hotel.room === 'string') {
                            // Check for invalid JSON like "[object Object]"
                            if (hotel.room === '[object Object]' || hotel.room.startsWith('[object')) {
                                hotel.room = {};
                            } else {
                                hotel.room = JSON.parse(hotel.room);
                            }
                        } else {
                            hotel.room = {};
                        }
                    } catch (e) {
                        console.error("Error parsing hotel room JSON:", e);
                        hotel.room = {};
                    }
                }
                
                if (hotel.policies) {
                    try {
                        // Check if it's already an object
                        if (typeof hotel.policies === 'object') {
                            // Already parsed, no need to parse again
                        } else if (typeof hotel.policies === 'string') {
                            // Check for invalid JSON like "[object Object]"
                            if (hotel.policies === '[object Object]' || hotel.policies.startsWith('[object')) {
                                hotel.policies = {};
                            } else {
                                hotel.policies = JSON.parse(hotel.policies);
                            }
                        } else {
                            hotel.policies = {};
                        }
                    } catch (e) {
                        console.error("Error parsing hotel policies JSON:", e);
                        hotel.policies = {};
                    }
                }
            }
            
            // Get schedule
            const [schedules] = await connection.query("SELECT * FROM daily_schedules WHERE trip_id = ? ORDER BY day", [tripId]);
            
            // Get budget
            const [budgets] = await connection.query("SELECT * FROM budgets WHERE trip_id = ?", [tripId]);
            const budget = budgets.length > 0 ? budgets[0] : null;
            
            // Get weather data
            const [weatherData] = await connection.query("SELECT * FROM weather WHERE trip_id = ?", [tripId]);
            const weather = weatherData.length > 0 ? weatherData[0] : null;
            
            // Parse weather JSON fields if they exist
            if (weather) {
                if (weather.weather_data) {
                    try {
                        weather.weather_data = JSON.parse(weather.weather_data);
                    } catch (e) {
                        console.error("Error parsing weather data JSON:", e);
                        weather.weather_data = {};
                    }
                }
                if (weather.forecast_data) {
                    try {
                        weather.forecast_data = JSON.parse(weather.forecast_data);
                    } catch (e) {
                        console.error("Error parsing forecast data JSON:", e);
                        weather.forecast_data = [];
                    }
                }
            }
            
            // Get local recommendations
            const [recommendations] = await connection.query("SELECT * FROM local_recommendations WHERE trip_id = ?", [tripId]);
            
            // Parse recommendations JSON fields
            recommendations.forEach(rec => {
                if (rec.contact_info) {
                    try {
                        rec.contact_info = JSON.parse(rec.contact_info);
                    } catch (e) {
                        console.error("Error parsing contact info JSON:", e);
                        rec.contact_info = {};
                    }
                }
                if (rec.coordinates) {
                    try {
                        rec.coordinates = JSON.parse(rec.coordinates);
                    } catch (e) {
                        console.error("Error parsing coordinates JSON:", e);
                        rec.coordinates = {};
                    }
                }
            });
            
            // Get packing list
            const [packingLists] = await connection.query("SELECT * FROM trip_packing_lists WHERE trip_id = ?", [tripId]);
            const packingList = packingLists.length > 0 ? packingLists[0] : null;
            
            // Parse packing list JSON
            if (packingList && packingList.items) {
                try {
                    packingList.items = JSON.parse(packingList.items);
                } catch (e) {
                    console.error("Error parsing packing list JSON:", e);
                    packingList.items = [];
                }
            }
            
            res.status(200).send({
                trip,
                flight,
                hotel,
                schedule: schedules,
                budget,
                weather,
                recommendations,
                packingList
            });
        } catch (err) {
            console.error('Error fetching trip summary:', err);
            res.status(500).send({ message: "Error fetching trip summary", error: err.message });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error getting database connection:', err);
        res.status(500).send({ message: "Error connecting to database", error: err.message });
    }
});

// Batch save endpoint for faster trip saving
router.post('/:tripId/batch-save', async (req, res) => {
    const { tripId } = req.params;
    const { tripData, flightData, hotelData, scheduleData, budgetData } = req.body;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Update trip details if provided
        if (tripData) {
            const formatDateForMySQL = (dateString) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                return date.toISOString().slice(0, 19).replace('T', ' ');
            };
            
            const formattedStartDate = formatDateForMySQL(tripData.start_date);
            const formattedEndDate = formatDateForMySQL(tripData.end_date);
            
            await connection.query(
                `UPDATE trips SET name = ?, destination = ?, destination_iata_code = ?, start_date = ?, end_date = ?, budget = ?, group_size = ?, transport = ?, activities = ?, other_activity = ?, special_needs = ? WHERE id = ?`,
                [tripData.name, tripData.destination, tripData.destination_iata_code, formattedStartDate, formattedEndDate, tripData.budget, tripData.group_size, tripData.transport, JSON.stringify(tripData.activities), tripData.other_activity, tripData.special_needs, tripId]
            );
        }
        
        // 2. Save flight data if provided
        if (flightData) {
            // Delete existing flights for this trip
            await connection.query("DELETE FROM flights WHERE trip_id = ?", [tripId]);
            
            // Insert new flight data
            if (flightData.length > 0) {
                const flightInsertQuery = `INSERT INTO flights (trip_id, airline, from_city, to_city, from_iata, to_iata, departure_date, departure_time, arrival_date, arrival_time, travel_class, price, duration, stops, flight_data) VALUES ?`;
                const flightValues = flightData.map(flight => [
                    tripId,
                    flight.airline || 'Unknown',
                    flight.from_city || flight.fromCity || '',
                    flight.to_city || flight.toCity || '',
                    flight.from_iata || flight.fromIata || '',
                    flight.to_iata || flight.toIata || '',
                    flight.departure_date || flight.departureDate || new Date(),
                    flight.departure_time || flight.departureTime || new Date(),
                    flight.arrival_date || flight.arrivalDate || new Date(),
                    flight.arrival_time || flight.arrivalTime || new Date(),
                    flight.travel_class || flight.travelClass || 'ECONOMY',
                    flight.price || 0,
                    flight.duration || 'PT0H',
                    flight.stops || 0,
                    JSON.stringify(flight)
                ]);
                await connection.query(flightInsertQuery, [flightValues]);
            }
        }
        
        // 3. Save hotel data if provided
        if (hotelData) {
            // Delete existing hotels for this trip
            await connection.query("DELETE FROM hotels WHERE trip_id = ?", [tripId]);
            
            // Insert new hotel data
            const hotelInsertQuery = `INSERT INTO hotels (trip_id, name, location, check_in_date, check_out_date, image_url, rating, description, room_type, room_description, room_beds, room_bed_type, price, number_of_adults, currency, amenities, room, policies, hotel_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            await connection.query(hotelInsertQuery, [
                tripId,
                hotelData.name || '',
                hotelData.location || '',
                hotelData.check_in_date || hotelData.checkInDate || new Date(),
                hotelData.check_out_date || hotelData.checkOutDate || new Date(),
                hotelData.image_url || hotelData.image || '',
                hotelData.rating || 3,
                hotelData.description || '',
                hotelData.room_type || 'STANDARD',
                hotelData.room_description || '',
                hotelData.room_beds || 1,
                hotelData.room_bed_type || 'KING',
                hotelData.price || 0,
                hotelData.number_of_adults || 1,
                hotelData.currency || 'THB',
                JSON.stringify(hotelData.amenities || []),
                JSON.stringify(hotelData.room || {}),
                JSON.stringify(hotelData.policies || {}),
                JSON.stringify(hotelData)
            ]);
        }
        
        // 4. Save schedule data if provided
        if (scheduleData && scheduleData.length > 0) {
            // Delete existing schedule for this trip
            await connection.query("DELETE FROM daily_schedules WHERE trip_id = ?", [tripId]);
            
            // Insert new schedule data
            const scheduleInsertQuery = `INSERT INTO daily_schedules (trip_id, day, day_name, activities) VALUES ?`;
            const scheduleValues = scheduleData.map(day => [
                tripId,
                day.dayNumber || day.day,
                day.name || day.day_name || `Day ${day.dayNumber || day.day}`,
                JSON.stringify(day.activities || [])
            ]);
            await connection.query(scheduleInsertQuery, [scheduleValues]);
        }
        
        // 5. Save budget data if provided
        if (budgetData) {
            // Update or insert budget data
            await connection.query(
                "INSERT INTO budgets (trip_id, total_budget, planned_expenses) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total_budget = ?, planned_expenses = ?",
                [tripId, budgetData.total_budget, budgetData.planned_expenses, budgetData.total_budget, budgetData.planned_expenses]
            );
        }
        
        await connection.commit();
        res.status(200).send({ message: "Trip data saved successfully" });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error in batch save:', error);
        res.status(500).send({ message: "Error saving trip data", error: error.message });
    } finally {
        connection.release();
    }
});

// Comprehensive save endpoint for ultra-fast saving
router.post('/:tripId/save-complete', async (req, res) => {
    const { tripId } = req.params;
    const { trip, budget, flight, hotel, schedule, weather, recommendations, packing } = req.body;
    
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const startTime = Date.now();
        
        // 1. Update trip details
        if (trip) {
            const formatDateForMySQL = (dateString) => {
                if (!dateString) return null;
                const date = new Date(dateString);
                return date.toISOString().slice(0, 19).replace('T', ' ');
            };
            
            const formattedStartDate = formatDateForMySQL(trip.start_date);
            const formattedEndDate = formatDateForMySQL(trip.end_date);
            
            await connection.query(
                `UPDATE trips SET name = ?, destination = ?, destination_iata_code = ?, start_date = ?, end_date = ?, budget = ?, group_size = ?, transport = ?, activities = ?, other_activity = ?, special_needs = ? WHERE id = ?`,
                [trip.name, trip.destination, trip.destination_iata_code, formattedStartDate, formattedEndDate, trip.budget, trip.group_size, trip.transport, JSON.stringify(trip.activities), trip.other_activity, trip.special_needs, tripId]
            );
        }
        
        // 2. Save budget data
        if (budget) {
            await connection.query(
                "INSERT INTO budgets (trip_id, total_budget, planned_expenses) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total_budget = ?, planned_expenses = ?",
                [tripId, budget.total_budget, budget.planned_expenses, budget.total_budget, budget.planned_expenses]
            );
        }
        
        // 3. Save flight data
        if (flight) {
            await connection.query("DELETE FROM flights WHERE trip_id = ?", [tripId]);
            
            await connection.query(
                `INSERT INTO flights (trip_id, airline, flight_number, from_city, to_city, departure_time, departure_date, arrival_time, arrival_date, duration, price, currency, stops, traveler_type, fare_class, baggage_quantity, bag_weight, bag_weight_unit, aircraft_code, fare_basis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tripId,
                    flight.airline || 'Unknown',
                    flight.flight_number || '',
                    flight.from_city || '',
                    flight.to_city || '',
                    flight.departure_time || null,
                    flight.departure_date || null,
                    flight.arrival_time || null,
                    flight.arrival_date || null,
                    flight.duration || '',
                    flight.price || 0,
                    flight.currency || 'THB',
                    flight.stops || 0,
                    flight.traveler_type || '',
                    flight.fare_class || '',
                    flight.baggage_quantity || 0,
                    flight.bag_weight || '',
                    flight.bag_weight_unit || '',
                    flight.aircraft_code || '',
                    flight.fare_basis || ''
                ]
            );
        }
        
        // 4. Save hotel data
        if (hotel) {
            await connection.query("DELETE FROM hotels WHERE trip_id = ?", [tripId]);
            
            await connection.query(
                `INSERT INTO hotels (trip_id, name, price, currency, description, image_url, location, rating, amenities, check_in_date, check_out_date, stops, city_code, number_of_adults, room, policies, room_type, room_beds, room_bed_type, cancellation_policy, payment_methods, contact_phone, contact_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tripId,
                    hotel.name || '',
                    hotel.price || 0,
                    hotel.currency || 'THB',
                    hotel.description || '',
                    hotel.image_url || '',
                    hotel.location || '',
                    hotel.rating || 0,
                    JSON.stringify(hotel.amenities || []),
                    hotel.check_in_date || null,
                    hotel.check_out_date || null,
                    hotel.stops || 0,
                    hotel.city_code || '',
                    hotel.number_of_adults || 1,
                    JSON.stringify(hotel.room || {}),
                    JSON.stringify(hotel.policies || {}),
                    hotel.room_type || '',
                    hotel.room_beds || 0,
                    hotel.room_bed_type || '',
                    hotel.cancellation_policy || '',
                    JSON.stringify(hotel.payment_methods || []),
                    hotel.contact_phone || '',
                    hotel.contact_email || ''
                ]
            );
        }
        
        // 5. Save schedule data
        if (schedule && schedule.length > 0) {
            await connection.query("DELETE FROM daily_schedules WHERE trip_id = ?", [tripId]);
            
            const scheduleInsertQuery = `INSERT INTO daily_schedules (trip_id, day, day_name, date, activities, activity_count, day_cost, full_day_data) VALUES ?`;
            const scheduleValues = schedule.map(day => [
                tripId,
                day.day || day.dayNumber,
                day.day_name || `Day ${day.day || day.dayNumber}`,
                day.date || null,
                JSON.stringify(day.activities || []),
                day.activity_count || (day.activities ? day.activities.length : 0),
                day.day_cost || 0,
                JSON.stringify(day)
            ]);
            await connection.query(scheduleInsertQuery, [scheduleValues]);
        }
        
        // 6. Save weather data
        if (weather) {
            await connection.query("DELETE FROM weather WHERE trip_id = ?", [tripId]);
            
            await connection.query(
                `INSERT INTO weather (trip_id, destination, weather_data, forecast_data, temperature_avg, temperature_min, temperature_max, humidity, precipitation, wind_speed, weather_condition, forecast_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    tripId,
                    trip?.destination || '',
                    JSON.stringify(weather),
                    JSON.stringify(weather.forecast || []),
                    weather.temperature_avg || null,
                    weather.temperature_min || null,
                    weather.temperature_max || null,
                    weather.humidity || null,
                    weather.precipitation || null,
                    weather.wind_speed || null,
                    weather.weather_condition || '',
                    weather.forecast_date || null
                ]
            );
        }
        
        // 7. Save local recommendations
        if (recommendations && recommendations.length > 0) {
            await connection.query("DELETE FROM local_recommendations WHERE trip_id = ?", [tripId]);
            
            const recommendationsInsertQuery = `INSERT INTO local_recommendations (trip_id, destination, place_name, description, image_url, category, location, rating, price_range, opening_hours, contact_info, coordinates, recommended_duration, best_time_to_visit) VALUES ?`;
            const recommendationsValues = recommendations.map(rec => [
                tripId,
                trip?.destination || '',
                rec.name || rec.place_name || '',
                rec.description || '',
                rec.image_url || rec.image || '',
                rec.category || '',
                rec.location || '',
                rec.rating || null,
                rec.price_range || '',
                rec.opening_hours || '',
                JSON.stringify(rec.contact_info || {}),
                JSON.stringify(rec.coordinates || {}),
                rec.recommended_duration || '',
                rec.best_time_to_visit || ''
            ]);
            await connection.query(recommendationsInsertQuery, [recommendationsValues]);
        }
        
        // 8. Save packing list
        if (packing) {
            await connection.query(
                "INSERT INTO trip_packing_lists (trip_id, items) VALUES (?, ?) ON DUPLICATE KEY UPDATE items = ?",
                [tripId, JSON.stringify(packing), JSON.stringify(packing)]
            );
        }
        
        // 9. Add to saved_trips
        if (trip?.name) {
            await connection.query(
                "INSERT INTO saved_trips (trip_id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?, updated_at = CURRENT_TIMESTAMP",
                [tripId, trip.name, trip.name]
            );
        }
        
        await connection.commit();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        res.status(200).send({
            success: true,
            message: `Trip data saved successfully in ${duration}ms`,
            duration: duration
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Error in comprehensive save:', error);
        res.status(500).send({
            success: false,
            message: "Error saving trip data",
            error: error.message
        });
    } finally {
        connection.release();
    }
});

// Mount packing list routes
router.use('/:tripId/packing-list', packingListRouter);

module.exports = router;