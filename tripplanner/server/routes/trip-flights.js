const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router({ mergeParams: true });

// Save flights for a trip
router.post('/', async (req, res) => {
  const { tripId } = req.params;
  const { flights, dictionaries } = req.body;

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Ensure trip_id is treated as a string
    const tripIdStr = String(tripId);
    await connection.query("DELETE FROM flights WHERE trip_id = ?", [tripIdStr]);
    
    for (const flight of flights) {
      // Handle case where flight might not have all expected properties
      if (!flight || !flight.itineraries || flight.itineraries.length === 0) {
        console.warn('Skipping invalid flight data:', flight);
        continue;
      }

      // Extract basic flight information
      const { itineraries, price } = flight;
      
      // Handle case where segments might be missing
      if (!itineraries[0].segments || itineraries[0].segments.length === 0) {
        console.warn('Skipping flight with missing segments:', flight);
        continue;
      }

      const firstSegment = itineraries[0].segments[0];
      const lastSegment = itineraries[0].segments[itineraries[0].segments.length - 1];

      // Safely extract carrier information
      const airline = dictionaries && dictionaries.carriers && firstSegment.carrierCode 
        ? dictionaries.carriers[firstSegment.carrierCode] || 'Unknown Airline'
        : 'Unknown Airline';
      
      // Safely extract location information
      const fromCity = dictionaries && dictionaries.locations && firstSegment.departure && firstSegment.departure.iataCode
        ? (dictionaries.locations[firstSegment.departure.iataCode]?.cityCode || firstSegment.departure.iataCode)
        : (firstSegment.departure ? firstSegment.departure.iataCode : 'Unknown');
      
      const toCity = dictionaries && dictionaries.locations && lastSegment.arrival && lastSegment.arrival.iataCode
        ? (dictionaries.locations[lastSegment.arrival.iataCode]?.cityCode || lastSegment.arrival.iataCode)
        : (lastSegment.arrival ? lastSegment.arrival.iataCode : 'Unknown');
      
      // Safely extract IATA codes
      const fromIata = firstSegment.departure && firstSegment.departure.iataCode 
        ? firstSegment.departure.iataCode 
        : 'Unknown';
      
      const toIata = lastSegment.arrival && lastSegment.arrival.iataCode 
        ? lastSegment.arrival.iataCode 
        : 'Unknown';
      
      // Safely format departure and arrival times
      let departureTime = '00:00:00';
      let arrivalTime = '00:00:00';
      let departureDate = new Date().toISOString().split('T')[0];
      let arrivalDate = new Date().toISOString().split('T')[0];
      
      if (firstSegment.departure && firstSegment.departure.at) {
        try {
          const departureDateTime = new Date(firstSegment.departure.at);
          departureTime = departureDateTime.toTimeString().split(' ')[0]; // Extract HH:MM:SS
          departureDate = departureDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        } catch (e) {
          console.error('Error parsing departure time:', e);
        }
      }
      
      if (lastSegment.arrival && lastSegment.arrival.at) {
        try {
          const arrivalDateTime = new Date(lastSegment.arrival.at);
          arrivalTime = arrivalDateTime.toTimeString().split(' ')[0]; // Extract HH:MM:SS
          arrivalDate = arrivalDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
        } catch (e) {
          console.error('Error parsing arrival time:', e);
        }
      }
      
      // Safely extract other flight details
      const duration = itineraries[0].duration || 'Unknown';
      const stops = itineraries[0].segments.length - 1;
      
      // Safely extract traveler information
      let travelerType = 'ADULT';
      let fareClass = 'ECONOMY';
      let baggageQuantity = 0;
      let aircraftCode = '';
      let fareOption = '';
      let fareBasis = '';
      let fareClass2 = '';
      
      if (flight.travelerPricings && flight.travelerPricings.length > 0) {
        const traveler = flight.travelerPricings[0];
        travelerType = traveler.travelerType || 'ADULT';
        
        if (traveler.fareDetailsBySegment && traveler.fareDetailsBySegment.length > 0) {
          fareClass = traveler.fareDetailsBySegment[0].cabin || 'ECONOMY';
          baggageQuantity = traveler.fareDetailsBySegment[0].includedCheckedBags?.quantity || 0;
          fareBasis = traveler.fareDetailsBySegment[0].fareBasis || '';
          fareClass2 = traveler.fareDetailsBySegment[0].class || '';
        }
        
        fareOption = traveler.fareOption || '';
      }
      
      // Get aircraft information
      if (firstSegment.aircraft && firstSegment.aircraft.code) {
        aircraftCode = firstSegment.aircraft.code;
      }
      
      // Safely extract currency
      const currency = price && price.currency ? price.currency : 'THB';
      const totalPrice = price && price.total ? price.total : 0;
      
      // Store detailed itinerary information
      const itineraryDetails = JSON.stringify(itineraries);
      const segmentDetails = JSON.stringify(itineraries[0].segments);
      const travelerDetails = JSON.stringify(flight.travelerPricings || []);
      const dictionaryDetails = JSON.stringify(dictionaries || {});
      
      // Insert flight data with new schema columns
      await connection.query(
        `INSERT INTO flights (
          trip_id, airline, flight_number, from_city, to_city,
          departure_time, departure_date, arrival_time, arrival_date,
          duration, price, currency, stops, traveler_type, fare_class,
          baggage_quantity, bag_weight, bag_weight_unit, aircraft_code, fare_basis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tripIdStr, airline, firstSegment.number || '', fromCity, toCity,
          departureTime, departureDate, arrivalTime, arrivalDate,
          duration, totalPrice, currency, stops, travelerType, fareClass,
          baggageQuantity, '', '', aircraftCode, fareBasis
        ]
      );
    }

    await connection.commit();
    res.status(201).send({ message: "Flights saved successfully" });
  } catch (err) {
    await connection.rollback();
    console.error('Error saving flights:', err);
    res.status(500).send({ message: "Error saving flights", error: err.message });
  } finally {
    connection.release();
  }
});

// Clear flight data for a trip
router.post('/clear', async (req, res) => {
    const { tripId } = req.params;
    try {
      const pool = getPool();
      const tripIdStr = String(tripId);
      await pool.query("UPDATE flights SET airline = NULL, from_city = NULL, to_city = NULL, price = NULL WHERE trip_id = ?", [tripIdStr]);
      res.status(200).send({ message: "Flight data cleared successfully" });
    } catch (err) {
      console.error('Error clearing flight data:', err);
      res.status(500).send({ message: "Error clearing flight data" });
    }
});

// Skip flight selection for a trip
router.post('/skip', async (req, res) => {
    const { tripId } = req.params;
    try {
      const pool = getPool();
      const tripIdStr = String(tripId);
      await pool.query("INSERT INTO flights (trip_id, airline, from_city, to_city, price) VALUES (?, NULL, NULL, NULL, NULL) ON DUPLICATE KEY UPDATE airline = NULL, from_city = NULL, to_city = NULL, price = NULL", [tripIdStr]);
      res.status(200).send({ message: "Flight selection skipped successfully" });
    } catch (err) {
      console.error('Error skipping flight selection:', err);
      res.status(500).send({ message: "Error skipping flight selection" });
    }
});

module.exports = router;