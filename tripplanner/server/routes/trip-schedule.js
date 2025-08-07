const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router({ mergeParams: true });

// Save schedule for a trip
router.post('/', async (req, res) => {
  const { tripId } = req.params;
  const { schedule } = req.body;
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Delete existing schedule
    await connection.query("DELETE FROM daily_schedules WHERE trip_id = ?", [tripId]);
    
    // Calculate total cost of activities
    let totalActivityCost = 0;
    
    // Process each day in the schedule
    for (const day of schedule) {
      if (day.dayNumber == null) {
        console.error("Missing 'dayNumber' in schedule:", day);
        continue;
      }
      
      // Extract day information
      const dayId = day.id;
      const dayNumber = day.dayNumber;
      const dayName = day.name || `Day ${dayNumber}`;
      const activities = day.activities || [];
      
      // Calculate day's total cost
      const dayCost = activities.reduce((sum, activity) => sum + (parseFloat(activity.cost) || 0), 0);
      totalActivityCost += dayCost;
      
      // Process activity details
      const activityDetails = activities.map(activity => {
        // Ensure each activity has an image
        if (!activity.image && activity.name) {
          const keyword = encodeURIComponent(activity.name.split(' ')[0] || 'travel');
          activity.image = `https://source.unsplash.com/640x360/?${keyword},travel`;
        }
        return activity;
      });
      
      // Save day with enhanced data
      await connection.query(
        `INSERT INTO daily_schedules (
          trip_id, day, day_name, activities,
          activity_count, day_cost, full_day_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          tripId,
          dayNumber,
          dayName,
          JSON.stringify(activityDetails),
          activities.length,
          dayCost,
          JSON.stringify(day)
        ]
      );
    }
    
    // Update the trip's planned expenses with the activity costs
    await connection.query(
      "UPDATE budgets SET planned_expenses = planned_expenses + ? WHERE trip_id = ?",
      [totalActivityCost, tripId]
    );
    
    await connection.commit();
    res.status(201).send({
      message: "Schedule saved successfully",
      totalActivityCost
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error saving schedule:', err);
    
    // Provide more detailed error message
    let errorMessage = "Error saving schedule";
    if (err.message.includes("Unknown column")) {
      errorMessage = `Database schema error: ${err.message}`;
    }
    
    res.status(500).send({ 
      message: errorMessage, 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    connection.release();
  }
});

// Get schedule for a trip
router.get('/', async (req, res) => {
  const { tripId } = req.params;
  try {
    const pool = getPool();
    const [schedules] = await pool.query(
      "SELECT * FROM daily_schedules WHERE trip_id = ? ORDER BY day",
      [tripId]
    );
    
    // Process activities for each day
    const processedSchedules = schedules.map(day => {
      try {
        day.activities = JSON.parse(day.activities);
      } catch (e) {
        console.error(`Error parsing activities for day ${day.day}:`, e);
        day.activities = [];
      }
      return day;
    });
    
    res.status(200).send(processedSchedules);
  } catch (err) {
    console.error('Error fetching schedule:', err);
    res.status(500).send({ 
      message: "Error fetching schedule", 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Get mock schedule data for a trip (fallback)
router.get('/mock', async (req, res) => {
  const { tripId } = req.params;
  try {
    // Generate mock schedule data based on trip ID
    const mockSchedule = [
      {
        id: 1001,
        trip_id: parseInt(tripId),
        day: 1,
        day_name: "Day 1",
        activity_count: 3,
        day_cost: 2200,
        activities: [
          {
            id: 10001,
            name: "Grand Palace",
            time: "09:00",
            cost: 500,
            image: "https://source.unsplash.com/640x360/?bangkok,palace",
            location: "Na Phra Lan Road, Bangkok",
            description: "Visit the stunning Grand Palace complex, home to the revered Emerald Buddha."
          },
          {
            id: 10002,
            name: "Wat Pho",
            time: "13:00",
            cost: 200,
            image: "https://source.unsplash.com/640x360/?bangkok,temple",
            location: "2 Sanamchai Road, Bangkok",
            description: "See the famous Reclining Buddha and enjoy a traditional Thai massage."
          },
          {
            id: 10003,
            name: "Chao Phraya River Dinner Cruise",
            time: "19:00",
            cost: 1500,
            image: "https://source.unsplash.com/640x360/?bangkok,river",
            location: "River City Pier, Bangkok",
            description: "Enjoy dinner while cruising along the Chao Phraya River with beautiful night views."
          }
        ]
      },
      {
        id: 1002,
        trip_id: parseInt(tripId),
        day: 2,
        day_name: "Day 2",
        activity_count: 3,
        day_cost: 400,
        activities: [
          {
            id: 10004,
            name: "Chatuchak Weekend Market",
            time: "10:00",
            cost: 0,
            image: "https://source.unsplash.com/640x360/?bangkok,market",
            location: "Kamphaeng Phet 2 Road, Bangkok",
            description: "Explore one of the world's largest weekend markets with over 8,000 stalls."
          },
          {
            id: 10005,
            name: "Jim Thompson House",
            time: "14:00",
            cost: 200,
            image: "https://source.unsplash.com/640x360/?bangkok,museum",
            location: "6 Soi Kasemsan 2, Bangkok",
            description: "Visit the beautiful teak house of the American who revitalized the Thai silk industry."
          },
          {
            id: 10006,
            name: "Asiatique The Riverfront",
            time: "18:00",
            cost: 200,
            image: "https://source.unsplash.com/640x360/?bangkok,shopping",
            location: "2194 Charoen Krung Road, Bangkok",
            description: "Shop and dine at this large open-air mall by the Chao Phraya River."
          }
        ]
      }
    ];
    
    res.status(200).send({
      mockSchedule,
      message: "Using mock schedule data due to database connection issues."
    });
  } catch (err) {
    console.error('Error generating mock schedule:', err);
    res.status(500).send({ message: "Error generating mock schedule", error: err.message });
  }
});

module.exports = router;