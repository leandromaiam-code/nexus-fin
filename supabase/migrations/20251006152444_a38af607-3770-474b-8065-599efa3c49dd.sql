-- View 1: Tendências de gastos mensais por categoria
CREATE OR REPLACE VIEW spending_trends_monthly AS
SELECT 
  u.id as user_id,
  DATE_TRUNC('month', t.transaction_date) as month,
  c.id as category_id,
  c.name as category_name,
  c.icon_name,
  COUNT(t.id) as transaction_count,
  SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END) as total_spent,
  AVG(CASE WHEN t.amount > 0 THEN t.amount ELSE NULL END) as avg_transaction,
  MAX(t.amount) as max_transaction,
  MIN(CASE WHEN t.amount > 0 THEN t.amount ELSE NULL END) as min_transaction
FROM users u
LEFT JOIN transactions t ON t.user_id = u.id
LEFT JOIN categories c ON c.id = t.category_id
WHERE t.amount > 0
GROUP BY u.id, DATE_TRUNC('month', t.transaction_date), c.id, c.name, c.icon_name
ORDER BY month DESC, total_spent DESC;

-- View 2: Performance de orçamento vs. realizado
CREATE OR REPLACE VIEW budget_performance AS
SELECT 
  o.user_id,
  o.mes_ano as month,
  o.category_id,
  c.name as category_name,
  c.icon_name,
  o.valor_orcado as budgeted,
  COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as actual_spent,
  o.valor_orcado - COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) as remaining,
  CASE 
    WHEN o.valor_orcado > 0 THEN 
      (COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) / o.valor_orcado * 100)
    ELSE 0 
  END as usage_percentage,
  CASE
    WHEN COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) > o.valor_orcado THEN 'over_budget'
    WHEN COALESCE(SUM(CASE WHEN t.amount > 0 THEN t.amount ELSE 0 END), 0) > (o.valor_orcado * 0.8) THEN 'warning'
    ELSE 'healthy'
  END as status
FROM orcamentos o
LEFT JOIN categories c ON c.id = o.category_id
LEFT JOIN transactions t ON t.category_id = o.category_id 
  AND DATE_TRUNC('month', t.transaction_date) = o.mes_ano
  AND t.user_id = o.user_id
GROUP BY o.user_id, o.mes_ano, o.category_id, c.name, c.icon_name, o.valor_orcado;

-- View 3: Evolução do saldo das contas ao longo do tempo
CREATE OR REPLACE VIEW account_balances_timeline AS
WITH monthly_data AS (
  SELECT 
    cp.id as account_id,
    cp.user_id,
    cp.nome as account_name,
    cp.tipo as account_type,
    cp.icone,
    cp.cor,
    cp.saldo_inicial,
    DATE_TRUNC('month', t.transaction_date) as month,
    SUM(t.amount) as monthly_change
  FROM contas_pagadoras cp
  LEFT JOIN transactions t ON t.conta_pagadora_id = cp.id
  WHERE cp.is_active = true
  GROUP BY cp.id, cp.user_id, cp.nome, cp.tipo, cp.icone, cp.cor, cp.saldo_inicial, DATE_TRUNC('month', t.transaction_date)
)
SELECT 
  account_id,
  user_id,
  account_name,
  account_type,
  icone,
  cor,
  month,
  saldo_inicial + COALESCE(SUM(monthly_change) OVER (PARTITION BY account_id ORDER BY month), 0) as balance,
  COALESCE(monthly_change, 0) as month_change
FROM monthly_data
WHERE month IS NOT NULL
ORDER BY account_id, month DESC;

-- View 4: Insights automáticos sobre padrões de gastos
CREATE OR REPLACE VIEW expense_insights AS
WITH user_stats AS (
  SELECT 
    user_id,
    DATE_TRUNC('month', transaction_date) as month,
    COUNT(*) as total_transactions,
    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_spent,
    AVG(CASE WHEN amount > 0 THEN amount ELSE NULL END) as avg_spent,
    COUNT(DISTINCT category_id) as categories_used,
    COUNT(DISTINCT conta_pagadora_id) as accounts_used
  FROM transactions
  GROUP BY user_id, DATE_TRUNC('month', transaction_date)
),
previous_month AS (
  SELECT 
    user_id,
    month,
    LAG(total_spent) OVER (PARTITION BY user_id ORDER BY month) as prev_month_spent
  FROM user_stats
)
SELECT 
  us.user_id,
  us.month,
  us.total_transactions,
  us.total_spent,
  us.avg_spent,
  us.categories_used,
  us.accounts_used,
  pm.prev_month_spent,
  CASE 
    WHEN pm.prev_month_spent > 0 THEN 
      ((us.total_spent - pm.prev_month_spent) / pm.prev_month_spent * 100)
    ELSE NULL 
  END as month_over_month_change
FROM user_stats us
LEFT JOIN previous_month pm ON pm.user_id = us.user_id AND pm.month = us.month
ORDER BY us.month DESC;

-- Habilitar RLS nas views
ALTER VIEW spending_trends_monthly SET (security_invoker = on);
ALTER VIEW budget_performance SET (security_invoker = on);
ALTER VIEW account_balances_timeline SET (security_invoker = on);
ALTER VIEW expense_insights SET (security_invoker = on);