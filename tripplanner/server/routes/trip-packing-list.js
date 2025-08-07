const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router({ mergeParams: true });

// Get packing list for a trip
router.get('/', async (req, res) => {
  const { tripId } = req.params;
  
  try {
    const pool = getPool();
    
    // Get trip details to calculate duration and get destination
    const [tripDetails] = await pool.query(
      "SELECT destination, start_date, end_date FROM trips WHERE id = ?",
      [tripId]
    );
    
    let tripDuration = 3; // Default duration
    let destination = ''; // Default empty destination
    
    if (tripDetails.length > 0) {
      const startDate = new Date(tripDetails[0].start_date);
      const endDate = new Date(tripDetails[0].end_date);
      
      // Calculate trip duration in days
      const diffTime = Math.abs(endDate - startDate);
      tripDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      destination = tripDetails[0].destination || '';
    }
    
    // First try to get from trips table
    const [tripRows] = await pool.query(
      "SELECT packing_list FROM trips WHERE id = ?",
      [tripId]
    );
    
    if (tripRows.length > 0 && tripRows[0].packing_list) {
      try {
        // If packing_list is already a JSON object, no need to parse
        const packingList = typeof tripRows[0].packing_list === 'string'
          ? JSON.parse(tripRows[0].packing_list)
          : tripRows[0].packing_list;
        
        // Check if the packing list has the new categorized structure
        if (!packingList.categories) {
          // Convert old format to new categorized format
          const categorizedList = {
            categories: [
              {
                name: "Essentials",
                items: Array.isArray(packingList) ? packingList : []
              }
            ]
          };
          res.status(200).send(categorizedList);
        } else {
          res.status(200).send(packingList);
        }
      } catch (e) {
        console.error('Error parsing packing list JSON:', e);
        res.status(200).send(getDefaultPackingList(tripDuration, destination));
      }
    } else {
      // If not in trips table, try the separate trip_packing_lists table
      const [listRows] = await pool.query(
        "SELECT items FROM trip_packing_lists WHERE trip_id = ?",
        [tripId]
      );
      
      if (listRows.length > 0 && listRows[0].items) {
        try {
          // If items is already a JSON object, no need to parse
          const packingList = typeof listRows[0].items === 'string'
            ? JSON.parse(listRows[0].items)
            : listRows[0].items;
          
          // Check if the packing list has the new categorized structure
          if (!packingList.categories) {
            // Convert old format to new categorized format
            const categorizedList = {
              categories: [
                {
                  name: "Essentials",
                  items: Array.isArray(packingList) ? packingList : []
                }
              ]
            };
            res.status(200).send(categorizedList);
          } else {
            res.status(200).send(packingList);
          }
        } catch (e) {
          console.error('Error parsing packing list JSON:', e);
          res.status(200).send(getDefaultPackingList(tripDuration, destination));
        }
      } else {
        // Return default categorized packing list based on trip duration and destination
        res.status(200).send(getDefaultPackingList(tripDuration, destination));
      }
    }
  } catch (err) {
    console.error('Error fetching packing list:', err);
    res.status(500).send({ message: "Error fetching packing list", error: err.message });
  }
});

// Save packing list for a trip
router.post('/', async (req, res) => {
  const { tripId } = req.params;
  const { packingList } = req.body;
  
  if (!tripId) {
    return res.status(400).send({ message: "Trip ID is required" });
  }
  
  if (!packingList) {
    return res.status(400).send({ message: "Valid packing list is required" });
  }
  
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Save to trips table
      await connection.query(
        `UPDATE trips SET packing_list = ? WHERE id = ?`,
        [JSON.stringify(packingList), tripId]
      );
      
      // Also save to trip_packing_lists table for backward compatibility
      await connection.query(
        `INSERT INTO trip_packing_lists (trip_id, items)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE items = ?`,
        [tripId, JSON.stringify(packingList), JSON.stringify(packingList)]
      );
      
      await connection.commit();
      res.status(200).send({ message: "Packing list saved successfully" });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error saving packing list:', err);
    res.status(500).send({ message: "Error saving packing list", error: err.message });
  }
});

