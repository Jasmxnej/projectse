export interface Flight {
  id: string;
  itineraries: Itinerary[];
  price: Price;
  travelerPricings: TravelerPricing[];
}

export interface Itinerary {
  duration: string;
  segments: Segment[];
}

export interface Segment {
  carrierCode: string;
  number: string;
  departure: {
    iataCode: string;
    at: string;
  };
  arrival: {
    iataCode: string;
    at: string;
  };
  aircraft: {
    code: string;
  };
}

export interface Price {
  total: string;
  currency: string;
}

export interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: Price;
  fareDetailsBySegment: FareDetailsBySegment[];
}

export interface FareDetailsBySegment {
  segmentId: string;
  cabin: string;
  fareBasis: string;
  class: string;
  includedCheckedBags: {
    quantity: number;
  };
}

export interface FlightLocations {
  [key: string]: {
    cityCode: string;
  };
}

export interface FlightCarriers {
  [key: string]: string;
}

export interface FlightDictionaries {
  locations: FlightLocations;
  carriers: FlightCarriers;
}