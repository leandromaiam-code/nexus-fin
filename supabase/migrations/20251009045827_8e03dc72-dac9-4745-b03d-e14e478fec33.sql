-- Drop e recriar view budget_performance para filtrar apenas categorias de Saída
DROP VIEW IF EXISTS budget_performance CASCADE;

CREATE VIEW budget_performance AS
WITH user_spending AS (
  SELECT 
    t.user_id,
    DATE_TRUNC('month', t.transaction_date)::date as month,
    t.category_id,
    SUM(ABS(t.amount)) as actual_spent
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  WHERE c.tipo::text = 'Saída'::text
  GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date)::date, t.category_id
)
SELECT 
  o.user_id,
  o.mes_ano as month,
  o.category_id,
  c.name as category_name,
  c.icon_name,
  o.valor_orcado as budgeted,
  COALESCE(us.actual_spent, 0) as actual_spent,
  o.valor_orcado - COALESCE(us.actual_spent, 0) as remaining,
  CASE 
    WHEN o.valor_orcado > 0 THEN ROUND((COALESCE(us.actual_spent, 0) / o.valor_orcado * 100)::numeric, 2)
    ELSE 0
  END as usage_percentage,
  CASE
    WHEN o.valor_orcado = 0 THEN 'no_budget'
    WHEN COALESCE(us.actual_spent, 0) > o.valor_orcado THEN 'over_budget'
    WHEN COALESCE(us.actual_spent, 0) > (o.valor_orcado * 0.8) THEN 'warning'
    ELSE 'healthy'
  END as status
FROM orcamentos o
JOIN categories c ON c.id = o.category_id
LEFT JOIN user_spending us ON 
  us.user_id = o.user_id 
  AND us.month = o.mes_ano 
  AND us.category_id = o.category_id
WHERE o.familia_id IS NULL;

-- Drop e recriar materialized view mv_family_budget_performance para filtrar apenas categorias de Saída
DROP MATERIALIZED VIEW IF EXISTS mv_family_budget_performance CASCADE;

CREATE MATERIALIZED VIEW mv_family_budget_performance AS
WITH family_spending AS (
  SELECT 
    mf.familia_id,
    DATE_TRUNC('month', t.transaction_date)::date as month,
    t.category_id,
    SUM(ABS(t.amount)) as actual_spent
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  JOIN membros_familia mf ON mf.user_id = t.user_id
  WHERE c.tipo::text = 'Saída'::text
  GROUP BY mf.familia_id, DATE_TRUNC('month', t.transaction_date)::date, t.category_id
)
SELECT 
  o.familia_id,
  o.mes_ano as month,
  o.category_id,
  c.name as category_name,
  c.icon_name,
  o.valor_orcado as budgeted,
  COALESCE(fs.actual_spent, 0) as actual_spent,
  o.valor_orcado - COALESCE(fs.actual_spent, 0) as remaining,
  CASE 
    WHEN o.valor_orcado > 0 THEN ROUND((COALESCE(fs.actual_spent, 0) / o.valor_orcado * 100)::numeric, 2)
    ELSE 0
  END as usage_percentage,
  CASE
    WHEN o.valor_orcado = 0 THEN 'no_budget'
    WHEN COALESCE(fs.actual_spent, 0) > o.valor_orcado THEN 'over_budget'
    WHEN COALESCE(fs.actual_spent, 0) > (o.valor_orcado * 0.8) THEN 'warning'
    ELSE 'healthy'
  END as status
FROM orcamentos o
JOIN categories c ON c.id = o.category_id
LEFT JOIN family_spending fs ON 
  fs.familia_id = o.familia_id 
  AND fs.month = o.mes_ano 
  AND fs.category_id = o.category_id
WHERE o.familia_id IS NOT NULL;

-- Criar índice para melhor performance
CREATE UNIQUE INDEX IF NOT EXISTS mv_family_budget_performance_idx 
ON mv_family_budget_performance (familia_id, month, category_id);