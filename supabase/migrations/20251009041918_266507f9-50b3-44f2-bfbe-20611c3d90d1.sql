-- Recriar a view materializada mv_family_budget_performance
DROP MATERIALIZED VIEW IF EXISTS mv_family_budget_performance CASCADE;

CREATE MATERIALIZED VIEW mv_family_budget_performance AS
WITH family_budgets AS (
  SELECT 
    f.id as familia_id,
    DATE_TRUNC('month', o.mes_ano)::date as month,
    c.id as category_id,
    c.name as category_name,
    c.icon_name,
    SUM(o.valor_orcado) as budgeted
  FROM familias f
  JOIN membros_familia mf ON mf.familia_id = f.id
  JOIN orcamentos o ON o.user_id = mf.user_id
  JOIN categories c ON c.id = o.category_id
  GROUP BY f.id, DATE_TRUNC('month', o.mes_ano)::date, c.id, c.name, c.icon_name
),
family_spending AS (
  SELECT 
    mf.familia_id,
    DATE_TRUNC('month', t.transaction_date)::date as month,
    t.category_id,
    SUM(ABS(t.amount)) as actual_spent
  FROM transactions t
  JOIN membros_familia mf ON mf.user_id = t.user_id
  JOIN categories c ON c.id = t.category_id
  WHERE c.tipo != 'Receita'
  GROUP BY mf.familia_id, DATE_TRUNC('month', t.transaction_date)::date, t.category_id
)
SELECT 
  ROW_NUMBER() OVER (ORDER BY fb.familia_id, fb.month, fb.category_id) as id,
  fb.familia_id,
  fb.month,
  fb.category_id,
  fb.category_name,
  fb.icon_name,
  fb.budgeted,
  COALESCE(fs.actual_spent, 0) as actual_spent,
  CASE 
    WHEN fb.budgeted > 0 THEN (COALESCE(fs.actual_spent, 0) / fb.budgeted) * 100
    ELSE 0
  END as usage_percentage,
  fb.budgeted - COALESCE(fs.actual_spent, 0) as remaining,
  CASE 
    WHEN COALESCE(fs.actual_spent, 0) / NULLIF(fb.budgeted, 0) > 1.0 THEN 'over_budget'
    WHEN COALESCE(fs.actual_spent, 0) / NULLIF(fb.budgeted, 0) > 0.85 THEN 'warning'
    ELSE 'healthy'
  END as status
FROM family_budgets fb
LEFT JOIN family_spending fs ON 
  fs.familia_id = fb.familia_id 
  AND fs.month = fb.month 
  AND fs.category_id = fb.category_id;

CREATE UNIQUE INDEX idx_mv_family_budget_unique ON mv_family_budget_performance(id);
CREATE INDEX idx_mv_family_budget_familia_month ON mv_family_budget_performance(familia_id, month);

-- Função para refresh automático da view
CREATE OR REPLACE FUNCTION refresh_family_budget_performance()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_family_budget_performance;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers para refresh automático
CREATE TRIGGER trigger_refresh_budget_on_orcamentos
AFTER INSERT OR UPDATE OR DELETE ON orcamentos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_family_budget_performance();

CREATE TRIGGER trigger_refresh_budget_on_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_family_budget_performance();