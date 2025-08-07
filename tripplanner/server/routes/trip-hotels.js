const express = require('express');
const { getPool } = require('../db/createdatabase');

const router = express.Router({ mergeParams: true });

// Save hotel for a trip
router.post('/', async (req, res) => {
  const { tripId } = req.params;
  const { hotel } = req.body;
  
  if (!hotel) {
    return res.status(400).send({ message: "Hotel data is required" });
  }
  
  try {
    // Extract all possible hotel data with default values
    const {
      id = null,
      name = null,
      description = null,
      price = null,
      currency = 'THB', // Default currency
      check_in_date = null,
      check_out_date = null,
      checkInDate = null,
      checkOutDate = null,
      adults = null,
      location = null,
      cityCode = null,
      city_code = null,
      image = null,
      image_url = null,
      rating = null,
      amenities = null,
      room = null,
      policies = null,
      contact = null,
      number_of_adults = null
    } = hotel;

    // Use the most appropriate values when multiple fields exist
    const finalCheckInDate = check_in_date || checkInDate || null;
    const finalCheckOutDate = check_out_date || checkOutDate || null;
    const finalCityCode = city_code || cityCode || null;
    const finalNumberOfAdults = number_of_adults || adults || null;
    const finalImageUrl = image_url || image || null;

    // Extract room details
    const roomType = room?.type || hotel?.room_type || null;
    const roomBeds = room?.beds || hotel?.room_beds || null;
    const roomBedType = room?.bedType || hotel?.room_bed_type || null;
    const roomDescription = room?.description || hotel?.room_description || null;
    const roomDetails = room ? JSON.stringify(room) : (hotel?.room_details ? (typeof hotel.room_details === 'string' ? hotel.room_details : JSON.stringify(hotel.room_details)) : null);

    // Extract policy details
    const cancellationPolicy = 
      (policies?.cancellation?.description?.text) || 
      (hotel?.cancellation_policy) || 
      (policies?.cancellation?.description) || 
      null;
    
    const paymentMethods = policies?.payment?.acceptedPayments?.creditCards
      ? JSON.stringify(policies.payment.acceptedPayments.creditCards)
      : (hotel?.payment_methods ? hotel.payment_methods : null);
    
    const policyDetails = policies
      ? JSON.stringify(policies)
      : (hotel?.policy_details ? (typeof hotel.policy_details === 'string' ? hotel.policy_details : JSON.stringify(hotel.policy_details)) : null);

    // Extract contact details
    const contactPhone = contact?.phone || hotel?.contact_phone || null;
    const contactEmail = contact?.email || hotel?.contact_email || null;
    const contactDetails = contact
      ? JSON.stringify(contact)
      : (hotel?.contact_details ? (typeof hotel.contact_details === 'string' ? hotel.contact_details : JSON.stringify(hotel.contact_details)) : null);

    // Prepare amenities data
    const amenitiesData = amenities 
      ? (typeof amenities === 'string' ? amenities : JSON.stringify(amenities)) 
      : null;

    // Store the full hotel object for future reference
    const fullHotelData = JSON.stringify(hotel);

    // Get database connection
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if a hotel record already exists for this trip
      const [existingHotels] = await connection.query(
        "SELECT id FROM hotels WHERE trip_id = ?",
        [tripId]
      );

      if (existingHotels.length > 0) {
        // Update existing hotel record with new schema
        await connection.query(
          `UPDATE hotels SET
            name = ?,
            price = ?,
            currency = ?,
            description = ?,
            image_url = ?,
            location = ?,
            rating = ?,
            amenities = ?,
            check_in_date = ?,
            check_out_date = ?,
            stops = ?,
            city_code = ?,
            number_of_adults = ?,
            room = ?,
            policies = ?,
            room_type = ?,
            room_beds = ?,
            room_bed_type = ?,
            cancellation_policy = ?,
            payment_methods = ?,
            contact_phone = ?,
            contact_email = ?
          WHERE trip_id = ?`,
          [
            name || null, price || null, currency || 'THB',
            description || null, finalImageUrl || null, location || null, rating || null, amenitiesData || null,
            finalCheckInDate || null, finalCheckOutDate || null, 0, // stops default to 0
            finalCityCode || null, finalNumberOfAdults || null,
            roomDetails || null, policyDetails || null,
            roomType || null, roomBeds || null, roomBedType || null,
            cancellationPolicy || null, paymentMethods || null,
            contactPhone || null, contactEmail || null,
            tripId
          ]
        );
      } else {
        // Insert new hotel record with new schema
        await connection.query(
          `INSERT INTO hotels (
            trip_id, name, price, currency, description, image_url, location, rating, amenities,
            check_in_date, check_out_date, stops, city_code, number_of_adults, room, policies,
            room_type, room_beds, room_bed_type, cancellation_policy, payment_methods,
            contact_phone, contact_email
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
          )`,
          [
            tripId, name || null, price || null, currency || 'THB',
            description || null, finalImageUrl || null, location || null, rating || null, amenitiesData || null,
            finalCheckInDate || null, finalCheckOutDate || null, 0, // stops default to 0
            finalCityCode || null, finalNumberOfAdults || null,
            roomDetails || null, policyDetails || null,
            roomType || null, roomBeds || null, roomBedType || null,
            cancellationPolicy || null, paymentMethods || null,
            contactPhone || null, contactEmail || null
          ]
        );
      }

      await connection.commit();
      res.status(201).send({ message: "Hotel saved successfully" });
    } catch (err) {
      await connection.rollback();
      console.error('Error saving hotel:', err);
      res.status(500).send({ message: "Error saving hotel", error: err.message });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error processing hotel data:', err);
    res.status(500).send({ message: "Error processing hotel data", error: err.message });
  }
});

// Clear hotel data for a trip
router.post('/clear', async (req, res) => {
    const { tripId } = req.params;
    try {
      const pool = getPool();
      await pool.query("UPDATE hotels SET name = NULL, description = NULL, price = NULL WHERE trip_id = ?", [tripId]);
      res.status(200).send({ message: "Hotel data cleared successfully" });
    } catch (err) {
      console.error('Error clearing hotel data:', err);
      res.status(500).send({ message: "Error clearing hotel data" });
    }
});

// Skip hotel selection for a trip
router.post('/skip', async (req, res) => {
    const { tripId } = req.params;
    try {
      const pool = getPool();
      await pool.query("INSERT INTO hotels (trip_id, name, description, price) VALUES (?, 'Skipped', 'Hotel selection was skipped', 0) ON DUPLICATE KEY UPDATE name = 'Skipped', description = 'Hotel selection was skipped', price = 0", [tripId]);
      res.status(200).send({ message: "Hotel selection skipped successfully" });
    } catch (err) {
      console.error('Error skipping hotel selection:', err);
      res.status(500).send({ message: "Error skipping hotel selection", error: err.message });
    }
});

module.exports = router;