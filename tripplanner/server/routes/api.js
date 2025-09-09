const express = require('express');
const Amadeus = require('amadeus');
const axios = require('axios');
const { amadeus: amadeusConfig, unsplash: unsplashConfig } = require('../config');
const router = express.Router();

const amadeus = new Amadeus({
  clientId: amadeusConfig.clientId,
  clientSecret: amadeusConfig.clientSecret
});

// Flight Search helper
const searchFlights = async (params) => {
  if (params.originDestinations) {
    return await amadeus.shopping.flightOffersSearch.post(params);
  }
  return await amadeus.shopping.flightOffersSearch.get(params);
};

router.get('/amadeus/hotels/search', async (req, res) => {
  try {
    const { cityCode } = req.query;
    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: cityCode
    });
    res.json(response.data);
  } catch (error) {
    console.error('Amadeus API Error in /hotels/search:', error.description || error.message);
    
    // Return mock data as fallback
    const mockHotels = [
      { hotelId: 'MOCK1', name: 'Grand Hotel', cityCode: cityCode },
      { hotelId: 'MOCK2', name: 'Luxury Resort', cityCode: cityCode },
      { hotelId: 'MOCK3', name: 'Boutique Stay', cityCode: cityCode },
      { hotelId: 'MOCK4', name: 'City Center Hotel', cityCode: cityCode },
      { hotelId: 'MOCK5', name: 'Riverside Lodge', cityCode: cityCode },
    ];
    res.json(mockHotels);
  }
});

