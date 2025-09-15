-- Limpar registros duplicados de user_action_plans
-- Manter apenas o registro mais recente para cada user_goal_id

DELETE FROM user_action_plans 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_goal_id) id
  FROM user_action_plans
  ORDER BY user_goal_id, started_at DESC
);