-- Corrigir datas inválidas com formato 202025-XX-XX
-- Substitui 202025 por 2025 em todas as transações afetadas
UPDATE transactions
SET transaction_date = REPLACE(transaction_date::text, '202025', '2025')::date
WHERE transaction_date::text LIKE '202025%';