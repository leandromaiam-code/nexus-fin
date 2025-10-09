-- ==========================================
-- FASE 1: CRIAÇÃO DAS MATERIALIZED VIEWS
-- ==========================================

-- 1. VIEW: Dashboard Individual (aprimorada)
DROP MATERIALIZED VIEW IF EXISTS mv_individual_dashboard CASCADE;
CREATE MATERIALIZED VIEW mv_individual_dashboard AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.financial_archetype,
  ms.month,
  COALESCE(ms.renda_base_amount, u.renda_base_amount, 0) as renda,
  COALESCE(ms.total_spent, 0) as total_spent,
  COALESCE(ms.balance, 0) as balance,
  (
    SELECT COUNT(DISTINCT t.id)
    FROM transactions t
    WHERE t.user_id = u.id
      AND DATE_TRUNC('month', t.transaction_date) = ms.month
  ) as transaction_count,
  (
    SELECT COUNT(DISTINCT cp.id)
    FROM contas_pagadoras cp
    WHERE cp.user_id = u.id AND cp.is_active = true
  ) as active_accounts,
  (
    SELECT COUNT(DISTINCT ug.id)
    FROM user_goals ug
    WHERE ug.user_id = u.id AND ug.status = 'active'
  ) as active_goals
FROM users u
CROSS JOIN LATERAL (
  SELECT month, renda_base_amount, total_spent, balance
  FROM monthly_summaries
  WHERE user_id = u.id
  ORDER BY month DESC
  LIMIT 1
) ms;

CREATE UNIQUE INDEX idx_mv_individual_dashboard_user_month ON mv_individual_dashboard(user_id, month);

-- 2. VIEW: Dashboard Família (NOVA)
DROP MATERIALIZED VIEW IF EXISTS mv_family_dashboard CASCADE;
CREATE MATERIALIZED VIEW mv_family_dashboard AS
SELECT 
  f.id as familia_id,
  f.nome_familia,
  DATE_TRUNC('month', CURRENT_DATE) as month,
  COUNT(DISTINCT mf.id) as total_members,
  SUM(COALESCE(mf.cota_mensal, 0)) as total_quota,
  (
    SELECT SUM(COALESCE(ms.total_spent, 0))
    FROM membros_familia mf2
    JOIN monthly_summaries ms ON ms.user_id = mf2.user_id
    WHERE mf2.familia_id = f.id
      AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
  ) as total_spent,
  (
    SELECT SUM(COALESCE(ms.renda_base_amount, u.renda_base_amount, 0))
    FROM membros_familia mf2
    JOIN users u ON u.id = mf2.user_id
    LEFT JOIN monthly_summaries ms ON ms.user_id = mf2.user_id 
      AND ms.month = DATE_TRUNC('month', CURRENT_DATE)
    WHERE mf2.familia_id = f.id
  ) as total_income,
  (
    SELECT COUNT(DISTINCT t.id)
    FROM membros_familia mf2
    JOIN transactions t ON t.user_id = mf2.user_id
    WHERE mf2.familia_id = f.id
      AND DATE_TRUNC('month', t.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
  ) as total_transactions,
  (
    SELECT COUNT(DISTINCT ug.id)
    FROM membros_familia mf2
    JOIN user_goals ug ON ug.user_id = mf2.user_id
    WHERE mf2.familia_id = f.id
      AND ug.status = 'active'
  ) as total_active_goals
FROM familias f
LEFT JOIN membros_familia mf ON mf.familia_id = f.id
GROUP BY f.id, f.nome_familia;

CREATE UNIQUE INDEX idx_mv_family_dashboard_familia ON mv_family_dashboard(familia_id);

-- 3. VIEW: Orçamento Familiar (NOVA)
DROP MATERIALIZED VIEW IF EXISTS mv_family_budget_performance CASCADE;
CREATE MATERIALIZED VIEW mv_family_budget_performance AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY f.id, o.mes_ano, c.id) as id,
  f.id as familia_id,
  o.mes_ano as month,
  c.id as category_id,
  c.name as category_name,
  c.icon_name,
  SUM(o.valor_orcado) as budgeted,
  (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM membros_familia mf2
    JOIN transactions t ON t.user_id = mf2.user_id
    WHERE mf2.familia_id = f.id
      AND t.category_id = c.id
      AND DATE_TRUNC('month', t.transaction_date) = o.mes_ano
  ) as actual_spent,
  CASE 
    WHEN SUM(o.valor_orcado) > 0 THEN
      ((
        SELECT COALESCE(SUM(t.amount), 0)
        FROM membros_familia mf2
        JOIN transactions t ON t.user_id = mf2.user_id
        WHERE mf2.familia_id = f.id
          AND t.category_id = c.id
          AND DATE_TRUNC('month', t.transaction_date) = o.mes_ano
      ) / SUM(o.valor_orcado)) * 100
    ELSE 0
  END as usage_percentage,
  SUM(o.valor_orcado) - (
    SELECT COALESCE(SUM(t.amount), 0)
    FROM membros_familia mf2
    JOIN transactions t ON t.user_id = mf2.user_id
    WHERE mf2.familia_id = f.id
      AND t.category_id = c.id
      AND DATE_TRUNC('month', t.transaction_date) = o.mes_ano
  ) as remaining
