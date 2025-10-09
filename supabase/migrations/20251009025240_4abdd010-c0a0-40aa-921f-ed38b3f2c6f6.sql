-- =====================================================
-- CORREÇÃO: Separar Entradas e Saídas corretamente
-- =====================================================

-- 1. Recriar view monthly_summaries com JOIN em categories
DROP VIEW IF EXISTS monthly_summaries CASCADE;
CREATE VIEW monthly_summaries AS
SELECT 
  u.id AS user_id,
  DATE_TRUNC('month', t.transaction_date)::date AS month,
  u.renda_base_amount,
  -- SOMA APENAS SAÍDAS (despesas)
  COALESCE(SUM(CASE WHEN c.tipo = 'Saída' THEN t.amount ELSE 0 END), 0) AS total_spent,
  -- SOMA APENAS ENTRADAS (receitas)
  COALESCE(SUM(CASE WHEN c.tipo = 'Entrada' THEN t.amount ELSE 0 END), 0) AS total_income,
  -- BALANÇO = Entradas - Saídas
  COALESCE(
    SUM(CASE WHEN c.tipo = 'Entrada' THEN t.amount WHEN c.tipo = 'Saída' THEN -t.amount ELSE 0 END), 
    0
  ) AS balance
FROM transactions t
JOIN users u ON t.user_id = u.id
JOIN categories c ON c.id = t.category_id
WHERE t.amount > 0
GROUP BY u.id, DATE_TRUNC('month', t.transaction_date)::date, u.renda_base_amount
ORDER BY u.id, DATE_TRUNC('month', t.transaction_date)::date DESC;

-- 2. Recriar mv_individual_dashboard com total_income
DROP MATERIALIZED VIEW IF EXISTS mv_individual_dashboard CASCADE;
CREATE MATERIALIZED VIEW mv_individual_dashboard AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.financial_archetype,
  ms.month,
  COALESCE(ms.renda_base_amount, u.renda_base_amount, 0) as renda,
  COALESCE(ms.total_spent, 0) as total_spent,
  COALESCE(ms.total_income, 0) as total_income,
  COALESCE(ms.balance, 0) as balance,
  (
    SELECT COUNT(*)
    FROM user_goals ug
    WHERE ug.user_id = u.id
      AND ug.status = 'active'
  ) as active_goals_count,
  (
    SELECT json_build_object(
      'id', ug.id,
      'custom_name', ug.custom_name,
      'target_amount', ug.target_amount,
      'current_amount', ug.current_amount,
      'target_date', ug.target_date,
      'goal_template', json_build_object(
        'id', gt.id,
        'name', gt.name,
        'description', gt.description
      )
    )
    FROM user_goals ug
    LEFT JOIN goal_templates gt ON gt.id = ug.goal_template_id
    WHERE ug.user_id = u.id
      AND ug.is_primary = true
      AND ug.status = 'active'
    LIMIT 1
  ) as primary_goal
FROM users u
LEFT JOIN monthly_summaries ms ON ms.user_id = u.id 
  AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY u.id;

CREATE UNIQUE INDEX idx_mv_individual_dashboard_user_id ON mv_individual_dashboard(user_id);

-- 3. Recriar mv_family_dashboard com total_income
DROP MATERIALIZED VIEW IF EXISTS mv_family_dashboard CASCADE;
CREATE MATERIALIZED VIEW mv_family_dashboard AS
SELECT 
  f.id as familia_id,
  f.nome_familia,
  f.responsavel_user_id,
  (
    SELECT COUNT(*)
    FROM membros_familia mf
    WHERE mf.familia_id = f.id
  ) as total_members,
  (
    SELECT SUM(COALESCE(ms.total_spent, 0))
    FROM membros_familia mf2
    LEFT JOIN monthly_summaries ms ON ms.user_id = mf2.user_id
      AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE mf2.familia_id = f.id
  ) as total_spent,
  (
    SELECT SUM(COALESCE(ms.total_income, 0))
    FROM membros_familia mf2
    LEFT JOIN monthly_summaries ms ON ms.user_id = mf2.user_id
      AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE mf2.familia_id = f.id
  ) as total_income,
  (
    SELECT SUM(COALESCE(ms.balance, 0))
    FROM membros_familia mf2
    LEFT JOIN monthly_summaries ms ON ms.user_id = mf2.user_id
      AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE mf2.familia_id = f.id
  ) as balance,
  (
    SELECT COUNT(*)
    FROM membros_familia mf3
    JOIN user_goals ug ON ug.user_id = mf3.user_id
    WHERE mf3.familia_id = f.id
      AND ug.status = 'active'
  ) as active_goals_count
FROM familias f
ORDER BY f.id;

CREATE UNIQUE INDEX idx_mv_family_dashboard_familia_id ON mv_family_dashboard(familia_id);

-- 4. Recriar budget_performance com filtro por tipo
DROP VIEW IF EXISTS budget_performance CASCADE;
CREATE VIEW budget_performance AS
SELECT 
  o.user_id,
  o.mes_ano AS month,
  o.category_id,
  cat.name AS category_name,
  cat.icon_name,
  o.valor_orcado AS budgeted,
  COALESCE(SUM(t.amount), 0) AS actual_spent,
  o.valor_orcado - COALESCE(SUM(t.amount), 0) AS remaining,
  CASE 
    WHEN o.valor_orcado > 0 THEN 
      ROUND((COALESCE(SUM(t.amount), 0) / o.valor_orcado * 100)::numeric, 2)
    ELSE 0
  END AS usage_percentage,
  CASE 
    WHEN COALESCE(SUM(t.amount), 0) > o.valor_orcado THEN 'over'
    WHEN COALESCE(SUM(t.amount), 0) > o.valor_orcado * 0.8 THEN 'warning'
    ELSE 'good'
  END AS status
FROM orcamentos o
JOIN categories cat ON cat.id = o.category_id
LEFT JOIN transactions t ON t.category_id = o.category_id 
  AND t.user_id = o.user_id
  AND DATE_TRUNC('month', t.transaction_date)::date = o.mes_ano
  AND t.amount > 0
LEFT JOIN categories c ON c.id = t.category_id
WHERE cat.tipo = 'Saída'
  AND (c.tipo = 'Saída' OR c.tipo IS NULL)
GROUP BY o.user_id, o.mes_ano, o.category_id, cat.name, cat.icon_name, o.valor_orcado
ORDER BY o.user_id, o.mes_ano DESC, cat.name;

-- 5. Atualizar função refresh_family_views
CREATE OR REPLACE FUNCTION public.refresh_family_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_individual_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_family_dashboard;
END;
$function$;

-- 6. Refresh inicial
REFRESH MATERIALIZED VIEW mv_individual_dashboard;
REFRESH MATERIALIZED VIEW mv_family_dashboard;