# Product Requirements Document (PRD)
## Macro Mentor - Aplicativo Mobile

**Versão:** 1.0  
**Data:** 2024  
**Objetivo:** Migração completa do web app para aplicativo mobile nativo/híbrido

---

## 1. Visão Geral do Produto

### 1.1 Descrição
O Macro Mentor é uma aplicação completa de rastreamento nutricional e gestão de alimentação que ajuda os usuários a alcançar seus objetivos de saúde através de:
- Rastreamento preciso de macronutrientes e calorias
- Geração de planos alimentares personalizados com IA
- Coaching nutricional inteligente
- Análises e relatórios de progresso
- Gestão de alimentos e refeições personalizadas

### 1.2 Objetivos da Migração Mobile
1. **Acessibilidade**: Disponibilizar o app em dispositivos móveis iOS e Android
2. **Experiência Nativa**: Aproveitar recursos nativos como câmera, notificações push, etc.
3. **Offline First**: Permitir uso básico sem conexão à internet
4. **Performance**: Melhorar tempos de resposta e fluidez da interface
5. **Engajamento**: Notificações e lembretes para manter usuários ativos

### 1.3 Público-Alvo
- Indivíduos que buscam melhorar sua alimentação
- Praticantes de musculação e fitness
- Pessoas em dietas específicas (perda de peso, ganho de massa, manutenção)
- Usuários que valorizam dados precisos e análises detalhadas

---

## 2. Arquitetura Técnica

### 2.1 Stack Tecnológico Recomendado

#### Opção A: React Native (Recomendado)
- **Framework**: React Native + TypeScript
- **Navegação**: React Navigation
- **Estado Global**: Redux Toolkit ou Zustand
- **Backend**: Supabase Client SDK (mantém compatibilidade)
- **IA**: Groq SDK (webhook/API)
- **Cache/Storage**: AsyncStorage + React Query
- **UI Components**: React Native Paper ou NativeBase

#### Opção B: Flutter
- **Framework**: Flutter + Dart
- **Backend**: Supabase Dart SDK
- **IA**: HTTP requests para Groq API
- **Estado**: Provider ou Riverpod
- **UI**: Material Design 3

#### Opção C: Expo (React Native Simplificado)
- **Framework**: Expo + React Native
- **Vantagens**: Deploy mais fácil, atualizações OTA
- **Limitações**: Algumas APIs nativas podem precisar de config

### 2.2 Estrutura de Dados
Manter compatibilidade total com o schema atual do Supabase:
- `profiles`
- `nutritional_goals`
- `foods`
- `food_brands`
- `meals`
- `meal_foods`
- `food_logs`
- `my_meal_plans`
- `api_cache`
- `ai_meal_plan_cache`

### 2.3 APIs Externas
- **Supabase**: Autenticação + Database + Storage
- **Groq AI**: Planos alimentares + Chat (NutriCoach)
- **Nutritionix**: Busca de alimentos + Código de barras (opcional)

---

## 3. Funcionalidades Detalhadas

### 3.1 Autenticação e Onboarding

#### 3.1.1 Tela de Landing
- **Objetivos**: Apresentar o app, permitir navegação para login/signup
- **Elementos**:
  - Hero section com valor principal
  - Botões: "Entrar" e "Criar Conta"
  - Screenshots/demo visual do app
- **Comportamento**: Redirecionar usuários autenticados para Dashboard

#### 3.1.2 Login
- Email + Senha
- Opção "Esqueci minha senha"
- Integração com Supabase Auth
- Validação de campos
- Loading states
- Tratamento de erros

#### 3.1.3 Signup
- Formulário: Email, Senha, Confirmar Senha
- Validação robusta
- Política de privacidade e termos
- Email de verificação (opcional)
- Redirecionamento para onboarding do perfil

#### 3.1.4 Onboarding Inicial (Novo)
- Passo 1: Dados pessoais (nome, idade, gênero)
- Passo 2: Dados físicos (altura, peso)
- Passo 3: Nível de atividade
- Passo 4: Objetivo (perder peso, ganhar massa, manutenção)
- Passo 5: Calculo automático de metas (ou manual)
- **Skip**: Permitir pular e completar depois

