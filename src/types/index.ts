// Core types for TripBoard

export type CanvasType = 'dates' | 'location' | 'accommodation' | 'activities' | 'food' | 'transportation';

export type TripStatus = 'ideation' | 'voting' | 'finalized';

export type CardStatus = 'open' | 'shortlisted' | 'selected';

export type UserRole = 'owner' | 'participant';

export type ActivityType =
  | 'trip_created'
  | 'member_joined'
  | 'idea_added'
  | 'idea_voted'
  | 'idea_commented'
  | 'idea_shortlisted'
  | 'idea_selected'
  | 'board_locked'
  | 'status_changed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  // Optional profile fields
  bio?: string;
  location?: string;
  favoriteDestination?: string;
  travelStyle?: string;
}

export interface TripMember {
  user_id: string;
  role: UserRole;
  joined_at: Date;
}

export interface Vote {
  idea_id: string;
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

export interface Activity {
  id: string;
  trip_id: string;
  type: ActivityType;
  user_id: string;
  target_id?: string; // idea_id, board_id, etc.
  target_type?: string;
  message: string;
  timestamp: Date;
}

// Base idea interface
export interface Idea {
  id: string;
  canvas_type: CanvasType;
  trip_id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  created_by: string;
  created_at: Date;
  votes: Vote[];
  comments: Comment[];
  status: CardStatus;
  metadata?: IdeaMetadata;
}

// Specific metadata for different canvas types
export interface DateIdeaMetadata {
  start_date: string;
  end_date: string;
  flexible: boolean;
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
  | DateIdeaMetadata
  | LocationMetadata
  | AccommodationMetadata
  | ActivityMetadata
  | FoodMetadata
  | TransportationMetadata;

export interface BoardSettings {
  votes_per_user: number;
  is_locked: boolean;
  locked_at?: Date;
  locked_by?: string;
}

export interface Canvas {
  type: CanvasType;
  trip_id: string;
  ideas: Idea[];
  selected_idea_id?: string;
  settings: BoardSettings;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  cover_image?: string;
  owner_id: string;
  created_at: Date;
  members: TripMember[];
  canvases: Record<CanvasType, Canvas>;
  status: TripStatus;
  invite_code: string;
  activities: Activity[];
  isPublic?: boolean; // Default false - trips are private by default
}

export interface FinalPlan {
  trip_id: string;
  dates?: Idea;
  location?: Idea;
  accommodation: Idea[];
  activities: Idea[];
  food: Idea[];
  transportation: Idea[];
  total_estimated_cost?: number;
  notes?: string;
}

// Canvas configuration for UI
export const CANVAS_CONFIG: Record<CanvasType, {
  label: string;
  icon: string;
  description: string;
  color: string;
  inputType: 'date' | 'url' | 'text';
  defaultVotesPerUser: number;
}> = {
  dates: {
    label: 'Dates',
    icon: 'Calendar',
    description: 'When should we go?',
    color: 'bg-blue-500',
    inputType: 'date',
    defaultVotesPerUser: 3,
  },
  location: {
    label: 'Destination',
    icon: 'MapPin',
    description: 'Where should we go?',
    color: 'bg-green-500',
    inputType: 'url',
    defaultVotesPerUser: 3,
  },
  accommodation: {
    label: 'Stay',
    icon: 'Home',
    description: 'Where should we stay?',
    color: 'bg-purple-500',
    inputType: 'url',
    defaultVotesPerUser: 3,
  },
  activities: {
    label: 'Activities',
    icon: 'Compass',
    description: 'What should we do?',
    color: 'bg-orange-500',
    inputType: 'url',
    defaultVotesPerUser: 5,
  },
  food: {
    label: 'Food & Dining',
    icon: 'Utensils',
    description: 'Where should we eat?',
    color: 'bg-red-500',
    inputType: 'url',
    defaultVotesPerUser: 5,
  },
  transportation: {
    label: 'Transportation',
    icon: 'Plane',
    description: 'How do we get there?',
    color: 'bg-cyan-500',
    inputType: 'url',
    defaultVotesPerUser: 3,
  },
};

export const TRIP_STATUS_CONFIG: Record<TripStatus, { label: string; description: string; color: string }> = {
  ideation: {
    label: 'Brainstorming',
    description: 'Collecting ideas from everyone',
    color: 'bg-yellow-500',
  },
  voting: {
    label: 'Voting',
    description: 'Vote for your favorites',
    color: 'bg-blue-500',
  },
  finalized: {
    label: 'Finalized',
    description: 'Trip plan is complete!',
    color: 'bg-green-500',
  },
};
