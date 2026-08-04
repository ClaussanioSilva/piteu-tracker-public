# 🚀 Guia Completo: Configurando Groq API Key

## Passo a Passo para Obter e Configurar a API Key

### 1. 📝 Criar Conta na Groq
1. Acesse: https://console.groq.com/signup
2. Complete o registro com email e senha
3. Verifique seu email se necessário

### 2. 🔑 Gerar API Key
1. Acesse o console da Groq: https://console.groq.com/keys
2. Clique em "Create API Key"
3. Dê um nome: "Macro Mentor App"
4. Copie a key imediatamente (ela só aparece uma vez!)

### 3. ⚙️ Configurar no Projeto

#### Opção A: Criar arquivo .env
```bash
# Na raiz do projeto, crie um arquivo .env
touch .env
```

#### Opção B: Editar arquivo .env existente
Adicione esta linha ao seu arquivo `.env`:

```bash
VITE_GROQ_API_KEY=gsk-sua-chave-aqui-completa
```

**Exemplo completo do arquivo .env:**
```bash
# SUPABASE
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-supabase

# NUTRITIONIX
VITE_NUTRITIONIX_APP_ID=seu-app-id
VITE_NUTRITIONIX_APP_KEY=sua-app-key

# GROQ
VITE_GROQ_API_KEY=gsk-sua-chave-aqui-completa
```
# APP
VITE_APP_NAME=Macro Mentor
VITE_APP_VERSION=1.0.0
```

### 4. ✅ Verificar Funcionamento
1. Inicie o aplicativo
2. Acesse a página de Plano de Alimentação com IA
3. Você deve ver "Usando Groq AI" com o modelo Llama 3.3 70B Versatile
4. Teste a geração de um plano personalizado
```bash
# Pare o servidor atual (Ctrl+C)
npm run dev
```

### 5. 📊 Custos e Considerações

#### Preços da Groq AI
- Consulte a página oficial de preços da Groq para informações atualizadas: https://console.groq.com/docs/pricing
- O modelo Llama 3.3 70B Versatile está disponível em planos gratuitos e pagos
- Monitore seu uso no console da Groq
# Depois execute novamente:
npm run dev
```
```

### 6. ✅ Verificar se Funcionou
1. Acesse a página "Plano IA" no app
2. Na seção "Status do Serviço de IA" deve aparecer:
   - ✅ Serviço de IA configurado e funcionando
   - • Usando Groq AI com modelo Llama 3.3 70B Versatile para gerar planos personalizados

## 💰 Custos da Groq

### Preços Atuais (Llama 3.3 70B Versatile):
- Consulte a página de preços oficial da Groq para informações atualizadas
- A Groq oferece um plano gratuito com limites de uso
- Planos pagos disponíveis para uso mais intensivo

### Recomendações:
- Use cache (já implementado) para reduzir custos
- Monitore seu uso no console da Groq

## 🛠️ Solução de Problemas

### Erro: "API key not configured"
- Verifique se o arquivo `.env` está na raiz do projeto
- Confirme que a variável começa com `VITE_GROQ_API_KEY`
- Reinicie o servidor após adicionar a key

### Erro: "Rate limit exceeded"
- Aguarde alguns minutos
- Verifique os limites do seu plano na Groq

### Erro: "Invalid API key"
- Verifique se copiou a key completa
- Confirme que não há espaços extras
- Gere uma nova key se necessário

## 🔒 Segurança

### ⚠️ IMPORTANTE:
- **NUNCA** commite o arquivo `.env` no Git
- **NUNCA** compartilhe sua API key
- **NUNCA** coloque a key em código público

### ✅ Boas Práticas:
- Use variáveis de ambiente
- Monitore uso regularmente
- Configure limites de gastos
- Revogue keys não utilizadas

## 📊 Monitoramento

### Acompanhar Uso:
1. Acesse: https://platform.openai.com/usage
2. Veja gastos por dia/mês
3. Configure alertas de limite

### Logs do App:
- Abra o console do navegador (F12)
- Veja logs de requisições da API
- Monitore erros e performance

## 🎯 Testando a Funcionalidade

### Prompt de Teste:
```
Quero um plano para ganhar massa muscular. Sou vegetariano, treino 4x por semana, tenho 25 anos e peso 70kg. Preciso de aproximadamente 2500 calorias por dia.
```

### O que Esperar:
- Resposta em 2-3 segundos
- Plano com 6 refeições detalhadas
- Totais nutricionais calculados
- Recomendações personalizadas

---

**🎉 Pronto! Agora você pode usar a IA real para gerar planos de alimentação personalizados!**