router.post('/amadeus/hotels', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults, page = 1, limit = 20, minPrice, maxPrice, minRating } = req.body;
    if (!cityCode || !checkInDate || !checkOutDate || !adults) {
      return res.status(400).send({ message: 'Missing required search parameters: cityCode, checkInDate, checkOutDate, adults are required.' });
    }

    try {
      const hotelsByCityResponse = await amadeus.referenceData.locations.hotels.byCity.get({
        cityCode: cityCode,
        radius: 20,
        radiusUnit: 'KM',
        hotelSource: 'ALL'
      });
      
      let allHotelIds = hotelsByCityResponse.data.map(hotel => hotel.hotelId);
      const totalHotels = allHotelIds.length;

      if (totalHotels === 0) {
        throw new Error('No hotels found');
      }

      // Limit to top 50 hotels by rank for faster processing
      allHotelIds = allHotelIds.slice(0, 50);

      const totalPages = Math.ceil(allHotelIds.length / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = Math.min(startIndex + limit, allHotelIds.length);
      const paginatedHotelIds = allHotelIds.slice(startIndex, endIndex);

      if (paginatedHotelIds.length === 0) {
        throw new Error('No hotels found for this page');
      }

      const availableHotels = [];
      // Smaller batch size for faster parallel processing
      for (let i = 0; i < paginatedHotelIds.length; i += 3) {
        const batchIds = paginatedHotelIds.slice(i, i + 3);
        if (batchIds.length === 0) continue;

        try {
          // Process each hotel ID individually to avoid invalid property code errors
          for (const hotelId of batchIds) {
            try {
              const hotelOffersResponse = await amadeus.shopping.hotelOffersSearch.get({
                hotelIds: hotelId,
                checkInDate,
                checkOutDate,
                adults,
                ratings: '2,3,4,5', 
                amenities: 'SWIMMING_POOL,SPA,FITNESS_CENTER,RESTAURANT,PARKING,WIFI', 
                bestRateOnly: true,
                view: 'FULL_ALL_IMAGES',
                sort: 'PRICE'
              });

              if (hotelOffersResponse.data) {
                const offers = hotelOffersResponse.data.filter(offer => offer.available && offer.offers && offer.offers.length > 0);
                availableHotels.push(...offers);
              }
            } catch (singleHotelError) {
              console.error(`Error fetching hotel offer for ${hotelId}:`, singleHotelError.description || singleHotelError.message);
              
            }
          }
        } catch (batchError) {
          console.error(`Error processing batch of hotel offers:`, batchError);
        }
      }
      
      // Apply server-side filters
      let filteredHotels = availableHotels;

      if (minPrice !== undefined && minPrice !== null) {
        filteredHotels = filteredHotels.filter(hotel => {
          const price = parseFloat(hotel.offers?.[0]?.price?.total || 0);
          return price >= parseFloat(minPrice);
        });
      }

      if (maxPrice !== undefined && maxPrice !== null) {
        filteredHotels = filteredHotels.filter(hotel => {
          const price = parseFloat(hotel.offers?.[0]?.price?.total || 0);
          return price <= parseFloat(maxPrice);
        });
      }

      if (minRating !== undefined && minRating !== null && minRating !== '') {
        filteredHotels = filteredHotels.filter(hotel => {
          const rating = hotel.hotel?.rating || 0;
          return rating >= parseInt(minRating);
        });
      }

      if (filteredHotels.length < 3 && availableHotels.length > 0) {
        console.log('Filtered results too small, using unfiltered results');
        filteredHotels = availableHotels;
      }

      if (filteredHotels.length > 0) {
        return res.json({ data: filteredHotels, totalPages });
      } else {
        throw new Error('No available hotel offers found');
      }
      
    } catch (amadeusError) {
      console.error('Amadeus API Error:', amadeusError.description || amadeusError.message);
      throw amadeusError; 
    }
    
  } catch (error) {
    console.error('Error in /hotels:', error.description || error.message);
    
    const { cityCode, checkInDate, checkOutDate, adults } = req.body;
    
    // Generate mock hotel data as fallback
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const mockHotels = [];
    
    // Create city-specific hotel names based on the cityCode
    let cityName = "Unknown";
    let hotelNames = [];
    
    // Map common city codes to city names and specific hotel names
    const cityMap = {
      'BKK': {
        name: 'Bangkok',
        hotels: ['Siam Grand Hotel', 'Bangkok Luxury Resort', 'Sukhumvit Boutique Stay',
                'Silom City Center Hotel', 'Chao Phraya Riverside Lodge', 'Bangkok View Resort']
      },
      'HKT': {
        name: 'Phuket',
        hotels: ['Patong Beach Resort', 'Phuket Luxury Villa', 'Kata Beach Hotel',
                'Old Town Heritage Inn', 'Phuket Marina Lodge', 'Andaman Sea View']
      },
      'CNX': {
        name: 'Chiang Mai',
        hotels: ['Nimman Boutique Stay', 'Chiang Mai Mountain Resort', 'Old City Heritage Hotel',
                'Ping River Lodge', 'Night Bazaar Inn', 'Doi Suthep View Resort']
      },
      'USM': {
        name: 'Koh Samui',
        hotels: ['Chaweng Beach Resort', 'Samui Luxury Villa', 'Lamai Beach Hotel',
                'Bophut Fisherman Village Stay', 'Maenam Beachfront Resort', 'Gulf View Hotel']
      }
    };
    
    // Get city-specific data or use defaults
    if (cityMap[cityCode]) {
      cityName = cityMap[cityCode].name;
      hotelNames = cityMap[cityCode].hotels;
    } else {
      cityName = cityCode || "International";
      hotelNames = [
        `${cityName} Grand Hotel`, `${cityName} Luxury Resort`, `${cityName} Boutique Stay`,
        `${cityName} City Center Hotel`, `${cityName} Riverside Lodge`, `${cityName} View Resort`,
        `${cityName} Premium Hotel`, `${cityName} Heritage Inn`, `${cityName} Modern Suites`
      ];
    }
    
    // Use the limit from request body or default to 7 for consistency with frontend
    const requestLimit = req.body.limit || 7;
    const requestPage = req.body.page || 1;
    
    const totalMockHotels = Math.min(hotelNames.length, requestLimit * 3); // More mock for pagination
    const totalPages = Math.ceil(totalMockHotels / requestLimit);
    const startIndex = (requestPage - 1) * requestLimit;
    const endIndex = Math.min(startIndex + requestLimit, totalMockHotels);
    
    for (let i = startIndex; i < endIndex; i++) {
      const index = i % hotelNames.length;
      const basePrice = 1000 + (index * 500);
      
      mockHotels.push({
        hotel: {
          hotelId: `MOCK${i+1}`,
          name: hotelNames[index],
          cityCode: cityCode,
          rating: Math.floor(Math.random() * 2) + 3, 
        },
        available: true,
        offers: [{
          id: `offer-${i+1}`,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          price: {
            currency: 'THB',
            total: (basePrice * nights).toString(),
          },
          room: {
            type: 'STANDARD',
            typeEstimated: {
              beds: 1,
              bedType: 'KING',
            },
            description: {
              text: `Comfortable ${hotelNames[index]} room with all amenities.`
            }
          },
          guests: {
            adults: adults
          }
        }]
      });
    }
    
    res.json({
      data: mockHotels,
      totalPages: totalPages,
      isMock: true
    });
  }
});

