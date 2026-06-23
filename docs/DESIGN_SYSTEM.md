# Kotz — Design System v2
## CRM para agências criativas

> **Fonte da verdade visual. Todo agente lê isso antes de tocar em qualquer arquivo de interface.**

---

## 0. A alma do produto

O Kotz é uma ferramenta de trabalho para pessoas criativas que operam rápido e não toleram fricção.
A Larissa não quer um dashboard de planilha. Ela quer algo que pareça que foi feito para ela.

**Direção:** Operational dark glass — a estética de um cockpit de missão, não de um painel corporativo.
**Sensação:** Você está no controle. Os dados flutuam. O fundo é profundo. Tudo tem propósito.
**Assinatura visual:** Cards em vidro translúcido sobre cosmos azul escuro, com laranja cirúrgico em exatamente um ponto por tela.

---

## 1. Tipografia — não convencional, opinionada

### Famílias

| Papel | Família | Peso | Uso |
|---|---|---|---|
| Display / Números grandes | `Inter` | 800–900 | Métricas, títulos de página |
| Interface / Labels | `Inter` | 400–600 | Corpo, botões, navegação |
| Dados / Timestamps / Código | `JetBrains Mono` | 400–500 | Datas, IDs, valores numéricos em tabelas |

### Escala — sem meio-termo

```
display:  clamp(48px, 5vw, 72px) / weight 900 / tracking -3px
heading:  28px / weight 700 / tracking -1px  
title:    20px / weight 600 / tracking -0.5px
body:     14px / weight 400 / tracking 0
label:    11px / weight 600 / tracking +1.5px / UPPERCASE
micro:    10px / weight 500 / tracking +1px
mono:     13px / JetBrains Mono / weight 400
```

### Regra tipográfica inviolável

Labels de seção são sempre:
```
UPPERCASE + letter-spacing: 0.12em + color: #A1B5CC + font-size: 11px + font-weight: 600
```

Números de métrica são sempre:
```
font-family: Inter / font-weight: 900 / letter-spacing: -2px / color: white
```

---

## 2. Paleta — cirúrgica

### Cores raiz (imutáveis — nunca substituir)

```
--kotz-black:      #080c14   ← fundo raiz — não #000, não #111
--kotz-deep:       #0B192C   ← superfícies primárias (cards, panels)
--kotz-navy:       #1E3E62   ← bordas, divisores, estados inativos
--kotz-orange:     #FF6500   ← UM acento por tela — CTA, ativo, destaque
--kotz-orange-dim: rgba(255,101,0,0.15) ← glow, hover bg
```

### Texto

```
--text-primary:    #FFFFFF              ← títulos, valores
--text-secondary:  #A1B5CC             ← subtextos, labels
--text-muted:      rgba(161,181,204,0.4) ← placeholders, desabilitados
```

### Status dos leads

```
novo:             borda #1E3E62      badge bg rgba(30,62,98,0.20)   texto #A1B5CC
em_contato:       borda #FF6500      badge bg rgba(255,101,0,0.12)  texto #FF6500
proposta_enviada: borda #F59E0B      badge bg rgba(245,158,11,0.12) texto #F59E0B
fechado:          borda #22C55E      badge bg rgba(34,197,94,0.12)  texto #22C55E
perdido:          borda #52525B      badge bg rgba(82,82,91,0.15)   texto #71717A
```

### Canais

```
instagram:  badge bg rgba(244,114,182,0.10)  texto #F472B6
whatsapp:   badge bg rgba(74,222,128,0.10)   texto #4ADE80
indicacao:  badge bg rgba(96,165,250,0.10)   texto #60A5FA
outro:      badge bg rgba(30,62,98,0.15)     texto #A1B5CC
```

---

## 3. Glass Morphism — a técnica exata

### Por que funciona no Kotz

O fundo `#080c14` com gradientes radiais sutis cria profundidade real.
Cards com `rgba(255,255,255,0.05)` sobre esse fundo = vidro flutuante visível.
`rgba(11,25,44,0.50)` sobre `#080c14` = quase invisível — **não usar como glass**.

### Fórmula correta

```css
/* CERTO — glass visível */
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.09);
box-shadow: 0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);

/* ERRADO — invisível sobre fundo escuro */
background: rgba(11, 25, 44, 0.50); /* mesma cor do fundo = sem contraste */
```

### Variantes

