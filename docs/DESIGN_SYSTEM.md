# Kotz Design System
## CRM para agências criativas — Identidade Visual e Diretrizes de UI

> **Este documento é a fonte da verdade visual do Kotz.**
> Todo agente que tocar em qualquer arquivo de interface DEVE seguir estas diretrizes antes de escrever uma linha de código.

---

## 1. Essência Visual

**Direção:** Tech-futurista, dark-first, glass morphism premium.
**Sensação:** Um cockpit de alta tecnologia. Flutuante, profundo, sofisticado — nunca genérico, nunca corporativo vanilla.
**Referência mental:** Interface de nave espacial em vidro sobre cosmos escuro.

O Kotz não é um dashboard de planilha. É uma ferramenta que faz a Larissa sentir que está operando em outro nível.

---

## 2. Paleta de Cores

### Cores base (imutáveis)

| Token | Hex | Uso |
|---|---|---|
| `brand-orange` | `#FF6500` | CTA primário, destaques, elementos interativos, ativo |
| `brand-orange-hover` | `#e55a00` | Hover do laranja |
| `brand-navy` | `#1E3E62` | Bordas, divisores, elementos secundários, inativos |
| `brand-dark` | `#0B192C` | Superfícies de cards, painéis, containers |
| `brand-black` | `#000000` | Background raiz — SEMPRE preto puro |

### Cores de texto

| Token | Hex | Uso |
|---|---|---|
| `text-primary` | `#FFFFFF` | Títulos, valores numéricos, labels principais |
| `text-secondary` | `#A1B5CC` | Subtextos, metadados, timestamps, labels de formulário |
| `text-muted` | `#1E3E62` | Placeholders, elementos desabilitados, bordas de texto |

### Cores de status (leads)

| Status | Background | Texto | Border |
|---|---|---|---|
| Novo | `#1E3E62/15` | `#A1B5CC` | `#1E3E62/30` |
| Em contato | `#FF6500/10` | `#FF6500` | `#FF6500/25` |
| Proposta enviada | `amber-500/10` | `#F59E0B` | `amber-500/25` |
| Fechado | `emerald-500/10` | `#22C55E` | `emerald-500/25` |
| Perdido | `zinc-800` | `#6B7280` | `#52525B` |

### Cores de canal (leads)

| Canal | Background | Texto |
|---|---|---|
| Instagram | `pink-500/10` | `#F472B6` |
| WhatsApp | `green-500/10` | `#4ADE80` |
| Indicação | `blue-500/10` | `#60A5FA` |
| Outro | `#1E3E62/20` | `#A1B5CC` |

---

## 3. Glass Morphism — Regras de Ouro

