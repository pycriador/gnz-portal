# GNZ Hortifruti — SPA Portal Público

Portal público independente de vitrine de catálogo online e rastreamento de pedidos em tempo real para a **GNZ Hortifruti**, conectado de forma segura e isolada ao Supabase da plataforma **Olivelas**.

- **URL de Produção:** [https://pycriador.github.io/gnz-portal/](https://pycriador.github.io/gnz-portal/)
- **Hospedagem:** GitHub Pages via GitHub Actions
- **Roteamento:** Hash/Query String (`#/order/<uuid>` ou `?order=<uuid>`) para compatibilidade total com CDN estática

---

## 🔒 Segurança e Isolamento

O portal se conecta exclusivamente à loja **GNZ Hortifruti** utilizando um cabeçalho HBAC (*Header-Based Access Control*):
- `X-Store-ID`: `f8fdfd0e-a13a-44a6-ba98-53e61be300db`
- `X-HBAC-Token`: Token com escopo restrito (`products:read`, `orders:read`, `orders:write`)
- O navegador jamais recebe preços de custo, margens ou dados de outras lojas.

---

## 🚀 Desenvolvimento Local

1. Instalar as dependências:
   ```bash
   npm install
   ```

2. Configurar o arquivo `.env` (opcional, já possui fallbacks para desenvolvimento):
   ```bash
   cp .env.example .env
   ```

3. Iniciar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Gerar build de produção:
   ```bash
   npm run build
   npm run preview
   ```

---

## 🌐 Deploy Contínuo no GitHub Pages

O deploy é gerenciado automaticamente pelo workflow em [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) a cada push no ramo `main`.

As variáveis e segredos de ambiente estão configurados no GitHub Actions:
- `VITE_SUPABASE_URL` (Secret)
- `VITE_SUPABASE_PUBLISHABLE_KEY` (Secret)
- `VITE_PORTAL_HBAC_TOKEN` (Secret)
- `VITE_PORTAL_STORE_ID` (Variable)
- `VITE_PORTAL_STORE_SLUG` (Variable)
- `VITE_PORTAL_BRAND_PRIMARY` (Variable)
- `VITE_PORTAL_BRAND_ACCENT` (Variable)
