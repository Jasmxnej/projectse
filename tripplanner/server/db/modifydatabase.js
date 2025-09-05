/**
 * Database modification functions
 * This file contains all the functions to modify the database schema
 * Consolidates all the SQL files into a single JavaScript file
 */

/**
 * Apply all database modifications
 * @param {Object} connection - MySQL connection object
 */
async function applyDatabaseModifications(connection) {
  try {
    // Apply packing list categories schema update
    await applyPackingListCategoriesUpdate(connection);
    
    // Fix user_id column type in trips table
    await fixUserIdColumnType(connection);
    
    // Add packing_list column to trips table
    await addPackingListColumn(connection);
    
    // Remove hotel_id column from hotels table if it exists
    await removeHotelIdColumn(connection);
    
    // Remove day_id column from daily_schedules table if it exists
    await removeDayIdColumn(connection);
    
    // Add currency column to hotels table
    await addCurrencyColumn(connection);
    
    // Fix trip_id column type in related tables
    await fixTripIdColumnType(connection);
    
    // Add missing columns to daily_schedules table
    await addDailySchedulesColumns(connection);
    
    // Add missing columns to flights table
    await addFlightColumns(connection);
    
    // Add from_iata and to_iata columns to flights table
    await addIataColumns(connection);
    
    // Add missing columns to hotels table
    await addHotelColumns(connection);
    
    // Create trip_packing_lists table if it doesn't exist
    await createTripPackingListsTable(connection);
    
    // Create weather and local_recommendations tables if they don't exist
    await createWeatherTable(connection);
    await createLocalRecommendationsTable(connection);
    
    // Update flights table to match new schema
    await updateFlightsTableSchema(connection);
    
    // Update hotels table to match new schema
    await updateHotelsTableSchema(connection);
    
    // Ensure saved_trips table has updated_at column
    await ensureSavedTripsUpdatedAtColumn(connection);
    
    console.log('All database modifications applied successfully.');
  } catch (error) {
    console.error('Error applying database modifications:', error);
    throw error;
  }
}

/**
 * Apply packing list categories schema update
 * @param {Object} connection - MySQL connection object
 */
async function applyPackingListCategoriesUpdate(connection) {
  try {
    // Update the packing_list column in trips table to use JSON format
    const [packingListResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'packing_list'
    `);
    
    if (packingListResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE trips MODIFY COLUMN packing_list JSON DEFAULT NULL
      `);
    }
    
    // Update the items column in trip_packing_lists table to use JSON format
    const [itemsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'trip_packing_lists' AND COLUMN_NAME = 'items'
    `);
    
    if (itemsResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE trip_packing_lists MODIFY COLUMN items JSON DEFAULT NULL
      `);
    }
    
    // Add country_info column to trips table for storing country-specific information
    const [countryInfoResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'country_info'
    `);
    
    if (countryInfoResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE trips ADD COLUMN country_info JSON DEFAULT NULL
      `);
    }
    
    console.log('Applied packing list categories schema update if needed.');
  } catch (error) {
    console.error('Error applying packing list categories schema update:', error);
    throw error;
  }
}

/**
 * Fix user_id column type in trips table
 * @param {Object} connection - MySQL connection object
 */
async function fixUserIdColumnType(connection) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'user_id'
    `);
    
    if (result[0].count > 0) {
      await connection.query(`
        ALTER TABLE trips MODIFY COLUMN user_id INT NOT NULL
      `);
    }
    
    console.log('User ID column type fixed to INTEGER if needed.');
  } catch (error) {
    console.error('Error fixing user_id column type:', error);
    throw error;
  }
}

/**
 * Add packing_list column to trips table
 * @param {Object} connection - MySQL connection object
 */
async function addPackingListColumn(connection) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'trips' AND COLUMN_NAME = 'packing_list'
    `);
    
    if (result[0].count === 0) {
      await connection.query(`
        ALTER TABLE trips ADD COLUMN packing_list JSON DEFAULT NULL
      `);
    }
    
    console.log('Packing list column added to trips table if needed.');
  } catch (error) {
    console.error('Error adding packing_list column:', error);
    throw error;
  }
}

/**
 * Remove hotel_id column from hotels table if it exists
 * @param {Object} connection - MySQL connection object
 */
async function removeHotelIdColumn(connection) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'hotel_id'
    `);
    
    if (result[0].count > 0) {
      await connection.query(`
        ALTER TABLE hotels DROP COLUMN hotel_id
      `);
    }
    
    console.log('Hotel ID column removed from hotels table if needed.');
  } catch (error) {
    console.error('Error removing hotel_id column:', error);
    throw error;
  }
}

/**
 * Remove day_id column from daily_schedules table if it exists
 * @param {Object} connection - MySQL connection object
 */
async function removeDayIdColumn(connection) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'day_id'
    `);
    
    if (result[0].count > 0) {
      await connection.query(`
        ALTER TABLE daily_schedules DROP COLUMN day_id
      `);
    }
    
    console.log('Day ID column removed from daily_schedules table if needed.');
  } catch (error) {
    console.error('Error removing day_id column:', error);
    throw error;
  }
}

