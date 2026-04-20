import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || '0.0.0.0';
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

if (!anthropicApiKey) {
  // Fail fast: this server is useless without a key.
  console.warn('Missing ANTHROPIC_API_KEY (set it in server/.env).');
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey });

app.use(
  cors({
    origin: allowedOrigin === '*' ? true : allowedOrigin,
    credentials: false,
  }),
);
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

function jsonOnly(text) {
  // Best-effort: extract the first JSON object from the model output.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

app.post('/ai/calories-from-text', async (req, res) => {
  try {
    const { text } = req.body ?? {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing `text`' });
    }
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' });
    }

    const msg = await anthropic.messages.create({
      model,
      max_tokens: 350,
      temperature: 0.2,
      system:
        'You are a nutrition assistant. Given a food + portion, estimate calories. Output STRICT JSON only. If portion missing, assume a typical serving. Be conservative and explain assumptions in `notes`.',
      messages: [
        {
          role: 'user',
          content: `Return JSON with shape:\n{\n  "foodName": string,\n  "portion": string,\n  "calories": number,\n  "confidence": "low"|"medium"|"high",\n  "notes": string\n}\n\nInput: ${text}`,
        },
      ],
    });

    const outText = msg.content
      .map(c => (c.type === 'text' ? c.text : ''))
      .join('\n')
      .trim();
    const parsed = jsonOnly(outText);
    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return JSON', raw: outText });
    }

    return res.json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to estimate calories' });
  }
});

app.post('/ai/calories-from-photo', upload.single('photo'), async (req, res) => {
  try {
    const file = req.file;
    const context = typeof req.body?.context === 'string' ? req.body.context : '';
    if (!file) return res.status(400).json({ error: 'Missing `photo` file field' });
    if (!anthropicApiKey) {
      return res.status(500).json({ error: 'Server missing ANTHROPIC_API_KEY' });
    }

    const mediaType = file.mimetype || 'image/jpeg';
    const base64 = file.buffer.toString('base64');

    const msg = await anthropic.messages.create({
      model,
      max_tokens: 650,
      temperature: 0.2,
      system:
        'You are a nutrition assistant. Identify foods in the image and estimate calories. Output STRICT JSON only. If uncertain, set confidence low and explain assumptions.',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text:
                `Return JSON with shape:\n{\n  "items": [{ "foodName": string, "portion": string, "calories": number }],\n  "totalCalories": number,\n  "confidence": "low"|"medium"|"high",\n  "notes": string\n}\n` +
                (context ? `\nUser context: ${context}\n` : '') +
                '\nEstimate based on typical serving sizes if needed.',
            },
          ],
        },
      ],
    });

    const outText = msg.content
      .map(c => (c.type === 'text' ? c.text : ''))
      .join('\n')
      .trim();
    const parsed = jsonOnly(outText);
    if (!parsed) {
      return res.status(502).json({ error: 'Model did not return JSON', raw: outText });
    }
    return res.json(parsed);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

app.listen(port, host, () => {
  const shownHost = host === '0.0.0.0' ? 'localhost' : host;
  console.log(`FitCheck server listening on http://${shownHost}:${port}`);
});