router.get('/amadeus/flights', async (req, res) => {
  try {
    const { originLocationCode, destinationLocationCode, departureDate, adults, returnDate, travelClass, nonStop } = req.query;
    const params = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults,
      travelClass,
      currencyCode: 'THB',
      max: 25
    };
    
    // Only add nonStop parameter if it's explicitly provided
    if (nonStop !== undefined) {
      params.nonStop = nonStop === 'true' || nonStop === true;
    }
    
    if (returnDate) {
      params.returnDate = returnDate;
    }
    
    const response = await searchFlights(params);
    res.send({ data: response.data, dictionaries: response.dictionaries });
  } catch (error) {
    console.error('Amadeus API Error in /flights:', error.description || error.message, error.response ? error.response.data : '');
    if (error.response) {
      res.status(error.response.statusCode).send({ message: "Failed to fetch flight offers.", error: error.description });
    } else {
      res.status(500).send({ message: "Failed to fetch flight offers.", error: error.message });
    }
  }
});

router.post('/amadeus/flights', async (req, res) => {
  try {
    const response = await searchFlights(req.body);
    res.send({ data: response.data, dictionaries: response.dictionaries });
  } catch (error) {
    console.error('Amadeus API Error in /flights:', error.description || error.message, error.response ? error.response.data : '');

    // Handle specific Amadeus errors
    if (error.response && error.response.data && error.response.data.errors) {
      const amadeusError = error.response.data.errors[0];
      if (amadeusError.code === 4926 && amadeusError.detail.includes('overlap')) {
        return res.status(400).send({
          message: "Invalid multi-city flight request. Please ensure no overlapping segments (destination of one flight should not be the origin of the next). For round-trip journeys, use the Round-trip option instead.",
          error: amadeusError.detail,
          code: amadeusError.code
        });
      }
    }

    if (error.response) {
      res.status(error.response.statusCode).send({ message: "Failed to fetch flight offers.", error: error.description });
    } else {
      res.status(500).send({ message: "Failed to fetch flight offers.", error: error.message });
    }
  }
});

router.get('/amadeus/cities', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    // Check if keyword is valid (at least 3 characters for Amadeus API)
    if (!keyword || keyword.length < 3) {
      return res.status(400).json({
        message: "Keyword must be at least 3 characters long",
        isMock: true,
        data: []
      });
    }
    
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword,
        subType: 'CITY',
      });
      const cities = response.data.map(city => ({
        name: city.name,
        iataCode: city.iataCode,
      }));
      res.send(cities);
    } catch (amadeusError) {
      console.error('Amadeus API Error in /cities:', amadeusError.description || amadeusError.message, amadeusError.response ? amadeusError.response.data : '');
      throw new Error('Amadeus API error, using fallback');
    }
  } catch (error) {
    console.error('Error in /cities:', error.message);
    // Fallback to Gemini or mock data
    try {
      const prompt = `Provide a list of city names and their IATA codes starting with "${req.query.keyword}". Return the data in a JSON array format with "name" and "iataCode" properties. For example: [{"name": "Bangkok", "iataCode": "BKK"}]`;
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const result = response.data;
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
      const cleanedText = jsonMatch ? jsonMatch[2] : text;
      const data = JSON.parse(cleanedText);
      res.json({
        data,
        isMock: true
      });
    } catch (geminiError) {
      console.error('Error with Gemini fallback for cities:', geminiError);
      
      // Final fallback - return mock data for Bangkok
      const mockCities = [
        { name: "Bangkok", iataCode: "BKK" },
        { name: "Bangkok Suvarnabhumi", iataCode: "BKK" },
        { name: "Bangkok Don Mueang", iataCode: "DMK" },
        { name: "Bangkrut", iataCode: "BKR" }
      ];
      
      // If keyword is provided, filter mock cities
      const filteredCities = keyword
        ? mockCities.filter(city =>
            city.name.toLowerCase().includes(keyword.toLowerCase()) ||
            city.iataCode.toLowerCase().includes(keyword.toLowerCase()))
        : mockCities;
      
      res.json({
        data: filteredCities,
        isMock: true
      });
    }
  }
});

