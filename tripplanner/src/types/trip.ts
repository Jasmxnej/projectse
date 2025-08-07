export interface Recommendation {
  id: number;
  image: string;
  name: string;
  description: string;
}

export interface TripActivity {
  id: number;
  image: string;
  name: string;
  time: string;
  cost: number;
}

export interface TripDay {
  id: number;
  dayNumber: number;
  name: string | null;
  activities: TripActivity[];
}

export interface Trip {
  id: number;
  user_id: number;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  group_size: number;
  transport: string;
  activities: string[];
  other_activity: string;
  special_needs: string;
  name: string;
  trip_type: string;
}