/**
 * Add currency column to hotels table
 * @param {Object} connection - MySQL connection object
 */
async function addCurrencyColumn(connection) {
  try {
    const [result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'currency'
    `);
    
    if (result[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN currency VARCHAR(3) DEFAULT 'THB'
      `);
    }
    
    console.log('Currency column added to hotels table if needed.');
  } catch (error) {
    console.error('Error adding currency column:', error);
    throw error;
  }
}

/**
 * Fix trip_id column type in related tables
 * @param {Object} connection - MySQL connection object
 */
async function fixTripIdColumnType(connection) {
  try {
    // Flights table
    const [flightsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'trip_id'
    `);
    
    if (flightsResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE flights MODIFY COLUMN trip_id INT NOT NULL
      `);
    }
    
    // Hotels table
    const [hotelsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'trip_id'
    `);
    
    if (hotelsResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE hotels MODIFY COLUMN trip_id INT NOT NULL
      `);
    }
    
    // Daily schedules table
    const [schedulesResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'trip_id'
    `);
    
    if (schedulesResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE daily_schedules MODIFY COLUMN trip_id INT NOT NULL
      `);
    }
    
    // Budgets table
    const [budgetsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'budgets' AND COLUMN_NAME = 'trip_id'
    `);
    
    if (budgetsResult[0].count > 0) {
      await connection.query(`
        ALTER TABLE budgets MODIFY COLUMN trip_id INT NOT NULL
      `);
    }
    
    console.log('Trip ID column types fixed in related tables if needed.');
  } catch (error) {
    console.error('Error fixing trip_id column types:', error);
    throw error;
  }
}

/**
 * Add missing columns to daily_schedules table
 * @param {Object} connection - MySQL connection object
 */
async function addDailySchedulesColumns(connection) {
  try {
    // day_name column
    const [dayNameResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'day_name'
    `);
    
    if (dayNameResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE daily_schedules ADD COLUMN day_name VARCHAR(100) DEFAULT NULL
      `);
    }
    
    // activity_count column
    const [activityCountResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'activity_count'
    `);
    
    if (activityCountResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE daily_schedules ADD COLUMN activity_count INT DEFAULT 0
      `);
    }
    
    // day_cost column
    const [dayCostResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'day_cost'
    `);
    
    if (dayCostResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE daily_schedules ADD COLUMN day_cost DECIMAL(10, 2) DEFAULT 0
      `);
    }
    
    // full_day_data column
    const [fullDayDataResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'daily_schedules' AND COLUMN_NAME = 'full_day_data'
    `);
    
    if (fullDayDataResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE daily_schedules ADD COLUMN full_day_data JSON DEFAULT NULL
      `);
    }
    
    console.log('Added missing columns to daily_schedules table if needed.');
  } catch (error) {
    console.error('Error adding daily_schedules columns:', error);
    throw error;
  }
}

/**
 * Add missing columns to flights table
 * @param {Object} connection - MySQL connection object
 */
async function addFlightColumns(connection) {
  try {
    // itinerary_details column
    const [itineraryDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'itinerary_details'
    `);
    
    if (itineraryDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN itinerary_details JSON DEFAULT NULL
      `);
    }
    
    // from_city column
    const [fromCityResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'from_city'
    `);
    
    if (fromCityResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN from_city VARCHAR(100) DEFAULT NULL
      `);
    }
    
    // to_city column
    const [toCityResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'to_city'
    `);
    
    if (toCityResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN to_city VARCHAR(100) DEFAULT NULL
      `);
    }
    
    // stops column
    const [stopsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'stops'
    `);
    
    if (stopsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN stops INT DEFAULT 0
      `);
    }
    
    // segment_details column
    const [segmentDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'segment_details'
    `);
    
    if (segmentDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN segment_details TEXT DEFAULT NULL
      `);
    }
    
    // traveler_details column
    const [travelerDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'traveler_details'
    `);
    
    if (travelerDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN traveler_details TEXT DEFAULT NULL
      `);
    }
    
    // dictionary_details column
    const [dictionaryDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'dictionary_details'
    `);
    
    if (dictionaryDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN dictionary_details TEXT DEFAULT NULL
      `);
    }
    
    // traveler_type column
    const [travelerTypeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'traveler_type'
    `);
    
    if (travelerTypeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN traveler_type VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // fare_class column
    const [fareClassResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'fare_class'
    `);
    
    if (fareClassResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN fare_class VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // baggage_quantity column
    const [baggageQuantityResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'baggage_quantity'
    `);
    
    if (baggageQuantityResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN baggage_quantity INT DEFAULT 0
      `);
    }
    
    // aircraft_code column
    const [aircraftCodeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'aircraft_code'
    `);
    
    if (aircraftCodeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN aircraft_code VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // fare_option column
    const [fareOptionResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'fare_option'
    `);
    
    if (fareOptionResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN fare_option VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // fare_basis column
    const [fareBasisResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'fare_basis'
    `);
    
    if (fareBasisResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN fare_basis VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // fare_class2 column
    const [fareClass2Result] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'fare_class2'
    `);
    
    if (fareClass2Result[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN fare_class2 VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // currency column
    const [currencyResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'currency'
    `);
    
    if (currencyResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN currency VARCHAR(3) DEFAULT "THB"
      `);
    }
    
    console.log('Added additional columns to flights table if needed.');
  } catch (error) {
    console.error('Error adding flight columns:', error);
    throw error;
  }
}

/**
 * Add from_iata and to_iata columns to flights table
 * @param {Object} connection - MySQL connection object
 */
async function addIataColumns(connection) {
  try {
    // from_iata column
    const [fromIataResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'from_iata'
    `);
    
    if (fromIataResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN from_iata VARCHAR(10) DEFAULT NULL
      `);
    }
    
    // to_iata column
    const [toIataResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'flights' AND COLUMN_NAME = 'to_iata'
    `);
    
    if (toIataResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN to_iata VARCHAR(10) DEFAULT NULL
      `);
    }
    
    console.log('Added IATA code columns to flights table if needed.');
  } catch (error) {
    console.error('Error adding IATA columns:', error);
    throw error;
  }
}

/**
 * Add missing columns to hotels table
 * @param {Object} connection - MySQL connection object
 */
async function addHotelColumns(connection) {
  try {
    // room column
    const [roomResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room'
    `);
    
    if (roomResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room JSON DEFAULT NULL
      `);
    }
    
    // policies column
    const [policiesResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'policies'
    `);
    
    if (policiesResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN policies JSON DEFAULT NULL
      `);
    }
    
    // check_in_date column
    const [checkInDateResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'check_in_date'
    `);
    
    if (checkInDateResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN check_in_date DATE DEFAULT NULL
      `);
    }
    
    // check_out_date column
    const [checkOutDateResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'check_out_date'
    `);
    
    if (checkOutDateResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN check_out_date DATE DEFAULT NULL
      `);
    }
    
    // adults column
    const [adultsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'adults'
    `);
    
    if (adultsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN adults INT DEFAULT NULL
      `);
    }
    
    // city_code column
    const [cityCodeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'city_code'
    `);
    
    if (cityCodeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN city_code VARCHAR(3) DEFAULT NULL
      `);
    }
    
    // number_of_adults column
    const [numberOfAdultsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'number_of_adults'
    `);
    
    if (numberOfAdultsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN number_of_adults INT DEFAULT 1
      `);
    }
    
    // image_url column
    const [imageUrlResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'image_url'
    `);
    
    if (imageUrlResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN image_url VARCHAR(255) DEFAULT NULL
      `);
    }
    
    // room_type column
    const [roomTypeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room_type'
    `);
    
    if (roomTypeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room_type VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // room_beds column
    const [roomBedsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room_beds'
    `);
    
    if (roomBedsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room_beds INT DEFAULT NULL
      `);
    }
    
    // room_bed_type column
    const [roomBedTypeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room_bed_type'
    `);
    
    if (roomBedTypeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room_bed_type VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // room_description column
    const [roomDescriptionResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room_description'
    `);
    
    if (roomDescriptionResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room_description TEXT DEFAULT NULL
      `);
    }
    
    // room_details column
    const [roomDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'room_details'
    `);
    
    if (roomDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN room_details JSON DEFAULT NULL
      `);
    }
    
    // cancellation_policy column
    const [cancellationPolicyResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'cancellation_policy'
    `);
    
    if (cancellationPolicyResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN cancellation_policy TEXT DEFAULT NULL
      `);
    }
    
    // payment_methods column
    const [paymentMethodsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'payment_methods'
    `);
    
    if (paymentMethodsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN payment_methods JSON DEFAULT NULL
      `);
    }
    
    // policy_details column
    const [policyDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'policy_details'
    `);
    
    if (policyDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN policy_details JSON DEFAULT NULL
      `);
    }
    
    // contact_phone column
    const [contactPhoneResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'contact_phone'
    `);
    
    if (contactPhoneResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN contact_phone VARCHAR(50) DEFAULT NULL
      `);
    }
    
    // contact_email column
    const [contactEmailResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'contact_email'
    `);
    
    if (contactEmailResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN contact_email VARCHAR(100) DEFAULT NULL
      `);
    }
    
    // contact_details column
    const [contactDetailsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'contact_details'
    `);
    
    if (contactDetailsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN contact_details JSON DEFAULT NULL
      `);
    }
    
    // full_hotel_data column
    const [fullHotelDataResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'hotels' AND COLUMN_NAME = 'full_hotel_data'
    `);
    
    if (fullHotelDataResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN full_hotel_data JSON DEFAULT NULL
      `);
    }
    
    console.log('Added additional columns to hotels table if needed.');
  } catch (error) {
    console.error('Error adding hotel columns:', error);
    throw error;
  }
}

/**
 * Create trip_packing_lists table if it doesn't exist
 * @param {Object} connection - MySQL connection object
 */
async function createTripPackingListsTable(connection) {
  try {
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
    console.log('Created trip_packing_lists table if it didn\'t exist.');
  } catch (error) {
    console.error('Error creating trip_packing_lists table:', error);
    throw error;
  }
}

/**
 * Create weather table if it doesn't exist
 * @param {Object} connection - MySQL connection object
 */
async function createWeatherTable(connection) {
  try {
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
    console.log('Created weather table if it didn\'t exist.');
  } catch (error) {
    console.error('Error creating weather table:', error);
    throw error;
  }
}

/**
 * Create local_recommendations table if it doesn't exist
 * @param {Object} connection - MySQL connection object
 */
async function createLocalRecommendationsTable(connection) {
  try {
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
    console.log('Created local_recommendations table if it didn\'t exist.');
  } catch (error) {
    console.error('Error creating local_recommendations table:', error);
    throw error;
  }
}

/**
 * Update flights table to match new schema
 * @param {Object} connection - MySQL connection object
 */
async function updateFlightsTableSchema(connection) {
  try {
    // Add bag_weight column
    const [bagWeightResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights' AND COLUMN_NAME = 'bag_weight'
    `);
    
    if (bagWeightResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN bag_weight VARCHAR(20) DEFAULT NULL
      `);
    }
    
    // Add bag_weight_unit column
    const [bagWeightUnitResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights' AND COLUMN_NAME = 'bag_weight_unit'
    `);

    if (bagWeightUnitResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN bag_weight_unit VARCHAR(20) DEFAULT NULL
      `);
    }

    // Add leg_number column
    const [legNumberResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights' AND COLUMN_NAME = 'leg_number'
    `);

    if (legNumberResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN leg_number INT DEFAULT 1
      `);
    }

    // Add flight_type column
    const [flightTypeResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'flights' AND COLUMN_NAME = 'flight_type'
    `);

    if (flightTypeResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE flights ADD COLUMN flight_type ENUM('one-way', 'round-trip', 'multi-city') DEFAULT 'one-way'
      `);
    } else {
      // Update existing ENUM to include 'multi-city' if not already present
      try {
        await connection.query(`
          ALTER TABLE flights MODIFY COLUMN flight_type ENUM('one-way', 'round-trip', 'multi-city') DEFAULT 'one-way'
        `);
      } catch (enumError) {
        console.log('Flight type ENUM already includes multi-city or update not needed');
      }
    }

    console.log('Updated flights table schema if needed.');
  } catch (error) {
    console.error('Error updating flights table schema:', error);
    // Don't throw error, just log it to prevent server crash
  }
}

/**
 * Update hotels table to match new schema
 * @param {Object} connection - MySQL connection object
 */
async function updateHotelsTableSchema(connection) {
  try {
    // Add stops column to hotels table
    const [stopsResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'hotels' AND COLUMN_NAME = 'stops'
    `);
    
    if (stopsResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE hotels ADD COLUMN stops INT DEFAULT 0
      `);
    }
    
    console.log('Updated hotels table schema if needed.');
  } catch (error) {
    console.error('Error updating hotels table schema:', error);
    // Don't throw error, just log it to prevent server crash
  }
}

/**
 * Ensure saved_trips table has updated_at column
 * @param {Object} connection - MySQL connection object
 */
async function ensureSavedTripsUpdatedAtColumn(connection) {
  try {
    // Check if updated_at column exists in saved_trips table
    const [updatedAtResult] = await connection.query(`
      SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'saved_trips' AND COLUMN_NAME = 'updated_at'
    `);
    
    if (updatedAtResult[0].count === 0) {
      await connection.query(`
        ALTER TABLE saved_trips ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('Added updated_at column to saved_trips table.');
    } else {
      console.log('updated_at column already exists in saved_trips table.');
    }
  } catch (error) {
    console.error('Error ensuring saved_trips updated_at column:', error);
    // Don't throw error, just log it to prevent server crash
  }
}

module.exports = { applyDatabaseModifications };