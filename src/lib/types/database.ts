// Database types based on the complete schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          category_id: number | null;
          tags: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug?: string;
          description?: string | null;
          category_id?: number | null;
          tags?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          category_id?: number | null;
          tags?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      branches: {
        Row: {
          id: string;
          place_id: string;
          name: string;
          slug: string;
          description: string | null;
          phone: string | null;
          website_url: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          location: unknown | null;
          business_hours: Record<string, unknown>;
          price_range: number | null;
          is_main_branch: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          name: string;
          slug?: string;
          description?: string | null;
          phone?: string | null;
          website_url?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          location?: unknown | null;
          business_hours?: Record<string, unknown>;
          price_range?: number | null;
          is_main_branch?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          phone?: string | null;
          website_url?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          location?: unknown | null;
          business_hours?: Record<string, unknown>;
          price_range?: number | null;
          is_main_branch?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          branch_id: string;
          author_id: string;
          rating: number;
          body: string | null;
          visited_at: string | null;
          owner_response: string | null;
          owner_response_at: string | null;
          owner_response_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          author_id: string;
          rating: number;
          body?: string | null;
          visited_at?: string | null;
          owner_response?: string | null;
          owner_response_at?: string | null;
          owner_response_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          author_id?: string;
          rating?: number;
          body?: string | null;
          visited_at?: string | null;
          owner_response?: string | null;
          owner_response_at?: string | null;
          owner_response_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          branch_menu_section_id: string;
          author_id: string;
          name: string;
          description: string | null;
          price: number | null;
          currency: string;
          is_available: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_menu_section_id: string;
          author_id: string;
          name: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          is_available?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_menu_section_id?: string;
          author_id?: string;
          name?: string;
          description?: string | null;
          price?: number | null;
          currency?: string;
          is_available?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_sections: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          slug: string;
          name: string;
          description: string | null;
          icon_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          name: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          name?: string;
          description?: string | null;
          icon_name?: string | null;
          created_at?: string;
        };
      };
      review_photos: {
        Row: {
          id: string;
          review_id: string;
          author_id: string;
          file_path: string;
          photo_category_id: number | null;
          cloud_public_id: string | null;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          author_id: string;
          file_path: string;
          photo_category_id?: number | null;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          author_id?: string;
          file_path?: string;
          photo_category_id?: number | null;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
      };
      branch_photos: {
        Row: {
          id: string;
          branch_id: string;
          author_id: string;
          file_path: string;
          cloud_public_id: string | null;
          alt_text: string | null;
          photo_category_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          author_id: string;
          file_path: string;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          photo_category_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          author_id?: string;
          file_path?: string;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          photo_category_id?: number | null;
          created_at?: string;
        };
      };
      menu_item_photos: {
        Row: {
          id: string;
          menu_item_id: string;
          author_id: string;
          file_path: string;
          cloud_public_id: string | null;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          author_id: string;
          file_path: string;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          author_id?: string;
          file_path?: string;
          cloud_public_id?: string | null;
          alt_text?: string | null;
          created_at?: string;
        };
      };
      favorite_branches: {
        Row: {
          user_id: string;
          branch_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          branch_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          branch_id?: string;
          created_at?: string;
        };
      };
      branch_edit_requests: {
        Row: {
          id: string;
          branch_id: string;
          author_id: string;
          request_type: "correction" | "closure" | "duplicate" | "other";
          proposed_changes: Record<string, unknown>;
          message: string | null;
          evidence_url: string | null;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          author_id: string;
          request_type: "correction" | "closure" | "duplicate" | "other";
          proposed_changes?: Record<string, unknown>;
          message?: string | null;
          evidence_url?: string | null;
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["branch_edit_requests"]["Row"]
        >;
      };
    };
    Views: {
      recent_reviews_enriched: {
        Row: {
          review_id: string;
          branch_id: string;
          branch_slug: string | null;
          is_main_branch: boolean | null;
          author_id: string;
          rating: number;
          body: string | null;
          visited_at: string | null;
          owner_response: string | null;
          owner_response_at: string | null;
          owner_response_by: string | null;
          created_at: string;
          updated_at: string;
          place_name: string | null;
          place_slug: string | null;
          category_id: number | null;
          category_name: string | null;
          author_username: string | null;
          author_full_name: string | null;
          author_avatar_url: string | null;
          total_reactions: number | null;
          likes_count: number | null;
          loves_count: number | null;
          mehs_count: number | null;
          dislikes_count: number | null;
          review_photos: Array<{
            id: string;
            file_path: string;
            alt_text: string | null;
            created_at: string;
          }>;
          branch_photos: Array<{
            id: string;
            file_path: string;
            alt_text: string | null;
            created_at: string;
          }>;
          display_image: string | null;
        };
      };
      branches_with_details: {
        Row: {
          branch_id: string;
          place_id: string;
          branch_name: string;
          branch_slug: string;
          branch_description: string | null;
          branch_phone: string | null;
          branch_website_url: string | null;
          branch_address_line1: string | null;
          branch_address_line2: string | null;
          branch_city: string | null;
          branch_state: string | null;
          branch_postal_code: string | null;
          branch_country: string | null;
          branch_latitude: number | null;
          branch_longitude: number | null;
          branch_business_hours: Record<string, unknown>;
          is_main_branch: boolean;
          branch_is_active: boolean;
          branch_created_at: string;
          branch_updated_at: string;
          place_name: string | null;
          place_slug: string | null;
          place_description: string | null;
          category_id: number | null;
          tags: string[] | null;
          price_range: number | null;
          place_is_active: boolean | null;
          place_created_at: string | null;
          place_updated_at: string | null;
          owner_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          category_description: string | null;
          category_icon: string | null;
          review_count: number | null;
          average_rating: number | null;
          last_reviewed_at: string | null;
          photo_count: number | null;
          hours: Array<{
            day_of_week: number;
            open_time: string | null;
            close_time: string | null;
            is_closed: boolean;
            is_24_hours: boolean;
          }>;
          other_branches: Array<{
            id: string;
            name: string;
            slug: string;
            description: string | null;
            phone: string | null;
            website_url: string | null;
            address_line1: string | null;
            address_line2: string | null;
            city: string | null;
            state: string | null;
            postal_code: string | null;
            country: string | null;
            latitude: number | null;
            longitude: number | null;
            is_main_branch: boolean;
            is_active: boolean;
            created_at: string;
            updated_at: string;
          }>;
          top_review: {
            id: string;
            rating: number;
            body: string | null;
            visited_at: string | null;
            created_at: string;
            author: {
              id: string;
              username: string | null;
              full_name: string | null;
              avatar_url: string | null;
            };
            stats: {
              total_reactions: number;
              likes_count: number;
              loves_count: number;
              mehs_count: number;
              dislikes_count: number;
            };
          } | null;
          amenities: Array<{
            amenity_type_id: number;
            value: boolean;
            amenity: {
              id: number;
              key: string;
              name: string;
              icon_name: string | null;
            };
          }>;
          menu: {
            sections: Array<{
              id: string;
              name: string;
              description: string | null;
              icon_name: string | null;
            }>;
            items: Array<{
              id: string;
              section_id: string;
              name: string;
              description: string | null;
              price: number | null;
              currency: string;
              is_available: boolean;
              position: number;
              created_at: string;
            }>;
          } | null;
        };
      };
      branch_stats: {
        Row: {
          branch_id: string;
          review_count: number;
          average_rating: number;
          last_reviewed_at: string | null;
          photo_count: number;
        };
      };
      review_stats: {
        Row: {
          review_id: string;
          total_reactions: number;
          likes_count: number;
          loves_count: number;
          mehs_count: number;
          dislikes_count: number;
        };
      };
    };
    Functions: {
      recent_reviews_nearby: {
        Args: {
          in_lat: number;
          in_lon: number;
          in_radius_meters?: number;
          in_limit?: number;
        };
        Returns: Database["public"]["Views"]["recent_reviews_enriched"]["Row"][];
      };
      recent_reviews_popular: {
        Args: {
          in_days?: number;
          in_limit?: number;
        };
        Returns: Database["public"]["Views"]["recent_reviews_enriched"]["Row"][];
      };
      recent_reviews_food: {
        Args: {
          in_limit?: number;
        };
        Returns: Database["public"]["Views"]["recent_reviews_enriched"]["Row"][];
      };
      search_places_nearby: {
        Args: {
          in_lat: number;
          in_lon: number;
          in_radius_meters?: number;
          in_max_results?: number;
        };
        Returns: {
          id: string;
          name: string;
          slug: string;
          city: string | null;
          country: string | null;
          category_id: number | null;
          average_rating: number;
          review_count: number;
          distance_meters: number;
        }[];
      };
    };
  };
}

