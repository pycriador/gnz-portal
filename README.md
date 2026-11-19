# GNZ Hortifruti — Portal Público de Catálogo & Rastreamento

Portal web independente (SPA) de vitrine e-commerce e rastreamento de pedidos em tempo real para a **GNZ Hortifruti**, conectado de forma isolada e segura ao Supabase da plataforma **Olivelas**.

- **URL de Produção:** [https://pycriador.github.io/gnz-portal/](https://pycriador.github.io/gnz-portal/)
- **Hospedagem:** GitHub Pages via GitHub Actions
- **Roteamento:** Hash / Query String (`#/order/<uuid>` ou `?order=<uuid>`) para compatibilidade total com hospedagem estática

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Uso no Projeto |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript 6 | Componentização, estado do carrinho, filtros, modais e tipagem estrita |
| **Build & Dev Server** | Vite 8 | Compilação rápida, HMR local e bundle de produção |
| **Estilização** | Tailwind CSS 3.4 + PostCSS + Autoprefixer | Design system utilitário, responsividade mobile-first e modo escuro (`darkMode: 'class'`) |
| **Ícones** | Lucide React | Ícones vetoriais padronizados para departamentos, ações e status (sem emojis no menu) |
| **Backend & Tempo Real** | Supabase JS (`@supabase/supabase-js`) | Consulta de catálogo, registro de pedidos, consentimento LGPD e assinatura Realtime de status |
| **CI/CD** | GitHub Actions + GitHub Pages | Typecheck (`tsc -b`), build (`vite build`) e publicação automática na branch `main` |

---

## 🎨 Sistema de Cores e Identidade Visual

As cores da marca são centralizadas em variáveis CSS com canais RGB em [`src/index.css`](src/index.css) e mapeadas no [`tailwind.config.js`](tailwind.config.js), permitindo usar modificadores de opacidade do Tailwind (ex.: `bg-brand-primary/10`, `border-brand-craft/30`).

| Nome | Hex | Token Tailwind | Uso no Layout |
| :--- | :--- | :--- | :--- |
| **Verde GNZ** | `#1B6B1E` | `brand-primary` | Cor principal (harmonizada com o verde botânico do logo `#036101`): barra superior, botões de CTA, preços no modo claro, links e abas ativas |
| **Carvão** | `#111827` | `brand-charcoal` | Tipografia principal, fundos do modo escuro, overlays dos banners e alto contraste sobre Craft |
| **Verde Claro** | `#81C784` | `brand-light` | Preços e destaques no modo escuro, ponto pulsante de status ao vivo e acentos sobre fundos escuros |
| **Craft** | `#B68652` | `brand-craft` / `brand-accent` | Acento artesanal: selo `Kg`, filtro *Por Quilo*, contador da sacola, tags de oferta e indicador do slider |
| **Palha** | `#D8C6A3` | `brand-straw` | Token disponível no tema (não aplicado nas superfícies principais para manter cards limpos e contraste alto nas fotos) |

### Acessibilidade e Tema
- **Modo Claro / Escuro:** alternado pela classe `.dark` no `<html>` (gerenciado em `src/App.tsx`), acompanhado de `color-scheme: light | dark` e `accent-color` em `src/index.css` para que inputs e scrollbars nativos sigam o tema.
- **Contraste WCAG AA:** pareamento de texto branco sobre Verde GNZ (`5.13:1`), Carvão sobre Craft (`5.6:1`) e Verde Claro sobre Carvão (`9.8:1`).
- **Alto Contraste do Sistema:** regras `@media (forced-colors: active)` em `src/index.css` mapeiam tokens para palavras-chave de sistema (`Highlight`, `CanvasText`).

---

## 📱💻 Arquitetura Responsiva (Desktop e Mobile)

O layout segue abordagem **mobile-first** com breakpoints Tailwind (`sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`) e largura máxima de `1536px` para aproveitar telas grandes.

### 1. Menu Superior de Departamentos (`src/components/CategoryNav.tsx`)
- **Estrutura semântica única:** utiliza um único `<nav aria-label="Departamentos">` e uma única lista `<ul>` para todos os tamanhos de tela, mantendo a ordem natural de teclado (`Tab`), `aria-current="page"` na categoria ativa e `aria-hidden="true"` nos ícones decorativos.
- **Mobile e telas menores (`< lg`):** exibido em **lista vertical elegante** (um departamento abaixo do outro com divisores sutis, ícone em bloco arredondado à esquerda, nome ao centro e indicador `Check`/`ChevronRight` à direita), com botão recolhível (`aria-expanded` / `aria-controls`).
- **Desktop (`lg+`):** a mesma lista se reorganiza em barra horizontal limpa com rolagem suave (`lg:flex-row`).

### 2. Vitrines e Grade de Produtos
- **Mobile (`< md`):** todas as vitrines da página inicial (`OffersShowcase`, `DailyFavoritesSection`, `CategoryShowcaseSection`) e a grade de busca/categoria (`ProductGrid`) usam **`grid grid-cols-2 gap-2.5`**, garantindo que os produtos apareçam **por completo de 2 em 2**, sem cortes horizontais.
- **Desktop (`md+`):**
  - As vitrines da home mudam automaticamente para **carrossel horizontal** (`md:flex md:overflow-x-auto md:snap-x md:snap-mandatory`) com botões laterais de navegação (`scrollBy({ behavior: 'smooth' })`).
  - A grade filtrada (`ProductGrid`) escala progressivamente: `2` colunas (mobile) → `3` (`sm`) → `4` (`md`) → `5` (`lg`) → `6` (`xl`).
- **Card de Produto (`src/components/ProductCard.tsx`):** usa `h-full min-w-0` para alinhar alturas na mesma linha, padding compacto no mobile (`p-2.5 sm:p-4`), truncamento seguro de badges para evitar sobreposição entre categoria e selo `Kg`, e stepper inline para ajuste rápido de quantidade/peso.

### 3. Cabeçalho, Busca e Carrinho
- **Cabeçalho (`src/components/Header.tsx`):** `sticky top-0` com `backdrop-blur-md`; busca central ampla no desktop (`hidden md:block`) e campo de busca dedicado abaixo da barra principal no mobile (`block md:hidden`).
- **Sacola Lateral (`src/components/CartDrawer.tsx`):** gaveta deslizante à direita (`max-w-lg`) com lista de itens, ajuste de peso/quantidade, formulário de entrega e envio opcional formatado para WhatsApp.

---

## ✏️ Guia de Personalização: Onde Editar Cada Elemento

### 1. Cores Padrão da Marca
Para alterar a paleta global, atualize:
1. [`src/index.css`](src/index.css) — variáveis `--portal-primary`, `--portal-primary-rgb`, `--portal-charcoal`, `--portal-green-light`, `--portal-craft` e `--portal-straw`.
2. [`presets/gnz-hortifruti.preset.json`](presets/gnz-hortifruti.preset.json) — campos `branding.primaryColor` e `branding.accentColor`.
3. [`.env.example`](.env.example) e [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — fallbacks `VITE_PORTAL_BRAND_PRIMARY` e `VITE_PORTAL_BRAND_ACCENT` (lembre de atualizar também as *Variables* no repositório do GitHub se estiverem definidas lá).

### 2. Textos Institucionais, Título e Faixa de Entrega
- Edite [`presets/gnz-hortifruti.preset.json`](presets/gnz-hortifruti.preset.json):
  - `customTitle`: título da aba do navegador.
  - `deliveryBannerText`: texto da barra verde superior no cabeçalho.
  - `heroBadge`, `heroSubtitle`, `trustBadges`: textos de apoio e selos.
- O carregamento com fallback de variáveis de ambiente fica em [`src/config/portal.config.ts`](src/config/portal.config.ts).

### 3. Banner Rotativo Principal (Slides de Promoção)
- Edite o array `PROMO_SLIDES` em [`src/components/PromoSlider.tsx`](src/components/PromoSlider.tsx):
  - `title`, `subtitle`, `badge`, `highlightTag`, `ctaText`
  - `imageUrl`: URL da foto de fundo
  - `targetCategory`: nome da categoria aberta ao clicar no botão (se omitido, rola até *Ofertas da Semana*)
  - Tempo de troca automática: `5000` ms no `useEffect` do mesmo arquivo.

### 4. Ícones e Departamentos
- Os ícones por nome de categoria (ex.: `fruta`, `verdura`, `cogumelo`, `ovo`, `tempero`, `mercearia`) são mapeados em:
  - [`src/components/CategoryNav.tsx`](src/components/CategoryNav.tsx) (`getCategoryIcon`)
  - [`src/components/CategoryCircles.tsx`](src/components/CategoryCircles.tsx) (`getCategoryVisual`)
  - [`src/components/CategoryShowcaseSection.tsx`](src/components/CategoryShowcaseSection.tsx) (`getCategoryIcon`)
- Para adicionar um novo departamento com ícone próprio, importe o ícone desejado de `lucide-react` e adicione o `if (lower.includes('...'))` correspondente.

### 5. Seções da Página Inicial
- **Ofertas da Semana:** [`src/components/OffersShowcase.tsx`](src/components/OffersShowcase.tsx) — edite a imagem lateral, textos do card editorial e a lógica `offerProducts`.
- **Favoritos do Dia a Dia:** [`src/components/DailyFavoritesSection.tsx`](src/components/DailyFavoritesSection.tsx) — ajuste o array `keywords` para definir quais produtos aparecem em destaque.
- **Ordem das seções da Home:** [`src/components/CatalogView.tsx`](src/components/CatalogView.tsx) (bloco `isBrowsingAll`).

### 6. Produtos Pesáveis, Carrinho e Rastreamento
- **Opções rápidas de peso (100g, 250g, 500g, 1kg...):** array `PRESET_GRAMS` em [`src/components/WeightSelectorModal.tsx`](src/components/WeightSelectorModal.tsx).
- **Campos do checkout e pagamento:** [`src/components/CartDrawer.tsx`](src/components/CartDrawer.tsx).
- **Linha do tempo e status do pedido:** [`src/components/OrderTrackingView.tsx`](src/components/OrderTrackingView.tsx) e formatadores em [`src/utils/portalFormatters.ts`](src/utils/portalFormatters.ts).

---

## 🔒 Segurança e Isolamento

O portal se conecta exclusivamente à loja **GNZ Hortifruti** utilizando cabeçalhos HBAC (*Header-Based Access Control*) em [`src/api/supabasePortalClient.ts`](src/api/supabasePortalClient.ts):
- `X-Store-ID`: identificador único da loja
- `X-HBAC-Token`: token com escopo restrito (`products:read`, `orders:read`, `orders:write`)
- O navegador nunca recebe preços de custo, margens ou dados de outras lojas.

---

## 🚀 Desenvolvimento Local

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Configurar o arquivo `.env` (opcional — o projeto já inclui fallbacks em `portal.config.ts` e `presets/gnz-hortifruti.preset.json`):
   ```bash
   cp .env.example .env
   ```

3. Iniciar o servidor de desenvolvimento (porta `5174`):
   ```bash
   npm run dev
   ```

4. Validar tipagem e gerar build de produção:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🌐 Deploy Contínuo no GitHub Pages

O deploy é executado automaticamente pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) a cada `push` na branch `main` (ou manualmente via *Run workflow* na aba Actions).

Variáveis e segredos configurados no GitHub Actions:
- `VITE_SUPABASE_URL` (Secret/Variable)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (Secret/Variable)
- `VITE_PORTAL_HBAC_TOKEN` (Secret/Variable)
- `VITE_PORTAL_STORE_ID` (Variable)
- `VITE_PORTAL_STORE_SLUG` (Variable)
- `VITE_PORTAL_BRAND_PRIMARY` (Variable — padrão `#1B6B1E`)
- `VITE_PORTAL_BRAND_ACCENT` (Variable — padrão `#B68652`)
