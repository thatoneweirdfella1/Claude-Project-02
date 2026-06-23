const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Allow requests from the Vite dev server on port 5173
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ADHD-to-AI Translator', port: PORT });
});

// Stub translation endpoint — returns parsed structure from raw input
app.post('/api/translate', (req, res) => {
  const { input } = req.body;
  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'input is required' });
  }

  // Minimal stub: split on conjunctions/punctuation to surface sub-questions
  const sentences = input
    .split(/(?:[.?!]|,?\s+(?:and|but|also|or)\s+)/i)
    .map(s => s.trim())
    .filter(s => s.length > 10);

  const questions = sentences.length > 0 ? sentences : [input.trim()];

  res.json({
    translated_questions: questions,
    metadata: {
      gap_category: 'COMPOUND',
      extracted_count: questions.length,
      confidence: Math.min(95, 60 + questions.length * 10),
      operations_applied: ['extract', 'decompose'],
      assumptions_surfaced: [],
    },
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