---

### 3.2 Dashboard / Página Inicial

#### 3.2.1 Visão Geral Diária
- **Cabeçalho**:
  - Saudação personalizada
  - Data atual formatada
  - Botão "Log Refeição" (destacado)

#### 3.2.2 Card de Calorias (Destaque)
- Valor atual / Meta (ex: "1,250 / 2,000 kcal")
- Barra de progresso visual
- Porcentagem do objetivo
- Indicador de status (verde/amarelo/vermelho)

#### 3.2.3 Cards de Macronutrientes
- Grid 3 colunas (Proteínas, Carboidratos, Gorduras)
- Cada card mostra:
  - Valor atual / Meta
  - Barra de progresso
  - Porcentagem
  - Cor diferenciada por macro

#### 3.2.4 Navegação de Datas
- Swipe left/right para navegar entre dias
- Botão "Hoje" para voltar rapidamente
- Visualização de dados históricos

#### 3.2.5 Lista de Refeições do Dia
- Agrupada por horário:
  - Café da Manhã
  - Lanche da Manhã
  - Almoço
  - Lanche da Tarde
  - Jantar
  - Ceia
- Cada item mostra:
  - Nome do alimento/refeição
  - Quantidade
  - Calorias
  - Botão remover (swipe to delete)
- Total por refeição

#### 3.2.6 Mensagem Motivacional
- Mensagens dinâmicas baseadas no progresso
- Exemplos:
  - "Estás quase a atingir a meta diária! 🎯"
  - "Continue firme, falta mais 50% para atingir a meta! 🚀"

#### 3.2.7 Atalhos Rápidos
- Botão FAB (Floating Action Button) para log rápido
- Cards de atalho: "Adicionar Alimento", "Criar Refeição"

---

### 3.3 Gestão de Alimentos

#### 3.3.1 Lista de Alimentos
- **Layout**: Lista ou grid (toggle)
- **Busca**: Barra de pesquisa no topo (real-time)
- **Filtros**:
  - Todos / Favoritos / Criados por mim
  - Por categoria (breakfast, lunch, snack, etc.)
- **Ordenação**: Nome, Calorias, Data de adição
- **Cards de Alimento**:
  - Nome
  - Calorias por 100g (destaque)
  - Badge de macros (P/C/G)
  - Ícone de favorito
  - Ações: Editar, Deletar (menu swipe)

#### 3.3.2 Adicionar Alimento
- **Botão**: FAB ou botão no header
- **Modal/Sheet** com formulário:
  - **Seção 1: Identificação**
    - Nome do alimento (requerido)
    - Marca (opcional)
    - Categoria (dropdown)
    - Tipo: Sólido/Líquido (toggle)
  
  - **Seção 2: Informações Nutricionais**
    - Porção padrão (g ou ml)
    - Calorias por 100g (requerido)
    - Proteínas (requerido)
    - Carboidratos (requerido)
    - Gorduras (requerido)
    - Opcionais: Fibra, Açúcar, Sódio
  
  - **Seção 3: Código de Barras** (Nova - Mobile)
    - Botão "Escanear Código de Barras"
    - Acesso à câmera nativa
    - Busca automática via Nutritionix ou API similar
    - Preenchimento automático dos campos
  
  - **Ações**: Cancelar, Salvar

#### 3.3.3 Editar Alimento
- Modal similar ao adicionar
- Campos pré-preenchidos
- Validação igual ao criar

#### 3.3.4 Deletar Alimento
- Confirmação antes de deletar
- Toast de feedback
- Atualização imediata da lista

#### 3.3.5 Busca com API Externa
- Integração com Nutritionix (opcional)
- Busca ao digitar na barra de pesquisa
- Lista de resultados sugeridos
- Adicionar resultado da API à biblioteca pessoal

#### 3.3.6 Scanner de Código de Barras
- **Recursos Nativos**:
  - Acesso à câmera traseira
  - Detecção automática de código (EAN-13, EAN-8, UPC-A, etc.)
  - Preview em tempo real
