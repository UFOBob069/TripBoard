// Core types for TripBoard

export type CanvasType = 'dates' | 'location' | 'accommodation' | 'activities' | 'food' | 'transportation';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface Vote {
  odea_id: string
  user_id: string;
  value: 1 | -1;
  timestamp: Date;
}

export interface Comment {
  id: string;
  idea_id: string;
  user_id: string;
  content: string;
  timestamp: Date;
}

export interface Idea {
  id: string;
  canvas_type: CanvasType;
  trip_id: string;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  created_by: string;
  created_at: Date;
  votes: Vote[];
  comments: Comment[];
  is_finalized: boolean;
  metadata?: IdeaMetadata;
}

// Specific metadata for different canvas types
export interface DateMetadata {
  start_date?: string;
  end_date?: string;
  flexible?: boolean;
}

export interface LocationMetadata {
  city?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
}

export interface AccommodationMetadata {
  type?: 'hotel' | 'airbnb' | 'hostel' | 'resort' | 'camping' | 'other';
  price_per_night?: number;
  rating?: number;
  amenities?: string[];
}

export interface ActivityMetadata {
  duration?: string;
  cost?: number;
  category?: 'adventure' | 'culture' | 'relaxation' | 'nightlife' | 'nature' | 'shopping' | 'other';
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'all-day';
}

export interface FoodMetadata {
  cuisine?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drinks';
  rating?: number;
}

export interface TransportationMetadata {
  type?: 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';
  departure_time?: string;
  arrival_time?: string;
  price?: number;
  carrier?: string;
}

export type IdeaMetadata =
  | DateMetadata
  | LocationMetadata
  | AccommodationMetadata
  | ActivityMetadata
  | FoodMetadata
  | TransportationMetadata;

export interface Canvas {
  type: CanvasType;
  trip_id: string;
  ideas: Idea[];
  finalized_idea_id?: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  cover_image?: string;
  created_by: string;
  created_at: Date;
  members: string[];
  canvases: Record<CanvasType, Canvas>;
  is_finalized: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: User[];
  trips: string[];
  created_by: string;
  created_at: Date;
  invite_code: string;
}

export interface FinalPlan {
  trip_id: string;
  dates?: Idea;
  location?: Idea;
  accommodation?: Idea;
  activities: Idea[];
  food: Idea[];
  transportation?: Idea;
  total_estimated_cost?: number;
  notes?: string;
}

// Canvas configuration for UI
export const CANVAS_CONFIG: Record<CanvasType, { label: string; icon: string; description: string; color: string }> = {
  dates: {
    label: 'Dates',
    icon: 'Calendar',
    description: 'When should we go?',
    color: 'bg-blue-500',
  },
  location: {
    label: 'Destination',
    icon: 'MapPin',
    description: 'Where should we go?',
    color: 'bg-green-500',
  },
  accommodation: {
    label: 'Stay',
    icon: 'Home',
    description: 'Where should we stay?',
    color: 'bg-purple-500',
  },
  activities: {
    label: 'Activities',
    icon: 'Compass',
    description: 'What should we do?',
    color: 'bg-orange-500',
  },
  food: {
    label: 'Food & Dining',
    icon: 'Utensils',
    description: 'Where should we eat?',
    color: 'bg-red-500',
  },
  transportation: {
    label: 'Transportation',
    icon: 'Plane',
    description: 'How do we get there?',
    color: 'bg-cyan-500',
  },
};