**`glass-card`** — LeadCards, cards de conteúdo
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px) saturate(160%);
border: 1px solid rgba(255, 255, 255, 0.09);
border-left: 3px solid {statusColor};
border-radius: 12px;
box-shadow: 0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);
```

**`glass-metric`** — Dashboard cards
```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(24px) saturate(170%);
border: 1px solid rgba(255, 255, 255, 0.08);
border-left: 3px solid {accentColor};
border-radius: 14px;
box-shadow: 0 2px 16px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06);
```

**`glass-panel`** — LeadPanel, modais, overlays
```css
background: rgba(8, 12, 20, 0.85);
backdrop-filter: blur(32px) saturate(180%);
border-left: 1px solid rgba(255, 255, 255, 0.07);
```

**`glass-nav`** — AppNav sticky
```css
background: rgba(8, 12, 20, 0.80);
backdrop-filter: blur(16px) saturate(150%);
border-bottom: 1px solid rgba(30, 62, 98, 0.25);
```

**`glass-column`** — Colunas do Kanban
```css
background: rgba(255, 255, 255, 0.02);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.05);
border-radius: 14px;
```

### Regras proibidas

```
❌ background: rgba(11,25,44,X) em qualquer elemento glass — mesma cor do fundo, glass desaparece
❌ Glass sobre glass — empilhar blur destrói o efeito
❌ Glass em inputs — prejudica legibilidade
❌ Glass em elementos com texto denso (parágrafos longos)
❌ backdrop-filter sem background semi-transparente — não funciona
```

---

## 4. Background — a profundidade que faz o glass funcionar

O body **precisa** ter gradientes radiais sutis.
Sem isso o glass não aparece — os cards somem no fundo plano.

```css
body {
  background-color: #080c14;
  background-image:
    radial-gradient(ellipse 70% 50% at 15% 35%,
      rgba(30, 62, 98, 0.22) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 85% 15%,
      rgba(30, 62, 98, 0.14) 0%, transparent 55%),
    radial-gradient(ellipse 40% 55% at 50% 85%,
      rgba(11, 25, 44, 0.35) 0%, transparent 65%);
  min-height: 100vh;
}
```

---

## 5. Componentes — especificação real

### Body / Fundo

Fundo `#080c14` com os 3 gradientes radiais acima.
Sem textura, sem pattern, sem ruído.

### AppNav

```
Position: sticky top-0 z-30
Background: glass-nav
Height: 52px
Logo: "Ko" #FFFFFF weight-800 + "tz" #FF6500 weight-800 — sem separador
Links: pill shape, ativo = bg rgba(255,101,0,0.10) + border rgba(255,101,0,0.25) + text #FF6500
       inativo = text rgba(161,181,204,0.7) hover text white
Tenant badge: avatar circular 28px + inicial + nome, glass-card variant leve
Logout: ícone apenas, sem texto, ghost hover
```

### MetricCard (Dashboard)

```
Variante: glass-metric
Padding: 22px 24px
Estrutura:
  [label uppercase 11px #A1B5CC]
  [número 56-64px weight-900 Inter white letter-spacing:-2px]
  [sparkline SVG 24px height — linha + área gradiente]

Accent por card:
  Leads Ativos:       borderLeft #4A7FA5 / sparkline rgba(74,127,165,0.6)
  Propostas Enviadas: borderLeft rgba(255,101,0,0.7) / sparkline rgba(255,101,0,0.6)
  Fechados no Mês:    borderLeft #FF6500 / sparkline #FF6500

SEM: ícones decorativos, shimmer, glow radial, badges extras
```

### Sparkline (dentro dos MetricCards)

```
Height: 24px
Path: curva suave (cubic bezier) — não linha reta
Área: gradiente vertical cor → transparente, opacity 0.20-0.25
Linha: strokeWidth 1.5, strokeLinecap round, opacity 0.55
Sem: eixos, labels, pontos, grid
```

### Gráfico Pipeline (Dashboard)

```
Mostrar SOMENTE quando chartData.length > 1
Quando ≤ 1 ponto: empty state com CTA para Pipeline

Estilo:
  Background: glass-metric variant, padding 24px
  Título: 16px weight-600 white
  Subtítulo: 12px #A1B5CC
  Linha: #FF6500 strokeWidth 2 rounded
  Área: gradiente #FF6500 → transparente opacity 0.15
  Grid: 3 linhas horizontais rgba(30,62,98,0.20)
  Labels eixo X: 11px JetBrains Mono #A1B5CC opacity 0.6
  Tooltip: glass-card mini, padding 8px 12px, border rgba(255,255,255,0.10)
```

### LeadCard (Kanban)