- **Fluxo**:
  1. Abrir modal de scanner
  2. Apontar para código de barras
  3. Detecção automática
  4. Busca de dados nutricionais
  5. Preview dos dados encontrados
  6. Confirmar adição ou editar antes de salvar

---

### 3.4 Gestão de Refeições

#### 3.4.1 Lista de Refeições
- Similar à lista de alimentos
- Cada card mostra:
  - Nome da refeição
  - Total de calorias
  - Distribuição de macros
  - Número de ingredientes
  - Botões: Editar, Deletar

#### 3.4.2 Criar Refeição
- **Passo 1**: Nome e descrição
- **Passo 2**: Adicionar alimentos
  - Busca de alimentos
  - Seleção de alimento
  - Quantidade (em gramas)
  - Preview nutricional por alimento
- **Passo 3**: Revisão
  - Lista de ingredientes
  - Totais calculados (Calorias, P, C, G)
  - Possibilidade de ajustar quantidades
- **Ações**: Cancelar, Salvar

#### 3.4.3 Editar Refeição
- Mesmo fluxo do criar
- Campos pré-preenchidos

#### 3.4.4 Deletar Refeição
- Confirmação
- Feedback visual

---

### 3.5 Registro Diário (Log)

#### 3.5.1 Visualização por Data
- **Header**: Data formatada + navegação (anterior/próxima)
- **Resumo do Dia**:
  - Cards: Calorias, Proteínas, Carboidratos, Gorduras
  - Progresso visual (barras)
  - Percentuais vs. metas

#### 3.5.2 Refeições por Horário
- **Seções** (accordion ou tabs):
  - Café da Manhã
  - Lanche da Manhã
  - Almoço
  - Lanche da Tarde
  - Jantar
  - Ceia
- Cada seção mostra:
  - Lista de itens registrados
  - Total de calorias da refeição
  - Botão "+" para adicionar item

#### 3.5.3 Adicionar Item ao Log
- **Modal rápido**:
  - Toggle: Alimento / Refeição
  - Busca rápida de alimento ou refeição
  - Seleção de quantidade (slider ou input)
  - Seleção de horário (se não veio da seção)
  - Preview nutricional
  - Botão "Adicionar"

#### 3.5.4 Remover Item
- Swipe to delete (iOS style)
- Confirmação
- Atualização imediata

#### 3.5.5 Ações Rápidas
- Duplicar refeição de ontem
- Replicar refeição para outros horários
- Criar refeição a partir do log

---

### 3.6 Metas Nutricionais (Goals)

#### 3.6.1 Calculadora de Metas
- **Entrada de Dados**:
  - Idade (slider ou input)
  - Gênero (Masculino/Feminino)
  - Peso (kg) - slider com range
  - Altura (cm) - slider ou input
  - Nível de atividade (cards selecionáveis)
    - Sedentário
    - Levemente Ativo
    - Moderadamente Ativo
    - Muito Ativo
    - Extremamente Ativo
  - Objetivo (cards):
    - Déficit Calórico (perder peso)
    - Manutenção
    - Superávit Calórico (ganhar massa)

#### 3.6.2 Resultados Calculados
- **BMR** (Taxa Metabólica Basal)
  - Explicação breve
  - Valor em kcal/dia
- **TDEE** (Gasto Calórico Total)
  - Explicação breve
  - Valor em kcal/dia
- **Calorias Alvo Diárias**
  - Valor destacado
  - Badge com objetivo selecionado
  - Indicador de déficit/superávit
- **Distribuição de Macronutrientes**
  - Proteínas (g)
  - Carboidratos (g)
  - Gorduras (g)
  - Visualização em porcentagens (gráfico de pizza opcional)

#### 3.6.3 Salvar Metas
- Botão "Salvar Metas" (destacado)
- Validação de dados obrigatórios
- Feedback de sucesso
- Redirecionamento para Dashboard (atualizado)

#### 3.6.4 Informações Contextuais
- Cards informativos:
  - Fórmula utilizada (Mifflin-St Jeor)
  - Explicação dos ajustes por objetivo
  - Níveis de atividade explicados

---

### 3.7 Perfil do Usuário