router.get('/amadeus/pois', async (req, res) => {
  try {
    // Extract query parameters with defaults to prevent ReferenceError
    const { keyword, radius = 20, limit = 5 } = req.query;
    const latitude = parseFloat(req.query.latitude) || 13.7563; // Default to Bangkok
    const longitude = parseFloat(req.query.longitude) || 100.5018; // Default to Bangkok
    
    console.log(`POI request - keyword: ${keyword}, lat: ${latitude}, lng: ${longitude}, radius: ${radius}, limit: ${limit}`);
    
    // Generate destination-specific POIs based on coordinates
    const destinationSpecificPOIs = getDestinationSpecificPOIs(latitude, longitude);
    
    // Filter by search term if provided
    let filteredPois = destinationSpecificPOIs;
    const searchTerm = keyword ? keyword.toLowerCase() : '';
    
    if (searchTerm) {
      filteredPois = destinationSpecificPOIs.filter(poi =>
        poi.name.toLowerCase().includes(searchTerm) ||
        (poi.category && poi.category.toLowerCase().includes(searchTerm)) ||
        (poi.tags && poi.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
      
      // Sort by relevance to search term
      filteredPois.sort((a, b) => {
        const aContains = a.name.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bContains = b.name.toLowerCase().includes(searchTerm) ? 1 : 0;
        return bContains - aContains;
      });
    }
    
    // Add image URLs and descriptions to POIs
    const enrichedPois = filteredPois.slice(0, parseInt(limit)).map(poi => ({
      ...poi,
      image: `https://source.unsplash.com/featured/640x360/?${poi.name.toLowerCase().replace(/\s+/g, '+')},${poi.category.toLowerCase()}`,
      description: poi.description || getPoiDescription(poi.name, poi.category)
    }));
    
    console.log(`Successfully returning ${enrichedPois.length} POIs`);
    res.json(enrichedPois);
    
  } catch (error) {
    console.error('Error in /pois:', error.message);
    
    // Return structured error response instead of throwing
    res.status(200).json([
      {
        id: 'fallback-1',
        name: 'Grand Palace',
        category: 'SIGHTS',
        rank: 95,
        tags: ['sights', 'culture', 'history'],
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
        image: 'https://source.unsplash.com/featured/640x360/?bangkok,palace',
        description: 'The Grand Palace is a complex of buildings in Bangkok, Thailand.'
      },
      {
        id: 'fallback-2',
        name: 'Wat Arun',
        category: 'SIGHTS',
        rank: 90,
        tags: ['sights', 'temple', 'culture'],
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
        image: 'https://source.unsplash.com/featured/640x360/?bangkok,temple',
        description: 'Wat Arun is a Buddhist temple in Bangkok Yai district of Bangkok, Thailand.'
      },
      {
        id: 'fallback-3',
        name: 'Chatuchak Weekend Market',
        category: 'SHOPPING',
        rank: 85,
        tags: ['shopping', 'market', 'local'],
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
        image: 'https://source.unsplash.com/featured/640x360/?bangkok,market',
        description: 'One of the world\'s largest weekend markets with over 8,000 stalls.'
      },
      {
        id: 'fallback-4',
        name: 'MBK Center',
        category: 'SHOPPING',
        rank: 80,
        tags: ['shopping', 'mall'],
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
        image: 'https://source.unsplash.com/featured/640x360/?bangkok,shopping',
        description: 'Popular shopping mall with hundreds of stores and restaurants.'
      },
      {
        id: 'fallback-5',
        name: 'Khao San Road',
        category: 'NIGHTLIFE',
        rank: 75,
        tags: ['nightlife', 'backpacker', 'street'],
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
        image: 'https://source.unsplash.com/featured/640x360/?bangkok,nightlife',
        description: 'Famous backpacker street with bars, restaurants, and street food.'
      }
    ]);
  }
});

// Helper function to generate POI descriptions
function getPoiDescription(name, category) {
  const descriptions = {
    'SIGHTS': `${name} is a popular tourist attraction offering stunning views and cultural experiences.`,
    'SHOPPING': `${name} is a great place for shopping with a variety of local and international brands.`,
    'RESTAURANT': `${name} offers delicious local cuisine and authentic dining experiences.`,
    'NIGHTLIFE': `${name} is a vibrant nightlife spot perfect for evening entertainment.`
  };
  return descriptions[category] || `${name} is a recommended place to visit.`;
}

// Helper function to get destination-specific POIs based on coordinates
function getDestinationSpecificPOIs(latitude, longitude) {
  // Bangkok coordinates (approximate)
  const bangkokLat = 13.7563;
  const bangkokLong = 100.5018;
  
  // Chiang Mai coordinates (approximate)
  const chiangMaiLat = 18.7883;
  const chiangMaiLong = 98.9853;
  
  // Phuket coordinates (approximate)
  const phuketLat = 7.9519;
  const phuketLong = 98.3381;
  
  // Calculate distance to determine which destination
  const distanceToBangkok = Math.sqrt(
    Math.pow(parseFloat(latitude) - bangkokLat, 2) +
    Math.pow(parseFloat(longitude) - bangkokLong, 2)
  );
  
  const distanceToChiangMai = Math.sqrt(
    Math.pow(parseFloat(latitude) - chiangMaiLat, 2) +
    Math.pow(parseFloat(longitude) - chiangMaiLong, 2)
  );
  
  const distanceToPhuket = Math.sqrt(
    Math.pow(parseFloat(latitude) - phuketLat, 2) +
    Math.pow(parseFloat(longitude) - phuketLong, 2)
  );
  
  // Determine closest destination
  const minDistance = Math.min(distanceToBangkok, distanceToChiangMai, distanceToPhuket);
  
  if (minDistance === distanceToBangkok) {
    return [
      {
        id: 'mock-sights-grand-palace',
        name: 'Grand Palace',
        category: 'SIGHTS',
        rank: 95,
        tags: ['sights', 'culture', 'history'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-wat-arun',
        name: 'Wat Arun',
        category: 'SIGHTS',
        rank: 90,
        tags: ['sights', 'temple', 'culture'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-wat-pho',
        name: 'Wat Pho',
        category: 'SIGHTS',
        rank: 88,
        tags: ['sights', 'temple', 'culture'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-shopping-chatuchak-weekend-market',
        name: 'Chatuchak Weekend Market',
        category: 'SHOPPING',
        rank: 85,
        tags: ['shopping', 'market', 'local'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-shopping-mbk-center',
        name: 'MBK Center',
        category: 'SHOPPING',
        rank: 80,
        tags: ['shopping', 'mall'],
        geoCode: { latitude, longitude }
      }
    ];
  } else if (minDistance === distanceToChiangMai) {
    return [
      {
        id: 'mock-sights-doi-suthep',
        name: 'Doi Suthep',
        category: 'SIGHTS',
        rank: 95,
        tags: ['sights', 'temple', 'mountain'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-old-city',
        name: 'Old City',
        category: 'SIGHTS',
        rank: 90,
        tags: ['sights', 'history', 'culture'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-shopping-night-bazaar',
        name: 'Night Bazaar',
        category: 'SHOPPING',
        rank: 88,
        tags: ['shopping', 'market', 'nightlife'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-elephant-sanctuary',
        name: 'Elephant Sanctuary',
        category: 'SIGHTS',
        rank: 85,
        tags: ['sights', 'nature', 'animals'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-restaurant-khao-soi',
        name: 'Khao Soi Restaurant',
        category: 'RESTAURANT',
        rank: 80,
        tags: ['food', 'local', 'cuisine'],
        geoCode: { latitude, longitude }
      }
    ];
  } else {
    return [
      {
        id: 'mock-sights-patong-beach',
        name: 'Patong Beach',
        category: 'SIGHTS',
        rank: 95,
        tags: ['beach', 'sea', 'nature'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-big-buddha',
        name: 'Big Buddha',
        category: 'SIGHTS',
        rank: 90,
        tags: ['sights', 'culture', 'viewpoint'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-nightlife-bangla-road',
        name: 'Bangla Road',
        category: 'NIGHTLIFE',
        rank: 88,
        tags: ['nightlife', 'entertainment'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-sights-phi-phi-islands',
        name: 'Phi Phi Islands',
        category: 'SIGHTS',
        rank: 85,
        tags: ['island', 'nature', 'sea'],
        geoCode: { latitude, longitude }
      },
      {
        id: 'mock-shopping-phuket-weekend-market',
        name: 'Phuket Weekend Market',
        category: 'SHOPPING',
        rank: 80,
        tags: ['shopping', 'market', 'local'],
        geoCode: { latitude, longitude }
      }
    ];
  }
}

router.post('/gemini/generate', async (req, res) => {
  const { prompt, apiKey } = req.body;
  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Prompt and API key are required' });
  }
  
  // Extract the prompt type to determine what kind of mock data to return if needed
  let promptType = 'general';
  const promptText = typeof prompt === 'object' ? JSON.stringify(prompt) : prompt;
  
  if (promptText.toLowerCase().includes('budget')) {
    promptType = 'budget';
  } else if (promptText.toLowerCase().includes('attractions') || promptText.toLowerCase().includes('activities')) {
    promptType = 'attractions';
  } else if (promptText.toLowerCase().includes('hotel')) {
    promptType = 'hotels';
  } else if (promptText.toLowerCase().includes('flight')) {
    promptType = 'flights';
  }
  
  try {
    const requestBody = {
      contents: [{
        parts: [{
          text: promptText
        }]
      }]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const result = response.data;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Try to parse as JSON with multiple approaches
    try {
      // First, check if the text is already valid JSON
      try {
        const data = JSON.parse(text);
        return res.json(data);
      } catch (directParseError) {
        // Not direct JSON, continue to other methods
      }
      
      // Look for JSON in code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const cleanedText = jsonMatch[1].trim();
        try {
          const data = JSON.parse(cleanedText);
          return res.json(data);
        } catch (codeBlockError) {
          // JSON in code block wasn't valid, continue
        }
      }
      
      // Try to extract JSON objects with regex
      const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          const data = JSON.parse(jsonObjectMatch[0]);
          return res.json(data);
        } catch (objectMatchError) {
          // Extracted object wasn't valid JSON, continue
        }
      }
      
      // If we couldn't parse JSON, return a structured response with the text
      return res.json({
        text: text,
        recommendations: text.includes("recommendations") ?
          [{
            name: "Generated Recommendation",
            description: text,
            image: "https://source.unsplash.com/640x360/?travel"
          }] : undefined,
        isMock: false
      });
    } catch (e) {
      console.error("Failed to parse Gemini response:", text);
      // Return a fallback structured response
      return res.json({
        text: text,
        recommendations: [{
          name: "Fallback Recommendation",
          description: "We couldn't process the AI response properly. Here's the raw text: " + text.substring(0, 200) + "...",
          image: "https://source.unsplash.com/640x360/?error"
        }],
        isMock: true
      });
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error.response?.data || error.message);
    
    // Return appropriate mock data based on prompt type
    if (promptType === 'budget') {
      return res.json({
        text: "Your budget appears reasonable for a trip to Bangkok. The hotel and flight costs are within typical ranges for this destination. You have sufficient funds remaining for activities, meals, and transportation. Consider setting aside some money for souvenirs and unexpected expenses.",
        isMock: true
      });
    } else if (promptType === 'attractions') {
      return res.json({
        recommendations: [
          {
            name: "Grand Palace",
            category: "SIGHTS",
            description: "The Grand Palace is a complex of buildings in Bangkok, Thailand. It served as the official residence of the Kings of Siam since 1782.",
            image: "https://source.unsplash.com/640x360/?bangkok,palace"
          },
          {
            name: "Wat Arun",
            category: "SIGHTS",
            description: "Wat Arun is a Buddhist temple in Bangkok Yai district of Bangkok, Thailand, on the Thonburi west bank of the Chao Phraya River.",
            image: "https://source.unsplash.com/640x360/?bangkok,temple"
          },
          {
            name: "Chatuchak Weekend Market",
            category: "SHOPPING",
            description: "Chatuchak Weekend Market is one of the world's largest weekend markets covering over 35 acres with more than 8,000 stalls.",
            image: "https://source.unsplash.com/640x360/?bangkok,market"
          },
          {
            name: "Chinatown (Yaowarat)",
            category: "RESTAURANT",
            description: "Bangkok's Chinatown is one of the largest Chinatowns in the world, known for its markets and delicious street food.",
            image: "https://source.unsplash.com/640x360/?bangkok,chinatown"
          }
        ],
        isMock: true
      });
    } else {
      // Generic fallback for other types
      return res.json({
        error: 'Gemini API request failed',
        text: "We're currently experiencing issues with our AI service. Here's some general information that might be helpful.",
        recommendations: [{
          name: "Bangkok Travel Guide",
          description: "Bangkok, Thailand's capital, is a large city known for ornate shrines and vibrant street life. The boat-filled Chao Phraya River feeds its network of canals, flowing past the Rattanakosin royal district, home to opulent Grand Palace and its sacred Wat Phra Kaew Temple.",
          image: "https://source.unsplash.com/640x360/?bangkok"
        }],
        isMock: true
      });
    }
  }
});

router.get('/unsplash/image', async (req, res) => {
  const { place, type = 'general' } = req.query;
  if (!place) {
    return res.status(400).json({ error: 'Place query parameter is required' });
  }

  try {
    // Build a more specific search query based on type
    let searchQuery = place;

    if (type === 'hotel') {
      // For hotels, add hotel-specific keywords to get more accurate results
      const hotelKeywords = ['hotel', 'resort', 'boutique hotel', 'luxury hotel', 'accommodation'];
      // Check if the place name already contains hotel keywords
      const hasHotelKeyword = hotelKeywords.some(keyword =>
        place.toLowerCase().includes(keyword.toLowerCase())
      );

      if (!hasHotelKeyword) {
        // Add hotel keywords to improve search accuracy
        searchQuery = `${place} hotel`;
      }
    } else if (type === 'restaurant') {
      searchQuery = `${place} restaurant food`;
    } else if (type === 'attraction') {
      searchQuery = `${place} landmark tourist attraction`;
    }

   
    const result = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: searchQuery,
        per_page: 3, 
        orientation: 'landscape',
        content_filter: 'high'
      },
      headers: {
        Authorization: `Client-ID ${unsplashConfig.accessKey}`
      },
      timeout: 5000 // 5 second timeout
    });

    // Filter results to find the most relevant image
    const results = result.data.results || [];
    let selectedImage = null;

    if (results.length > 0) {
      // For hotels, prefer images that might show hotel exteriors or lobbies
      if (type === 'hotel') {
        // Look for images with hotel-related tags or descriptions
        const hotelImage = results.find(img =>
          img.tags?.some(tag => tag.title?.toLowerCase().includes('hotel')) ||
          img.description?.toLowerCase().includes('hotel') ||
          img.alt_description?.toLowerCase().includes('hotel')
        );
        selectedImage = hotelImage || results[0];
      } else {
        selectedImage = results[0];
      }

      if (selectedImage?.urls?.regular) {
        return res.json({ image: selectedImage.urls.regular });
      }
    }

    throw new Error('No suitable images found');
  } catch (err) {
    console.error('Error fetching image from Unsplash:', err.response?.status, err.message);

    // Fallback to source.unsplash.com with improved query building
    try {
      let fallbackQuery = place.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '+');

      if (type === 'hotel') {
        fallbackQuery = `${fallbackQuery}+hotel`;
      } else if (type === 'restaurant') {
        fallbackQuery = `${fallbackQuery}+restaurant`;
      } else if (type === 'attraction') {
        fallbackQuery = `${fallbackQuery}+landmark`;
      }

      const fallbackUrl = `https://source.unsplash.com/featured/640x360/?${fallbackQuery}`;

      // Test if the fallback URL is accessible
      const testResponse = await axios.head(fallbackUrl, { timeout: 3000 });
      if (testResponse.status === 200) {
        return res.json({ image: fallbackUrl });
      }
    } catch (fallbackErr) {
      console.error('Fallback image also failed:', fallbackErr.message);
    }

    // Final fallback to type-specific generic images
    let genericImages = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Travel
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Nature
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Mountain
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Beach
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80'  // City
    ];

    // Use hotel-specific fallback images for hotels
    if (type === 'hotel') {
      genericImages = [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Hotel lobby
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Hotel exterior
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Resort
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80', // Boutique hotel
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=640&h=360&q=80'  // Luxury hotel
      ];
    }

    // Select a random appropriate image
    const randomImage = genericImages[Math.floor(Math.random() * genericImages.length)];
    res.json({ image: randomImage });
  }
});

module.exports = router;