```
Variante: glass-card
Width: 248px fixed
Padding: 14px

Linha 1: Avatar 30px + Nome weight-600 14px + ícone canal direita
Linha 2: Serviço 12px #A1B5CC truncated (omitir se null)
Linha 3: badge canal + timeAgo JetBrains Mono 10px

Avatar:
  rounded-full 30x30px
  Paleta hash: ['#1a4a6e', '#1E3E62', '#0d3b5e', '#164e63', '#0c4a6e']
  SEM roxo, SEM violeta, SEM verde

Hover: border rgba(255,101,0,0.28) + box-shadow 0 0 0 1px rgba(255,101,0,0.10)
Dragging: opacity-45 scale-[0.97] rotate-[0.5deg]
SEM: ID visível, dot decorativo sem significado
```

### KanbanColumn

```
Variante: glass-column
Width: 256px fixed
Border radius: 14px

Header:
  Label: 10px uppercase weight-600 letter-spacing 0.12em #A1B5CC
  Counter badge: pill, cor accent do status, bg rgba cor/15
  Botão +: 28x28px ghost, hover bg rgba(255,101,0,0.10) text #FF6500

Colunas Fechado/Perdido:
  opacity: 0.50
  background: rgba(255,255,255,0.01)
  pointer visual diferenciado — sem botão +

Drop zone ativa:
  border: 1px dashed rgba(255,101,0,0.35)
  background: rgba(255,101,0,0.04)
```

### InlineAddLead

```
background: rgba(0,0,0,0.40)
border: 1px solid rgba(255,101,0,0.45)
border-radius: 10px
box-shadow: 0 0 0 3px rgba(255,101,0,0.08)
input: 13px Inter placeholder rgba(161,181,204,0.40)
hint: 10px #A1B5CC opacity-50 "Enter para criar · Esc para cancelar"
```

### LeadPanel (Slide-over)

```
Width: 480px max, full height, right-0
Backdrop: bg rgba(0,0,0,0.25) blur(2px) — kanban visível atrás
Panel bg: glass-panel variant (#080c14/85 + blur 32px)

Header: padding 24px, border-bottom rgba(255,255,255,0.06)
  Nome: 20px weight-700
  Status badge: pill colorido por status

Seção DADOS DO LEAD:
  Label seção: 11px uppercase #A1B5CC
  View mode: key/value pairs, label #A1B5CC value white
  Edit mode: inputs dark (bg rgba(0,0,0,0.35) border rgba(255,255,255,0.10))
  Botão Editar: ghost, texto #FF6500
  Botão Salvar: bg #FF6500 weight-600

Timeline:
  Linha vertical: rgba(30,62,98,0.35)
  Nó recente: filled #FF6500 + ring rgba(255,101,0,0.25)
  Nós antigos: rgba(30,62,98,0.60)
  Timestamp: JetBrains Mono 11px #A1B5CC

Campo nova interação:
  textarea bg rgba(0,0,0,0.35) border rgba(255,255,255,0.08)
  focus: border rgba(255,101,0,0.45)
  Botão Salvar: aparece em fade-in ao digitar, bg #FF6500
```

### LoginPage

```
Layout: 50/50 split (md+) — só formulário no mobile

Esquerda (formulário):
  bg: #080c14
  Logo: "Ko" white weight-800 + "tz" #FF6500 weight-800, 36px
  Subtítulo: "CRM" uppercase tracking-widest #1E3E62 12px
  Card: glass-card default, padding 32px
  Botão Google: bg white text gray-900 — único elemento não-dark
  Inputs: bg rgba(0,0,0,0.35) border rgba(255,255,255,0.08)
          focus border rgba(255,101,0,0.50)
  Botão Entrar: StarBorder component, color #FF6500
  Botão Criar conta: ghost, border rgba(255,255,255,0.10)

Direita (visual):
  Orb WebGL animado — hue 15-20 (laranja/âmbar)
  Texto typewriter: Inter weight-600 28px white
  "— Kotz CRM": JetBrains Mono 13px #1E3E62
```

---

## 6. Layout e Espaçamento

```
Padding de página:    px-6 py-6
Gap metric cards:     gap-4 (grid 3 colunas)
Gap kanban columns:   gap-4
Gap lead cards:       gap-3
Border radius:
  inputs/badges: 8px
  cards:        12px
  columns:      14px
  metric cards: 14px
  panels:       0 (full height)
Max width dashboard:  1200px centralizado
Kanban:               overflow-x-auto, sem max-width
```

---

## 7. Animações — com propósito, sem ruído

```
Transição padrão:      all 150ms ease
Hover (border):        border-color 150ms — NÃO muda tamanho
LeadPanel entrada:     translateX 300ms cubic-bezier(0.32,0.72,0,1)
Card drag:             scale(0.97) rotate(0.5deg) — instantâneo
Fade-in elementos:     opacity 0 → 1, 200ms ease
Spinner:               border-[#FF6500] border-t-transparent spin 600ms linear
Timeline nó ativo:     animate-ping 1.5s cubic-bezier(0,0,0.2,1) infinite
Botão StarBorder:      animação própria do componente, speed 5s
```

