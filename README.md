# VibraAi - Plataforma de Música Eletrônica

Plataforma profissional para geração de música eletrônica usando Suno AI.

## � Instalação

### Pré-requisitos

- Node.js 18+
- npm ou pnpm
- Git

### Clone o repositório

```bash
git clone git@github.com:vibrazzi/vibraAi.git
cd vibraAi
```

## 🚀 Como Rodar

### 1. Configurar o Backend (Proxy)

O backend é necessário para proteger sua API Key e evitar bloqueios de CORS.

```bash
# Na raiz do projeto
npm install express cors dotenv helmet axios express-rate-limit
cp .env.example .env
node server.js
```

### 2. Rodar o Frontend

```bash
npm install
npm run dev
```

## � Deploy

### Render

O projeto está configurado para deploy no Render:

1. **Backend**: Crie um serviço Web no Render
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/` (HEAD method)
   - **Instance Type:** Free ou Starter (para começar)

2. **Frontend**: Configure como Static Site
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

3. **Variáveis de Ambiente** (Environment Variables):
   - `SUNO_API_KEY`: Sua chave da API Suno
   - `FRONTEND_URL`: URL do seu frontend (opcional)
   - `PORT`: Porta do servidor (padrão: 10000 no Render)

## �🛠️ Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS v4, Shadcn/ui
- **State Management**: Zustand
- **Audio Visualization**: Wavesurfer.js
- **Routing**: Wouter
- **Backend**: Node.js Express Proxy
- **Segurança**: Helmet, Rate Limiting, CSP

## 🔒 Segurança

- Rate limiting configurado
- Content Security Policy (CSP)
- Sanitização de entrada
- Validação rigorosa de dados
- Logs de segurança
- Arquivo .env protegido no .gitignore

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run lint` - Executa o linter
- `npm run preview` - Preview do build de produção


