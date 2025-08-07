const Amadeus = require('amadeus');
const { amadeus: amadeusConfig } = require('./config');

const amadeus = new Amadeus({
  clientId: amadeusConfig.clientId,
  clientSecret: amadeusConfig.clientSecret
});

const testHotelOffersSearch = async () => {
  try {
    console.log('Testing Amadeus hotel offers search...');
    // A small list of valid hotel IDs for testing
    const hotelIds = ['RABKK676', 'HSBKKAIV', 'HSBKKATG'];
    const response = await amadeus.shopping.hotelOffersSearch.get({
      hotelIds: hotelIds.join(','),
      checkInDate: '2025-07-21',
      checkOutDate: '2025-07-23',
      adults: 1
    });
    console.log('Amadeus API Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error during hotel offers test:', error);
    if (error.response) {
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
};

testHotelOffersSearch();