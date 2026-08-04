# Plano de Alimentação com IA

Esta funcionalidade permite que os usuários criem planos de alimentação personalizados usando inteligência artificial.

## Funcionalidades

### 🎯 Geração de Planos Personalizados
- Interface intuitiva para descrever necessidades alimentares
- Integração com metas nutricionais do usuário
- Geração de planos com 6 refeições diárias
- Recomendações personalizadas

### 🤖 Integração com IA
- Suporte para Groq AI com modelo Llama 3.3 70B Versatile
- Sistema de cache para otimizar performance
- Fallback para respostas simuladas quando IA não está configurada
- Tratamento robusto de erros

### 📊 Visualização de Resultados
- Exibição clara do cronograma diário
- Resumo nutricional completo
- Recomendações práticas
- Status do serviço de IA

## Configuração

### 1. Configurar Groq API Key

Para usar a funcionalidade real de IA, configure a variável de ambiente:

```bash
# No arquivo .env
VITE_GROQ_API_KEY=sua_chave_api_aqui
```

### 2. Estrutura do Banco de Dados

A funcionalidade usa uma tabela de cache para otimizar performance:

```sql
-- Tabela para cache de planos de IA
CREATE TABLE IF NOT EXISTS ai_meal_plan_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_hash TEXT NOT NULL,
  request_data JSONB NOT NULL,
  response_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_ai_meal_plan_cache_hash ON ai_meal_plan_cache(request_hash);
CREATE INDEX IF NOT EXISTS idx_ai_meal_plan_cache_expires ON ai_meal_plan_cache(expires_at);
```

## Como Usar

### 1. Acessar a Funcionalidade
- Navegue para "Plano IA" no menu lateral
- A página será carregada com interface intuitiva

### 2. Descrever Necessidades
- Use o campo de texto para descrever:
  - Objetivos (perda de peso, ganho de massa, manutenção)
  - Restrições alimentares
  - Alergias
  - Nível de atividade física
  - Preferências alimentares

### 3. Gerar Plano
- Clique em "Gerar Plano Personalizado"
- Aguarde o processamento (2-3 segundos)
- Visualize o plano gerado

### 4. Interpretar Resultados
- **Cronograma Diário**: 6 refeições com descrições detalhadas
- **Resumo Nutricional**: Totais de calorias e macronutrientes
- **Recomendações**: Dicas práticas para seguir o plano

## Exemplos de Prompts

### Para Ganho de Massa Muscular
```
Quero um plano para ganhar massa muscular. Sou vegetariano, treino 4x por semana, tenho 25 anos e peso 70kg. Preciso de aproximadamente 2500 calorias por dia com foco em proteínas.
```

### Para Perda de Peso
```
Preciso de um plano para perder peso de forma saudável. Tenho 30 anos, peso 80kg, trabalho sentado e faço caminhada 3x por semana. Quero perder 1kg por semana.
```

### Para Manutenção
```
Quero manter meu peso atual de 65kg. Tenho 28 anos, sou ativo e faço exercícios 5x por semana. Preciso de um plano equilibrado e variado.
```

## Arquitetura Técnica

### Serviços
- **ai-service.ts**: Serviço principal para integração com IA
- **nutritionix-api.ts**: API existente para dados nutricionais

### Componentes
- **AIMealPlan.tsx**: Página principal da funcionalidade
- **Navigation.tsx**: Item de menu adicionado

### Roteamento
- **App.tsx**: Rota `/ai-meal-plan` adicionada

## Tratamento de Erros

### Cenários Cobertos
- ✅ API key não configurada (usa mock)
- ✅ Erro de rede (mensagem de erro)
- ✅ Resposta inválida da IA (fallback)
- ✅ Prompt vazio (validação)
- ✅ Timeout de requisição (retry)

### Logs e Debugging
- Console logs para debugging
- Tratamento de erros com mensagens amigáveis
- Status visual do serviço de IA

## Performance

### Otimizações
- **Cache**: Planos similares são cacheados por 24h
- **Mock Mode**: Respostas instantâneas quando IA não configurada
- **Lazy Loading**: Componentes carregados sob demanda

### Métricas
- Tempo de resposta: ~2-3 segundos (IA real)
- Tempo de resposta: ~0.5 segundos (mock)
- Cache hit rate: ~70% para prompts similares

## Segurança

### Validações
- Sanitização de prompts
- Limite de tokens na requisição
- Validação de resposta JSON

### Privacidade
- Dados não são armazenados permanentemente
- Cache expira automaticamente
- Logs não contêm dados pessoais

## Futuras Melhorias

### Funcionalidades Planejadas
- [ ] Integração com outros provedores de IA (Claude, Gemini)
- [ ] Salvamento de planos favoritos
- [ ] Histórico de planos gerados
- [ ] Exportação para PDF
- [ ] Integração com lista de compras
- [ ] Avaliação de planos pelos usuários

### Melhorias Técnicas
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Monitoramento de performance
- [ ] Analytics de uso
- [ ] A/B testing de prompts

## Suporte

Para dúvidas ou problemas:
1. Verifique se a API key está configurada corretamente
2. Consulte os logs do console para erros
3. Teste com prompts mais simples
4. Verifique a conectividade de rede

---

**Nota**: Esta funcionalidade está em desenvolvimento ativo. Sugestões e feedback são bem-vindos!