// Helper function to get default categorized packing list
function getDefaultPackingList(tripDuration = 3, destination = '') {
  // Calculate clothing quantities based on trip duration
  const tshirtQuantity = Math.min(Math.ceil(tripDuration * 0.7), 10); // ~0.7 shirts per day, max 10
  const underwearQuantity = Math.min(tripDuration + 1, 10); // One per day + 1 extra, max 10
  const socksQuantity = Math.min(tripDuration + 1, 10); // One per day + 1 extra, max 10
  const shortsQuantity = Math.min(Math.ceil(tripDuration * 0.5), 7); // ~0.5 shorts per day, max 7

  // Get country-specific plug type information if available
  const plugTypeInfo = getPlugTypeInfo(destination);
  
  return {
    categories: [
      {
        name: "Documents",
        items: [
          { name: "Passport", quantity: 1, packed: false },
          { name: "Travel Insurance", quantity: 1, packed: false },
          { name: "Flight Tickets", quantity: 1, packed: false },
          { name: "Hotel Reservations", quantity: 1, packed: false },
          { name: "Driver's License/ID", quantity: 1, packed: false },
          { name: "Credit/Debit Cards", quantity: 2, packed: false },
          { name: "Travel Itinerary", quantity: 1, packed: false }
        ]
      },
      {
        name: "Clothing",
        items: [
          { name: "T-shirts", quantity: tshirtQuantity, packed: false },
          { name: "Shorts", quantity: shortsQuantity, packed: false },
          { name: "Swimwear", quantity: 2, packed: false },
          { name: "Underwear", quantity: underwearQuantity, packed: false },
          { name: "Socks", quantity: socksQuantity, packed: false },
          { name: "Light Jacket", quantity: 1, packed: false },
          { name: "Sleepwear", quantity: 2, packed: false },
          { name: "Hat/Cap", quantity: 1, packed: false }
        ]
      },
      {
        name: "Electronics",
        items: [
          { name: "Smartphone", quantity: 1, packed: false },
          { name: "Phone Charger", quantity: 1, packed: false },
          { name: "Camera", quantity: 1, packed: false },
          { name: "Power Bank", quantity: 1, packed: false },
          { name: "Travel Adapter", quantity: 1, packed: false, note: plugTypeInfo },
          { name: "Headphones", quantity: 1, packed: false }
        ]
      },
      {
        name: "Toiletries",
        items: [
          { name: "Toothbrush & Toothpaste", quantity: 1, packed: false },
          { name: "Shampoo & Conditioner", quantity: 1, packed: false },
          { name: "Soap/Body Wash", quantity: 1, packed: false },
          { name: "Deodorant", quantity: 1, packed: false },
          { name: "Sunscreen", quantity: 1, packed: false },
          { name: "Insect Repellent", quantity: 1, packed: false },
          { name: "Hand Sanitizer", quantity: 1, packed: false }
        ]
      },
      {
        name: "Health",
        items: [
          { name: "Prescription Medications", quantity: 1, packed: false },
          { name: "Pain Relievers", quantity: 1, packed: false },
          { name: "Band-Aids", quantity: 1, packed: false },
          { name: "Motion Sickness Pills", quantity: 1, packed: false },
          { name: "Antidiarrheal Medication", quantity: 1, packed: false },
          { name: "First Aid Kit", quantity: 1, packed: false }
        ]
      },
      {
        name: "Miscellaneous",
        items: [
          { name: "Daypack/Small Bag", quantity: 1, packed: false },
          { name: "Sunglasses", quantity: 1, packed: false },
          { name: "Travel Pillow", quantity: 1, packed: false },
          { name: "Water Bottle", quantity: 1, packed: false },
          { name: "Travel Guidebook", quantity: 1, packed: false },
          { name: "Umbrella", quantity: 1, packed: false }
        ]
      }
    ]
  };
}

// Helper function to get plug type information based on destination
function getPlugTypeInfo(destination) {
  const countryPlugTypes = {
    'Thailand': 'Type A, B, C, and O (220V)',
    'Japan': 'Type A and B (100V)',
    'United States': 'Type A and B (120V)',
    'United Kingdom': 'Type G (230V)',
    'Australia': 'Type I (230V)',
    'China': 'Type A, C, and I (220V)',
    'Singapore': 'Type G and M (230V)',
    'Malaysia': 'Type G and M (240V)',
    'Indonesia': 'Type C, F, and G (230V)',
    'Vietnam': 'Type A, C, and G (220V)',
    'South Korea': 'Type C and F (220V)',
    'India': 'Type C, D, and M (230V)',
    'France': 'Type C and E (230V)',
    'Germany': 'Type C and F (230V)',
    'Italy': 'Type C, F, and L (230V)',
    'Spain': 'Type C and F (230V)'
  };

  // Try to match the destination with a country
  for (const country in countryPlugTypes) {
    if (destination.toLowerCase().includes(country.toLowerCase())) {
      return `Plug Type: ${countryPlugTypes[country]}`;
    }
  }

  // Default message if no match
  return 'Check plug type for your destination';
}

module.exports = router;