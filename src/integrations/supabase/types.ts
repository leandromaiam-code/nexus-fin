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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          description: string | null
          goal_template_id: number | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          goal_template_id?: number | null
          id?: never
          name: string
        }
        Update: {
          description?: string | null
          goal_template_id?: number | null
          id?: never
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_goal_template_id_fkey"
            columns: ["goal_template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_prompts: {
        Row: {
          block_name: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          prompt_content: string
          version: number
        }
        Insert: {
          block_name: string
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          prompt_content: string
          version?: number
        }
        Update: {
          block_name?: string
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          prompt_content?: string
          version?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string | null
          id: number
          name: string
          parent_category_id: number | null
          tipo: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: never
          name: string
          parent_category_id?: number | null
          tipo?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: never
          name?: string
          parent_category_id?: number | null
          tipo?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_questions: {
        Row: {
          id: number
          is_active: boolean
          question_text: string
          step_order: number
          target_column: string
        }
        Insert: {
          id?: never
          is_active?: boolean
          question_text: string
          step_order: number
          target_column: string
        }
        Update: {
          id?: never
          is_active?: boolean
          question_text?: string
          step_order?: number
          target_column?: string
        }
        Relationships: []
      }
      goal_templates: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      memoria_conversas: {
        Row: {
          id: number
          message: Json
          session_id: string
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
        }
        Relationships: []
      }
      plan_steps: {
        Row: {
          content: string | null
          id: number
          plan_id: number
          step_order: number
          title: string
        }
        Insert: {
          content?: string | null
          id?: never
          plan_id: number
          step_order: number
          title: string
        }
        Update: {
          content?: string | null
          id?: never
          plan_id?: number
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_steps_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: number | null
          created_at: string
          description: string | null
          id: number
          transaction_date: string
          user_id: number
        }
        Insert: {
          amount: number
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: never
          transaction_date?: string
          user_id: number
        }
        Update: {
          amount?: number
          category_id?: number | null
          created_at?: string
          description?: string | null
          id?: never
          transaction_date?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_action_plans: {
        Row: {
          id: number
          plan_id: number
          started_at: string
          status: string | null
          user_goal_id: number | null
          user_id: number
        }
        Insert: {
          id?: never
          plan_id: number
          started_at?: string
          status?: string | null
          user_goal_id?: number | null
          user_id: number
        }
        Update: {
          id?: never
          plan_id?: number
          started_at?: string
          status?: string | null
          user_goal_id?: number | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_action_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_action_plans_user_goal_id_fkey"
            columns: ["user_goal_id"]
            isOneToOne: false
            referencedRelation: "user_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_action_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_action_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          current_amount: number | null
          custom_name: string | null
          goal_template_id: number | null
          id: number
          is_primary: boolean
          status: string | null
          target_amount: number
          target_date: string | null
          user_id: number
        }
        Insert: {
          current_amount?: number | null
          custom_name?: string | null
          goal_template_id?: number | null
          id?: never
          is_primary?: boolean
          status?: string | null
          target_amount: number
          target_date?: string | null
          user_id: number
        }
        Update: {
          current_amount?: number | null
          custom_name?: string | null
          goal_template_id?: number | null
          id?: never
          is_primary?: boolean
          status?: string | null
          target_amount?: number
          target_date?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_goal_template_id_fkey"
            columns: ["goal_template_id"]
            isOneToOne: false
            referencedRelation: "goal_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_keyword_mappings: {
        Row: {
          category_id: number
          created_at: string
          id: number
          keyword: string
          user_id: number
        }
        Insert: {
          category_id: number
          created_at?: string
          id?: never
          keyword: string
          user_id: number
        }
        Update: {
          category_id?: number
          created_at?: string
          id?: never
          keyword?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_keyword_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_keyword_mappings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_keyword_mappings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan_step_progress: {
        Row: {
          completed_at: string
          id: number
          plan_step_id: number
          user_action_plan_id: number
        }
        Insert: {
          completed_at: string
          id?: never
          plan_step_id: number
          user_action_plan_id: number
        }
        Update: {
          completed_at?: string
          id?: never
          plan_step_id?: number
          user_action_plan_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_step_progress_plan_step_id_fkey"
            columns: ["plan_step_id"]
            isOneToOne: false
            referencedRelation: "plan_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plan_step_progress_user_action_plan_id_fkey"
            columns: ["user_action_plan_id"]
            isOneToOne: false
            referencedRelation: "user_action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          cost_of_living_reported: number | null
          created_at: string
          financial_archetype: string | null
          full_name: string | null
          id: number
          income_input_best: number | null
          income_input_typical: number | null
          income_input_worst: number | null
          phone_number: string
          renda_base_amount: number | null
          vigilant_alert_sent_at: string | null
        }
        Insert: {
          auth_id?: string | null
          cost_of_living_reported?: number | null
          created_at?: string
          financial_archetype?: string | null
          full_name?: string | null
          id?: never
          income_input_best?: number | null
          income_input_typical?: number | null
          income_input_worst?: number | null
          phone_number: string
          renda_base_amount?: number | null
          vigilant_alert_sent_at?: string | null
        }
        Update: {
          auth_id?: string | null
          cost_of_living_reported?: number | null
          created_at?: string
          financial_archetype?: string | null
          full_name?: string | null
          id?: never
          income_input_best?: number | null
          income_input_typical?: number | null
          income_input_worst?: number | null
          phone_number?: string
          renda_base_amount?: number | null
          vigilant_alert_sent_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      category_spending_by_month: {
        Row: {
          category_id: number | null
          category_name: string | null
          icon_name: string | null
          month: string | null
          total_spent_in_category: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "monthly_summaries"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_summaries: {
        Row: {
          balance: number | null
          month: string | null
          renda_base_amount: number | null
          total_spent: number | null
          user_id: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: number
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
    Enums: {},
  },
} as const