// Common types used throughout the application
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Place = Database["public"]["Tables"]["places"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type MenuSection = Database["public"]["Tables"]["menu_sections"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type ReviewPhoto = Database["public"]["Tables"]["review_photos"]["Row"];
export type BranchPhoto = Database["public"]["Tables"]["branch_photos"]["Row"];
export type MenuItemPhoto =
  Database["public"]["Tables"]["menu_item_photos"]["Row"];
export type FavoriteBranch =
  Database["public"]["Tables"]["favorite_branches"]["Row"];
export type RecentReviewEnriched =
  Database["public"]["Views"]["recent_reviews_enriched"]["Row"];
export type BranchWithDetails =
  Database["public"]["Views"]["branches_with_details"]["Row"];
export type BranchStats = Database["public"]["Views"]["branch_stats"]["Row"];
export type ReviewStats = Database["public"]["Views"]["review_stats"]["Row"];

// Extended types for components
export interface MenuItemWithPhotos extends MenuItem {
  menu_item_photos?: MenuItemPhoto[];
}

export interface MenuSectionWithItems extends MenuSection {
  items?: MenuItemWithPhotos[];
}

export interface PlaceWithStats extends Place {
  branch_id?: string; // Add branch_id for review creation
  place_stats?: BranchStats | null;
  stats?: {
    review_count: number;
    average_rating?: number | null;
    last_reviewed_at?: string | null;
    photo_count: number;
  };
  cover_image_path?: string | null;
}

export interface ReviewWithAuthor extends Review {
  author?: Profile;
  place?: Place;
  photos?: ReviewPhoto[];
  replies?: Array<{
    id: string;
    review_id: string;
    body: string;
    created_at: string;
    updated_at: string;
    author_id: string;
    author: {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    };
  }>;
  reactions?: ReviewStats;
}

export interface BranchWithPlace extends Branch {
  place?: Place;
}

export interface FavoritePlace {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  category_id?: number | null;
  price_range?: number | null;
}
