-- RLS Policies para módulo de Família e Contas Pagadoras

-- ============================================
-- FAMILIAS: RLS Policies
-- ============================================

ALTER TABLE public.familias ENABLE ROW LEVEL SECURITY;

-- Membros podem ver dados da sua família
CREATE POLICY "ver_familia"
ON public.familias FOR SELECT
USING (
  id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id()
  )
);

-- Apenas responsável pode editar dados da família
CREATE POLICY "editar_familia"
ON public.familias FOR UPDATE
USING (
  id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id() 
    AND papel = 'Responsável'
  )
);

-- Qualquer usuário pode criar uma família
CREATE POLICY "criar_familia"
ON public.familias FOR INSERT
WITH CHECK (true);

-- Apenas responsável pode deletar a família
CREATE POLICY "deletar_familia"
ON public.familias FOR DELETE
USING (
  id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id() 
    AND papel = 'Responsável'
  )
);

-- ============================================
-- MEMBROS_FAMILIA: RLS Policies
-- ============================================

ALTER TABLE public.membros_familia ENABLE ROW LEVEL SECURITY;

-- Membros podem ver outros membros da sua família
CREATE POLICY "ver_membros_familia"
ON public.membros_familia FOR SELECT
USING (
  familia_id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id()
  )
);

-- Responsável pode adicionar membros
CREATE POLICY "adicionar_membro"
ON public.membros_familia FOR INSERT
WITH CHECK (
  familia_id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id() 
    AND papel = 'Responsável'
  )
  OR NOT EXISTS (
    SELECT 1 
    FROM public.membros_familia 
    WHERE familia_id = membros_familia.familia_id
  )
);

-- Responsável pode editar membros
CREATE POLICY "editar_membro"
ON public.membros_familia FOR UPDATE
USING (
  familia_id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id() 
    AND papel = 'Responsável'
  )
);

-- Responsável pode remover membros
CREATE POLICY "remover_membro"
ON public.membros_familia FOR DELETE
USING (
  familia_id IN (
    SELECT familia_id 
    FROM public.membros_familia 
    WHERE user_id = get_current_user_id() 
    AND papel = 'Responsável'
  )
);

-- ============================================
-- CONTAS_PAGADORAS: RLS Policies
-- ============================================

ALTER TABLE public.contas_pagadoras ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias contas
CREATE POLICY "ver_contas"
ON public.contas_pagadoras FOR SELECT
USING (user_id = get_current_user_id());

-- Usuários podem criar suas próprias contas
CREATE POLICY "criar_conta"
ON public.contas_pagadoras FOR INSERT
WITH CHECK (user_id = get_current_user_id());

-- Usuários podem editar suas próprias contas
CREATE POLICY "editar_conta"
ON public.contas_pagadoras FOR UPDATE
USING (user_id = get_current_user_id());

-- Usuários podem deletar suas próprias contas
CREATE POLICY "deletar_conta"
ON public.contas_pagadoras FOR DELETE
USING (user_id = get_current_user_id());

-- ============================================
-- Adicionar campos faltantes em contas_pagadoras
-- ============================================

-- Adicionar campos de personalização visual se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contas_pagadoras' AND column_name = 'icone') THEN
    ALTER TABLE public.contas_pagadoras ADD COLUMN icone TEXT DEFAULT 'wallet';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contas_pagadoras' AND column_name = 'cor') THEN
    ALTER TABLE public.contas_pagadoras ADD COLUMN cor TEXT DEFAULT '#6366F1';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contas_pagadoras' AND column_name = 'is_active') THEN
    ALTER TABLE public.contas_pagadoras ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;