FROM familias f
JOIN membros_familia mf ON mf.familia_id = f.id
JOIN orcamentos o ON o.familia_id = f.id
JOIN categories c ON c.id = o.category_id
GROUP BY f.id, o.mes_ano, c.id, c.name, c.icon_name;

CREATE UNIQUE INDEX idx_mv_family_budget_unique ON mv_family_budget_performance(id);
CREATE INDEX idx_mv_family_budget_familia_month ON mv_family_budget_performance(familia_id, month);

-- 4. VIEW: Metas Familiares (NOVA)
DROP MATERIALIZED VIEW IF EXISTS mv_family_goals CASCADE;
CREATE MATERIALIZED VIEW mv_family_goals AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY f.id, gt.id) as id,
  f.id as familia_id,
  gt.id as goal_template_id,
  gt.name as goal_name,
  COUNT(DISTINCT ug.id) as members_with_goal,
  SUM(COALESCE(ug.target_amount, 0)) as total_target,
  SUM(COALESCE(ug.current_amount, 0)) as total_current,
  AVG(
    CASE 
      WHEN ug.target_amount > 0 THEN (ug.current_amount / ug.target_amount) * 100
      ELSE 0
    END
  ) as avg_progress_percentage,
  MIN(ug.target_date) as earliest_target_date,
  MAX(ug.target_date) as latest_target_date
FROM familias f
JOIN membros_familia mf ON mf.familia_id = f.id
JOIN user_goals ug ON ug.user_id = mf.user_id
LEFT JOIN goal_templates gt ON gt.id = ug.goal_template_id
WHERE ug.status = 'active'
GROUP BY f.id, gt.id, gt.name;

CREATE UNIQUE INDEX idx_mv_family_goals_unique ON mv_family_goals(id);
CREATE INDEX idx_mv_family_goals_familia ON mv_family_goals(familia_id);

-- ==========================================
-- FASE 2: FUNÇÃO DE REFRESH AUTOMÁTICO
-- ==========================================

CREATE OR REPLACE FUNCTION refresh_family_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_individual_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_family_dashboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_family_budget_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_family_goals;
END;
$$;

-- ==========================================
-- FASE 3: TRIGGERS PARA AUTO-REFRESH
-- ==========================================

CREATE OR REPLACE FUNCTION trigger_refresh_family_views()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM refresh_family_views();
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS refresh_views_on_transaction ON transactions;
CREATE TRIGGER refresh_views_on_transaction
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_family_views();

DROP TRIGGER IF EXISTS refresh_views_on_budget ON orcamentos;
CREATE TRIGGER refresh_views_on_budget
AFTER INSERT OR UPDATE OR DELETE ON orcamentos
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_family_views();

-- Refresh inicial
SELECT refresh_family_views();