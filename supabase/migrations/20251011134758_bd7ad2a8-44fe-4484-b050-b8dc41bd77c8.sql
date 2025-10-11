-- Criar view para agregação de gastos por categoria PAI
CREATE VIEW spending_trends_by_parent_category
WITH (security_invoker = true)
AS
WITH category_hierarchy AS (
  SELECT
    c.id as category_id,
    COALESCE(parent.id, c.id) as root_category_id,
    COALESCE(parent.name, c.name) as root_category_name,
    COALESCE(parent.icon_name, c.icon_name) as root_icon_name,
    COALESCE(parent.tipo, c.tipo) as root_category_type
  FROM categories c
  LEFT JOIN categories parent ON c.parent_category_id = parent.id
  WHERE c.tipo = 'Saída' OR parent.tipo = 'Saída'
)
SELECT
  DATE_TRUNC('month', t.transaction_date)::timestamp with time zone AS month,
  t.user_id,
  ch.root_category_id as category_id,
  ch.root_category_name as category_name,
  ch.root_icon_name as icon_name,
  ch.root_category_type as category_type,
  SUM(t.amount) AS total_spent,
  COUNT(*) AS transaction_count,
  AVG(t.amount) AS avg_transaction,
  MIN(t.amount) AS min_transaction,
  MAX(t.amount) AS max_transaction
FROM transactions t
JOIN category_hierarchy ch ON t.category_id = ch.category_id
WHERE t.amount > 0 AND t.tipo = 'Saída'
GROUP BY
  DATE_TRUNC('month', t.transaction_date),
  t.user_id,
  ch.root_category_id,
  ch.root_category_name,
  ch.root_icon_name,
  ch.root_category_type;