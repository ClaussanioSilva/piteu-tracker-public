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


## IA (Plano e Coach)

As funcionalidades de IA são chamadas via Supabase Edge Functions.

- Guia de configuração: `GROQ_SETUP_GUIDE.md`
- Notas de plano alimentar: `AI_MEAL_PLAN.md`

