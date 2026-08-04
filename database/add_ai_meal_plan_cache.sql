-- =====================================================
-- AI MEAL PLAN CACHE TABLE
-- =====================================================
-- Esta tabela armazena cache das respostas da IA para evitar
-- chamadas desnecessárias e melhorar a performance

CREATE TABLE public.ai_meal_plan_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_hash TEXT NOT NULL UNIQUE,
  request_data JSONB NOT NULL,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ai_meal_plan_cache_request_hash ON public.ai_meal_plan_cache(request_hash);
CREATE INDEX idx_ai_meal_plan_cache_expires_at ON public.ai_meal_plan_cache(expires_at);

-- RLS (Row Level Security) - não é necessário pois não há dados sensíveis por usuário
-- O cache é compartilhado entre usuários para requests similares
ALTER TABLE public.ai_meal_plan_cache ENABLE ROW LEVEL SECURITY;

-- Política para permitir acesso completo (cache compartilhado)
CREATE POLICY "Allow all operations on ai_meal_plan_cache" ON public.ai_meal_plan_cache
  FOR ALL USING (true) WITH CHECK (true);

-- Função para limpeza automática de cache expirado (opcional)
CREATE OR REPLACE FUNCTION public.cleanup_expired_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ai_meal_plan_cache 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comentários para documentação
COMMENT ON TABLE public.ai_meal_plan_cache IS 'Cache das respostas da IA para planos alimentares';
COMMENT ON COLUMN public.ai_meal_plan_cache.request_hash IS 'Hash único do request para identificação';
COMMENT ON COLUMN public.ai_meal_plan_cache.request_data IS 'Dados originais do request (prompt, metas, perfil)';
COMMENT ON COLUMN public.ai_meal_plan_cache.response_data IS 'Resposta completa da IA em formato JSON';
COMMENT ON COLUMN public.ai_meal_plan_cache.expires_at IS 'Data/hora de expiração do cache (24h por padrão)';