#### 3.7.1 Informações Pessoais
- **Dados Básicos**:
  - Nome completo (editável)
  - Email (editável, com validação)
  - Idade (slider)
  - Gênero (dropdown)
- **Dados Físicos**:
  - Altura (cm) - slider ou input
  - Peso (kg) - slider ou input
- **Atividade e Objetivos**:
  - Nível de atividade (dropdown)
  - Objetivo (dropdown)

#### 3.7.2 Cálculo e Exibição de IMC
- **Card de IMC**:
  - Valor calculado (grande, destacado)
  - Categoria (Abaixo do peso, Normal, Sobrepeso, Obesidade)
  - Escala visual
  - Legenda com ranges

#### 3.7.3 Configurações
- **Idioma**:
  - Português / English / Español
  - Salvo em localStorage/SecureStorage
- **Tema**:
  - Claro / Escuro / Automático (sistema)
- **Notificações** (Nova - Mobile):
  - Lembretes de refeições
  - Lembretes de peso
  - Notificações de metas

#### 3.7.4 Ações de Conta
- Botão "Sair" (destrutivo)
- Link "Deletar Conta" (confirmação múltipla)

---

### 3.8 Plano de Alimentação IA

#### 3.8.1 Interface de Geração
- **Header**: Título + descrição breve
- **Campo de Texto**:
  - Placeholder com exemplo
  - Mínimo de caracteres
  - Contador de caracteres
  - Dicas de como melhorar o prompt (tooltip)
- **Card de Metas Atuais** (referência):
  - Exibição das metas salvas
  - Ícones para cada macro
- **Botão "Gerar Plano"**:
  - Loading state com animação
  - Desabilitado durante geração

#### 3.8.2 Visualização do Plano Gerado
- **Card de Resumo**:
  - Totais de calorias e macros
  - Comparação com metas (visual)
- **Cronograma Diário**:
  - Cards para cada refeição:
    - Ícone/emoji da refeição
    - Nome do horário
    - Descrição detalhada
    - Macros estimados (se disponível)
- **Recomendações**:
  - Lista numerada ou bullets
  - Cada item é clicável (expandir detalhes)

#### 3.8.3 Ações no Plano
- **Salvar Plano**:
  - Botão destacado
  - Feedback de sucesso
  - Redirecionamento para "Meus Planos"
- **Gerar Novo Plano**:
  - Limpa o plano atual
  - Volta ao estado inicial

#### 3.8.4 Status do Serviço
- Badge indicando se IA está configurada
- Mensagem informativa sobre mock mode (se aplicável)

---

### 3.9 Meus Planos

#### 3.9.1 Lista de Planos Salvos
- **Grid ou Lista**:
  - Cards compactos com:
    - Título do plano
    - Data de criação
    - Totais de macros (resumo)
    - Badge "Gerado por IA"
- **Ordenação**: Mais recente primeiro
- **Ações por card**:
  - Ver detalhes
  - Duplicar
  - Deletar (com confirmação)

#### 3.9.2 Detalhes do Plano
- **Modal/Sheet expandido**:
  - Header com título e data
  - Resumo nutricional completo
  - Cronograma diário completo (expandido)
  - Recomendações
  - Prompt original usado (colapsável)
- **Ações**:
  - Aplicar ao log (adiciona refeições ao log do dia)
  - Exportar (PDF/Texto - futuro)

---

### 3.10 NutriCoach (Chat com IA)

#### 3.10.1 Interface de Chat
- **Header**: Título + descrição
- **Área de Mensagens**:
  - Scroll automático para última mensagem
  - Bubbles diferenciadas (usuário vs. assistente)
  - Avatar do assistente
  - Timestamp (opcional)
  - Indicador de "digitando..." durante resposta
- **Campo de Input**:
  - Placeholder: "Digite sua pergunta sobre nutrição..."
  - Botão de envio (desabilitado quando vazio)
  - Suporte a Enter para enviar

#### 3.10.2 Funcionalidades do Chat
- **Contexto do Usuário**:
  - Perfil (idade, peso, altura, atividade, objetivo)
  - Metas nutricionais atuais
  - Histórico recente de logs (opcional)
