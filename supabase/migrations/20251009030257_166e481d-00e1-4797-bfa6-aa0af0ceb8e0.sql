-- Recriar view spending_trends_monthly com category_type
DROP VIEW IF EXISTS spending_trends_monthly;

CREATE VIEW spending_trends_monthly AS
SELECT
  DATE_TRUNC('month', t.transaction_date) AS month,
  t.user_id,
  t.category_id,
  c.name AS category_name,
  c.icon_name,
  c.tipo AS category_type,
  SUM(t.amount) AS total_spent,
  COUNT(*) AS transaction_count,
  AVG(t.amount) AS avg_transaction,
  MIN(t.amount) AS min_transaction,
  MAX(t.amount) AS max_transaction
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE c.tipo = 'Saída' AND t.amount > 0
GROUP BY DATE_TRUNC('month', t.transaction_date), t.user_id, t.category_id, c.name, c.icon_name, c.tipo;