export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      community_wins: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          niche_name: string | null
          platform: string | null
          product_name: string
          user_id: string
          win_type: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          niche_name?: string | null
          platform?: string | null
          product_name: string
          user_id: string
          win_type?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          niche_name?: string | null
          platform?: string | null
          product_name?: string
          user_id?: string
          win_type?: string
        }
        Relationships: []
      }
      daily_inspiration: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          niche_link: string | null
          title: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          niche_link?: string | null
          title: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          niche_link?: string | null
          title?: string
        }
        Relationships: []
      }
      launch_packs: {
        Row: {
          category: string
          created_at: string | null
          id: string
          image_recommendations: string[]
          is_active: boolean | null
          listing_bullets: string[]
          listing_title: string
          niche_name: string
          plr_suggestion: Json
          promo_idea: string
          slug: string
          title: string
          why_hot: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          image_recommendations: string[]
          is_active?: boolean | null
          listing_bullets: string[]
          listing_title: string
          niche_name: string
          plr_suggestion: Json
          promo_idea: string
          slug: string
          title: string
          why_hot: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          image_recommendations?: string[]
          is_active?: boolean | null
          listing_bullets?: string[]
          listing_title?: string
          niche_name?: string
          plr_suggestion?: Json
          promo_idea?: string
          slug?: string
          title?: string
          why_hot?: string
        }
        Relationships: []
      }
      niche_blueprint_usage: {
        Row: {
          blueprint_hash: string
          created_at: string
          id: string
          niche_id: string
          niche_name: string
          price_tier: string
          product_name: string | null
          product_type: string
          style_vibe: string
          target_audience: string
          transformation_focus: string
          user_id: string
        }
        Insert: {
          blueprint_hash: string
          created_at?: string
          id?: string
          niche_id: string
          niche_name: string
          price_tier: string
          product_name?: string | null
          product_type: string
          style_vibe: string
          target_audience: string
          transformation_focus: string
          user_id: string
        }
        Update: {
          blueprint_hash?: string
          created_at?: string
          id?: string
          niche_id?: string
          niche_name?: string
          price_tier?: string
          product_name?: string | null
          product_type?: string
          style_vibe?: string
          target_audience?: string
          transformation_focus?: string
          user_id?: string
        }
        Relationships: []
      }
      plr_quickstart_kits: {
        Row: {
          created_at: string
          description: string
          difficulty_level: string | null
          id: string
          included_item_ids: string[] | null
          is_featured: boolean | null
          is_pro_only: boolean | null
          niche_category: string
          suggested_funnel_order: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          difficulty_level?: string | null
          id?: string
          included_item_ids?: string[] | null
          is_featured?: boolean | null
          is_pro_only?: boolean | null
          niche_category: string
          suggested_funnel_order?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          difficulty_level?: string | null
          id?: string
          included_item_ids?: string[] | null
          is_featured?: boolean | null
          is_pro_only?: boolean | null
          niche_category?: string
          suggested_funnel_order?: string[] | null
          title?: string
        }
        Relationships: []
      }
      plr_vault_items: {
        Row: {
          content_sample: string | null
          created_at: string
          description: string
          funnel_role: string
          id: string
          is_active: boolean | null
          is_pro_only: boolean | null
          license_type: string
          niche_category: string
          product_type: string
          suggested_price_max: number | null
          suggested_price_min: number | null
          tags: string[] | null
          title: string
        }
        Insert: {
          content_sample?: string | null
          created_at?: string
          description: string
          funnel_role?: string
          id?: string
          is_active?: boolean | null
          is_pro_only?: boolean | null
          license_type?: string
          niche_category: string
          product_type: string
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          tags?: string[] | null
          title: string
        }
        Update: {
          content_sample?: string | null
          created_at?: string
          description?: string
          funnel_role?: string
          id?: string
          is_active?: boolean | null
          is_pro_only?: boolean | null
          license_type?: string
          niche_category?: string
          product_type?: string
          suggested_price_max?: number | null
          suggested_price_min?: number | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          last_activity_date: string | null
          onboarding_completed: boolean | null
          pack_uses_reset_at: string | null
          pack_uses_today: number | null
          preferred_platform: string | null
          product_interests: string[] | null
          products_launched: number | null
          searches_today: number | null
          streak_days: number | null
          tooltips_seen: string[] | null
          updated_at: string | null
          usage_reset_at: string | null
          views_today: number | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          pack_uses_reset_at?: string | null
          pack_uses_today?: number | null
          preferred_platform?: string | null
          product_interests?: string[] | null
          products_launched?: number | null
          searches_today?: number | null
          streak_days?: number | null
          tooltips_seen?: string[] | null
          updated_at?: string | null
          usage_reset_at?: string | null
          views_today?: number | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          last_activity_date?: string | null
          onboarding_completed?: boolean | null
          pack_uses_reset_at?: string | null
          pack_uses_today?: number | null
          preferred_platform?: string | null
          product_interests?: string[] | null
          products_launched?: number | null
          searches_today?: number | null
          streak_days?: number | null
          tooltips_seen?: string[] | null
          updated_at?: string | null
          usage_reset_at?: string | null
          views_today?: number | null
        }
        Relationships: []
      }
      revenue_goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          goal_amount: number
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          goal_amount?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_niches: {
        Row: {
          alert_enabled: boolean | null
          created_at: string | null
          id: string
          niche_id: string
          niche_name: string
          notes: string | null
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          niche_id: string
          niche_name: string
          notes?: string | null
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string | null
          id?: string
          niche_id?: string
          niche_name?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          earned_at: string
          icon: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          earned_at?: string
          icon?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          earned_at?: string
          icon?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_product_builds: {
        Row: {
          blueprint: Json
          bundles: Json | null
          completion_steps: Json | null
          created_at: string
          ecovers: Json | null
          id: string
          launch_kit: Json | null
          niche_id: string
          niche_name: string
          playbook_progress: Json | null
          price_tier: string
          product_name: string
          product_type: string
          status: string
          style_vibe: string
          target_audience: string
          transformation_focus: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint: Json
          bundles?: Json | null
          completion_steps?: Json | null
          created_at?: string
          ecovers?: Json | null
          id?: string
          launch_kit?: Json | null
          niche_id: string
          niche_name: string
          playbook_progress?: Json | null
          price_tier: string
          product_name: string
          product_type: string
          status?: string
          style_vibe: string
          target_audience: string
          transformation_focus: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint?: Json
          bundles?: Json | null
          completion_steps?: Json | null
          created_at?: string
          ecovers?: Json | null
          id?: string
          launch_kit?: Json | null
          niche_id?: string
          niche_name?: string
          playbook_progress?: Json | null
          price_tier?: string
          product_name?: string
          product_type?: string
          status?: string
          style_vibe?: string
          target_audience?: string
          transformation_focus?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_reset_daily_limits: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_blueprint_uniqueness: {
        Args: {
          p_niche_id: string
          p_style_vibe: string
          p_target_audience: string
          p_transformation_focus: string
        }
        Returns: number
      }
      get_niche_blueprint_count: {
        Args: { p_niche_id: string }
        Returns: number
      }
      get_saved_niche_count: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_search_count: { Args: { p_user_id: string }; Returns: Json }
      increment_view_count: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "free" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["free", "pro"],
    },
  },
} as const
