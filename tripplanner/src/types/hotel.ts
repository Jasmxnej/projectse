export interface Hotel {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  location?: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  cityCode: string;
  amenities?: string[];
  rating?: number;
  contact?: {
    phone?: string;
    email?: string;
  };
  room?: {
    type?: string;
    beds?: number;
    bedType?: string;
    description?: string;
  };
  policies?: {
    cancellation?: {
      description?: {
        text?: string;
      };
    };
    payment?: {
      acceptedPayments?: {
        creditCards?: string[];
      };
    };
  };
}
