# VibrAi - Plataforma de Música Eletrônica

Plataforma profissional para geração de música eletrônica usando Suno AI.

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

## 🛠️ Stack

- **Frontend**: React 18+, TypeScript, Tailwind CSS v4, Shadcn/ui
- **State Management**: Zustand
- **Audio Visualization**: Wavesurfer.js
- **Routing**: Wouter
- **Backend**: Node.js Express Proxy


