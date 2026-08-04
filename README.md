# PiteuTracker AI

Aplicação web para registo alimentar e acompanhamento de macros (calorias, proteína, hidratos e gordura), com funcionalidades assistidas por IA.

**Deploy (Vercel):** https://piteu-tracker-app.vercel.app/

## Funcionalidades

- Registo de refeições por foto (Snap Log)
- Registo manual (alimento/refeição + quantidade)
- Registo por voz
- Metas diárias de calorias e macros
- Diário alimentar com histórico por data
- Relatórios e gráficos de progresso
- NutriCoach (perguntas e respostas sobre nutrição) e Plano IA (geração de plano alimentar) via funções no Supabase

## Stack

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui (Radix UI)
- Supabase (Auth, Database, Storage e Edge Functions)
- React Router + TanStack Query
- Vercel (deploy)

## Como correr localmente

### Pré-requisitos

- Node.js (LTS recomendado)
- Uma conta/projeto no Supabase (para Auth/DB)

### Instalação

```bash
npm install
```

Cria um ficheiro `.env` na raiz do projeto com as variáveis abaixo (não publiques o `.env`):

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anonima

VITE_NUTRITIONIX_APP_ID=seu-app-id
VITE_NUTRITIONIX_APP_KEY=sua-app-key
```

Notas:

- No Supabase, a chave “anon public” pode ser usada como `VITE_SUPABASE_ANON_KEY` e também como `VITE_SUPABASE_PUBLISHABLE_KEY`.
- As chaves da Nutritionix são opcionais, mas necessárias para partes do fluxo de pesquisa/validação de alimentos.

Depois, inicia o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Estrutura do projeto (alto nível)

- `src/pages`: páginas (Dashboard, Log, Reports, etc.)
- `src/components`: componentes reutilizáveis e modais (ex.: registo manual, drawer, etc.)
- `src/providers`: contextos globais (ex.: nutrição)
- `src/services`: integrações externas (ex.: IA, Nutritionix)
- `src/lib`: clientes e utilitários (ex.: Supabase)

## IA (Plano e Coach)

As funcionalidades de IA são chamadas via Supabase Edge Functions.

- Guia de configuração: `GROQ_SETUP_GUIDE.md`
- Notas de plano alimentar: `AI_MEAL_PLAN.md`

