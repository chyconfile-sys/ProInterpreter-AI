require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.APP_ALLOWED_ORIGINS || 'http://localhost:8000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(express.json({ limit: '2mb' }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

const medicalPhraseMap = {
  'please describe your symptoms': '请描述一下您的症状。',
  'are you allergic to any medication': '您对任何药物过敏吗？',
  'i have a fever': '我发烧。',
  'i have chest pain': '我胸口疼。',
  'i need an appointment': '我需要预约。',
  'doctor': '医生',
  'nurse': '护士',
  'blood pressure': '血压',
  'patient': '患者',
  'medication': '药物',
  'allergy': '过敏',
  'symptom': '症状',
};

function fallbackTranslate(text, sourceLanguage, targetLanguage) {
  const normalized = String(text || '').trim();

  if (!normalized) {
    return { sourceText: text, targetText: '', status: 'error', message: 'No text provided.' };
  }

  const safeInput = normalized.toLowerCase();

  if (sourceLanguage === 'en' && targetLanguage === 'zh') {
    if (medicalPhraseMap[safeInput]) {
      return {
        sourceText: text,
        targetText: medicalPhraseMap[safeInput],
        status: 'ok',
        provider: 'fallback-map',
        isFinal: true,
      };
    }

    return {
      sourceText: text,
      targetText: '',
      status: 'service_unavailable',
      message: 'Translation service not configured. Add a real speech/translation service to enable this feature.',
    };
  }

  if (sourceLanguage === 'zh' && targetLanguage === 'en') {
    const match = Object.entries(medicalPhraseMap).find(([key, value]) => value === normalized);
    if (match) {
      return {
        sourceText: text,
        targetText: match[0].charAt(0).toUpperCase() + match[0].slice(1),
        status: 'ok',
        provider: 'fallback-map',
        isFinal: true,
      };
    }

    return {
      sourceText: text,
      targetText: '',
      status: 'service_unavailable',
      message: 'Translation service not configured. Add a real speech/translation service to enable this feature.',
    };
  }

  return {
    sourceText: text,
    targetText: '',
    status: 'service_unavailable',
    message: 'Unsupported language pair. Configure a production translation provider.',
  };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    mode: 'safe-hybrid',
    message: 'Backend is running and ready for a secure transcription/translation service.',
  });
});

app.post('/api/translate', async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body || {};

  if (!text || !sourceLanguage || !targetLanguage) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required fields: text, sourceLanguage, targetLanguage.',
    });
  }

  const provider = process.env.TRANSLATION_PROVIDER || process.env.SPEECH_PROVIDER || '';

  if (!provider) {
    return res.status(503).json(fallbackTranslate(text, sourceLanguage, targetLanguage));
  }

  try {
    const result = {
      sourceText: text,
      targetText: '',
      status: 'service_unavailable',
      message: 'Translation service configured but not connected in this demo build. Add your provider implementation here.',
      provider,
    };

    return res.status(503).json(result);
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Translation request failed.',
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`ProInterpreter AI backend listening on http://localhost:${PORT}`);
});
