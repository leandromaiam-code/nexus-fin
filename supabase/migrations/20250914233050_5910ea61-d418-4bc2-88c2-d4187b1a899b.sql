-- Enable RLS on tables that are missing it
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memoria_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_steps ENABLE ROW LEVEL SECURITY;

-- Create basic policies for system tables (allow read access)
CREATE POLICY "action_plans_read_all" ON public.action_plans FOR SELECT USING (true);
CREATE POLICY "goal_templates_read_all" ON public.goal_templates FOR SELECT USING (true);
CREATE POLICY "plan_steps_read_all" ON public.plan_steps FOR SELECT USING (true);
CREATE POLICY "diagnostic_questions_read_all" ON public.diagnostic_questions FOR SELECT USING (true);

-- Admin-only policies for system management tables
CREATE POLICY "agent_prompts_admin_only" ON public.agent_prompts FOR ALL USING (false);
CREATE POLICY "memoria_conversas_admin_only" ON public.memoria_conversas FOR ALL USING (false);