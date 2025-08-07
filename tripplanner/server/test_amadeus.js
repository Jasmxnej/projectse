const Amadeus = require('amadeus');
const { amadeus: amadeusConfig } = require('./config');

const amadeus = new Amadeus({
  clientId: amadeusConfig.clientId,
  clientSecret: amadeusConfig.clientSecret
});

const testHotelSearch = async () => {
  try {
    console.log('Testing Amadeus hotel list by city...');
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: 'BKK'
    });
    console.log('Amadeus API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error during hotel list test:', error);
  }
};

testHotelSearch();