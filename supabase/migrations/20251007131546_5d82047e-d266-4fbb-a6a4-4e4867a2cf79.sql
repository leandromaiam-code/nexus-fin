-- Corrigir datas futuras (2026 → 2025)
UPDATE transactions
SET transaction_date = (transaction_date - INTERVAL '1 year')::date
WHERE transaction_date >= '2026-01-01';