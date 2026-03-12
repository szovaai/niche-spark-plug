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
      ai_cache: {
        Row: {
          cache_key: string
          created_at: string
          expires_at: string
          function_name: string
          hit_count: number
          id: string
          input_hash: string
          model_used: string
          response: Json
          user_tier: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          expires_at?: string
          function_name: string
          hit_count?: number
          id?: string
          input_hash: string
          model_used: string
          response: Json
          user_tier?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          expires_at?: string
          function_name?: string
          hit_count?: number
          id?: string
          input_hash?: string
          model_used?: string
          response?: Json
          user_tier?: string
        }
        Relationships: []
      }
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
      empire_projects: {
        Row: {
          created_at: string
          current_step: number
          id: string
          name: string
          status: string
          step1_final_niche: string | null
          step1_niche_analysis: Json | null
          step1_niches_input: Json | null
          step2_brand_options: Json | null
          step2_logo_prompts: Json | null
          step2_selected_brand: string | null
          step2_social_bios: Json | null
          step2_warming_checklist: Json | null
          step3_manual_text: string | null
          step3_price_range: string | null
          step3_product_brief: Json | null
          step3_selected_product: string | null
          step3_sheet_schema: Json | null
          step4_delivery_instructions: string | null
          step4_domain_ideas: Json | null
          step4_listing_copy: Json | null
          step4_visual_prompts: Json | null
          step5_content_calendar: Json | null
          step5_content_patterns: Json | null
          step5_scripts: Json | null
          step5_viral_ideas: Json | null
          step6_ad_angles: Json | null
          step6_engagement_checklist: Json | null
          step6_schedule_plan: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          status?: string
          step1_final_niche?: string | null
          step1_niche_analysis?: Json | null
          step1_niches_input?: Json | null
          step2_brand_options?: Json | null
          step2_logo_prompts?: Json | null
          step2_selected_brand?: string | null
          step2_social_bios?: Json | null
          step2_warming_checklist?: Json | null
          step3_manual_text?: string | null
          step3_price_range?: string | null
          step3_product_brief?: Json | null
          step3_selected_product?: string | null
          step3_sheet_schema?: Json | null
          step4_delivery_instructions?: string | null
          step4_domain_ideas?: Json | null
          step4_listing_copy?: Json | null
          step4_visual_prompts?: Json | null
          step5_content_calendar?: Json | null
          step5_content_patterns?: Json | null
          step5_scripts?: Json | null
          step5_viral_ideas?: Json | null
          step6_ad_angles?: Json | null
          step6_engagement_checklist?: Json | null
          step6_schedule_plan?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          status?: string
          step1_final_niche?: string | null
          step1_niche_analysis?: Json | null
          step1_niches_input?: Json | null
          step2_brand_options?: Json | null
          step2_logo_prompts?: Json | null
          step2_selected_brand?: string | null
          step2_social_bios?: Json | null
          step2_warming_checklist?: Json | null
          step3_manual_text?: string | null
          step3_price_range?: string | null
          step3_product_brief?: Json | null
          step3_selected_product?: string | null
          step3_sheet_schema?: Json | null
          step4_delivery_instructions?: string | null
          step4_domain_ideas?: Json | null
          step4_listing_copy?: Json | null
          step4_visual_prompts?: Json | null
          step5_content_calendar?: Json | null
          step5_content_patterns?: Json | null
          step5_scripts?: Json | null
          step5_viral_ideas?: Json | null
          step6_ad_angles?: Json | null
          step6_engagement_checklist?: Json | null
          step6_schedule_plan?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      launch_genomes: {
        Row: {
          bonus_count: number | null
          conversion_style: string | null
          created_at: string
          email_style: string | null
          funnel_layout: string | null
          genome_data: Json
          headline_style: string | null
          id: string
          is_public: boolean | null
          name: string
          niche: string
          offer_type: string
          performance_score: number | null
          price_point: number | null
          project_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          uses_count: number | null
        }
        Insert: {
          bonus_count?: number | null
          conversion_style?: string | null
          created_at?: string
          email_style?: string | null
          funnel_layout?: string | null
          genome_data?: Json
          headline_style?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          niche: string
          offer_type?: string
          performance_score?: number | null
          price_point?: number | null
          project_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          uses_count?: number | null
        }
        Update: {
          bonus_count?: number | null
          conversion_style?: string | null
          created_at?: string
          email_style?: string | null
          funnel_layout?: string | null
          genome_data?: Json
          headline_style?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          niche?: string
          offer_type?: string
          performance_score?: number | null
          price_point?: number | null
          project_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_genomes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_intelligence: {
        Row: {
          affiliate_interest: string | null
          blueprint_tags: string[] | null
          bonus_count: number | null
          click_through_rate: number | null
          copy_tone: string | null
          created_at: string
          email_open_rate: number | null
          email_sequence_type: string | null
          headline_style: string | null
          hooks_used: Json | null
          id: string
          mechanism_name: string | null
          niche: string | null
          notes: string | null
          offer_structure: Json | null
          performance_rating: string | null
          platform: string | null
          price_point: number | null
          product_type: string | null
          project_id: string | null
          sales_count: number | null
          sales_style: string | null
          social_engagement: string | null
          target_audience: string | null
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_interest?: string | null
          blueprint_tags?: string[] | null
          bonus_count?: number | null
          click_through_rate?: number | null
          copy_tone?: string | null
          created_at?: string
          email_open_rate?: number | null
          email_sequence_type?: string | null
          headline_style?: string | null
          hooks_used?: Json | null
          id?: string
          mechanism_name?: string | null
          niche?: string | null
          notes?: string | null
          offer_structure?: Json | null
          performance_rating?: string | null
          platform?: string | null
          price_point?: number | null
          product_type?: string | null
          project_id?: string | null
          sales_count?: number | null
          sales_style?: string | null
          social_engagement?: string | null
          target_audience?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_interest?: string | null
          blueprint_tags?: string[] | null
          bonus_count?: number | null
          click_through_rate?: number | null
          copy_tone?: string | null
          created_at?: string
          email_open_rate?: number | null
          email_sequence_type?: string | null
          headline_style?: string | null
          hooks_used?: Json | null
          id?: string
          mechanism_name?: string | null
          niche?: string | null
          notes?: string | null
          offer_structure?: Json | null
          performance_rating?: string | null
          platform?: string | null
          price_point?: number | null
          product_type?: string | null
          project_id?: string | null
          sales_count?: number | null
          sales_style?: string | null
          social_engagement?: string | null
          target_audience?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_intelligence_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "launch_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_metrics: {
        Row: {
          affiliate_clicks: number
          created_at: string
          date: string
          email_clicks: number
          email_opens: number
          id: string
          notes: string | null
          optins: number
          project_id: string
          refunds: number
          revenue: number
          sales: number
          updated_at: string
          upsell_revenue: number
          upsell_sales: number
          user_id: string
          visitors: number
        }
        Insert: {
          affiliate_clicks?: number
          created_at?: string
          date?: string
          email_clicks?: number
          email_opens?: number
          id?: string
          notes?: string | null
          optins?: number
          project_id: string
          refunds?: number
          revenue?: number
          sales?: number
          updated_at?: string
          upsell_revenue?: number
          upsell_sales?: number
          user_id: string
          visitors?: number
        }
        Update: {
          affiliate_clicks?: number
          created_at?: string
          date?: string
          email_clicks?: number
          email_opens?: number
          id?: string
          notes?: string | null
          optins?: number
          project_id?: string
          refunds?: number
          revenue?: number
          sales?: number
          updated_at?: string
          upsell_revenue?: number
          upsell_sales?: number
          user_id?: string
          visitors?: number
        }
        Relationships: [
          {
            foreignKeyName: "launch_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "launch_projects"
            referencedColumns: ["id"]
          },
        ]
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
      launch_progress: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          first_sale_date: string | null
          id: string
          launched_at: string | null
          live_url: string | null
          selected_platform: string | null
          started_at: string | null
          toolkit_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          first_sale_date?: string | null
          id?: string
          launched_at?: string | null
          live_url?: string | null
          selected_platform?: string | null
          started_at?: string | null
          toolkit_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          first_sale_date?: string | null
          id?: string
          launched_at?: string | null
          live_url?: string | null
          selected_platform?: string | null
          started_at?: string | null
          toolkit_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_progress_toolkit_id_fkey"
            columns: ["toolkit_id"]
            isOneToOne: false
            referencedRelation: "toolkits"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_projects: {
        Row: {
          buyer_avatar: Json | null
          created_at: string
          current_step: number
          id: string
          name: string
          niche: string | null
          product_type: string | null
          status: string
          step1_product: Json | null
          step2_assets: Json | null
          step2_product_content: Json | null
          step3_funnel: Json | null
          step4_marketing: Json | null
          step5_checklist: Json | null
          target_audience: string | null
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_avatar?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          niche?: string | null
          product_type?: string | null
          status?: string
          step1_product?: Json | null
          step2_assets?: Json | null
          step2_product_content?: Json | null
          step3_funnel?: Json | null
          step4_marketing?: Json | null
          step5_checklist?: Json | null
          target_audience?: string | null
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_avatar?: Json | null
          created_at?: string
          current_step?: number
          id?: string
          name?: string
          niche?: string | null
          product_type?: string | null
          status?: string
          step1_product?: Json | null
          step2_assets?: Json | null
          step2_product_content?: Json | null
          step3_funnel?: Json | null
          step4_marketing?: Json | null
          step5_checklist?: Json | null
          target_audience?: string | null
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      micro_products: {
        Row: {
          config: Json
          created_at: string
          generated_content: Json | null
          id: string
          niche_topic: string
          problem_statement: string
          product_subtitle: string | null
          product_title: string | null
          product_type: string
          status: string
          target_audience: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          generated_content?: Json | null
          id?: string
          niche_topic: string
          problem_statement: string
          product_subtitle?: string | null
          product_title?: string | null
          product_type: string
          status?: string
          target_audience: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          generated_content?: Json | null
          id?: string
          niche_topic?: string
          problem_statement?: string
          product_subtitle?: string | null
          product_title?: string | null
          product_type?: string
          status?: string
          target_audience?: string
          updated_at?: string
          user_id?: string
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
      pregenerated_niches: {
        Row: {
          created_at: string
          id: string
          niche_category: string
          niche_name: string
          popularity_score: number
          recommendation_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          niche_category: string
          niche_name: string
          popularity_score?: number
          recommendation_data: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          niche_category?: string
          niche_name?: string
          popularity_score?: number
          recommendation_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          api_keys: Json | null
          brand_kit: Json | null
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
          api_keys?: Json | null
          brand_kit?: Json | null
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
          api_keys?: Json | null
          brand_kit?: Json | null
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
      toolkits: {
        Row: {
          components: Json | null
          content: Json | null
          created_at: string
          downloads: number
          ecover_url: string | null
          guide_sections: Json | null
          id: string
          logo_url: string | null
          niche: string
          sales_letter: string | null
          sales_offer_details: Json | null
          salesletter_html: string | null
          salesletter_polished: string | null
          salesletter_raw: string | null
          salesletter_step: string | null
          salesletter_style: string | null
          status: string
          subtitle: string | null
          target_audience: string | null
          thesis: string | null
          title: string
          updated_at: string
          upsell: Json | null
          user_id: string
          wizard_step: number | null
          writing_style: string | null
        }
        Insert: {
          components?: Json | null
          content?: Json | null
          created_at?: string
          downloads?: number
          ecover_url?: string | null
          guide_sections?: Json | null
          id?: string
          logo_url?: string | null
          niche: string
          sales_letter?: string | null
          sales_offer_details?: Json | null
          salesletter_html?: string | null
          salesletter_polished?: string | null
          salesletter_raw?: string | null
          salesletter_step?: string | null
          salesletter_style?: string | null
          status?: string
          subtitle?: string | null
          target_audience?: string | null
          thesis?: string | null
          title: string
          updated_at?: string
          upsell?: Json | null
          user_id: string
          wizard_step?: number | null
          writing_style?: string | null
        }
        Update: {
          components?: Json | null
          content?: Json | null
          created_at?: string
          downloads?: number
          ecover_url?: string | null
          guide_sections?: Json | null
          id?: string
          logo_url?: string | null
          niche?: string
          sales_letter?: string | null
          sales_offer_details?: Json | null
          salesletter_html?: string | null
          salesletter_polished?: string | null
          salesletter_raw?: string | null
          salesletter_step?: string | null
          salesletter_style?: string | null
          status?: string
          subtitle?: string | null
          target_audience?: string | null
          thesis?: string | null
          title?: string
          updated_at?: string
          upsell?: Json | null
          user_id?: string
          wizard_step?: number | null
          writing_style?: string | null
        }
        Relationships: []
      }
      ugc_app_tag_assignments: {
        Row: {
          app_id: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          app_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          app_id?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ugc_app_tag_assignments_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "ugc_apps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ugc_app_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "ugc_app_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      ugc_app_tags: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          tag_group: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          tag_group: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          tag_group?: string
        }
        Relationships: []
      }
      ugc_apps: {
        Row: {
          beginner_friendly_score: number | null
          category: string[]
          cons: string[] | null
          consistency_score: number | null
          content_types: string[]
          countries_supported: string[] | null
          created_at: string | null
          currency: string | null
          description: string
          earning_potential_score: number | null
          followers_required: string | null
          how_it_works: string[] | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_pro_only: boolean | null
          last_verified_at: string | null
          logo_url: string | null
          name: string
          notes_for_creators: string | null
          official_site_url: string | null
          pay_model: string[]
          platforms: string[]
          primary_audience: string | null
          pros: string[] | null
          referral_notes: string | null
          referral_program: boolean | null
          risk_notes: string | null
          short_tagline: string
          signup_url_android: string | null
          signup_url_ios: string | null
          signup_url_web: string | null
          slug: string
          tips: string[] | null
          typical_pay_max: number | null
          typical_pay_min: number | null
        }
        Insert: {
          beginner_friendly_score?: number | null
          category: string[]
          cons?: string[] | null
          consistency_score?: number | null
          content_types: string[]
          countries_supported?: string[] | null
          created_at?: string | null
          currency?: string | null
          description: string
          earning_potential_score?: number | null
          followers_required?: string | null
          how_it_works?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_pro_only?: boolean | null
          last_verified_at?: string | null
          logo_url?: string | null
          name: string
          notes_for_creators?: string | null
          official_site_url?: string | null
          pay_model: string[]
          platforms: string[]
          primary_audience?: string | null
          pros?: string[] | null
          referral_notes?: string | null
          referral_program?: boolean | null
          risk_notes?: string | null
          short_tagline: string
          signup_url_android?: string | null
          signup_url_ios?: string | null
          signup_url_web?: string | null
          slug: string
          tips?: string[] | null
          typical_pay_max?: number | null
          typical_pay_min?: number | null
        }
        Update: {
          beginner_friendly_score?: number | null
          category?: string[]
          cons?: string[] | null
          consistency_score?: number | null
          content_types?: string[]
          countries_supported?: string[] | null
          created_at?: string | null
          currency?: string | null
          description?: string
          earning_potential_score?: number | null
          followers_required?: string | null
          how_it_works?: string[] | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_pro_only?: boolean | null
          last_verified_at?: string | null
          logo_url?: string | null
          name?: string
          notes_for_creators?: string | null
          official_site_url?: string | null
          pay_model?: string[]
          platforms?: string[]
          primary_audience?: string | null
          pros?: string[] | null
          referral_notes?: string | null
          referral_program?: boolean | null
          risk_notes?: string | null
          short_tagline?: string
          signup_url_android?: string | null
          signup_url_ios?: string | null
          signup_url_web?: string | null
          slug?: string
          tips?: string[] | null
          typical_pay_max?: number | null
          typical_pay_min?: number | null
        }
        Relationships: []
      }
      ugc_user_app_status: {
        Row: {
          app_id: string | null
          created_at: string | null
          estimated_monthly: number | null
          id: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string | null
          estimated_monthly?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_id?: string | null
          created_at?: string | null
          estimated_monthly?: number | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ugc_user_app_status_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "ugc_apps"
            referencedColumns: ["id"]
          },
        ]
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
      clean_expired_cache: { Args: never; Returns: number }
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
      increment_genome_uses: { Args: { genome_id: string }; Returns: undefined }
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
