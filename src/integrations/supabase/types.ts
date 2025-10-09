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
          {
            foreignKeyName: "action_plans_goal_template_id_fkey"
            columns: ["goal_template_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["goal_template_id"]
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
          description_agente: string | null
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
          description_agente?: string | null
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
          description_agente?: string | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_pagadoras: {
        Row: {
          cor: string | null
          dia_fechamento_fatura: number | null
          icone: string | null
          id: number
          is_active: boolean | null
          nome: string
          saldo_inicial: number | null
          tipo: string
          user_id: number
        }
        Insert: {
          cor?: string | null
          dia_fechamento_fatura?: number | null
          icone?: string | null
          id?: never
          is_active?: boolean | null
          nome: string
          saldo_inicial?: number | null
          tipo: string
          user_id: number
        }
        Update: {
          cor?: string | null
          dia_fechamento_fatura?: number | null
          icone?: string | null
          id?: never
          is_active?: boolean | null
          nome?: string
          saldo_inicial?: number | null
          tipo?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagadoras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      desafios: {
        Row: {
          descricao: string
          id: number
          pontos: number
          tipo: string
          titulo: string
        }
        Insert: {
          descricao: string
          id?: never
          pontos: number
          tipo: string
          titulo: string
        }
        Update: {
          descricao?: string
          id?: never
          pontos?: number
          tipo?: string
          titulo?: string
        }
        Relationships: []
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
      familias: {
        Row: {
          created_at: string
          id: number
          nome_familia: string
          responsavel_user_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          nome_familia: string
          responsavel_user_id: number
        }
        Update: {
          created_at?: string
          id?: never
          nome_familia?: string
          responsavel_user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "familias_responsavel_user_id_fkey"
            columns: ["responsavel_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invites: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: number | null
          cota_mensal: number | null
          created_at: string
          expires_at: string
          familia_id: number
          id: number
          invited_by_user_id: number
          papel: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: number | null
          cota_mensal?: number | null
          created_at?: string
          expires_at: string
          familia_id: number
          id?: never
          invited_by_user_id: number
          papel: string
          status?: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: number | null
          cota_mensal?: number | null
          created_at?: string
          expires_at?: string
          familia_id?: number
          id?: never
          invited_by_user_id?: number
          papel?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invites_accepted_by_user_id_fkey"
            columns: ["accepted_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_invites_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "family_invites_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      membros_familia: {
        Row: {
          cota_mensal: number | null
          familia_id: number
          id: number
          papel: string
          user_id: number
        }
        Insert: {
          cota_mensal?: number | null
          familia_id: number
          id?: never
          papel: string
          user_id: number
        }
        Update: {
          cota_mensal?: number | null
          familia_id?: number
          id?: never
          papel?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "membros_familia_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_familia_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "membros_familia_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      monthly_summaries: {
        Row: {
          balance: number | null
          month: string
          renda_base_amount: number | null
          total_income: number | null
          total_spent: number | null
          user_id: number
        }
        Insert: {
          balance?: number | null
          month: string
          renda_base_amount?: number | null
          total_income?: number | null
          total_spent?: number | null
          user_id: number
        }
        Update: {
          balance?: number | null
          month?: string
          renda_base_amount?: number | null
          total_income?: number | null
          total_spent?: number | null
          user_id?: number
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          category_id: number
          familia_id: number | null
          id: number
          mes_ano: string
          user_id: number | null
          valor_orcado: number
        }
        Insert: {
          category_id: number
          familia_id?: number | null
          id?: never
          mes_ano: string
          user_id?: number | null
          valor_orcado: number
        }
        Update: {
          category_id?: number
          familia_id?: number | null
          id?: never
          mes_ano?: string
          user_id?: number | null
          valor_orcado?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["familia_id"]
          },
          {
            foreignKeyName: "orcamentos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      progresso_desafios_usuario: {
        Row: {
          data_conclusao: string | null
          data_inicio: string | null
          desafio_id: number
          id: number
          progresso: number | null
          status: string
          user_id: number
        }
        Insert: {
          data_conclusao?: string | null
          data_inicio?: string | null
          desafio_id: number
          id?: never
          progresso?: number | null
          status?: string
          user_id: number
        }
        Update: {
          data_conclusao?: string | null
          data_inicio?: string | null
          desafio_id?: number
          id?: never
          progresso?: number | null
          status?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "progresso_desafios_usuario_desafio_id_fkey"
            columns: ["desafio_id"]
            isOneToOne: false
            referencedRelation: "desafios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_desafios_usuario_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recompensas: {
        Row: {
          descricao: string | null
          disponivel: boolean | null
          familia_id: number
          id: number
          pontos_necessarios: number
          titulo: string
        }
        Insert: {
          descricao?: string | null
          disponivel?: boolean | null
          familia_id: number
          id?: never
          pontos_necessarios: number
          titulo: string
        }
        Update: {
          descricao?: string | null
          disponivel?: boolean | null
          familia_id?: number
          id?: never
          pontos_necessarios?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "familias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recompensas_familia_id_fkey"
            columns: ["familia_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["familia_id"]
          },
        ]
      }
      recompensas_resgatadas: {
        Row: {
          data_resgate: string | null
          id: number
          recompensa_id: number
          user_id: number
        }
        Insert: {
          data_resgate?: string | null
          id?: never
          recompensa_id: number
          user_id: number
        }
        Update: {
          data_resgate?: string | null
          id?: never
          recompensa_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "recompensas_resgatadas_recompensa_id_fkey"
            columns: ["recompensa_id"]
            isOneToOne: false
            referencedRelation: "recompensas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recompensas_resgatadas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: number
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: number
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: number
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: number
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category_id: number | null
          conta_pagadora_id: number | null
          created_at: string
          description: string | null
          id: number
          transaction_date: string
          user_id: number
        }
        Insert: {
          amount: number
          category_id?: number | null
          conta_pagadora_id?: number | null
          created_at?: string
          description?: string | null
          id?: never
          transaction_date?: string
          user_id: number
        }
        Update: {
          amount?: number
          category_id?: number | null
          conta_pagadora_id?: number | null
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
            foreignKeyName: "transactions_conta_pagadora_id_fkey"
            columns: ["conta_pagadora_id"]
            isOneToOne: false
            referencedRelation: "account_balances_timeline"
            referencedColumns: ["account_id"]
          },
          {
            foreignKeyName: "transactions_conta_pagadora_id_fkey"
            columns: ["conta_pagadora_id"]
            isOneToOne: false
            referencedRelation: "contas_pagadoras"
            referencedColumns: ["id"]
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_actions: {
        Row: {
          completed_at: string | null
          content: string | null
          created_at: string
          id: number
          is_completed: boolean
          step_order: number
          title: string
          user_action_plan_id: number
        }
        Insert: {
          completed_at?: string | null
          content?: string | null
          created_at?: string
          id?: number
          is_completed?: boolean
          step_order: number
          title: string
          user_action_plan_id: number
        }
        Update: {
          completed_at?: string | null
          content?: string | null
          created_at?: string
          id?: number
          is_completed?: boolean
          step_order?: number
          title?: string
          user_action_plan_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_custom_actions_user_action_plan"
            columns: ["user_action_plan_id"]
            isOneToOne: false
            referencedRelation: "user_action_plans"
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
            foreignKeyName: "user_goals_goal_template_id_fkey"
            columns: ["goal_template_id"]
            isOneToOne: false
            referencedRelation: "mv_family_goals"
            referencedColumns: ["goal_template_id"]
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
          confirmar_registros: boolean
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
          confirmar_registros?: boolean
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
          confirmar_registros?: boolean
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
      account_balances_timeline: {
        Row: {
          account_id: number | null
          account_name: string | null
          account_type: string | null
          balance: number | null
          cor: string | null
          icone: string | null
          month: string | null
          month_change: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagadoras_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_performance: {
        Row: {
          actual_spent: number | null
          budgeted: number | null
          category_id: number | null
          category_name: string | null
          icon_name: string | null
          month: string | null
          remaining: number | null
          status: string | null
          usage_percentage: number | null
          user_id: number | null
        }
        Relationships: []
      }
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_insights: {
        Row: {
          accounts_used: number | null
          avg_spent: number | null
          categories_used: number | null
          month: string | null
          month_over_month_change: number | null
          prev_month_spent: number | null
          total_spent: number | null
          total_transactions: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_user_summary: {
        Row: {
          month: string | null
          total_spent: number | null
          transaction_count: number | null
          user_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_family_budget_performance: {
        Row: {
          actual_spent: number | null
          budgeted: number | null
          category_id: number | null
          category_name: string | null
          familia_id: number | null
          icon_name: string | null
          id: number | null
          month: string | null
          remaining: number | null
          status: string | null
          usage_percentage: number | null
        }
        Relationships: []
      }
      mv_family_goals: {
        Row: {
          avg_progress_percentage: number | null
          earliest_target_date: string | null
          familia_id: number | null
          goal_name: string | null
          goal_template_id: number | null
          id: number | null
          latest_target_date: string | null
          members_with_goal: number | null
          total_current: number | null
          total_target: number | null
        }
        Relationships: []
      }
      spending_trends_monthly: {
        Row: {
          avg_transaction: number | null
          category_id: number | null
          category_name: string | null
          category_type: string | null
          icon_name: string | null
          max_transaction: number | null
          min_transaction: number | null
          month: string | null
          total_spent: number | null
          transaction_count: number | null
          user_id: number | null
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_valid_invite: {
        Args: { _familia_id: number; _user_id: number }
        Returns: boolean
      }
      is_family_admin: {
        Args: { _familia_id: number; _user_id: number }
        Returns: boolean
      }
      is_family_empty: {
        Args: { _familia_id: number }
        Returns: boolean
      }
      is_family_member: {
        Args: { _familia_id: number; _user_id: number }
        Returns: boolean
      }
      refresh_family_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
