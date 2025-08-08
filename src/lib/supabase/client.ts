import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for our database schema
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon_name?: string;
  created_at: string;
}

export interface Place {
  id: string;
  owner_id?: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  website_url?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  category_id?: number;
  tags?: string[];
  business_hours?: Record<string, { open: string; close: string }>;
  price_range?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaceWithStats extends Place {
  place_stats?: {
    review_count: number;
    average_rating: number;
    last_reviewed_at?: string;
    photo_count: number;
  };
}

export interface FeaturedPlace extends Place {
  review_count: number;
  average_rating: number;
  last_reviewed_at?: string;
  photo_count: number;
  featured_score: number;
}

export interface Review {
  id: string;
  place_id: string;
  author_id: string;
  rating: number;
  title?: string;
  body?: string;
  visited_at?: string;
  owner_response?: string;
  owner_response_at?: string;
  owner_response_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  place_id: string;
  author_id: string;
  name: string;
  description?: string;
  price?: number;
  currency: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlacePhoto {
  id: string;
  place_id: string;
  author_id: string;
  file_path: string;
  alt_text?: string;
  created_at: string;
}

export interface MenuItemPhoto {
  id: string;
  menu_item_id: string;
  author_id: string;
  file_path: string;
  alt_text?: string;
  created_at: string;
}

export interface ReviewPhoto {
  id: string;
  review_id: string;
  author_id: string;
  file_path: string;
  alt_text?: string;
  created_at: string;
}

export interface ReviewReaction {
  user_id: string;
  review_id: string;
  reaction_type: "like" | "love" | "meh" | "dislike";
  created_at: string;
}

export interface ReviewStats {
  review_id: string;
  total_reactions: number;
  likes_count: number;
  loves_count: number;
  mehs_count: number;
  dislikes_count: number;
}

export interface CuisineType {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface PlaceCuisine {
  place_id: string;
  cuisine_type_id: number;
}

export interface NearbyPlace {
  id: string;
  name: string;
  slug: string;
  city?: string;
  country?: string;
  category_id?: number;
  average_rating: number;
  review_count: number;
  distance_meters: number;
}
