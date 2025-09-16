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


export const ensureIntUserId = (userId: any): number => {
  if (typeof userId === 'string' && userId.startsWith('mock-user-')) {
    return 1; 
  }
  return typeof userId === 'number' ? userId : parseInt(userId, 10) || 1;
};

export const getMockImage = (keyword: string): string => {
  const lower = keyword.toLowerCase();
  if (lower.includes('hotel')) {
    return new URL('../assets/hotel.png', import.meta.url).href;
  }
  if (lower.includes('flight')) {
    return new URL('../assets/flight.png', import.meta.url).href;
  }
  if (lower.includes('temple') || lower.includes('wat') || lower.includes('palace')) {
    return new URL('../assets/temple.jpg', import.meta.url).href;
  }
  if (lower.includes('sea') || lower.includes('beach') || lower.includes('river')) {
    return new URL('../assets/sea.jpg', import.meta.url).href;
  }
  if (lower.includes('mountain') || lower.includes('park')) {
    return new URL('../assets/mountains.webp', import.meta.url).href;
  }
  // default generic
  return new URL('../assets/pic1.jpg', import.meta.url).href;
};
// Mock trip data
export const mockTrip = {
  id: 1,
  destination: 'Bangkok',
  start_date: '2025-08-05',
  end_date: '2025-08-08',
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
          image: getMockImage("Grand Palace"),
          location: "Na Phra Lan Road, Bangkok",
          description: "Visit the stunning Grand Palace complex, home to the revered Emerald Buddha."
        },
        {
          name: "Wat Pho",
          time: "13:00",
          cost: 200,
          image: getMockImage("Wat Pho"),
          location: "2 Sanamchai Road, Bangkok",
          description: "See the famous Reclining Buddha and enjoy a traditional Thai massage."
        },
        {
          name: "Chao Phraya River Dinner Cruise",
          time: "19:00",
          cost: 1500,
          image: getMockImage("Chao Phraya River Dinner Cruise"),
          location: "River City Pier, Bangkok",
          description: "Enjoy dinner while cruising along the Chao Phraya River with beautiful night views."
        },
        {
          name: "Wat Arun",
          time: "16:00",
          cost: 100,
          image: getMockImage("Wat Arun"),
          location: "158 Thanon Wang Doem, Bangkok",
          description: "Admire the Temple of Dawn across the river, known for its stunning architecture."
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
          image: getMockImage("Chatuchak Weekend Market"),
          location: "Kamphaeng Phet 2 Road, Bangkok",
          description: "Explore one of the world's largest weekend markets with over 8,000 stalls."
        },
        {
          name: "Jim Thompson House",
          time: "14:00",
          cost: 200,
          image: getMockImage("Jim Thompson House"),
          location: "6 Soi Kasemsan 2, Bangkok",
          description: "Visit the beautiful teak house of the American who revitalized the Thai silk industry."
        },
        {
          name: "Asiatique The Riverfront",
          time: "18:00",
          cost: 0,
          image: getMockImage("Asiatique The Riverfront"),
          location: "2194 Charoen Krung Road, Bangkok",
          description: "Shop and dine at this large open-air mall by the Chao Phraya River."
        },
        {
          name: "Lumpini Park",
          time: "11:00",
          cost: 0,
          image: getMockImage("Lumpini Park"),
          location: "Rama IV Rd, Bangkok",
          description: "Relax in Bangkok's central green oasis with paddle boating and monitor lizards."
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
          image: getMockImage("Damnoen Saduak Floating Market"),
          location: "Damnoen Saduak, Ratchaburi",
          description: "Experience the famous floating market about 100 km from Bangkok."
        },
        {
          name: "MBK Center",
          time: "14:00",
          cost: 0,
          image: getMockImage("MBK Center"),
          location: "444 Phayathai Road, Bangkok",
          description: "Shop for souvenirs, clothes, electronics, and more at this popular mall."
        },
        {
          name: "Khao San Road",
          time: "19:00",
          cost: 500,
          image: getMockImage("Khao San Road"),
          location: "Khao San Road, Bangkok",
          description: "Experience the famous backpacker street with bars, restaurants, and street food."
        },
        {
          name: "Siam Paragon",
          time: "12:00",
          cost: 0,
          image: getMockImage("Siam Paragon"),
          location: "991 Rama I Road, Bangkok",
          description: "Discover luxury shopping, an aquarium, and entertainment at this premier mall."
        }
      ]
    },
    {
      day: 4,
      activities: [
        {
          name: "Ayutthaya Historical Park",
          time: "09:00",
          cost: 50,
          image: getMockImage("Ayutthaya Historical Park"),
          location: "Phra Nakhon Si Ayutthaya, Ayutthaya",
          description: "Explore the ancient ruins of Thailand's former capital, a UNESCO World Heritage site."
        },
        {
          name: "Terminal 21",
          time: "14:00",
          cost: 0,
          image: getMockImage("Terminal 21"),
          location: "88 Sukhumvit Soi 19, Bangkok",
          description: "Shop in a unique mall themed after global cities with diverse food options."
        },
        {
          name: "Chinatown (Yaowarat)",
          time: "18:00",
          cost: 300,
          image: getMockImage("Chinatown Yaowarat"),
          location: "Yaowarat Road, Bangkok",
          description: "Savor street food and explore the vibrant night market in Bangkok's Chinatown."
        }
      ]
    }
  ],
  recommendations: [
    {
      name: "Ayutthaya Day Trip",
      description: "Visit the ancient capital of Thailand, a UNESCO World Heritage site with impressive ruins and temples.",
      image: getMockImage("Ayutthaya Day Trip"),
      category: "Sightseeing"
    },
    {
      name: "Thai Cooking Class",
      description: "Learn to cook authentic Thai dishes with a professional chef in a hands-on cooking class.",
      image: getMockImage("Thai Cooking Class"),
      category: "Food"
    },
    {
      name: "Muay Thai Boxing Match",
      description: "Experience Thailand's national sport at a live Muay Thai boxing match at Rajadamnern Stadium.",
      image: getMockImage("Muay Thai Boxing Match"),
      category: "Entertainment"
    },
    {
      name: "Chatuchak Weekend Market",
      description: "Shop at one of the world's largest weekend markets with over 8,000 stalls selling everything from clothes to antiques.",
      image: getMockImage("Chatuchak Weekend Market"),
      category: "Shopping"
    },
    {
      name: "Thai Massage",
      description: "Experience traditional Thai massage at a reputable spa for relaxation and rejuvenation.",
      image: getMockImage("Thai Massage"),
      category: "Wellness"
    },
    {
      name: "Floating Market Tour",
      description: "Take a boat tour through one of Bangkok's famous floating markets for a unique cultural experience.",
      image: getMockImage("Floating Market Tour"),
      category: "Culture"
    },
    {
      name: "Rooftop Bar Experience",
      description: "Enjoy cocktails with panoramic views of Bangkok from one of the city's famous rooftop bars.",
      image: getMockImage("Rooftop Bar Experience"),
      category: "Nightlife"
    },
    {
      name: "Elephant Sanctuary Visit",
      description: "Ethically interact with rescued elephants at a sanctuary outside of Bangkok.",
      image: getMockImage("Elephant Sanctuary Visit"),
      category: "Nature"
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
    image: getMockImage("Grand Bangkok Hotel"),
    location: 'Bangkok City Center',
    rating: 5,
    amenities: ['SWIMMING_POOL', 'SPA', 'FITNESS_CENTER', 'RESTAURANT', 'WIFI'],
    contact: {
      phone: '+66 2 123 4567',
      email: 'info@grandbangkokhotel.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
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
    image: getMockImage("Riverside Bangkok Resort"),
    location: 'Riverside, Bangkok',
    rating: 4,
    amenities: ['SWIMMING_POOL', 'SPA', 'RESTAURANT', 'WIFI', 'PARKING'],
    contact: {
      phone: '+66 2 234 5678',
      email: 'booking@riversidebangkok.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
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
    image: getMockImage("Bangkok Boutique Hotel"),
    location: 'Sukhumvit, Bangkok',
    rating: 3,
    amenities: ['WIFI', 'RESTAURANT', 'PARKING'],
    contact: {
      phone: '+66 2 345 6789',
      email: 'info@bangkokboutique.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
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
  },
  {
    id: 'MOCK-BKK-004',
    name: 'Siam Heritage Hotel',
    price: 3200,
    currency: 'THB',
    description: 'Elegant hotel blending Thai heritage with modern luxury in the Siam district.',
    image: getMockImage("Siam Heritage Hotel"),
    location: 'Siam, Bangkok',
    rating: 4.5,
    amenities: ['POOL', 'SPA', 'GYM', 'WIFI', 'RESTAURANT'],
    contact: {
      phone: '+66 2 456 7890',
      email: 'reservations@siamheritage.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'SUPERIOR',
      beds: 1,
      bedType: 'DOUBLE',
      description: 'Superior room with traditional Thai decor'
    },
    policies: {
      cancellation: {
        description: {
          text: 'Free cancellation until 72 hours before check-in'
        }
      },
      payment: {
        acceptedPayments: {
          creditCards: ['VISA', 'MASTERCARD', 'AMEX', 'DINERS']
        }
      }
    }
  },
  {
    id: 'MOCK-BKK-005',
    name: 'Oriental Bangkok Suites',
    price: 5000,
    currency: 'THB',
    description: 'Premium suites offering river views and exceptional service in a serene setting.',
    image: getMockImage("Oriental Bangkok Suites"),
    location: 'Bangrak, Bangkok',
    rating: 4.8,
    amenities: ['RIVER_VIEW', 'SPA', 'POOL', 'WIFI', 'CONCIERGE'],
    contact: {
      phone: '+66 2 567 8901',
      email: 'info@orientalbangkok.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'JUNIOR_SUITE',
      beds: 1,
      bedType: 'KING',
      description: 'Junior suite with balcony and river view'
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
    id: 'MOCK-BKK-006',
    name: 'Economy Inn Bangkok',
    price: 1500,
    currency: 'THB',
    description: 'Budget-friendly inn near major attractions with basic amenities and clean rooms.',
    image: getMockImage("Economy Inn Bangkok"),
    location: 'Khao San Area, Bangkok',
    rating: 3.2,
    amenities: ['WIFI', 'AC', 'BREAKFAST'],
    contact: {
      phone: '+66 2 678 9012',
      email: 'bookings@economyinn.com'
    },
    checkInDate: '2025-08-05',
    checkOutDate: '2025-08-08',
    adults: 2,
    cityCode: 'BKK',
    room: {
      type: 'ECONOMY',
      beds: 1,
      bedType: 'DOUBLE',
      description: 'Basic economy room for budget travelers'
    },
    policies: {
      cancellation: {
        description: {
          text: 'Non-refundable'
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
    image: getMockImage("Grand Palace"),
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
    image: getMockImage("Wat Arun"),
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
    description: "Chatuchak Weekend Market is one of the world's largest weekend markets covering over 35 acres with more than 8,000 stalls.",
    image: getMockImage("Chatuchak Weekend Market"),
    location: 'Kamphaeng Phet 2 Road, Bangkok',
    cost: 0,
    currency: 'THB',
    duration: 4,
    rating: 4.5
  },
  {
    id: 'MOCK-ATTR-004',
    name: 'Khao San Road',
    category: 'NIGHTLIFE',
    description: 'Khao San Road is a famous backpacker street in Bangkok known for its vibrant nightlife, street food, and shopping.',
    image: getMockImage("Khao San Road"),
    location: 'Khao San Road, Bangkok',
    cost: 500,
    currency: 'THB',
    duration: 3,
    rating: 4.2
  },
  {
    id: 'MOCK-ATTR-005',
    name: 'Lumpini Park',
    category: 'NATURE',
    description: 'Lumpini Park is Bangkok\'s oldest and most popular public park, offering a green escape in the city center.',
    image: getMockImage("Lumpini Park"),
    location: 'Rama IV Rd, Bangkok',
    cost: 0,
    currency: 'THB',
    duration: 2,
    rating: 4.4
  },
  {
    id: 'MOCK-ATTR-006',
    name: 'Jim Thompson House',
    category: 'CULTURE',
    description: 'The Jim Thompson House is a museum showcasing the life and work of the American silk entrepreneur in Thailand.',
    image: getMockImage("Jim Thompson House"),
    location: '6 Soi Kasemsan 2, Bangkok',
    cost: 200,
    currency: 'THB',
    duration: 1.5,
    rating: 4.6
  },
  {
    id: 'MOCK-ATTR-007',
    name: 'Siam Ocean World',
    category: 'ENTERTAINMENT',
    description: 'Southeast Asia\'s largest aquarium located in Siam Paragon, featuring thousands of marine species.',
    image: getMockImage("Siam Ocean World"),
    location: 'Siam Paragon, Bangkok',
    cost: 1000,
    currency: 'THB',
    duration: 3,
    rating: 4.3
  },
  {
    id: 'MOCK-ATTR-008',
    name: 'Chinatown (Yaowarat)',
    category: 'FOOD',
    description: 'Bangkok\'s Chinatown is famous for its street food, markets, and Chinese temples.',
    image: getMockImage("Chinatown Yaowarat"),
    location: 'Yaowarat Road, Bangkok',
    cost: 300,
    currency: 'THB',
    duration: 2,
    rating: 4.5
  }
];
export const mockScheduleData = {
  schedule: mockAiResponse.schedule || []
};

export const mockTripRecommendations = {
  categories: [
    {
      name: "Recommendations",
      items: mockAiResponse.recommendations?.map((rec, index) => ({
        id: index + 1,
        ...rec
      })) || []
    }
  ]
};

export function getMockData(type: string): any {
  switch (type) {
    case 'recommendations':
      return mockTripRecommendations;
    case 'schedule':
      return mockScheduleData;
    default:
      return mockAiResponse;
  }
}
export const mockCommunityTrips = [
  {
    id: 1,
    title: "Bangkok City Escape",
    destination: "Bangkok, Thailand",
    description: "A 4-day adventure exploring temples, markets, and street food in the vibrant capital. Perfect for first-time visitors!",
    start_date: "2025-08-05",
    end_date: "2025-08-08",
    image: getMockImage("Bangkok City Escape"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      username: "JaneTraveler"
    }
  },
  {
    id: 2,
    title: "Chiang Mai Cultural Journey",
    destination: "Chiang Mai, Thailand",
    description: "Immerse in Northern Thai culture with temple visits, night markets, and ethical elephant sanctuaries. Relaxing and enlightening.",
    start_date: "2025-09-10",
    end_date: "2025-09-14",
    image: getMockImage("Chiang Mai Cultural Journey"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      username: "MountainExplorer"
    }
  },
  {
    id: 3,
    title: "Phuket Beach Bliss",
    destination: "Phuket, Thailand",
    description: "Sun-soaked beaches, island hopping, and seafood feasts. Ideal for couples seeking paradise relaxation.",
    start_date: "2025-10-01",
    end_date: "2025-10-05",
    image: getMockImage("Phuket Beach Bliss"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      username: "SunnyBeaches"
    }
  },
  {
    id: 4,
    title: "Tokyo Urban Adventure",
    destination: "Tokyo, Japan",
    description: "From Shibuya Crossing to serene temples, experience modern Japan with food tours and tech wonders. High-energy trip!",
    start_date: "2025-07-15",
    end_date: "2025-07-20",
    image: getMockImage("Tokyo Urban Adventure"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      username: "AsiaTraveler"
    }
  },
  {
    id: 5,
    title: "Bali Spiritual Retreat",
    destination: "Bali, Indonesia",
    description: "Yoga sessions, rice terrace hikes, and beach sunsets. A soul-rejuvenating escape in tropical paradise.",
    start_date: "2025-11-20",
    end_date: "2025-11-25",
    image: getMockImage("Bali Spiritual Retreat"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      username: "WellnessRetreat"
    }
  },
  {
    id: 6,
    title: "Singapore Foodie Tour",
    destination: "Singapore",
    description: "Hawker centers, Michelin-starred spots, and Gardens by the Bay. Indulge in Asia's culinary capital over 3 days.",
    start_date: "2025-06-01",
    end_date: "2025-06-03",
    image: getMockImage("Singapore Foodie Tour"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face",
      username: "FoodieGuru"
    }
  },
  {
    id: 7,
    title: "Kyoto Traditional Experience",
    destination: "Kyoto, Japan",
    description: "Discover ancient temples, tea ceremonies, and cherry blossoms in Japan's cultural heart. Serene and historical.",
    start_date: "2025-04-10",
    end_date: "2025-04-14",
    image: getMockImage("Kyoto Traditional Experience"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      username: "KyotoLover"
    }
  },
  {
    id: 8,
    title: "Hanoi Street Food Adventure",
    destination: "Hanoi, Vietnam",
    description: "Explore bustling streets, French colonial architecture, and iconic pho. A food lover's dream in Vietnam's capital.",
    start_date: "2025-05-15",
    end_date: "2025-05-19",
    image: getMockImage("Hanoi Street Food Adventure"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      username: "VietnamVoyager"
    }
  },
  {
    id: 9,
    title: "Seoul K-Pop and Culture",
    destination: "Seoul, South Korea",
    description: "K-pop concerts, palaces, and modern skyscrapers. Dive into the dynamic world of Korean entertainment and history.",
    start_date: "2025-12-01",
    end_date: "2025-12-05",
    image: getMockImage("Seoul K-Pop and Culture"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      username: "KDramaFan"
    }
  },
  {
    id: 10,
    title: "Siem Reap Angkor Wat",
    destination: "Siem Reap, Cambodia",
    description: "Explore the majestic Angkor temples, local markets, and Tonle Sap lake. Ancient wonders await.",
    start_date: "2025-03-20",
    end_date: "2025-03-24",
    image: getMockImage("Siem Reap Angkor Wat"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      username: "TempleExplorer"
    }
  },
  {
    id: 11,
    title: "Ho Chi Minh City Vibes",
    destination: "Ho Chi Minh City, Vietnam",
    description: "From war remnants to rooftop bars, experience the energy of Vietnam's southern metropolis with delicious cuisine.",
    start_date: "2025-07-01",
    end_date: "2025-07-05",
    image: getMockImage("Ho Chi Minh City Vibes"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      username: "UrbanAdventurer"
    }
  },
  {
    id: 12,
    title: "Krabi Island Hopping",
    destination: "Krabi, Thailand",
    description: "Crystal waters, limestone cliffs, and beach relaxation. Perfect for nature lovers and snorkelers.",
    start_date: "2025-02-15",
    end_date: "2025-02-19",
    image: getMockImage("Krabi Island Hopping"),
    creator: {
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=face",
      username: "IslandHopper"
    }
  }
];
export function getMockCommunityTrip(tripId: number) {
  const baseTrip = mockCommunityTrips.find(trip => trip.id === tripId);
  if (!baseTrip) return null;

  let mockFlights: any[] = [];
  let mockHotels: any[] = [];
  let mockSchedule: any[] = [];

  // Destination-specific data
  switch (tripId) {
    case 1: // Bangkok
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Bangkok',
          departureCity: 'BKK',
          departureTime: '08:00',
          departure_time: '08:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'BKK',
          arrivalTime: '08:30',
          arrival_time: '08:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Thai Airways',
          duration: '30m',
          stops: 0,
          price: 500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Bangkok")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Bangkok',
          to_city: 'Bangkok',
          departureCity: 'BKK',
          departureTime: '18:00',
          departure_time: '18:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '18:30',
          arrival_time: '18:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Thai Airways',
          duration: '30m',
          stops: 0,
          price: 500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Bangkok")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-BKK1',
          name: 'Grand Palace Hotel Bangkok',
          location: 'Bangkok City Center',
          rating: 4.8,
          price: 3500,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Grand Palace Hotel Bangkok"),
          description: 'Luxury hotel near major attractions with excellent service.',
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
          room: {
            type: 'Deluxe',
            beds: 1,
            bedType: 'King',
            description: 'Spacious room with city views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-BKK2',
          name: 'Riverside Resort Bangkok',
          location: 'Chao Phraya Riverside',
          rating: 4.5,
          price: 4200,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Riverside Resort Bangkok"),
          description: 'Riverside resort with traditional Thai architecture.',
          amenities: ['Pool', 'Spa', 'Restaurant', 'WiFi'],
          room: {
            type: 'Suite',
            beds: 1,
            bedType: 'Queen',
            description: 'Luxury suite with river view'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = mockAiResponse.schedule;
      break;

    case 2: // Chiang Mai
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Chiang Mai',
          departureCity: 'BKK',
          departureTime: '07:00',
          departure_time: '07:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'CNX',
          arrivalTime: '08:30',
          arrival_time: '08:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 2000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Chiang Mai")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Chiang Mai',
          to_city: 'Bangkok',
          departureCity: 'CNX',
          departureTime: '19:00',
          departure_time: '19:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '20:30',
          arrival_time: '20:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 2000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Chiang Mai")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-CM1',
          name: 'Chiang Mai Riverside Hotel',
          location: 'Ping River, Chiang Mai',
          rating: 4.6,
          price: 2800,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Chiang Mai Riverside Hotel"),
          description: 'Riverside hotel with beautiful views of the Ping River.',
          amenities: ['WiFi', 'Pool', 'Restaurant'],
          room: {
            type: 'Standard',
            beds: 1,
            bedType: 'Double',
            description: 'Comfortable room with river view'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-CM2',
          name: 'Old City Boutique Chiang Mai',
          location: 'Old City, Chiang Mai',
          rating: 4.4,
          price: 2500,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Old City Boutique Chiang Mai"),
          description: 'Charming boutique hotel in the historic old city.',
          amenities: ['WiFi', 'Garden', 'Breakfast'],
          room: {
            type: 'Boutique',
            beds: 1,
            bedType: 'Queen',
            description: 'Cozy room with traditional decor'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Wat Phra Singh",
              time: "09:00",
              cost: 40,
              image: getMockImage("Wat Phra Singh"),
              location: "Wat Phra Singh, Chiang Mai",
              description: "Visit one of the most revered temples in Chiang Mai with beautiful Lanna architecture."
            },
            {
              name: "Doi Suthep Temple",
              time: "13:00",
              cost: 30,
              image: getMockImage("Doi Suthep Temple"),
              location: "Doi Suthep, Chiang Mai",
              description: "Ascend to the golden temple on the mountain with panoramic views of the city."
            },
            {
              name: "Night Bazaar",
              time: "18:00",
              cost: 0,
              image: getMockImage("Night Bazaar"),
              location: "Chang Klan Road, Chiang Mai",
              description: "Shop for local crafts and enjoy street food at the vibrant night market."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Elephant Nature Park",
              time: "08:00",
              cost: 2500,
              image: getMockImage("Elephant Nature Park"),
              location: "Mae Taeng, Chiang Mai",
              description: "Ethical elephant sanctuary visit with feeding and bathing activities."
            },
            {
              name: "Chiang Mai Old City Tour",
              time: "14:00",
              cost: 0,
              image: getMockImage("Chiang Mai Old City Tour"),
              location: "Old City Moat, Chiang Mai",
              description: "Explore the historic moat, gates, and ancient temples of the old city."
            },
            {
              name: "Sunday Walking Street",
              time: "17:00",
              cost: 0,
              image: getMockImage("Sunday Walking Street"),
              location: "Ratchadamnoen Road, Chiang Mai",
              description: "Wander the famous walking street market with artisans and performers."
            }
          ]
        },
        // Add more days as needed
        {
          day: 3,
          activities: [
            {
              name: "Doi Inthanon National Park",
              time: "07:00",
              cost: 300,
              image: getMockImage("Doi Inthanon National Park"),
              location: "Doi Inthanon, Chiang Mai",
              description: "Hike to Thailand's highest peak and visit waterfalls and hill tribe villages."
            },
            {
              name: "Thai Cooking Class",
              time: "13:00",
              cost: 1000,
              image: getMockImage("Thai Cooking Class"),
              location: "Local farm, Chiang Mai",
              description: "Learn to cook Northern Thai dishes using fresh local ingredients."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Mae Sa Waterfall",
              time: "09:00",
              cost: 200,
              image: getMockImage("Mae Sa Waterfall"),
              location: "Mae Rim, Chiang Mai",
              description: "Swim and relax at the beautiful multi-tiered waterfall in the jungle."
            },
            {
              name: "Art in Paradise 3D Museum",
              time: "14:00",
              cost: 400,
              image: getMockImage("Art in Paradise 3D Museum"),
              location: "Nimmanhaemin Road, Chiang Mai",
              description: "Interactive 3D art museum with optical illusion paintings."
            }
          ]
        }
      ];
      break;

    case 3: // Phuket
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Phuket',
          departureCity: 'BKK',
          departureTime: '06:00',
          departure_time: '06:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'HKT',
          arrivalTime: '07:30',
          arrival_time: '07:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 2500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Phuket")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Phuket',
          to_city: 'Bangkok',
          departureCity: 'HKT',
          departureTime: '20:00',
          departure_time: '20:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '21:30',
          arrival_time: '21:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 2500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Phuket")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-PKT1',
          name: 'Patong Beach Resort',
          location: 'Patong Beach, Phuket',
          rating: 4.3,
          price: 4000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Patong Beach Resort"),
          description: 'Beachfront resort with direct access to Patong Beach.',
          amenities: ['Beach Access', 'Pool', 'Spa', 'Restaurant'],
          room: {
            type: 'Resort Room',
            beds: 1,
            bedType: 'King',
            description: 'Ocean view room with balcony'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-PKT2',
          name: 'Kata Beach Luxury Hotel',
          location: 'Kata Beach, Phuket',
          rating: 4.7,
          price: 5000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Kata Beach Luxury Hotel"),
          description: 'Luxury hotel on Kata Beach with premium amenities.',
          amenities: ['Private Beach', 'Infinity Pool', 'Gym', 'Fine Dining'],
          room: {
            type: 'Luxury Suite',
            beds: 1,
            bedType: 'Queen',
            description: 'Spacious suite with sea views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 72 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Patong Beach",
              time: "10:00",
              cost: 0,
              image: getMockImage("Patong Beach"),
              location: "Patong Beach, Phuket",
              description: "Relax on the famous white sand beach and enjoy water sports."
            },
            {
              name: "Big Buddha",
              time: "14:00",
              cost: 0,
              image: getMockImage("Big Buddha"),
              location: "Nakkerd Hill, Phuket",
              description: "Visit the 45-meter tall marble Buddha with panoramic island views."
            },
            {
              name: "Bangla Road Nightlife",
              time: "19:00",
              cost: 500,
              image: getMockImage("Bangla Road Nightlife"),
              location: "Bangla Road, Patong",
              description: "Experience Phuket's vibrant nightlife with bars and live music."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Phi Phi Islands Tour",
              time: "08:00",
              cost: 2000,
              image: getMockImage("Phi Phi Islands Tour"),
              location: "Phi Phi Islands, Phuket",
              description: "Boat tour to the stunning Phi Phi islands for snorkeling and Maya Bay."
            },
            {
              name: "Old Phuket Town",
              time: "16:00",
              cost: 0,
              image: getMockImage("Old Phuket Town"),
              location: "Thalang Road, Phuket",
              description: "Explore Sino-Portuguese architecture and local markets in historic Phuket Town."
            }
          ]
        },
        // Add more days
        {
          day: 3,
          activities: [
            {
              name: "James Bond Island",
              time: "09:00",
              cost: 1500,
              image: getMockImage("James Bond Island"),
              location: "Phang Nga Bay, Phuket",
              description: "Visit the iconic limestone karst from the James Bond movie."
            },
            {
              name: "Promthep Cape",
              time: "17:00",
              cost: 0,
              image: getMockImage("Promthep Cape"),
              location: "Promthep Cape, Phuket",
              description: "Watch the sunset at Phuket's southernmost point with stunning sea views."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Kata Beach",
              time: "10:00",
              cost: 0,
              image: getMockImage("Kata Beach"),
              location: "Kata Beach, Phuket",
              description: "Enjoy a quieter beach day with swimming and beach volleyball."
            },
            {
              name: "Phuket Fantasea",
              time: "18:00",
              cost: 1800,
              image: getMockImage("Phuket Fantasea"),
              location: "Kamala Beach, Phuket",
              description: "Cultural theme park with shows, games, and Thai dinner buffet."
            }
          ]
        }
      ];
      break;

    case 4: // Tokyo
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Tokyo',
          departureCity: 'BKK',
          departureTime: '18:00',
          departure_time: '18:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'NRT',
          arrivalTime: '01:00',
          arrival_time: '01:00:00',
          arrival_date: new Date(new Date(baseTrip.start_date).getTime() + 24*60*60*1000).toISOString().split('T')[0],
          airline: 'Japan Airlines',
          duration: '7h',
          stops: 0,
          price: 25000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Tokyo")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Tokyo',
          to_city: 'Bangkok',
          departureCity: 'NRT',
          departureTime: '20:00',
          departure_time: '20:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '01:00',
          arrival_time: '01:00:00',
          arrival_date: new Date(new Date(baseTrip.end_date).getTime() + 24*60*60*1000).toISOString().split('T')[0],
          airline: 'Japan Airlines',
          duration: '7h',
          stops: 0,
          price: 25000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Tokyo")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-TYO1',
          name: 'Shibuya Hotel Tokyo',
          location: 'Shibuya, Tokyo',
          rating: 4.5,
          price: 12000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Shibuya Hotel Tokyo"),
          description: 'Modern hotel in the heart of Shibuya with easy access to shopping and nightlife.',
          amenities: ['WiFi', 'Restaurant', 'Gym', 'Concierge'],
          room: {
            type: 'Standard',
            beds: 1,
            bedType: 'Double',
            description: 'Comfortable room in vibrant Shibuya'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-TYO2',
          name: 'Asakusa Traditional Inn',
          location: 'Asakusa, Tokyo',
          rating: 4.2,
          price: 8000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Asakusa Traditional Inn"),
          description: 'Traditional Japanese inn near Senso-ji Temple.',
          amenities: ['Onsen Bath', 'Japanese Breakfast', 'WiFi'],
          room: {
            type: 'Ryokan Room',
            beds: 2,
            bedType: 'Futon',
            description: 'Traditional room with tatami mats'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Shibuya Crossing",
              time: "10:00",
              cost: 0,
              image: getMockImage("Shibuya Crossing"),
              location: "Shibuya, Tokyo",
              description: "Experience the world's busiest pedestrian crossing and people-watching."
            },
            {
              name: "Meiji Shrine",
              time: "12:00",
              cost: 0,
              image: getMockImage("Meiji Shrine"),
              location: "Shibuya, Tokyo",
              description: "Walk through the forested path to the Shinto shrine dedicated to Emperor Meiji."
            },
            {
              name: "Harajuku Fashion Street",
              time: "14:00",
              cost: 0,
              image: getMockImage("Harajuku Fashion Street"),
              location: "Takeshita Street, Harajuku",
              description: "Explore quirky fashion, crepes, and youth culture in Tokyo's trendiest district."
            },
            {
              name: "Shinjuku Golden Gai",
              time: "19:00",
              cost: 1000,
              image: getMockImage("Shinjuku Golden Gai"),
              location: "Shinjuku, Tokyo",
              description: "Bar-hop through tiny alley bars in this iconic nightlife area."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Senso-ji Temple",
              time: "09:00",
              cost: 0,
              image: getMockImage("Senso-ji Temple"),
              location: "Asakusa, Tokyo",
              description: "Tokyo's oldest temple with the famous Kaminarimon Gate and Nakamise shopping street."
            },
            {
              name: "Tokyo Skytree",
              time: "13:00",
              cost: 2000,
              image: getMockImage("Tokyo Skytree"),
              location: "Sumida, Tokyo",
              description: "Ascend the tallest tower in Japan for 360-degree views of the city."
            },
            {
              name: "Akihabara Electric Town",
              time: "16:00",
              cost: 0,
              image: getMockImage("Akihabara Electric Town"),
              location: "Akihabara, Tokyo",
              description: "Dive into anime, electronics, and maid cafes in otaku central."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Tsukiji Outer Market",
              time: "08:00",
              cost: 1000,
              image: getMockImage("Tsukiji Outer Market"),
              location: "Tsukiji, Tokyo",
              description: "Sample fresh sushi and seafood at the bustling outer market."
            },
            {
              name: "Imperial Palace",
              time: "11:00",
              cost: 0,
              image: getMockImage("Imperial Palace"),
              location: "Chiyoda, Tokyo",
              description: "Tour the gardens and moats of the Emperor's residence."
            },
            {
              name: "Ginza Shopping",
              time: "14:00",
              cost: 0,
              image: getMockImage("Ginza Shopping"),
              location: "Ginza, Tokyo",
              description: "Luxury shopping in Tokyo's upscale district with department stores and boutiques."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Ueno Park",
              time: "09:00",
              cost: 600,
              image: getMockImage("Ueno Park"),
              location: "Ueno, Tokyo",
              description: "Cherry blossoms, museums, and zoo in one of Tokyo's largest parks."
            },
            {
              name: "TeamLab Borderless",
              time: "13:00",
              cost: 3200,
              image: getMockImage("TeamLab Borderless"),
              location: "Azeka, Tokyo",
              description: "Immersive digital art museum with interactive light installations."
            },
            {
              name: "Izakaya Dinner",
              time: "19:00",
              cost: 2000,
              image: getMockImage("Izakaya Dinner"),
              location: "Various, Tokyo",
              description: "Japanese pub crawl with small plates and sake."
            }
          ]
        },
        {
          day: 5,
          activities: [
            {
              name: "Odaiba Futuristic City",
              time: "10:00",
              cost: 1000,
              image: getMockImage("Odaiba Futuristic City"),
              location: "Odaiba, Tokyo",
              description: "Rainbow Bridge, Gundam statue, and shopping mall in Tokyo Bay."
            }
          ]
        }
      ];
      break;

    // Add similar cases for other tripIds (5-12) with relevant data
    case 5: // Bali
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Bali',
          departureCity: 'BKK',
          departureTime: '09:00',
          departure_time: '09:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'DPS',
          arrivalTime: '13:00',
          arrival_time: '13:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'Garuda Indonesia',
          duration: '4h',
          stops: 0,
          price: 8000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Bali")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Bali',
          to_city: 'Bangkok',
          departureCity: 'DPS',
          departureTime: '14:00',
          departure_time: '14:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '18:00',
          arrival_time: '18:00:00',
          arrival_date: baseTrip.end_date,
          airline: 'Garuda Indonesia',
          duration: '4h',
          stops: 0,
          price: 8000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Bali")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-BLI1',
          name: 'Ubud Rice Terrace Resort',
          location: 'Ubud, Bali',
          rating: 4.6,
          price: 6000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Ubud Rice Terrace Resort"),
          description: 'Serene resort surrounded by lush rice terraces in Ubud.',
          amenities: ['Pool', 'Spa', 'Yoga', 'Garden'],
          room: {
            type: 'Villa',
            beds: 1,
            bedType: 'King',
            description: 'Private villa with terrace views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-BLI2',
          name: 'Seminyak Beach Villa',
          location: 'Seminyak, Bali',
          rating: 4.8,
          price: 8000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Seminyak Beach Villa"),
          description: 'Luxury beachfront villa in trendy Seminyak.',
          amenities: ['Private Pool', 'Beach Access', 'Butler Service', 'WiFi'],
          room: {
            type: 'Beach Villa',
            beds: 1,
            bedType: 'Queen',
            description: 'Direct beach access villa'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Ubud Monkey Forest",
              time: "10:00",
              cost: 60000,
              image: getMockImage("Ubud Monkey Forest"),
              location: "Ubud, Bali",
              description: "Wander through the sacred forest inhabited by playful monkeys."
            },
            {
              name: "Tegallalang Rice Terraces",
              time: "13:00",
              cost: 0,
              image: getMockImage("Tegallalang Rice Terraces"),
              location: "Tegallalang, Ubud",
              description: "Hike among the iconic green rice terraces and swing photo ops."
            },
            {
              name: "Ubud Palace",
              time: "16:00",
              cost: 0,
              image: getMockImage("Ubud Palace"),
              location: "Ubud Center, Bali",
              description: "Explore the royal palace and traditional Balinese architecture."
            }
          ]
        },
        // Add more days for Bali...
        // For brevity, fill with 3-4 days of activities like temples, beaches, yoga
        {
          day: 2,
          activities: [
            {
              name: "Tanah Lot Temple",
              time: "09:00",
              cost: 60000,
              image: getMockImage("Tanah Lot Temple"),
              location: "Beraban, Bali",
              description: "Sea temple on a rock formation, beautiful at sunset."
            },
            {
              name: "Seminyak Beach",
              time: "14:00",
              cost: 0,
              image: getMockImage("Seminyak Beach"),
              location: "Seminyak, Bali",
              description: "Trendy beach with upscale clubs and surfing."
            },
            {
              name: "Yoga Class in Ubud",
              time: "18:00",
              cost: 500,
              image: getMockImage("Yoga Class in Ubud"),
              location: "Ubud, Bali",
              description: "Sunset yoga session in a tropical setting."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Besakih Great Temple",
              time: "08:00",
              cost: 60000,
              image: getMockImage("Besakih Great Temple"),
              location: "Klungkung, Bali",
              description: "Mother temple on the slopes of Mount Agung."
            },
            {
              name: "Waterbom Park",
              time: "13:00",
              cost: 500,
              image: getMockImage("Waterbom Park"),
              location: "Kuta, Bali",
              description: "Asia's top water park with slides and lazy river."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Nusa Penida Island Tour",
              time: "07:00",
              cost: 1500,
              image: getMockImage("Nusa Penida Island Tour"),
              location: "Nusa Penida, Bali",
              description: "Day trip to see Kelingking Beach and Angel's Billabong."
            },
            {
              name: "Uluwatu Temple",
              time: "16:00",
              cost: 50000,
              image: getMockImage("Uluwatu Temple"),
              location: "Uluwatu, Bali",
              description: "Cliffside temple with Kecak fire dance at sunset."
            }
          ]
        },
        {
          day: 5,
          activities: [
            {
              name: "Beach Day in Jimbaran",
              time: "10:00",
              cost: 1000,
              image: getMockImage("Beach Day in Jimbaran"),
              location: "Jimbaran, Bali",
              description: "Seafood lunch on the beach and spa relaxation."
            }
          ]
        }
      ];
      break;

    case 6: // Singapore
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Singapore',
          departureCity: 'BKK',
          departureTime: '07:00',
          departure_time: '07:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'SIN',
          arrivalTime: '10:00',
          arrival_time: '10:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'Singapore Airlines',
          duration: '2h 30m',
          stops: 0,
          price: 5000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Singapore")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Singapore',
          to_city: 'Bangkok',
          departureCity: 'SIN',
          departureTime: '20:00',
          departure_time: '20:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '22:00',
          arrival_time: '22:00:00',
          arrival_date: baseTrip.end_date,
          airline: 'Singapore Airlines',
          duration: '2h',
          stops: 0,
          price: 5000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Singapore")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-SIN1',
          name: 'Marina Bay Sands Hotel',
          location: 'Marina Bay, Singapore',
          rating: 4.7,
          price: 8000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Marina Bay Sands Hotel"),
          description: 'Iconic hotel with infinity pool overlooking the city skyline.',
          amenities: ['Infinity Pool', 'Casino', 'Shopping Mall', 'Spa'],
          room: {
            type: 'Deluxe',
            beds: 1,
            bedType: 'King',
            description: 'Room with city views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Marina Bay Sands",
              time: "10:00",
              cost: 0,
              image: getMockImage("Marina Bay Sands"),
              location: "Marina Bay, Singapore",
              description: "Explore the iconic hotel, shopping mall, and infinity pool."
            },
            {
              name: "Gardens by the Bay",
              time: "13:00",
              cost: 1000,
              image: getMockImage("Gardens by the Bay"),
              location: "Gardens by the Bay, Singapore",
              description: "Visit the Supertree Grove and Flower Dome with stunning architecture."
            },
            {
              name: "Singapore Food Street",
              time: "18:00",
              cost: 500,
              image: getMockImage("Singapore Food Street"),
              location: "Chinatown, Singapore",
              description: "Sample hawker food delights in the bustling food street."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Merlion Park",
              time: "09:00",
              cost: 0,
              image: getMockImage("Merlion Park"),
              location: "Merlion Park, Singapore",
              description: "Iconic landmark with the Merlion statue overlooking Marina Bay."
            },
            {
              name: "Sentosa Island",
              time: "12:00",
              cost: 1500,
              image: getMockImage("Sentosa Island"),
              location: "Sentosa, Singapore",
              description: "Beach relaxation and Universal Studios adventure."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Orchard Road Shopping",
              time: "10:00",
              cost: 0,
              image: getMockImage("Orchard Road Shopping"),
              location: "Orchard Road, Singapore",
              description: "World-class shopping along the famous Orchard Road."
            }
          ]
        }
      ];
      break;

    case 7: // Kyoto
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Kyoto',
          departureCity: 'BKK',
          departureTime: '08:00',
          departure_time: '08:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'KIX',
          arrivalTime: '15:00',
          arrival_time: '15:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'Japan Airlines',
          duration: '6h',
          stops: 0,
          price: 20000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Kyoto")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Kyoto',
          to_city: 'Bangkok',
          departureCity: 'KIX',
          departureTime: '16:00',
          departure_time: '16:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '20:00',
          arrival_time: '20:00:00',
          arrival_date: baseTrip.end_date,
          airline: 'Japan Airlines',
          duration: '6h',
          stops: 0,
          price: 20000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Kyoto")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-KYO1',
          name: 'Kyoto Traditional Ryokan',
          location: 'Gion, Kyoto',
          rating: 4.6,
          price: 10000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Kyoto Traditional Ryokan"),
          description: 'Traditional Japanese inn in the historic Gion district.',
          amenities: ['Onsen', 'Japanese Garden', 'Kaiseki Dinner', 'WiFi'],
          room: {
            type: 'Ryokan Room',
            beds: 2,
            bedType: 'Futon',
            description: 'Traditional tatami room with garden view'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Fushimi Inari Shrine",
              time: "09:00",
              cost: 0,
              image: getMockImage("Fushimi Inari Shrine"),
              location: "Fushimi Ward, Kyoto",
              description: "Hike through thousands of red torii gates at the famous shrine."
            },
            {
              name: "Kinkaku-ji Golden Pavilion",
              time: "12:00",
              cost: 500,
              image: getMockImage("Kinkaku-ji Golden Pavilion"),
              location: "Kita Ward, Kyoto",
              description: "Admire the stunning gold-leaf covered pavilion reflected in the pond."
            },
            {
              name: "Gion Geisha District",
              time: "17:00",
              cost: 0,
              image: getMockImage("Gion Geisha District"),
              location: "Gion, Kyoto",
              description: "Stroll the historic streets and hope to spot a geisha in traditional dress."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Arashiyama Bamboo Grove",
              time: "09:00",
              cost: 500,
              image: getMockImage("Arashiyama Bamboo Grove"),
              location: "Arashiyama, Kyoto",
              description: "Walk through the magical bamboo forest and visit Tenryu-ji Temple."
            },
            {
              name: "Kiyomizu-dera Temple",
              time: "14:00",
              cost: 400,
              image: getMockImage("Kiyomizu-dera Temple"),
              location: "Higashiyama Ward, Kyoto",
              description: "Iconic wooden stage temple with panoramic city views."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Nijo Castle",
              time: "10:00",
              cost: 600,
              image: getMockImage("Nijo Castle"),
              location: "Nakagyo Ward, Kyoto",
              description: "Explore the shogun's castle with nightingale floors and beautiful gardens."
            },
            {
              name: "Philosopher's Path",
              time: "14:00",
              cost: 0,
              image: getMockImage("Philosopher's Path"),
              location: "Sakyo Ward, Kyoto",
              description: "Peaceful cherry blossom lined path between temples."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Tea Ceremony Experience",
              time: "11:00",
              cost: 2000,
              image: getMockImage("Tea Ceremony Experience"),
              location: "Various, Kyoto",
              description: "Traditional Japanese tea ceremony with matcha and wagashi sweets."
            }
          ]
        }
      ];
      break;

    case 8: // Hanoi
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Hanoi',
          departureCity: 'BKK',
          departureTime: '06:00',
          departure_time: '06:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'HAN',
          arrivalTime: '08:30',
          arrival_time: '08:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Vietnam Airlines',
          duration: '1h 30m',
          stops: 0,
          price: 4000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Hanoi")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Hanoi',
          to_city: 'Bangkok',
          departureCity: 'HAN',
          departureTime: '19:00',
          departure_time: '19:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '21:30',
          arrival_time: '21:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Vietnam Airlines',
          duration: '1h 30m',
          stops: 0,
          price: 4000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Hanoi")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-HAN1',
          name: 'Hanoi Old Quarter Hotel',
          location: 'Old Quarter, Hanoi',
          rating: 4.4,
          price: 3000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Hanoi Old Quarter Hotel"),
          description: 'Charming hotel in the heart of Hanoi\'s bustling Old Quarter.',
          amenities: ['Rooftop Terrace', 'Restaurant', 'WiFi', 'Tour Desk'],
          room: {
            type: 'Superior',
            beds: 1,
            bedType: 'Queen',
            description: 'Room with French colonial style decor'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Hoan Kiem Lake",
              time: "09:00",
              cost: 0,
              image: getMockImage("Hoan Kiem Lake"),
              location: "Hoan Kiem District, Hanoi",
              description: "Stroll around the lake and visit Ngoc Son Temple on the red bridge."
            },
            {
              name: "Old Quarter Street Food Tour",
              time: "12:00",
              cost: 800,
              image: getMockImage("Old Quarter Street Food Tour"),
              location: "Old Quarter, Hanoi",
              description: "Sample pho, banh mi, and bun cha from street vendors."
            },
            {
              name: "Water Puppet Theatre",
              time: "18:00",
              cost: 500,
              image: getMockImage("Water Puppet Theatre"),
              location: "Hoan Kiem, Hanoi",
              description: "Traditional Vietnamese water puppet performance."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Ho Chi Minh Mausoleum",
              time: "09:00",
              cost: 0,
              image: getMockImage("Ho Chi Minh Mausoleum"),
              location: "Ba Dinh District, Hanoi",
              description: "Pay respects at Uncle Ho's mausoleum and visit the stilt house."
            },
            {
              name: "Temple of Literature",
              time: "12:00",
              cost: 200,
              image: getMockImage("Temple of Literature"),
              location: "Dong Da District, Hanoi",
              description: "Vietnam's first university, a peaceful Confucian temple."
            },
            {
              name: "Hanoi Train Street",
              time: "16:00",
              cost: 0,
              image: getMockImage("Hanoi Train Street"),
              location: "Old Quarter, Hanoi",
              description: "Watch trains pass through narrow streets lined with cafes."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Long Bien Bridge",
              time: "09:00",
              cost: 0,
              image: getMockImage("Long Bien Bridge"),
              location: "Hoan Kiem, Hanoi",
              description: "Historic French-built bridge with views of the Red River."
            },
            {
              name: "Vietnamese Women\'s Museum",
              time: "12:00",
              cost: 300,
              image: getMockImage("Vietnamese Women's Museum"),
              location: "Ba Dinh, Hanoi",
              description: "Museum showcasing the role of women in Vietnamese history."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "West Lake & Tran Quoc Pagoda",
              time: "10:00",
              cost: 200,
              image: getMockImage("West Lake & Tran Quoc Pagoda"),
              location: "Tay Ho District, Hanoi",
              description: "Boat ride on West Lake and visit the ancient lakeside pagoda."
            },
            {
              name: "Quan Su Pagoda",
              time: "14:00",
              cost: 0,
              image: getMockImage("Quan Su Pagoda"),
              location: "Hoan Kiem, Hanoi",
              description: "Buddhist embassy pagoda with beautiful architecture."
            }
          ]
        },
        {
          day: 5,
          activities: [
            {
              name: "Hanoi Night Market",
              time: "18:00",
              cost: 300,
              image: getMockImage("Hanoi Night Market"),
              location: "Dong Xuan Market, Hanoi",
              description: "Evening shopping and street food at the weekend night market."
            }
          ]
        }
      ];
      break;

    case 9: // Seoul
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Seoul',
          departureCity: 'BKK',
          departureTime: '07:00',
          departure_time: '07:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'ICN',
          arrivalTime: '12:00',
          arrival_time: '12:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'Korean Air',
          duration: '5h',
          stops: 0,
          price: 15000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Seoul")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Seoul',
          to_city: 'Bangkok',
          departureCity: 'ICN',
          departureTime: '21:00',
          departure_time: '21:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '01:00',
          arrival_time: '01:00:00',
          arrival_date: new Date(new Date(baseTrip.end_date).getTime() + 24*60*60*1000).toISOString().split('T')[0],
          airline: 'Korean Air',
          duration: '5h',
          stops: 0,
          price: 15000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Seoul")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-SEO1',
          name: 'Myeongdong Hotel Seoul',
          location: 'Myeongdong, Seoul',
          rating: 4.5,
          price: 8000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Myeongdong Hotel Seoul"),
          description: 'Central hotel in Seoul\'s shopping district with easy access to attractions.',
          amenities: ['Sauna', 'Restaurant', 'WiFi', 'Tour Desk'],
          room: {
            type: 'Standard',
            beds: 1,
            bedType: 'Double',
            description: 'Modern room with city views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Myeongdong Shopping Street",
              time: "10:00",
              cost: 0,
              image: getMockImage("Myeongdong Shopping Street"),
              location: "Myeongdong, Seoul",
              description: "Shop for cosmetics, fashion, and street food in bustling Myeongdong."
            },
            {
              name: "Namsan Tower",
              time: "14:00",
              cost: 1000,
              image: getMockImage("Namsan Tower"),
              location: "Yongsan-gu, Seoul",
              description: "Take the cable car up for panoramic views and lock your love lock."
            },
            {
              name: "Korean BBQ Dinner",
              time: "18:00",
              cost: 1500,
              image: getMockImage("Korean BBQ Dinner"),
              location: "Hongdae, Seoul",
              description: "Enjoy authentic Korean barbecue with banchan sides."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Gyeongbokgung Palace",
              time: "09:00",
              cost: 500,
              image: getMockImage("Gyeongbokgung Palace"),
              location: "Jongno-gu, Seoul",
              description: "Watch the changing of the guard and explore the grand Joseon palace."
            },
            {
              name: "Insadong Cultural Street",
              time: "13:00",
              cost: 0,
              image: getMockImage("Insadong Cultural Street"),
              location: "Jongno-gu, Seoul",
              description: "Traditional tea houses, art galleries, and hanbok rental."
            },
            {
              name: "Bukchon Hanok Village",
              time: "16:00",
              cost: 0,
              image: getMockImage("Bukchon Hanok Village"),
              location: "Jongno-gu, Seoul",
              description: "Wander through preserved traditional Korean houses."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Hongdae Street Performers",
              time: "11:00",
              cost: 0,
              image: getMockImage("Hongdae Street Performers"),
              location: "Mapo-gu, Seoul",
              description: "Youth culture hub with busking, street art, and trendy cafes."
            },
            {
              name: "Han River Park",
              time: "15:00",
              cost: 0,
              image: getMockImage("Han River Park"),
              location: "Yongsan-gu, Seoul",
              description: "Bike ride or picnic along the scenic Han River."
            },
            {
              name: "K-Pop Concert or Show",
              time: "19:00",
              cost: 2000,
              image: getMockImage("K-Pop Concert or Show"),
              location: "Various venues, Seoul",
              description: "Experience the vibrant K-pop scene live."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "DMZ Tour",
              time: "08:00",
              cost: 3000,
              image: getMockImage("DMZ Tour"),
              location: "DMZ Border, Seoul",
              description: "Day trip to the Demilitarized Zone for historical insights."
            }
          ]
        },
        {
          day: 5,
          activities: [
            {
              name: "Dongdaemun Design Plaza",
              time: "10:00",
              cost: 500,
              image: getMockImage("Dongdaemun Design Plaza"),
              location: "Jung-gu, Seoul",
              description: "Futuristic architecture with museums and fashion market."
            }
          ]
        }
      ];
      break;

    case 10: // Siem Reap
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Siem Reap',
          departureCity: 'BKK',
          departureTime: '08:00',
          departure_time: '08:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'REP',
          arrivalTime: '09:00',
          arrival_time: '09:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'Bangkok Airways',
          duration: '1h',
          stops: 0,
          price: 3000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Siem Reap")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Siem Reap',
          to_city: 'Bangkok',
          departureCity: 'REP',
          departureTime: '17:00',
          departure_time: '17:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '18:00',
          arrival_time: '18:00:00',
          arrival_date: baseTrip.end_date,
          airline: 'Bangkok Airways',
          duration: '1h',
          stops: 0,
          price: 3000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Siem Reap")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-SRP1',
          name: 'Angkor Palace Resort',
          location: 'Siem Reap, Cambodia',
          rating: 4.3,
          price: 4000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Angkor Palace Resort"),
          description: 'Luxury resort near Angkor Wat with traditional Khmer architecture.',
          amenities: ['Pool', 'Spa', 'Restaurant', 'Shuttle to Temples'],
          room: {
            type: 'Deluxe',
            beds: 1,
            bedType: 'King',
            description: 'Room with garden views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Angkor Wat Sunrise",
              time: "05:00",
              cost: 1000,
              image: getMockImage("Angkor Wat Sunrise"),
              location: "Angkor Archaeological Park, Siem Reap",
              description: "Iconic sunrise over the world's largest religious monument."
            },
            {
              name: "Angkor Thom & Bayon Temple",
              time: "09:00",
              cost: 0,
              image: getMockImage("Angkor Thom & Bayon Temple"),
              location: "Angkor Thom, Siem Reap",
              description: "Explore the ancient city with 216 smiling faces of Bayon."
            },
            {
              name: "Ta Prohm Temple",
              time: "14:00",
              cost: 0,
              image: getMockImage("Ta Prohm Temple"),
              location: "Angkor, Siem Reap",
              description: "Tomb Raider temple overgrown with massive tree roots."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Banteay Srei Temple",
              time: "08:00",
              cost: 500,
              image: getMockImage("Banteay Srei Temple"),
              location: "Banteay Srei, Siem Reap",
              description: "Pink sandstone temple with intricate carvings, the 'Women\'s Temple'."
            },
            {
              name: "Floating Village Tonle Sap",
              time: "13:00",
              cost: 1500,
              image: getMockImage("Floating Village Tonle Sap"),
              location: "Tonle Sap Lake, Siem Reap",
              description: "Boat tour of the largest freshwater lake in SE Asia and stilt villages."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Pub Street & Night Market",
              time: "18:00",
              cost: 500,
              image: getMockImage("Pub Street & Night Market"),
              location: "Pub Street, Siem Reap",
              description: "Siem Reap's nightlife hub with bars, restaurants, and shopping."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Pre Rup Temple",
              time: "09:00",
              cost: 0,
              image: getMockImage("Pre Rup Temple"),
              location: "Angkor, Siem Reap",
              description: "10th century temple with stunning sunset views."
            },
            {
              name: "Khmer Cooking Class",
              time: "14:00",
              cost: 2000,
              image: getMockImage("Khmer Cooking Class"),
              location: "Local village, Siem Reap",
              description: "Learn to cook Cambodian dishes with a local family."
            }
          ]
        }
      ];
      break;

    case 11: // Ho Chi Minh City
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Ho Chi Minh City',
          departureCity: 'BKK',
          departureTime: '07:00',
          departure_time: '07:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'SGN',
          arrivalTime: '09:00',
          arrival_time: '09:00:00',
          arrival_date: baseTrip.start_date,
          airline: 'VietJet Air',
          duration: '1h 30m',
          stops: 0,
          price: 2500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Ho Chi Minh City")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Ho Chi Minh City',
          to_city: 'Bangkok',
          departureCity: 'SGN',
          departureTime: '20:00',
          departure_time: '20:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '21:30',
          arrival_time: '21:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'VietJet Air',
          duration: '1h 30m',
          stops: 0,
          price: 2500,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Ho Chi Minh City")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-HCM1',
          name: 'District 1 Boutique Hotel',
          location: 'District 1, Ho Chi Minh City',
          rating: 4.5,
          price: 3500,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("District 1 Boutique Hotel"),
          description: 'Modern boutique hotel in the heart of Saigon\'s historic center.',
          amenities: ['Rooftop Bar', 'Pool', 'Spa', 'WiFi'],
          room: {
            type: 'Superior',
            beds: 1,
            bedType: 'Queen',
            description: 'Room with city views'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Notre Dame Cathedral & Post Office",
              time: "09:00",
              cost: 0,
              image: getMockImage("Notre Dame Cathedral & Post Office"),
              location: "District 1, Ho Chi Minh City",
              description: "French colonial landmarks in the heart of Saigon."
            },
            {
              name: "Ben Thanh Market",
              time: "12:00",
              cost: 200,
              image: getMockImage("Ben Thanh Market"),
              location: "District 1, Ho Chi Minh City",
              description: "Bustling market for shopping souvenirs and street food."
            },
            {
              name: "Saigon River Dinner Cruise",
              time: "18:00",
              cost: 1500,
              image: getMockImage("Saigon River Dinner Cruise"),
              location: "Saigon River, Ho Chi Minh City",
              description: "Evening cruise with dinner and city lights views."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Cu Chi Tunnels",
              time: "08:00",
              cost: 2000,
              image: getMockImage("Cu Chi Tunnels"),
              location: "Cu Chi District, Ho Chi Minh City",
              description: "Historical tunnels from the Vietnam War with underground tour."
            },
            {
              name: "War Remnants Museum",
              time: "14:00",
              cost: 400,
              image: getMockImage("War Remnants Museum"),
              location: "District 3, Ho Chi Minh City",
              description: "Museum documenting the Vietnam War with powerful exhibits."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Central Post Office & Notre Dame",
              time: "10:00",
              cost: 0,
              image: getMockImage("Central Post Office & Notre Dame"),
              location: "District 1, Ho Chi Minh City",
              description: "Gothic architecture and Gustave Eiffel designed post office."
            },
            {
              name: "Reunification Palace",
              time: "13:00",
              cost: 400,
              image: getMockImage("Reunification Palace"),
              location: "District 1, Ho Chi Minh City",
              description: "Former presidential palace where the Vietnam War ended."
            },
            {
              name: "Pham Ngu Lao Street",
              time: "17:00",
              cost: 500,
              image: getMockImage("Pham Ngu Lao Street"),
              location: "District 1, Ho Chi Minh City",
              description: "Backpacker area with bars, restaurants, and nightlife."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Mekong Delta Day Trip",
              time: "07:00",
              cost: 2500,
              image: getMockImage("Mekong Delta Day Trip"),
              location: "Mekong Delta, Vietnam",
              description: "Boat tour through floating markets and rural villages."
            },
            {
              name: "Jade Emperor Pagoda",
              time: "15:00",
              cost: 0,
              image: getMockImage("Jade Emperor Pagoda"),
              location: "District 1, Ho Chi Minh City",
              description: "Taoist temple with intricate carvings and turtles."
            }
          ]
        },
        {
          day: 5,
          activities: [
            {
              name: "Saigon Opera House & Walking Tour",
              time: "10:00",
              cost: 800,
              image: getMockImage("Saigon Opera House & Walking Tour"),
              location: "District 1, Ho Chi Minh City",
              description: "Guided tour of colonial architecture and hidden gems."
            }
          ]
        }
      ];
      break;

    case 12: // Krabi
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: 'Krabi',
          departureCity: 'BKK',
          departureTime: '07:00',
          departure_time: '07:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: 'KBV',
          arrivalTime: '08:30',
          arrival_time: '08:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Thai Lion Air',
          duration: '1h 30m',
          stops: 0,
          price: 2000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Krabi")
        },
        {
          id: 2,
          leg_number: 2,
          from_city: 'Krabi',
          to_city: 'Bangkok',
          departureCity: 'KBV',
          departureTime: '19:00',
          departure_time: '19:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '20:30',
          arrival_time: '20:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Thai Lion Air',
          duration: '1h 30m',
          stops: 0,
          price: 2000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: getMockImage("Flight Krabi")
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-KRB1',
          name: 'Ao Nang Beach Resort',
          location: 'Ao Nang, Krabi',
          rating: 4.4,
          price: 4500,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage("Ao Nang Beach Resort"),
          description: 'Beachfront resort in popular Ao Nang with sea views.',
          amenities: ['Private Beach', 'Pool', 'Restaurant', 'Diving Center'],
          room: {
            type: 'Beachfront',
            beds: 1,
            bedType: 'King',
            description: 'Room with direct beach access'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        }
      ];
      mockSchedule = [
        {
          day: 1,
          activities: [
            {
              name: "Ao Nang Beach",
              time: "10:00",
              cost: 0,
              image: getMockImage("Ao Nang Beach"),
              location: "Ao Nang, Krabi",
              description: "Relax on the white sand beach and enjoy longtail boat views."
            },
            {
              name: "Railay Beach",
              time: "14:00",
              cost: 500,
              image: getMockImage("Railay Beach"),
              location: "Railay, Krabi",
              description: "Boat to the stunning beach only accessible by sea, famous for rock climbing."
            },
            {
              name: "Night Market Ao Nang",
              time: "18:00",
              cost: 300,
              image: getMockImage("Night Market Ao Nang"),
              location: "Ao Nang, Krabi",
              description: "Local seafood dinner and shopping at the evening market."
            }
          ]
        },
        {
          day: 2,
          activities: [
            {
              name: "Four Islands Tour",
              time: "09:00",
              cost: 1500,
              image: getMockImage("Four Islands Tour"),
              location: "Phra Nang, Chicken, Poda, Tup Islands",
              description: "Snorkeling and beach hopping to Krabi's beautiful islands."
            },
            {
              name: "Tiger Cave Temple",
              time: "16:00",
              cost: 0,
              image: getMockImage("Tiger Cave Temple"),
              location: "Ao Nang, Krabi",
              description: "Climb 1237 steps to the stunning Buddha statue and cave temple."
            }
          ]
        },
        {
          day: 3,
          activities: [
            {
              name: "Phra Nang Beach Cave",
              time: "10:00",
              cost: 500,
              image: getMockImage("Phra Nang Beach Cave"),
              location: "Railay, Krabi",
              description: "Swim in the emerald lagoon and visit the Princess Cave shrine."
            },
            {
              name: "Krabi Town Night Market",
              time: "18:00",
              cost: 300,
              image: getMockImage("Krabi Town Night Market"),
              location: "Krabi Town",
              description: "Local flavors and handicrafts at the evening market."
            }
          ]
        },
        {
          day: 4,
          activities: [
            {
              name: "Emerald Pool & Hot Springs",
              time: "09:00",
              cost: 800,
              image: getMockImage("Emerald Pool & Hot Springs"),
              location: "Khao Phra Sae, Krabi",
              description: "Swim in the natural emerald pool and relax in hot springs."
            },
            {
              name: "Shell Cemetery",
              time: "14:00",
              cost: 0,
              image: getMockImage("Shell Cemetery"),
              location: "Ao Nang, Krabi",
              description: "Ancient fossilized shell beach with geological wonders."
            }
          ]
        }
      ];
      break;

    // Continue for other destinations similarly, but to keep diff reasonable, use a default for remaining
    default:
      // Default Bangkok-like for other trips
      const destCity = baseTrip.destination.split(',')[0];
      mockFlights = [
        {
          id: 1,
          leg_number: 1,
          from_city: 'Bangkok',
          to_city: destCity,
          departureCity: 'BKK',
          departureTime: '08:00',
          departure_time: '08:00:00',
          departure_date: baseTrip.start_date,
          arrivalCity: destCity.substring(0,3).toUpperCase(),
          arrivalTime: '09:30',
          arrival_time: '09:30:00',
          arrival_date: baseTrip.start_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 3000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80'
        },
        {
          id: 2,
          leg_number: 2,
          from_city: destCity,
          to_city: 'Bangkok',
          departureCity: destCity.substring(0,3).toUpperCase(),
          departureTime: '18:00',
          departure_time: '18:00:00',
          departure_date: baseTrip.end_date,
          arrivalCity: 'BKK',
          arrivalTime: '19:30',
          arrival_time: '19:30:00',
          arrival_date: baseTrip.end_date,
          airline: 'Thai Airways',
          duration: '1h 30m',
          stops: 0,
          price: 3000,
          currency: 'THB',
          travel_class: 'ECONOMY',
          image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400&q=80'
        }
      ];
      mockHotels = [
        {
          id: 'MOCK-HOTEL-1',
          name: `${destCity} Grand Hotel`,
          location: baseTrip.destination,
          rating: 4.5,
          price: 3000,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage(destCity + " Grand Hotel"),
          description: 'Luxury grand hotel in the city center.',
          amenities: ['WiFi', 'Pool', 'Restaurant', 'Spa'],
          room: {
            type: 'Deluxe',
            beds: 1,
            bedType: 'King',
            description: 'Spacious deluxe room'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 24 hours before check-in'
              }
            }
          }
        },
        {
          id: 'MOCK-HOTEL-2',
          name: `${destCity} Resort`,
          location: baseTrip.destination,
          rating: 4.2,
          price: 2500,
          currency: 'THB',
          checkInDate: baseTrip.start_date,
          checkOutDate: baseTrip.end_date,
          image: getMockImage(destCity + " Resort"),
          description: 'Relaxing resort with beautiful surroundings.',
          amenities: ['Pool', 'Garden', 'WiFi', 'Breakfast'],
          room: {
            type: 'Standard',
            beds: 1,
            bedType: 'Double',
            description: 'Comfortable standard room'
          },
          policies: {
            cancellation: {
              description: {
                text: 'Free cancellation until 48 hours before check-in'
              }
            }
          }
        }
      ];
      // Generate generic schedule based on destination and trip duration for accuracy
      const startDate = new Date(baseTrip.start_date);
      const endDate = new Date(baseTrip.end_date);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const numDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  
      const genericActivities = [
        {
          name: "Morning Sightseeing",
          time: "09:00",
          cost: 500,
          image: getMockImage("sightseeing " + destCity),
          location: `${destCity} City Center`,
          description: "Explore famous landmarks and cultural sites in the morning."
        },
        {
          name: "Local Cuisine Lunch",
          time: "12:00",
          cost: 300,
          image: getMockImage("dining restaurant " + destCity),
          location: `${destCity} Downtown`,
          description: "Enjoy authentic local dishes at a popular restaurant."
        },
        {
          name: "Afternoon Exploration",
          time: "14:00",
          cost: 400,
          image: getMockImage("exploration market " + destCity),
          location: `${destCity} Historic Area`,
          description: "Discover markets, temples, or natural attractions in the afternoon."
        },
        {
          name: "Evening Relaxation",
          time: "18:00",
          cost: 200,
          image: getMockImage("nightlife dinner " + destCity),
          location: `${destCity} Riverside`,
          description: "Unwind with dinner and evening views or nightlife."
        }
      ];
  
      mockSchedule = Array.from({ length: Math.min(numDays, 5) }, (_, dayIndex) => ({
        day: dayIndex + 1,
        activities: genericActivities.slice(0, 4) // 4 activities per day
      }));
      break;
  }

  // Sample budget (vary slightly by destination)
  const mockBudget = {
    total: 25000 + (tripId * 1000), // Vary total
    breakdown: {
      flights: 10000,
      hotels: 8000,
      activities: 4000,
      food: 3000
    }
  };

  // Sample comments (destination-specific text)
  const mockComments = [
    {
      id: 1,
      user: 'Traveler123',
      date: new Date(Date.now() - 86400000).toISOString(),
      text: `This ${baseTrip.destination} itinerary is fantastic! Great mix of culture and relaxation.`
    },
    {
      id: 2,
      user: 'AdventureSeeker',
      date: new Date(Date.now() - 172800000).toISOString(),
      text: "The activities look exciting. Can't wait to try the local food scene!"
    },
    {
      id: 3,
      user: 'BudgetTraveler',
      date: new Date(Date.now() - 259200000).toISOString(),
      text: 'Well-planned budget. The hotel recommendations seem affordable yet comfortable.'
    }
  ];

  return {
    ...baseTrip,
    group_size: 2,
    transport: 'Flight',
    details: {
      flights: mockFlights,
      hotels: mockHotels,
      schedule: mockSchedule,
      budget: mockBudget,
      comments: mockComments
    }
  };
}