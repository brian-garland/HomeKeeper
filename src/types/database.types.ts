export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          timezone: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null  
          phone?: string | null
          avatar_url?: string | null
          timezone?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          timezone?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      homes: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          country: string
          home_type: string
          year_built: number | null
          square_footage: number | null
          lot_size: number | null
          bedrooms: number | null
          bathrooms: number | null
          stories: number | null
          garage_spaces: number | null
          hvac_type: string | null
          roof_type: string | null
          foundation_type: string | null
          siding_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address: string
          city: string
          state: string
          zip_code: string
          country?: string
          home_type: string
          year_built?: number | null
          square_footage?: number | null
          lot_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          stories?: number | null
          garage_spaces?: number | null
          hvac_type?: string | null
          roof_type?: string | null
          foundation_type?: string | null
          siding_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zip_code?: string
          country?: string
          home_type?: string
          year_built?: number | null
          square_footage?: number | null
          lot_size?: number | null
          bedrooms?: number | null
          bathrooms?: number | null  
          stories?: number | null
          garage_spaces?: number | null
          hvac_type?: string | null
          roof_type?: string | null
          foundation_type?: string | null
          siding_type?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          home_id: string
          name: string
          category: string
          type: string
          brand: string | null
          model: string | null
          serial_number: string | null
          purchase_date: string | null
          install_date: string | null
          warranty_expires: string | null
          specifications: Json | null
          location: string | null
          room: string | null
          maintenance_frequency_months: number | null
          last_service_date: string | null
          next_service_due: string | null
          photo_urls: string[] | null
          manual_url: string | null
          notes: string | null
          active: boolean | null
          needs_attention: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          home_id: string
          name: string
          category: string
          type: string
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          purchase_date?: string | null
          install_date?: string | null
          warranty_expires?: string | null
          specifications?: Json | null
          location?: string | null
          room?: string | null
          maintenance_frequency_months?: number | null
          last_service_date?: string | null
          next_service_due?: string | null
          photo_urls?: string[] | null
          manual_url?: string | null
          notes?: string | null
          active?: boolean | null
          needs_attention?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          home_id?: string
          name?: string
          category?: string
          type?: string
          brand?: string | null
          model?: string | null
          serial_number?: string | null
          purchase_date?: string | null
          install_date?: string | null
          warranty_expires?: string | null
          specifications?: Json | null
          location?: string | null
          room?: string | null
          maintenance_frequency_months?: number | null
          last_service_date?: string | null
          next_service_due?: string | null
          photo_urls?: string[] | null
          manual_url?: string | null
          notes?: string | null
          active?: boolean | null
          needs_attention?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          home_id: string
          equipment_id: string | null
          template_id: string | null
          title: string
          description: string | null
          category: string
          due_date: string
          priority: number | null
          estimated_duration_minutes: number | null
          difficulty_level: number | null
          instructions: Json | null
          status: string | null
          completed_at: string | null
          completed_by: string | null
          auto_generated: boolean | null
          reschedule_count: number | null
          weather_dependent: boolean | null
          notes: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          home_id: string
          equipment_id?: string | null
          template_id?: string | null
          title: string
          description?: string | null
          category: string
          due_date: string
          priority?: number | null
          estimated_duration_minutes?: number | null
          difficulty_level?: number | null
          instructions?: Json | null
          status?: string | null
          completed_at?: string | null
          completed_by?: string | null
          auto_generated?: boolean | null
          reschedule_count?: number | null
          weather_dependent?: boolean | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          home_id?: string
          equipment_id?: string | null
          template_id?: string | null
          title?: string
          description?: string | null
          category?: string
          due_date?: string
          priority?: number | null
          estimated_duration_minutes?: number | null
          difficulty_level?: number | null
          instructions?: Json | null
          status?: string | null
          completed_at?: string | null
          completed_by?: string | null
          auto_generated?: boolean | null
          reschedule_count?: number | null
          weather_dependent?: boolean | null
          notes?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types for easier use
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type Home = Database['public']['Tables']['homes']['Row']
export type HomeInsert = Database['public']['Tables']['homes']['Insert']
export type HomeUpdate = Database['public']['Tables']['homes']['Update']

export type Equipment = Database['public']['Tables']['equipment']['Row']
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert']
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
