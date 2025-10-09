-- FASE 1: Corrigir budget_performance para incluir TODAS as categorias com gastos
DROP VIEW IF EXISTS budget_performance CASCADE;

CREATE VIEW budget_performance AS
WITH user_budgets AS (
  SELECT 
    o.user_id,
    DATE_TRUNC('month', o.mes_ano)::date as month,
    c.id as category_id,
    c.name as category_name,
    c.icon_name,
    o.valor_orcado as budgeted
  FROM orcamentos o
  JOIN categories c ON c.id = o.category_id
),
user_spending AS (
  SELECT 
    t.user_id,
    DATE_TRUNC('month', t.transaction_date)::date as month,
    t.category_id,
    c.name as category_name,
    c.icon_name,
    SUM(ABS(t.amount)) as actual_spent
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  WHERE c.tipo != 'Receita'
  GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date)::date, t.category_id, c.name, c.icon_name
)
SELECT 
  COALESCE(ub.user_id, us.user_id) as user_id,
  COALESCE(ub.month, us.month) as month,
  COALESCE(ub.category_id, us.category_id) as category_id,
  COALESCE(ub.category_name, us.category_name) as category_name,
  COALESCE(ub.icon_name, us.icon_name) as icon_name,
  COALESCE(ub.budgeted, 0) as budgeted,
  COALESCE(us.actual_spent, 0) as actual_spent,
  CASE 
    WHEN COALESCE(ub.budgeted, 0) > 0 THEN (COALESCE(us.actual_spent, 0) / ub.budgeted) * 100
    ELSE 0
  END as usage_percentage,
  COALESCE(ub.budgeted, 0) - COALESCE(us.actual_spent, 0) as remaining,
  CASE 
    WHEN COALESCE(ub.budgeted, 0) = 0 THEN 'no_budget'
    WHEN COALESCE(us.actual_spent, 0) / NULLIF(ub.budgeted, 0) > 1.0 THEN 'over_budget'
    WHEN COALESCE(us.actual_spent, 0) / NULLIF(ub.budgeted, 0) > 0.85 THEN 'warning'
    ELSE 'healthy'
  END as status
FROM user_budgets ub
FULL OUTER JOIN user_spending us ON 
  us.user_id = ub.user_id 
  AND us.month = ub.month 
  AND us.category_id = ub.category_id;

-- FASE 2: Converter monthly_summaries de VIEW para TABLE
DROP VIEW IF EXISTS monthly_summaries CASCADE;

CREATE TABLE IF NOT EXISTS monthly_summaries (
  user_id bigint NOT NULL,
  month date NOT NULL,
  total_income numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  balance numeric DEFAULT 0,
  renda_base_amount numeric DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

-- FASE 3: Popular monthly_summaries com dados históricos
INSERT INTO monthly_summaries (user_id, month, total_income, total_spent, balance, renda_base_amount)
SELECT 
  t.user_id,
  DATE_TRUNC('month', t.transaction_date)::date as month,
  COALESCE(SUM(CASE WHEN c.tipo = 'Receita' THEN t.amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN c.tipo != 'Receita' THEN ABS(t.amount) ELSE 0 END), 0) as total_spent,
  COALESCE(SUM(CASE WHEN c.tipo = 'Receita' THEN t.amount ELSE -ABS(t.amount) END), 0) as balance,
  COALESCE(MAX(u.renda_base_amount), 0) as renda_base_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
JOIN users u ON u.id = t.user_id
GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date)::date
ON CONFLICT (user_id, month) DO UPDATE SET
  total_income = EXCLUDED.total_income,
  total_spent = EXCLUDED.total_spent,
  balance = EXCLUDED.balance,
  renda_base_amount = EXCLUDED.renda_base_amount;

-- FASE 4: Criar sistema de atualização automática
CREATE OR REPLACE FUNCTION refresh_monthly_summaries()
RETURNS TRIGGER AS $$
DECLARE
  affected_user_id bigint;
  affected_month date;
BEGIN
  affected_user_id := COALESCE(NEW.user_id, OLD.user_id);
  affected_month := DATE_TRUNC('month', COALESCE(NEW.transaction_date, OLD.transaction_date))::date;
  
  DELETE FROM monthly_summaries 
  WHERE user_id = affected_user_id AND month = affected_month;
  
  INSERT INTO monthly_summaries (user_id, month, total_income, total_spent, balance, renda_base_amount)
  SELECT 
    t.user_id,
    DATE_TRUNC('month', t.transaction_date)::date as month,
    COALESCE(SUM(CASE WHEN c.tipo = 'Receita' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN c.tipo != 'Receita' THEN ABS(t.amount) ELSE 0 END), 0) as total_spent,
    COALESCE(SUM(CASE WHEN c.tipo = 'Receita' THEN t.amount ELSE -ABS(t.amount) END), 0) as balance,
    COALESCE(MAX(u.renda_base_amount), 0) as renda_base_amount
  FROM transactions t
  JOIN categories c ON c.id = t.category_id
  JOIN users u ON u.id = t.user_id
  WHERE t.user_id = affected_user_id
    AND DATE_TRUNC('month', t.transaction_date)::date = affected_month
  GROUP BY t.user_id, DATE_TRUNC('month', t.transaction_date)::date;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_refresh_monthly_summaries ON transactions;
CREATE TRIGGER trigger_refresh_monthly_summaries
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION refresh_monthly_summaries();