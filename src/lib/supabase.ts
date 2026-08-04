import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          height_cm: number | null
          weight_kg: number | null
          target_weight_kg: number | null
          age: number | null
          dob: string | null
          gender: 'male' | 'female' | 'other' | null
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | null
          body_fat_percentage?: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          target_weight_kg?: number | null
          age?: number | null
          dob?: string | null
          gender?: 'male' | 'female' | 'other' | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | null
          body_fat_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          target_weight_kg?: number | null
          age?: number | null
          dob?: string | null
          gender?: 'male' | 'female' | 'other' | null
          activity_level?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null
          goal?: 'lose_weight' | 'maintain' | 'gain_weight' | 'gain_muscle' | null
          body_fat_percentage?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      nutritional_goals: {
        Row: {
          id: string
          user_id: string
          daily_calories: number
          daily_protein_g: number
          daily_carbs_g: number
          daily_fat_g: number
          daily_fiber_g: number | null
          daily_sodium_mg: number | null
          daily_sugar_g: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          daily_calories?: number
          daily_protein_g?: number
          daily_carbs_g?: number
          daily_fat_g?: number
          daily_fiber_g?: number | null
          daily_sodium_mg?: number | null
          daily_sugar_g?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          daily_calories?: number
          daily_protein_g?: number
          daily_carbs_g?: number
          daily_fat_g?: number
          daily_fiber_g?: number | null
          daily_sodium_mg?: number | null
          daily_sugar_g?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          user_id: string | null
          brand_id: string | null
          name: string
          display_name: string | null
          description: string | null
          api_id: string | null
          api_source: string | null
          api_last_updated: string | null
          serving_size_g: number
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          fiber_per_100g: number | null
          sugar_per_100g: number | null
          sodium_per_100g: number | null
          saturated_fat_per_100g: number | null
          trans_fat_per_100g: number | null
          cholesterol_per_100g: number | null
          potassium_per_100g: number | null
          vitamin_a_per_100g: number | null
          vitamin_c_per_100g: number | null
          vitamin_d_per_100g: number | null
          vitamin_e_per_100g: number | null
          vitamin_k_per_100g: number | null
          vitamin_b1_per_100g: number | null
          vitamin_b2_per_100g: number | null
          vitamin_b3_per_100g: number | null
          vitamin_b6_per_100g: number | null
          vitamin_b12_per_100g: number | null
          folate_per_100g: number | null
          calcium_per_100g: number | null
          iron_per_100g: number | null
          magnesium_per_100g: number | null
          phosphorus_per_100g: number | null
          zinc_per_100g: number | null
          category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'supplement' | null
          subcategory: string | null
          tags: string[] | null
          is_favorite: boolean | null
          is_verified: boolean | null
          source: string | null
          barcode: string | null
          allergens: string[] | null
          ingredients: string | null
          preparation_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          brand_id?: string | null
          name: string
          display_name?: string | null
          description?: string | null
          api_id?: string | null
          api_source?: string | null
          api_last_updated?: string | null
          serving_size_g?: number
          calories_per_100g: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fat_per_100g?: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          saturated_fat_per_100g?: number | null
          trans_fat_per_100g?: number | null
          cholesterol_per_100g?: number | null
          potassium_per_100g?: number | null
          vitamin_a_per_100g?: number | null
          vitamin_c_per_100g?: number | null
          vitamin_d_per_100g?: number | null
          vitamin_e_per_100g?: number | null
          vitamin_k_per_100g?: number | null
          vitamin_b1_per_100g?: number | null
          vitamin_b2_per_100g?: number | null
          vitamin_b3_per_100g?: number | null
          vitamin_b6_per_100g?: number | null
          vitamin_b12_per_100g?: number | null
          folate_per_100g?: number | null
          calcium_per_100g?: number | null
          iron_per_100g?: number | null
          magnesium_per_100g?: number | null
          phosphorus_per_100g?: number | null
          zinc_per_100g?: number | null
          category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'supplement' | null
          subcategory?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          is_verified?: boolean | null
          source?: string | null
          barcode?: string | null
          allergens?: string[] | null
          ingredients?: string | null
          preparation_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          brand_id?: string | null
          name?: string
          display_name?: string | null
          description?: string | null
          api_id?: string | null
          api_source?: string | null
          api_last_updated?: string | null
          serving_size_g?: number
          calories_per_100g?: number
          protein_per_100g?: number
          carbs_per_100g?: number
          fat_per_100g?: number
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          saturated_fat_per_100g?: number | null
          trans_fat_per_100g?: number | null
          cholesterol_per_100g?: number | null
          potassium_per_100g?: number | null
          vitamin_a_per_100g?: number | null
          vitamin_c_per_100g?: number | null
          vitamin_d_per_100g?: number | null
          vitamin_e_per_100g?: number | null
          vitamin_k_per_100g?: number | null
          vitamin_b1_per_100g?: number | null
          vitamin_b2_per_100g?: number | null
          vitamin_b3_per_100g?: number | null
          vitamin_b6_per_100g?: number | null
          vitamin_b12_per_100g?: number | null
          folate_per_100g?: number | null
          calcium_per_100g?: number | null
          iron_per_100g?: number | null
          magnesium_per_100g?: number | null
          phosphorus_per_100g?: number | null
          zinc_per_100g?: number | null
          category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'beverage' | 'supplement' | null
          subcategory?: string | null
          tags?: string[] | null
          is_favorite?: boolean | null
          is_verified?: boolean | null
          source?: string | null
          barcode?: string | null
          allergens?: string[] | null
          ingredients?: string | null
          preparation_method?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | null
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          category?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout' | null
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      meal_foods: {
        Row: {
          id: string
          meal_id: string
          food_id: string
          quantity_g: number
          created_at: string
        }
        Insert: {
          id?: string
          meal_id: string
          food_id: string
          quantity_g: number
          created_at?: string
        }
        Update: {
          id?: string
          meal_id?: string
          food_id?: string
          quantity_g?: number
          created_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          meal_time: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
          log_type: 'food' | 'meal'
          item_id: string
          item_name: string
          quantity: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          notes: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date?: string
          meal_time: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
          log_type: 'food' | 'meal'
          item_id: string
          item_name: string
          quantity: number
          calories: number
          protein_g: number
          carbs_g: number
          fat_g: number
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_date?: string
          meal_time?: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack'
          log_type?: 'food' | 'meal'
          item_id?: string
          item_name?: string
          quantity?: number
          calories?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          water_percentage: number | null
          log_date: string
          is_initial: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight_kg: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          log_date?: string
          is_initial?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight_kg?: number
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          water_percentage?: number | null
          log_date?: string
          is_initial?: boolean
          notes?: string | null
          created_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          workout_type: string
          duration_minutes: number | null
          calories_burned: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_date?: string
          workout_type: string
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          workout_type?: string
          duration_minutes?: number | null
          calories_burned?: number | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      weight_history_view: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          body_fat_percentage: number | null
          log_date: string
          created_at: string
          is_initial: boolean
        }
      }
    }
    Functions: {
      calculate_meal_totals: {
        Args: {
          meal_uuid: string
        }
        Returns: {
          total_calories: number
          total_protein: number
          total_carbs: number
          total_fat: number
        }[]
      }
      get_daily_nutrition_summary: {
        Args: {
          user_uuid: string
          target_date?: string
        }
        Returns: {
          total_calories: number
          total_protein: number
          total_carbs: number
          total_fat: number
          total_fiber: number
          total_sugar: number
          total_sodium: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
