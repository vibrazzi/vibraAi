import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import axios from 'axios';

const app = express();

const BANNED_ARTISTS = [
  'kygo', 'avicii', 'calvin harris', 'david guetta', 'zedd', 'the chainsmokers',
  'chainsmokers', 'marshmello', 'skrillex', 'diplo', 'steve aoki', 'hardwell',
  'tiesto', 'tiësto', 'armin van buuren', 'deadmau5', 'porter robinson', 'flume',
  'illenium', 'galantis', 'alan walker', 'kshmr', 'oliver heldens', 'don diablo',
  'sam feldt', 'robin schulz', 'lost frequencies', 'matoma', 'martin garrix',
  'daft punk', 'swedish house mafia', 'eric prydz', 'above & beyond', 'kaskade',
  'above and beyond', 'drake', 'taylor swift', 'beyonce', 'eminem', 'kanye west',
  'ed sheeran', 'the weeknd', 'billie eilish', 'post malone', 'dua lipa',
  'bruno mars', 'lady gaga', 'rihanna', 'adele', 'coldplay', 'imagine dragons',
  'twenty one pilots', 'linkin park', 'metallica', 'nirvana'
];

function filterArtists(text) {
  if (!text) return text;
  let filtered = text;

  BANNED_ARTISTS.forEach(artist => {
    const regex = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&').replace(/\\s+/g, '\\s+')}\\b`, 'gi');
    filtered = filtered.replace(regex, '');
  });

  filtered = filtered.replace(/\b(inspired by|by|feat\.?|ft\.?|featuring)\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g, '');

  filtered = filtered.replace(/,\s*,/g, ',');
  filtered = filtered.replace(/\.\s*\./g, '.');
  filtered = filtered.replace(/\s+/g, ' ').trim();
  filtered = filtered.replace(/^[,.\s]+|[,.\s]+$/g, '');

  return filtered;
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.sunoapi.org"],
      mediaSrc: ["'self'", "https:", "blob:"],
    },
  },
}));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
  };

  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    error: 'Limite de geração excedido. Tente novamente em 1 hora.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/generate-music', generateLimiter);

app.head('/', (req, res) => {
  res.status(200).end();
});

app.use(express.static('public'));

app.post('/api/generate-music', async (req, res) => {
  try {
    const {
      prompt,
      style,
      title,
      model,
      customMode,
      instrumental
    } = req.body;

    if (typeof prompt !== 'string' || prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt deve ser uma string com no máximo 1000 caracteres' });
    }
    if (style && (typeof style !== 'string' || style.length > 500)) {
      return res.status(400).json({ error: 'Estilo deve ser uma string com no máximo 500 caracteres' });
    }
    if (title && (typeof title !== 'string' || title.length > 100)) {
      return res.status(400).json({ error: 'Título deve ser uma string com no máximo 100 caracteres' });
    }
    if (model && !['V3', 'V4', 'V5'].includes(model.toUpperCase())) {
      return res.status(400).json({ error: 'Modelo deve ser V3, V4 ou V5' });
    }
    if (typeof instrumental !== 'boolean') {
      return res.status(400).json({ error: 'Instrumental deve ser um booleano' });
    }

    if (customMode === false && !prompt) {
        return res.status(400).json({ error: 'Prompt é necessário para geração simples' });
    }
    if (customMode === true && !style) {
        return res.status(400).json({ error: 'Estilo é necessário para modo customizado' });
    }

    const filteredPrompt = filterArtists(prompt);
    const filteredStyle = filterArtists(style);
    const filteredTitle = filterArtists(title);

    console.log('Original request:', { prompt, style, title });
    console.log('Filtered request:', { filteredPrompt, filteredStyle, filteredTitle });

    const payload = {
        prompt: filteredPrompt,
        model: model || 'V5',
        customMode,
        instrumental,
        callBackUrl: 'https://api.example.com/callback'
    };

    if (customMode) {
        if (filteredTitle) payload.title = filteredTitle;
        if (filteredStyle) payload.style = filteredStyle;
    }

    console.log('Enviando requisição para Suno API:', {
        url: 'https://api.sunoapi.org/api/v1/generate',
        body: payload
    });

    const response = await axios.post('https://api.sunoapi.org/api/v1/generate',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.SUNO_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Resposta Suno API:', response.data);
    res.json(response.data);

  } catch (error) {
    console.error('Suno API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    const status = error.response?.status || 500;
    const isClientError = status >= 400 && status < 500;

    if (isClientError) {
      res.status(status).json({
        error: 'Erro na requisição. Verifique os dados enviados.'
      });
    } else {
      res.status(500).json({
        error: 'Erro interno do servidor. Tente novamente mais tarde.'
      });
    }
  }
});

app.get('/api/generate/record-info', async (req, res) => {
    try {
        const { taskId } = req.query;
        if (!taskId) {
            return res.status(400).json({ error: 'taskId é necessário' });
        }

        const response = await axios.get('https://api.sunoapi.org/api/v1/generate/record-info', {
            params: { taskId },
            headers: { 'Authorization': `Bearer ${process.env.SUNO_API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Suno API Status Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro ao verificar status' });
    }
});

const PORT = process.env.PORT || 3001;

app.get('*', (req, res) => {
  res.sendFile('index.html', { root: '.' });
});

if (!process.env.SUNO_API_KEY) {
  console.error('ERRO: SUNO_API_KEY não está configurada no arquivo .env');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Backend proxy rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'não configurada'}`);
});
