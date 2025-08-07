// Mock data for fallback when APIs fail

// Mock user data
export const mockUser = {
  id: 1,
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z'
};

// Ensure we never use string IDs for mock user
export const ensureIntUserId = (userId: any): number => {
  if (typeof userId === 'string' && userId.startsWith('mock-user-')) {
    return 1; // Default to user ID 1 for mock users
  }
  return typeof userId === 'number' ? userId : parseInt(userId, 10) || 1;
};

// Mock trip data
export const mockTrip = {
  id: 1,
  destination: 'Bangkok',
  start_date: '2025-08-05',
  end_date: '2025-08-07',
  group_size: 2,
  budget: 10000,
  transport: 'Flight',
  activities: ['Sightseeing', 'Food', 'Shopping'],
  other_activity: '',
  special_needs: '',
  user_id: 1
};

// Mock AI response for trip planning
export const mockAiResponse = {
  schedule: [
    {
      day: 1,
      activities: [
        {
          name: "Grand Palace",
          time: "09:00",
          cost: 500,
          image: "https://source.unsplash.com/640x360/?bangkok,palace",
          location: "Na Phra Lan Road, Bangkok",
          description: "Visit the stunning Grand Palace complex, home to the revered Emerald Buddha."
        },
        {
          name: "Wat Pho",
          time: "13:00",
          cost: 200,
          image: "https://source.unsplash.com/640x360/?bangkok,temple",
          location: "2 Sanamchai Road, Bangkok",
          description: "See the famous Reclining Buddha and enjoy a traditional Thai massage."
        },
        {
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
      day: 2,
      activities: [
        {
          name: "Chatuchak Weekend Market",
          time: "10:00",
          cost: 0,
          image: "https://source.unsplash.com/640x360/?bangkok,market",
          location: "Kamphaeng Phet 2 Road, Bangkok",
          description: "Explore one of the world's largest weekend markets with over 8,000 stalls."
        },
        {
          name: "Jim Thompson House",
          time: "14:00",
          cost: 200,
          image: "https://source.unsplash.com/640x360/?bangkok,museum",
          location: "6 Soi Kasemsan 2, Bangkok",
          description: "Visit the beautiful teak house of the American who revitalized the Thai silk industry."
        },
        {
          name: "Asiatique The Riverfront",
          time: "18:00",
          cost: 0,
          image: "https://source.unsplash.com/640x360/?bangkok,shopping",
          location: "2194 Charoen Krung Road, Bangkok",
          description: "Shop and dine at this large open-air mall by the Chao Phraya River."
        }
      ]
    },
    {
      day: 3,
      activities: [
        {
          name: "Damnoen Saduak Floating Market",
          time: "08:00",
          cost: 1000,
          image: "https://source.unsplash.com/640x360/?bangkok,floating-market",
          location: "Damnoen Saduak, Ratchaburi",
          description: "Experience the famous floating market about 100 km from Bangkok."
        },
        {
          name: "MBK Center",
          time: "14:00",
          cost: 0,
          image: "https://source.unsplash.com/640x360/?bangkok,mall",
          location: "444 Phayathai Road, Bangkok",
          description: "Shop for souvenirs, clothes, electronics, and more at this popular mall."
        },
        {
          name: "Khao San Road",
          time: "19:00",
          cost: 500,
          image: "https://source.unsplash.com/640x360/?bangkok,nightlife",
          location: "Khao San Road, Bangkok",
          description: "Experience the famous backpacker street with bars, restaurants, and street food."
        }
      ]
    }
  ],
  recommendations: [
    {
      name: "Ayutthaya Day Trip",
      description: "Visit the ancient capital of Thailand, a UNESCO World Heritage site with impressive ruins and temples.",
      image: "https://source.unsplash.com/640x360/?ayutthaya",
      category: "Sightseeing"
    },
    {
      name: "Thai Cooking Class",
      description: "Learn to cook authentic Thai dishes with a professional chef in a hands-on cooking class.",
      image: "https://source.unsplash.com/640x360/?thai,cooking",
      category: "Food"
    },
    {
      name: "Muay Thai Boxing Match",
      description: "Experience Thailand's national sport at a live Muay Thai boxing match at Rajadamnern Stadium.",
      image: "https://source.unsplash.com/640x360/?muay,thai",
      category: "Entertainment"
    },
    {
      name: "Chatuchak Weekend Market",
      description: "Shop at one of the world's largest weekend markets with over 8,000 stalls selling everything from clothes to antiques.",
      image: "https://source.unsplash.com/640x360/?bangkok,market",
      category: "Shopping"
    },
    {
      name: "Thai Massage",
      description: "Experience traditional Thai massage at a reputable spa for relaxation and rejuvenation.",
      image: "https://source.unsplash.com/640x360/?thai,massage",
      category: "Wellness"
    }
  ]
};

// Mock Bangkok hotels
export const mockBangkokHotels = [
  {
    id: 'MOCK-BKK-001',
    name: 'Grand Bangkok Hotel',
    price: 3500,
    currency: 'THB',
    description: 'Luxury hotel in the heart of Bangkok with stunning city views and world-class amenities.',
    image: 'https://source.unsplash.com/640x360/?bangkok,hotel',
    location: 'Bangkok City Center',
    rating: 5,
    amenities: ['SWIMMING_POOL', 'SPA', 'FITNESS_CENTER', 'RESTAURANT', 'WIFI'],
    contact: {
      phone: '+66 2 123 4567',
      email: 'info@grandbangkokhotel.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-07',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'DELUXE',
      beds: 1,
      bedType: 'KING',
      description: 'Spacious deluxe room with city view'
    },
    policies: {
      cancellation: {
        description: {
          text: 'Free cancellation until 24 hours before check-in'
        }
      },
      payment: {
        acceptedPayments: {
          creditCards: ['VISA', 'MASTERCARD', 'AMEX']
        }
      }
    }
  },
  {
    id: 'MOCK-BKK-002',
    name: 'Riverside Bangkok Resort',
    price: 4200,
    currency: 'THB',
    description: 'Beautiful resort along the Chao Phraya River with traditional Thai architecture and modern comforts.',
    image: 'https://source.unsplash.com/640x360/?bangkok,resort',
    location: 'Riverside, Bangkok',
    rating: 4,
    amenities: ['SWIMMING_POOL', 'SPA', 'RESTAURANT', 'WIFI', 'PARKING'],
    contact: {
      phone: '+66 2 234 5678',
      email: 'booking@riversidebangkok.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-07',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'SUITE',
      beds: 1,
      bedType: 'QUEEN',
      description: 'Luxury suite with river view'
    },
    policies: {
      cancellation: {
        description: {
          text: 'Free cancellation until 48 hours before check-in'
        }
      },
      payment: {
        acceptedPayments: {
          creditCards: ['VISA', 'MASTERCARD']
        }
      }
    }
  },
  {
    id: 'MOCK-BKK-003',
    name: 'Bangkok Boutique Hotel',
    price: 2800,
    currency: 'THB',
    description: 'Charming boutique hotel in a quiet neighborhood with easy access to public transportation.',
    image: 'https://source.unsplash.com/640x360/?boutique,hotel',
    location: 'Sukhumvit, Bangkok',
    rating: 3,
    amenities: ['WIFI', 'RESTAURANT', 'PARKING'],
    contact: {
      phone: '+66 2 345 6789',
      email: 'info@bangkokboutique.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-07',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'STANDARD',
      beds: 2,
      bedType: 'TWIN',
      description: 'Cozy standard room with city view'
    },
    policies: {
      cancellation: {
        description: {
          text: 'Free cancellation until 24 hours before check-in'
        }
      },
      payment: {
        acceptedPayments: {
          creditCards: ['VISA', 'MASTERCARD']
        }
      }
    }
  }
];

// Mock Bangkok attractions
export const mockBangkokAttractions = [
  {
    id: 'MOCK-ATTR-001',
    name: 'Grand Palace',
    category: 'SIGHTS',
    description: 'The Grand Palace is a complex of buildings in Bangkok, Thailand. It served as the official residence of the Kings of Siam since 1782.',
    image: 'https://source.unsplash.com/640x360/?bangkok,palace',
    location: 'Na Phra Lan Road, Bangkok',
    cost: 500,
    currency: 'THB',
    duration: 3,
    rating: 4.8
  },
  {
    id: 'MOCK-ATTR-002',
    name: 'Wat Arun',
    category: 'SIGHTS',
    description: 'Wat Arun is a Buddhist temple in Bangkok Yai district of Bangkok, Thailand, on the Thonburi west bank of the Chao Phraya River.',
    image: 'https://source.unsplash.com/640x360/?bangkok,temple',
    location: 'Arun Amarin Road, Bangkok',
    cost: 200,
    currency: 'THB',
    duration: 2,
    rating: 4.7
  },
  {
    id: 'MOCK-ATTR-003',
    name: 'Chatuchak Weekend Market',
    category: 'SHOPPING',
    description: 'Chatuchak Weekend Market is one of the world\'s largest weekend markets covering over 35 acres with more than 8,000 stalls.',
    image: 'https://source.unsplash.com/640x360/?bangkok,market',
    location: 'Kamphaeng Phet 2 Road, Bangkok',
    cost: 0,
    currency: 'THB',
    duration: 4,
    rating: 4.5
  },
  {
    id: 'MOCK-ATTR-004',
    name: 'Chinatown (Yaowarat)',
    category: 'RESTAURANT',
    description: 'Bangkok\'s Chinatown is one of the largest Chinatowns in the world, known for its markets and delicious street food.',
    image: 'https://source.unsplash.com/640x360/?bangkok,chinatown',
    location: 'Yaowarat Road, Bangkok',
    cost: 300,
    currency: 'THB',
    duration: 3,
    rating: 4.6
  },
  {
    id: 'MOCK-ATTR-005',
    name: 'Asiatique The Riverfront',
    category: 'NIGHTLIFE',
    description: 'Asiatique The Riverfront is a large open-air mall in Bangkok, combining shopping, dining, and entertainment.',
    image: 'https://source.unsplash.com/640x360/?bangkok,riverfront',
    location: 'Charoen Krung Road, Bangkok',
    cost: 0,
    currency: 'THB',
    duration: 3,
    rating: 4.3
  }
];

// Mock Bangkok flights
export const mockBangkokFlights = [
  {
    id: 'MOCK-FLIGHT-001',
    airline: 'Thai Airways',
    flightNumber: 'TG123',
    departureAirport: 'BKK',
    departureCity: 'Bangkok',
    departureTime: '10:00',
    departureDate: '2025-08-05',
    arrivalAirport: 'HKT',
    arrivalCity: 'Phuket',
    arrivalTime: '11:30',
    arrivalDate: '2025-08-05',
    duration: '1h 30m',
    price: 2500,
    currency: 'THB',
    cabinClass: 'ECONOMY',
    seatsAvailable: 15
  },
  {
    id: 'MOCK-FLIGHT-002',
    airline: 'Bangkok Airways',
    flightNumber: 'PG456',
    departureAirport: 'BKK',
    departureCity: 'Bangkok',
    departureTime: '14:30',
    departureDate: '2025-08-05',
    arrivalAirport: 'USM',
    arrivalCity: 'Koh Samui',
    arrivalTime: '15:45',
    arrivalDate: '2025-08-05',
    duration: '1h 15m',
    price: 3200,
    currency: 'THB',
    cabinClass: 'ECONOMY',
    seatsAvailable: 8
  },
  {
    id: 'MOCK-FLIGHT-003',
    airline: 'AirAsia',
    flightNumber: 'FD789',
    departureAirport: 'DMK',
    departureCity: 'Bangkok',
    departureTime: '08:15',
    departureDate: '2025-08-05',
    arrivalAirport: 'CNX',
    arrivalCity: 'Chiang Mai',
    arrivalTime: '09:30',
    arrivalDate: '2025-08-05',
    duration: '1h 15m',
    price: 1800,
    currency: 'THB',
    cabinClass: 'ECONOMY',
    seatsAvailable: 22
  }
];

// Mock cities
export const mockCities = [
  { name: "Bangkok", iataCode: "BKK" },
  { name: "Bangkok Suvarnabhumi", iataCode: "BKK" },
  { name: "Bangkok Don Mueang", iataCode: "DMK" },
  { name: "Phuket", iataCode: "HKT" },
  { name: "Chiang Mai", iataCode: "CNX" },
  { name: "Koh Samui", iataCode: "USM" },
  { name: "Krabi", iataCode: "KBV" },
  { name: "Pattaya", iataCode: "PYX" }
];

// Mock categorized packing list
export const mockPackingList = {
  categories: [
    {
      name: "Documents",
      items: [
        { name: "Passport", quantity: 1, packed: false },
        { name: "Travel Insurance", quantity: 1, packed: false },
        { name: "Flight Tickets", quantity: 1, packed: false },
        { name: "Hotel Reservations", quantity: 1, packed: false },
        { name: "Driver's License", quantity: 1, packed: false },
        { name: "Credit/Debit Cards", quantity: 2, packed: false }
      ]
    },
    {
      name: "Clothing",
      items: [
        { name: "T-shirts", quantity: 5, packed: false },
        { name: "Shorts", quantity: 3, packed: false },
        { name: "Swimwear", quantity: 2, packed: false },
        { name: "Light Jacket", quantity: 1, packed: false },
        { name: "Underwear", quantity: 7, packed: false },
        { name: "Socks", quantity: 5, packed: false },
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
        { name: "Travel Adapter", quantity: 1, packed: false },
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

// Mock trip recommendations with categories
export const mockTripRecommendations = {
  text: "Here are some recommendations for your trip to Bangkok:",
  categories: [
    {
      name: "Food",
      items: [
        {
          name: "Street Food Tour",
          description: "Experience Bangkok's famous street food scene with a guided tour through local markets and food stalls.",
          image: "https://source.unsplash.com/640x360/?bangkok,streetfood"
        },
        {
          name: "Pad Thai at Thip Samai",
          description: "Try the legendary Pad Thai at Thip Samai, one of Bangkok's most famous Pad Thai restaurants.",
          image: "https://source.unsplash.com/640x360/?padthai"
        },
        {
          name: "Rooftop Dining",
          description: "Enjoy a meal with a view at one of Bangkok's many rooftop restaurants.",
          image: "https://source.unsplash.com/640x360/?bangkok,rooftop"
        }
      ]
    },
    {
      name: "Shopping",
      items: [
        {
          name: "Chatuchak Weekend Market",
          description: "Shop at one of the world's largest weekend markets with over 8,000 stalls.",
          image: "https://source.unsplash.com/640x360/?bangkok,market"
        },
        {
          name: "MBK Center",
          description: "Find bargains on clothing, electronics, and souvenirs at this popular shopping mall.",
          image: "https://source.unsplash.com/640x360/?bangkok,mall"
        },
        {
          name: "Pratunam Market",
          description: "Shop for wholesale clothing and fashion accessories at this bustling market.",
          image: "https://source.unsplash.com/640x360/?bangkok,clothing"
        }
      ]
    },
    {
      name: "Culture",
      items: [
        {
          name: "Traditional Thai Dance Performance",
          description: "Watch a traditional Thai dance performance showcasing Thailand's rich cultural heritage.",
          image: "https://source.unsplash.com/640x360/?thai,dance"
        },
        {
          name: "Thai Cooking Class",
          description: "Learn to cook authentic Thai dishes with a professional chef.",
          image: "https://source.unsplash.com/640x360/?thai,cooking"
        },
        {
          name: "Thai Massage",
          description: "Experience traditional Thai massage at a reputable spa.",
          image: "https://source.unsplash.com/640x360/?thai,massage"
        }
      ]
    },
    {
      name: "Entertainment",
      items: [
        {
          name: "Muay Thai Boxing Match",
          description: "Watch Thailand's national sport at a live Muay Thai boxing match.",
          image: "https://source.unsplash.com/640x360/?muay,thai"
        },
        {
          name: "Calypso Cabaret Show",
          description: "Enjoy a colorful and entertaining cabaret show featuring talented performers.",
          image: "https://source.unsplash.com/640x360/?cabaret,show"
        },
        {
          name: "Asiatique Night Market",
          description: "Visit this popular night market with shopping, dining, and entertainment options.",
          image: "https://source.unsplash.com/640x360/?bangkok,night"
        }
      ]
    }
  ]
};

// Mock schedule data
export const mockScheduleData = {
  schedule: [
    {
      day: 1,
      activities: [
        {
          name: "Grand Palace",
          time: "09:00",
          cost: 500,
          image: "https://source.unsplash.com/640x360/?bangkok,palace",
          location: "Na Phra Lan Road, Bangkok",
          description: "Visit the stunning Grand Palace complex, home to the revered Emerald Buddha."
        },
        {
          name: "Wat Pho",
          time: "13:00",
          cost: 200,
          image: "https://source.unsplash.com/640x360/?bangkok,temple",
          location: "2 Sanamchai Road, Bangkok",
          description: "See the famous Reclining Buddha and enjoy a traditional Thai massage."
        },
        {
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
      day: 2,
      activities: [
        {
          name: "Chatuchak Weekend Market",
          time: "10:00",
          cost: 0,
          image: "https://source.unsplash.com/640x360/?bangkok,market",
          location: "Kamphaeng Phet 2 Road, Bangkok",
          description: "Explore one of the world's largest weekend markets with over 8,000 stalls."
        },
        {
          name: "Jim Thompson House",
          time: "14:00",
          cost: 200,
          image: "https://source.unsplash.com/640x360/?bangkok,museum",
          location: "6 Soi Kasemsan 2, Bangkok",
          description: "Visit the beautiful teak house of the American who revitalized the Thai silk industry."
        },
        {
          name: "Asiatique The Riverfront",
          time: "18:00",
          cost: 0,
          image: "https://source.unsplash.com/640x360/?bangkok,shopping",
          location: "2194 Charoen Krung Road, Bangkok",
          description: "Shop and dine at this large open-air mall by the Chao Phraya River."
        }
      ]
    }
  ]
};

// Function to get mock data based on type and parameters
export function getMockData(type: string, params: any = {}) {
  switch (type) {
    case 'hotels':
      return {
        data: mockBangkokHotels,
        totalPages: 1,
        isMock: true
      };
    case 'attractions':
      return {
        data: mockBangkokAttractions,
        isMock: true
      };
    case 'flights':
      return {
        data: mockBangkokFlights,
        isMock: true
      };
    case 'cities':
      const { keyword } = params;
      if (keyword) {
        return {
          data: mockCities.filter(city => 
            city.name.toLowerCase().includes(keyword.toLowerCase()) ||
            city.iataCode.toLowerCase().includes(keyword.toLowerCase())
          ),
          isMock: true
        };
      }
      return {
        data: mockCities,
        isMock: true
      };
    case 'recommendations':
      return mockTripRecommendations;
    case 'packingList':
      return mockPackingList;
    case 'schedule':
      return mockScheduleData;
    default:
      return { error: 'Unknown mock data type', isMock: true };
  }
}