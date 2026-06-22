# Kotz — CRM

SaaS MVP de CRM multi-tenant para pequenos negócios e agências.

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + RLS)
- **Deploy:** Vercel (CI/CD via GitHub)

## Setup local

### 1. Clone o repositório

```bash
git clone https://github.com/rodbvexlab/kotz.git
cd kotz
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o `.env.example` para `.env` e preencha com as keys do Supabase:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

> ⚠️ **Nunca commite o arquivo `.env`** — ele está no `.gitignore`.

### 4. Rode em desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## Estrutura do projeto

```
src/
├── app/              # Router, providers, Auth context
├── features/
│   ├── auth/         # Login (Google OAuth + email/senha)
│   ├── leads/        # Pipeline de leads (Fase 1)
│   └── dashboard/    # Métricas (Fase 2)
├── lib/
│   ├── supabase.ts   # Client singleton
│   └── tenant.ts     # Hook useTenant
├── types/
│   └── database.ts   # Tipos do schema Supabase
└── styles/
    └── globals.css
```

## Fases do MVP

| Fase | Status | Descrição |
|------|--------|-----------|
| 0 — Fundação | ✅ Completo | Schema, RLS, trigger de onboarding, auth |
| 1 — Core CRM | 🔧 Em progresso | Pipeline kanban, ficha do lead, log |
| 2 — Dashboard | ⏳ Pendente | Métricas, conversão, visão consolidada |
| 3 — Polish | ⏳ Pendente | Onboarding UX, branding por tenant |

## Configurar Google OAuth

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URIs: `https://caapdmvlmnpmuqctarfj.supabase.co/auth/v1/callback`
4. Cole o Client ID e Secret em: Supabase Dashboard → Authentication → Providers → Google