### Regra de ouro das animações

> Uma animação orquestrada vale mais que dez espalhadas.
> Se mais de 2 elementos animam ao mesmo tempo, remova um.

---

## 8. Estados de UI

### Loading

```jsx
<div style={{minHeight:'100vh', background:'#080c14',
  display:'flex', alignItems:'center', justifyContent:'center'}}>
  <div style={{
    width:'24px', height:'24px', borderRadius:'50%',
    border:'2px solid rgba(255,101,0,0.20)',
    borderTop:'2px solid #FF6500',
    animation:'spin 600ms linear infinite'
  }} />
</div>
```

### Empty state

```jsx
<div style={{
  border:'1px dashed rgba(30,62,98,0.35)',
  borderRadius:'14px', padding:'48px 32px',
  textAlign:'center', background:'rgba(255,255,255,0.02)'
}}>
  <Icon size={32} color="rgba(30,62,98,0.50)" />
  <p style={{color:'rgba(255,255,255,0.55)', fontWeight:600, marginTop:'12px'}}>
    Título do estado vazio
  </p>
  <p style={{color:'#A1B5CC', fontSize:'13px', marginTop:'6px'}}>
    Instrução clara de próximo passo.
  </p>
  <a style={{color:'#FF6500', fontSize:'13px', fontWeight:500,
    display:'inline-flex', alignItems:'center', gap:'4px', marginTop:'16px'}}>
    Call to action →
  </a>
</div>
```

### Error state

```jsx
<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'8px'}}>
  <AlertCircle size={20} color="#FF6500" />
  <p style={{color:'white', fontSize:'13px', fontWeight:500}}>{msg}</p>
  <button onClick={retry} style={{color:'#A1B5CC', fontSize:'12px',
    background:'none', border:'none', cursor:'pointer'}}>
    Tentar novamente
  </button>
</div>
```

---

## 9. O que NUNCA fazer

```
❌ background: rgba(11,25,44,X) em elementos glass — fundo e card ficam iguais
❌ Shimmer laranja / glow radial decorativo nos cards
❌ Roxo/violeta em qualquer lugar — fora da paleta
❌ Verde nos cards de "Fechados" — usar laranja
❌ ID do banco de dados visível no UI (nenhum UUID ou hash)
❌ Dot decorativo sem significado semântico
❌ Ícones decorativos em metric cards
❌ Sparkline ocupando mais de 30px de altura
❌ Mais de 1 animação simultânea por região visual
❌ Glass sobre glass (backdrop-filter aninhado)
❌ font-family diferente de Inter ou JetBrains Mono
❌ Cor fora da paleta — incluindo qualquer azul não derivado de #1E3E62
❌ border-radius > 16px em qualquer componente
❌ Instalar dependências npm sem aprovação do orquestrador
❌ Commitar sem npm run build passando (zero erros TS)
❌ Push sem git push origin main explícito
```

---

## 10. Checklist $200k antes de qualquer commit

```
[ ] Body com #080c14 + 3 gradientes radiais sutis
[ ] Cards com rgba(255,255,255,0.04-0.06) — não rgba(11,25,44,X)
[ ] Glass visível a olho nu — elemento se destaca do fundo
[ ] Tipografia: Inter 900 nos números, 600 nos labels uppercase, Mono em timestamps
[ ] Laranja (#FF6500) em NO MÁXIMO 1 ponto de destaque por região
[ ] Nenhum roxo, verde (exceto badge "Fechado"), shimmer laranja
[ ] Avatar: paleta navy — sem #7c3aed ou qualquer roxo/violeta
[ ] Estados loading/empty/error implementados em todas as telas
[ ] Hover/focus/disabled definidos em todos os elementos interativos
[ ] npm run build → zero erros TypeScript
[ ] git push origin main após commit
```

---

## 11. Referências visuais aprovadas

```
Estética geral:    Cockpit de missão — vidro sobre cosmos escuro
Cards kanban:      CRM premium — avatar + metadados densos, sem decoração
Dashboard:         Executive dark glass — números grandes, sparklines discretas
Login:             Orb WebGL animado + formulário glass + typewriter
Kanban:            Colunas navy glass + cards translúcidos flutuantes
```

---

*Versão 2.0 — Reescrito com UI/UX Pro Max + frontend-design skill*
*Mantenedor: Orquestrador (Claude)*
*Padrão: $200k SaaS+*
