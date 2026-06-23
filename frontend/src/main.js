const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const translateBtn = document.getElementById('translate-btn');
const clearBtn = document.getElementById('clear-btn');
const userInput = document.getElementById('user-input');
const errorBanner = document.getElementById('error-banner');
const resultsCard = document.getElementById('results-card');
const confidenceBar = document.getElementById('confidence-bar');
const confidenceLabel = document.getElementById('confidence-label');
const questionList = document.getElementById('question-list');

async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connected';
  } catch {
    statusDot.className = 'status-dot error';
    statusText.textContent = 'Backend unreachable';
  }
}

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.classList.remove('hidden');
}

function clearError() {
  errorBanner.classList.add('hidden');
}

translateBtn.addEventListener('click', async () => {
  const input = userInput.value.trim();
  if (!input) return;

  clearError();
  translateBtn.disabled = true;
  translateBtn.textContent = 'Translating...';

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderResults(data);
  } catch (err) {
    showError(`Translation failed: ${err.message}`);
  } finally {
    translateBtn.disabled = false;
    translateBtn.textContent = 'Translate';
  }
});

clearBtn.addEventListener('click', () => {
  userInput.value = '';
  resultsCard.classList.add('hidden');
  clearError();
});

function renderResults({ translated_questions, metadata }) {
  const pct = metadata.confidence;
  confidenceBar.style.width = `${pct}%`;
  confidenceLabel.textContent = `${pct}% confidence`;

  questionList.innerHTML = translated_questions
    .map((q, i) => `
      <div class="question-item">
        <span class="q-number">${i + 1}</span>
        <span class="q-text">${escapeHtml(q)}</span>
      </div>`)
    .join('');

  resultsCard.classList.remove('hidden');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

checkHealth();