- **Respostas Inteligentes**:
  - Formatação rica (listas, parágrafos)
  - Emojis quando apropriado
  - Links para telas relevantes (quando mencionado)
- **Redirecionamento Inteligente**:
  - Se usuário pedir plano alimentar → redireciona para "Plano IA"
  - Se pedir treino → mensagem informando limitação

#### 3.10.3 Estado e Gerenciamento
- Persistir histórico de conversa (localStorage)
- Botão "Limpar Conversa"
- Indicador de status do serviço (configurado ou não)

---

### 3.11 Relatórios e Análises

#### 3.11.1 Seleção de Período
- **Picker de Mês/Ano**:
  - Navegação anterior/próximo
  - Seletores dropdown de mês e ano
  - Botão "Ir para hoje"

#### 3.11.2 Resumo do Período
- **Cards de Métricas Médias**:
  - Calorias diárias (média)
  - Proteínas (média)
  - Carboidratos (média)
  - Gorduras (média)
  - Comparação com metas (% da meta)

#### 3.11.3 Gráficos
- **Tab 1: Calorias Diárias**
  - Gráfico de barras
  - Eixo X: Dias do mês
  - Eixo Y: Calorias
  - Linha de referência (meta diária)

- **Tab 2: Macronutrientes**
  - Gráfico de pizza (distribuição média)
  - Gráfico de barras agrupadas (P/C/G por dia)
  - Cores diferenciadas por macro

- **Tab 3: Tendências**
  - Gráfico de linha
  - Múltiplas linhas: Calorias, Proteínas, Carboidratos, Gorduras
  - Legenda interativa
  - Zoom e pan (opcional)

#### 3.11.4 Insights e Recomendações
- **Card de Insights** (Nova - Mobile):
  - Tendência de consumo
  - Dias com maior/menor aderência à meta
  - Recomendações baseadas nos dados

---

## 4. Funcionalidades Específicas Mobile

### 4.1 Notificações Push
- **Lembretes de Refeições**:
  - Horários configuráveis (ex: 8h, 12h, 19h)
  - Mensagens personalizadas
- **Lembretes de Peso**:
  - Frequência configurável (diário, semanal)
- **Notificações de Metas**:
  - Aviso quando próxima da meta
  - Parabéns ao atingir meta diária
- **Configurações**:
  - Ativar/desativar por tipo
  - Configurar horários
  - DND (Do Not Disturb) horas

### 4.2 Offline First
- **Sincronização Automática**:
  - Queue de ações quando offline
  - Sincronização quando online
  - Indicador de status de conexão
- **Cache Local**:
  - Alimentos do usuário (sempre disponíveis)
  - Últimos logs do dia (para edição offline)
  - Metas nutricionais (para cálculo offline)
- **Modo Offline**:
  - Interface adaptada
  - Mensagens informativas
  - Limitações claramente comunicadas

### 4.3 Widgets (iOS/Android)
- **Widget de Dashboard**:
  - Calorias do dia (atual/metas)
  - Progresso visual
  - Atalho para abrir app
- **Widget de Quick Log**:
  - Botões rápidos para logar refeições comuns
  - Abrir app direto na tela de log

### 4.4 Integrações Nativas
- **Health App (iOS) / Google Fit (Android)**:
  - Sincronização bidirecional de peso
  - Importar dados de atividade física
  - Exportar dados nutricionais
- **Câmera Nativa**:
  - Scanner de código de barras otimizado
  - Foto de rótulo nutricional (futuro: OCR)

### 4.5 Gestos e Interações
- **Swipe Actions**:
  - Swipe left: Deletar item
  - Swipe right: Editar item (em listas)
- **Pull to Refresh**:
  - Atualizar dados em todas as telas de lista
- **Swipe entre Datas**:
  - Dashboard e Log com swipe horizontal

### 4.6 Haptics
- **Feedback Tátil**:
  - Ao adicionar item ao log (sucesso)
  - Ao completar meta (celebração)
  - Em erros de validação

