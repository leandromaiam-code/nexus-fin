-- Create sequence for the table first
CREATE SEQUENCE user_custom_actions_id_seq;

-- Create table for user custom actions
CREATE TABLE public.user_custom_actions (
  id BIGINT NOT NULL DEFAULT nextval('user_custom_actions_id_seq'::regclass) PRIMARY KEY,
  user_action_plan_id BIGINT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  step_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.user_custom_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - users can only manage custom actions for their own action plans
CREATE POLICY "Usuários podem gerenciar apenas suas próprias ações personalizadas"
ON public.user_custom_actions
FOR ALL
USING (
  user_action_plan_id IN (
    SELECT user_action_plans.id 
    FROM user_action_plans 
    WHERE user_action_plans.user_id = get_current_user_id()
  )
)
WITH CHECK (
  user_action_plan_id IN (
    SELECT user_action_plans.id 
    FROM user_action_plans 
    WHERE user_action_plans.user_id = get_current_user_id()
  )
);

-- Add foreign key constraint
ALTER TABLE public.user_custom_actions 
ADD CONSTRAINT fk_user_custom_actions_user_action_plan 
FOREIGN KEY (user_action_plan_id) 
REFERENCES public.user_action_plans(id) 
ON DELETE CASCADE;