> **Glass morphism SÓ funciona quando há profundidade visual atrás.**
> O fundo preto (#000) e o azul escuro (#0B192C) criam essa profundidade naturalmente.

### Variante `glass-card` (padrão — leads kanban)

```css
background: rgba(11, 25, 44, 0.35);
backdrop-filter: blur(20px) saturate(200%);
-webkit-backdrop-filter: blur(20px) saturate(200%);
border: 1px solid rgba(255, 255, 255, 0.10);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.4),
  0 2px 8px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.08),
  inset 0 -1px 0 rgba(0, 0, 0, 0.2);
border-radius: 12px;
```

### Variante `glass-metric` (dashboard cards)

```css
background: rgba(11, 25, 44, 0.50);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-top: 1px solid rgba(255, 101, 0, 0.30);
box-shadow:
  0 4px 24px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.06);
border-radius: 16px;
```

### Variante `glass-overlay` (LeadPanel header, modais)

```css
background: rgba(11, 25, 44, 0.75);
backdrop-filter: blur(24px) saturate(200%);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
```

### Variante `glass-nav` (AppNav sticky)

```css
background: rgba(0, 0, 0, 0.80);
backdrop-filter: blur(12px) saturate(150%);
border-bottom: 1px solid rgba(30, 62, 98, 0.20);
```

### ⚠️ Regras proibidas

- **NUNCA** usar glass em fundo claro ou uniforme
- **NUNCA** empilhar glass sobre glass (perde o efeito)
- **NUNCA** usar `background: white` com glass
- **NUNCA** colocar glass em elementos de texto denso
- **NUNCA** usar glass em inputs (prejudica legibilidade)

---

## 4. Tipografia

### Fontes

| Papel | Família | Uso |
|---|---|---|
| Interface principal | `Inter` | Tudo exceto dados numéricos |
| Dados / Código / Timestamps | `JetBrains Mono` | Números de métricas, datas, logs |

### Escala tipográfica

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| `display` | `text-6xl` | `font-black` | Números principais do dashboard |
| `title` | `text-2xl` | `font-bold` | Títulos de página |
| `heading` | `text-xl` | `font-semibold` | Títulos de seção |
| `body` | `text-sm` | `font-medium` | Texto de cards, labels |
| `caption` | `text-xs` | `font-normal` | Metadados, timestamps |
| `micro` | `text-[10px]` | `font-medium` | Badges, labels de canal |

### Labels de seção

```
SEMPRE uppercase + tracking-widest + text-xs + text-[#A1B5CC]
Exemplo: "LEADS ATIVOS", "HISTÓRICO DE INTERAÇÕES"
```

---

## 5. Componentes — Especificações

### LeadCard (Kanban)

```
┌─────────────────────────────────────────┐  ← glass-card
│                                         │
│ [LC] Lead Company Name      [icon-16px] │  ← avatar 28px + nome sm/semibold + canal icon
│                                         │
│  Serviço de interesse                   │  ← xs text-secondary (omitir se null)
│                                         │
│ [badge canal]              há 2 dias    │  ← footer: badge + timeAgo mono
│                                         │
└─────────────────────────────────────────┘

Hover: border rgba(255,101,0,0.25) + glow sutil
Dragging: opacity-50 scale-[0.98] border-orange
Borda esquerda: 2px solid (cor do status) — sempre presente
```

### Avatar (gerado por nome)

```
Tamanho: 28x28px, rounded-full
Texto: 2 iniciais, text-[10px] font-bold text-white
Cor de fundo: hash do nome → ['#FF6500', '#1E3E62', '#2a4a7f', '#7c3aed']
Border: 1px solid rgba(255,255,255,0.15)
```

### KanbanColumn

```
Background: rgba(11, 25, 44, 0.40) + border rgba(30,62,98,0.25)
Header: label uppercase xs + counter badge com cor do status
Colunas "Fechado" e "Perdido": opacity-60, visual recuado
Drop zone ativa: border tracejada laranja
```

### MetricCard (Dashboard)

```
glass-metric variant
Número: text-6xl font-black font-mono
Label: text-xs uppercase tracking-widest text-secondary
Borda esquerda: 3px solid (cor temática da métrica)
Sem ícones decorativos
```

### AppNav

```
glass-nav sticky top-0 z-30
Logo: "Ko" white + "tz" #FF6500, font-bold
Links: ativo = bg-[#FF6500]/10 + border + text-[#FF6500]
       inativo = text-[#1E3E62] hover:text-white
Tenant badge: avatar inicial + nome, bg-[#0B192C] border
```

### LeadPanel (Slide-over)

```
Largura: max-w-[480px], right-0, full height
Header: glass-overlay variant
Backdrop: bg-black/20 backdrop-blur-[2px] (leve — kanban visível)
Timeline: linha vertical #1E3E62/30 + nós circulares
  Nó recente: bg-[#FF6500] + animate-ping
  Nós antigos: bg-[#1E3E62]
Campo interação: bg-black border-[#1E3E62]/40 focus:border-[#FF6500]
```

### InlineAddLead

```
Border: 1px solid #FF6500/50 + ring #FF6500/20
Background: rgba(17, 34, 54, 0.80)
Placeholder: text-[#1E3E62]
Hint: "Enter para criar · Esc para cancelar" text-[10px]
```

### LoginPage

```
Layout: split 50/50 (md+), só formulário no mobile
Esquerda: bg-black, formulário em GlassCard variant="default"
Direita: gradient #0B192C → #000, glow radial laranja, typewriter CSS
Botão Google: bg-white text-gray-900 (único elemento não-dark)
Botão Entrar: bg-[#FF6500] hover:bg-[#e55a00]
```

---

## 6. Espaçamento e Layout

```
Padding de página:    px-6 py-6 (desktop), px-4 py-4 (mobile)
Gap entre cards:      gap-3 (kanban), gap-4 (dashboard)
Border radius base:   8px (inputs, badges), 12px (cards), 16px (panels)
Max width conteúdo:   sem max-width — full width para kanban
                      max-w-5xl para dashboard
```

---

## 7. Animações e Micro-interações

```
Transição padrão:     transition-all duration-150
Hover cards:          border-color change (150ms) — NÃO escala
Drag active:          scale-[1.03] + shadow forte + rotate-0.5deg
Card entry:           fade-in + slide-in-from-bottom-1 (200ms)
LeadPanel open:       translate-x-0 duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
LeadPanel close:      translate-x-full
Spinner loading:      border-[#FF6500] border-t-transparent animate-spin
Nó ativo timeline:    animate-ping bg-[#FF6500]
```

---

## 8. Estados de UI

### Loading

```jsx
// Spinner centralizado padrão
<div className="min-h-screen bg-black flex items-center justify-center">
  <div className="w-6 h-6 border-2 border-[#FF6500] border-t-transparent rounded-full animate-spin" />
</div>
```

### Empty state

```jsx
// Estado vazio padrão (funil/pipeline vazio)
<div className="border-2 border-dashed border-[#1E3E62]/30 rounded-xl p-8 text-center">
  <Icon size={32} className="text-[#1E3E62]/40 mx-auto" />
  <p className="text-white/60 font-medium mt-3">Título do estado vazio</p>
  <p className="text-[#A1B5CC] text-sm mt-1">Instrução de ação.</p>
  <Link className="text-[#FF6500] hover:text-[#FF6500]/80 text-sm font-medium mt-4 inline-flex items-center gap-1">
    Call to action →
  </Link>
</div>
```

### Error state

```jsx
<div className="flex flex-col items-center gap-3 text-center">
  <AlertCircle size={24} className="text-[#FF6500]" />
  <p className="text-white text-sm font-medium">{mensagem}</p>
  <button onClick={retry} className="text-xs text-[#1E3E62] hover:text-white transition-colors">
    Tentar novamente
  </button>
</div>
```

---

## 9. O que NUNCA fazer

```
❌ Ícones decorativos em cards de métrica
❌ Gradientes coloridos chamativos (só preto/navy)
❌ Shadows coloridas (só rgba black)
❌ Border-radius > 16px em cards de dados
❌ Fundo branco em qualquer elemento interno
❌ Glass sobre glass
❌ Animações longas (> 400ms) em interações de dados
❌ Texto explicativo desnecessário nos cards
❌ Emojis fora da saudação do dashboard
❌ Cores fora da paleta definida
❌ Instalar dependências sem aprovação do orquestrador
```

---

## 10. Checklist antes de qualquer commit de UI

```
[ ] Paleta respeitada — só cores do token system
[ ] Glass morphism aplicado corretamente (fundo escuro por trás)
[ ] Tipografia: Inter para interface, JetBrains Mono para dados
[ ] Labels de seção: uppercase + tracking-widest + text-[#A1B5CC]
[ ] Estados: loading, empty, error implementados
[ ] Hover/focus/disabled definidos em todos os elementos interativos
[ ] npm run build → zero erros TypeScript
[ ] git push origin main após commit
```

---

## 11. Referências visuais aprovadas

**Estética geral:** Cockpit tech-futurista, glass sobre cosmos escuro
**Cards kanban:** CRM premium com avatar + metadados densos (referência Loan CRM)
**Dashboard:** Bento grid com numbers grandes, sparklines sutis
**Login:** Split screen 50/50 com typewriter no lado direito

---

*Última atualização: Fase 1 → Fase 2 do MVP Kotz*
*Mantenedor: Orquestrador (Claude)*