### 4.7 Deep Links
- **URLs de Ação Rápida**:
  - `macromentor://log?food=ID&quantity=100`
  - `macromentor://dashboard?date=2024-01-15`
  - `macromentor://meal-plan?id=UUID`
- **Share Extension** (iOS):
  - Compartilhar receitas de outros apps
  - Adicionar ao Macro Mentor

---

## 5. Design e UX

### 5.1 Princípios de Design
- **Clareza**: Informações importantes sempre visíveis
- **Eficiência**: Mínimo de toques para ações comuns
- **Feedback**: Respostas visuais imediatas
- **Consistência**: Padrões de design unificados
- **Acessibilidade**: Suporte a leitores de tela, contraste adequado

### 5.2 Sistema de Design
- **Cores**:
  - Primária: Azul (#3B82F6 ou similar)
  - Sucesso: Verde
  - Aviso: Amarelo/Laranja
  - Erro: Vermelho
  - Neutros: Cinzas escalonados
- **Tipografia**:
  - Hierarquia clara (títulos, corpo, legendas)
  - Tamanhos responsivos
- **Componentes**:
  - Cards com sombras suaves
  - Botões com estados claros
  - Inputs com validação visual
  - Modals/Sheets nativos

### 5.3 Animações
- **Transições Suaves**:
  - Entre telas (slide, fade)
  - Ao adicionar/remover itens
  - Ao atualizar dados
- **Microinterações**:
  - Loading states animados
  - Celebrações ao atingir metas
  - Feedback de toque

### 5.4 Adaptações por Tela
- **Telas Pequenas (< 6")**:
  - Layout vertical otimizado
  - Cards mais compactos
  - Menos informações por linha
- **Telas Grandes (> 6.5")**:
  - Aproveitar espaço horizontal
  - Grids mais amplos
  - Mais informações visíveis

---

## 6. Performance e Otimização

### 6.1 Tempos de Carregamento
- **Primeira Abertura**: < 3 segundos
- **Navegação entre Telas**: < 500ms
- **Busca de Alimentos**: < 1 segundo
- **Geração de Plano IA**: < 5 segundos (com loading claro)

### 6.2 Otimizações
- **Lazy Loading**: Carregar dados sob demanda
- **Pagination**: Listas grandes paginadas
- **Cache Inteligente**: 
  - Cache de buscas de API
  - Cache de planos IA (24h)
- **Image Optimization**: Comprimir imagens antes de upload
- **Bundle Size**: Code splitting e tree shaking

### 6.3 Gerenciamento de Memória
- Limpar cache antigo automaticamente
- Remover listeners não utilizados
- Otimizar re-renders (React.memo, useMemo)

---

## 7. Segurança e Privacidade

### 7.1 Autenticação
- Senhas nunca armazenadas localmente
- Tokens com expiração
- Refresh tokens seguros
- Biometria (Face ID / Touch ID / Fingerprint) para login rápido

### 7.2 Dados Sensíveis
- Criptografia de dados locais sensíveis
- Secure Storage para tokens
- Não logar dados pessoais em produção

### 7.3 Permissões
- Câmera: Apenas quando necessário (scanner)
- Notificações: Opt-in com explicação clara
- Health: Opt-in com controle granular

### 7.4 Privacidade
- Política de privacidade acessível
- Termos de uso
- Controle de dados: exportar, deletar conta

---

## 8. Testes e Qualidade

### 8.1 Testes Unitários
- Lógica de cálculo (BMR, TDEE, macros)
- Formatação de dados
- Validações de formulários

### 8.2 Testes de Integração
- Fluxos completos (criar alimento → logar → verificar dashboard)
- Integração com Supabase
- Integração com APIs externas (mock quando necessário)

### 8.3 Testes de UI/UX
- Testes em dispositivos reais
- Diferentes tamanhos de tela
- Modo claro/escuro
- Diferentes idiomas

### 8.4 Testes de Performance
- Profiling de memória
- Análise de bundle size
- Testes de carga (simulação de muitos logs)

---

## 9. Roadmap e Priorização

### 9.1 MVP (Fase 1 - 3 meses)
**Prioridade Alta - Funcionalidades Essenciais**
1. Autenticação (Login/Signup)
2. Dashboard básico (calorias e macros do dia)
3. CRUD de Alimentos
4. Log de alimentos (adicionar/remover)
5. Metas nutricionais (calculadora + salvar)
6. Perfil básico

### 9.2 Fase 2 (Meses 4-6)
**Prioridade Média - Funcionalidades Importantes**
1. Gestão de Refeições completas
2. Plano de Alimentação IA (integração básica)
3. Relatórios (gráficos básicos)
4. Notificações push
5. Modo offline básico
6. Scanner de código de barras

### 9.3 Fase 3 (Meses 7-9)
**Prioridade Baixa - Funcionalidades Avançadas**
1. NutriCoach (chat completo com IA)
2. Meus Planos (histórico e detalhes)
3. Integração Health/Google Fit
4. Widgets
5. Deep links
6. OCR de rótulos nutricionais

### 9.4 Melhorias Contínuas
- Otimizações de performance
- Novos recursos baseados em feedback
- Suporte a mais idiomas
- Melhorias de UX

---

## 10. Métricas de Sucesso

### 10.1 Métricas de Engajamento
- DAU (Daily Active Users)
- Taxa de retenção (D1, D7, D30)
- Número de logs por usuário/dia
- Tempo médio na app

### 10.2 Métricas Funcionais
- Taxa de conclusão de onboarding
- Uso da calculadora de metas
- Geração de planos IA
- Uso do NutriCoach

### 10.3 Métricas de Performance
- Tempo de carregamento médio
- Taxa de erros
- Crashes por sessão

---

## 11. Considerações Técnicas Específicas

### 11.1 Gerenciamento de Estado
- **Global State**: Dados do usuário, metas, logs do dia atual
- **Local State**: Formulários, modais, UI temporária
- **Server State**: React Query ou similar para cache de API

### 11.2 Sincronização
- **Estratégia**: Optimistic updates + sync em background
- **Resolução de Conflitos**: Last-write-wins (com timestamp)
- **Indicadores**: Status de sincronização visível

### 11.3 Tratamento de Erros
- **Erros de Rede**: Retry automático + mensagens claras
- **Erros de Validação**: Feedback imediato nos campos
- **Erros Inesperados**: Logging + mensagens genéricas amigáveis

### 11.4 Acessibilidade
- **Screen Readers**: Labels adequados, navegação por teclado
- **Contraste**: WCAG AA mínimo
- **Tamanhos de Toque**: Mínimo 44x44 pontos (iOS) / 48dp (Android)

---

## 12. Documentação e Suporte

### 12.1 Documentação Técnica
- README com setup do projeto
- Guia de contribuição
- Documentação de APIs
- Diagramas de arquitetura

### 12.2 Documentação de Usuário
- Tutorial interativo (onboarding)
- FAQ na app
- Help center (futuro)

### 12.3 Suporte
- Email de suporte
- In-app feedback
- Canal de comunidade (Discord/Telegram - futuro)

---

## 13. Considerações de Negócio

### 13.1 Modelo de Monetização (Futuro)
- **Freemium**:
  - Básico: Gratuito (funcionalidades essenciais)
  - Premium: Pago (planos IA ilimitados, NutriCoach avançado, relatórios detalhados)
- **Monetização**:
  - Assinatura mensal/anual
  - Compra única (opcional)

### 13.2 Compliance
- LGPD (Lei Geral de Proteção de Dados) - Brasil
- GDPR (se expandir para Europa)
- Termos de uso e política de privacidade atualizados

---

## 14. Apêndices

### 14.1 Glossário
- **BMR**: Taxa Metabólica Basal
- **TDEE**: Total Daily Energy Expenditure (Gasto Calórico Total)
- **Macros**: Macronutrientes (Proteínas, Carboidratos, Gorduras)

### 14.2 Referências
- Schema do banco de dados (Supabase)
- Documentação das APIs (Groq, Nutritionix, Supabase)
- Guias de design (Material Design, Human Interface Guidelines)

---

**Documento criado em:** 2024  
**Última atualização:** 2024  
**Versão:** 1.0

