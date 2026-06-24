import React, { useState, useEffect } from 'react';
import { DefaultButton, TextField, ProgressIndicator, MessageBar, MessageBarType, ChoiceGroup, IChoiceGroupOption, Stack, PrimaryButton, SecondaryButton } from '@fluentui/react';
import { apiService } from './services/api';
import { TranslationResult, RoutingResult, CompositionResult, AskResult, Translation } from './types';
import './styles/App.css';

type Step = 'input' | 'translation' | 'routing' | 'composition' | 'answer' | 'feedback' | 'settings';

interface Session {
  rawInput: string;
  translation?: TranslationResult;
  selectedTranslation?: Translation;
  routing?: RoutingResult;
  composition?: CompositionResult;
  answer?: AskResult;
}

export default function App() {
  const [step, setStep] = useState<Step>('input');
  const [session, setSession] = useState<Session>({} as Session);
  const [rawInput, setRawInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [backendConnected, setBackendConnected] = useState(false);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      const connected = await apiService.healthCheck();
      setBackendConnected(connected);
      if (!connected) {
        setError('Backend not connected. Make sure server is running on port 8000.');
      }
    };
    checkBackend();
  }, []);

  const handleTranslate = async () => {
    if (!rawInput.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.translate(rawInput);
      setSession(prev => ({
        ...prev,
        rawInput,
        translation: result,
        selectedTranslation: result.translations[0],
      }));
      setStep('translation');
    } catch (err) {
      setError(`Translation error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTranslation = async () => {
    if (!session.selectedTranslation || !session.translation) return;

    setLoading(true);
    setError(null);

    try {
      const domain = session.translation.analysis.scope === 'broad' ? 'exploratory' : 'analytical';
      const result = await apiService.route(
        session.translation.session_id,
        session.selectedTranslation.translated_text,
        domain
      );
      setSession(prev => ({ ...prev, routing: result }));
      setStep('routing');
    } catch (err) {
      setError(`Routing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRouting = async () => {
    if (!session.routing || !session.selectedTranslation) return;

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.compose(
        session.routing.session_id,
        session.selectedTranslation.translated_text,
        session.routing.routing.routed_model,
        session.routing.routing.dimensions.domain
      );
      setSession(prev => ({ ...prev, composition: result }));
      setStep('composition');
    } catch (err) {
      setError(`Composition error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrompt = async () => {
    if (!session.composition || !apiKey) {
      setError('Missing API key or composition');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiService.ask(
        session.composition.session_id,
        session.composition.composition.final_prompt,
        session.routing?.routing.routed_model || 'haiku',
        apiKey
      );
      setSession(prev => ({ ...prev, answer: result }));
      setStep('answer');
    } catch (err) {
      setError(`Error getting answer: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (rating: string) => {
    if (!session.answer) return;

    try {
      await apiService.sendFeedback(session.answer.session_id, rating);
      setError(null);
      setStep('input');
      setRawInput('');
      setSession({} as Session);
    } catch (err) {
      setError(`Feedback error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('apiKey', apiKey);
    setError(null);
    setStep('input');
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <h1>ADHD-to-AI Translator</h1>
        <p className="subtitle">Translate rambling thoughts into perfect AI prompts</p>
        {!backendConnected && (
          <MessageBar messageBarType={MessageBarType.error}>
            Backend not connected. Make sure to run: cd backend && python run.py
          </MessageBar>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <span className={`status-item ${step === 'input' ? 'active' : ''}`}>1. Input</span>
        <span className="separator">→</span>
        <span className={`status-item ${step === 'translation' ? 'active' : ''}`}>2. Translate</span>
        <span className="separator">→</span>
        <span className={`status-item ${step === 'routing' ? 'active' : ''}`}>3. Route</span>
        <span className="separator">→</span>
        <span className={`status-item ${step === 'composition' ? 'active' : ''}`}>4. Techniques</span>
        <span className="separator">→</span>
        <span className={`status-item ${step === 'answer' ? 'active' : ''}`}>5. Answer</span>
      </div>

      {/* Error Display */}
      {error && (
        <MessageBar messageBarType={MessageBarType.error} onDismiss={() => setError(null)}>
          {error}
        </MessageBar>
      )}

      {/* Main Content */}
      <div className="content">
        {step === 'input' && (
          <div className="step-container">
            <h2>Ask Your Question</h2>
            <p>Type your raw thought process, worries, tangents and all—we'll clean it up.</p>
            <TextField
              multiline
              rows={6}
              placeholder="e.g., 'okay so like i've been thinking about the architecture problem but also i notice the logging is weird and do the models handle like edge cases for the thing, and also im overthinking this but which model should i even use'"
              value={rawInput}
              onChange={(e, value) => setRawInput(value || '')}
            />
            <div className="button-group">
              <PrimaryButton onClick={handleTranslate} disabled={loading || !backendConnected}>
                {loading ? 'Translating...' : 'Translate'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setStep('settings')}>
                Settings
              </SecondaryButton>
            </div>
          </div>
        )}

        {step === 'translation' && session.translation && (
          <div className="step-container">
            <h2>Translation Review</h2>
            <p className="label">Original Input:</p>
            <div className="original-text">{session.translation.original_input}</div>

            <p className="label">Translated Question:</p>
            {session.translation.translations.map((translation, idx) => (
              <div key={translation.id} className="translation-item">
                <div className="translation-text">{translation.translated_text}</div>
                <div className="translation-meta">
                  <span className="confidence-badge">Confidence: {translation.confidence}%</span>
                  <span className="explanation">{translation.explanation}</span>
                </div>
              </div>
            ))}

            <p className="label">Analysis:</p>
            <div className="analysis-box">
              <p><strong>Emotional Content:</strong> {session.translation.analysis.emotional_content}</p>
              <p><strong>Scope:</strong> {session.translation.analysis.scope}</p>
              <p><strong>Number of Questions:</strong> {session.translation.analysis.num_questions}</p>
              {session.translation.analysis.assumptions.length > 0 && (
                <p><strong>Assumptions:</strong> {session.translation.analysis.assumptions.join('; ')}</p>
              )}
            </div>

            <div className="button-group">
              <PrimaryButton onClick={handleAcceptTranslation} disabled={loading}>
                {loading ? 'Processing...' : 'Accept & Continue'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setStep('input')}>
                Start Over
              </SecondaryButton>
            </div>
          </div>
        )}

        {step === 'routing' && session.routing && (
          <div className="step-container">
            <h2>Model Routing</h2>
            <p>Based on question complexity, we recommend this model:</p>

            <div className="routing-card">
              <div className="model-badge" data-model={session.routing.routing.routed_model}>
                {session.routing.routing.routed_model.toUpperCase()}
              </div>
              <p className="routing-reasoning">{session.routing.routing.reasoning}</p>
              <p className="confidence">Confidence: {session.routing.routing.confidence}%</p>

              <div className="dimensions">
                <p><strong>Complexity:</strong> {session.routing.routing.dimensions.complexity}/10</p>
                <p><strong>Domain:</strong> {session.routing.routing.dimensions.domain}</p>
                <p><strong>Scope:</strong> {session.routing.routing.dimensions.scope}</p>
                <p><strong>Depth Needed:</strong> {session.routing.routing.dimensions.depth_requirement}</p>
              </div>
            </div>

            <div className="button-group">
              <PrimaryButton onClick={handleConfirmRouting} disabled={loading}>
                {loading ? 'Processing...' : 'Continue'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setStep('translation')}>
                Back
              </SecondaryButton>
            </div>
          </div>
        )}

        {step === 'composition' && session.composition && (
          <div className="step-container">
            <h2>Prompt Composition</h2>
            <p>Selected techniques to improve your answer:</p>

            <div className="techniques-grid">
              {session.composition.composition.techniques.map(tech => (
                <div key={tech.id} className="technique-card">
                  <h4>{tech.name}</h4>
                  <p>{tech.description}</p>
                  <span className="tokens">+{tech.tokens_overhead} tokens</span>
                </div>
              ))}
            </div>

            <p className="label">Final Prompt:</p>
            <div className="prompt-box">
              <pre>{session.composition.composition.final_prompt}</pre>
            </div>
            <p className="tokens-estimate">
              Estimated tokens: {session.composition.composition.estimated_tokens} | Confidence: {session.composition.composition.confidence}%
            </p>

            <div className="button-group">
              <PrimaryButton onClick={handleSubmitPrompt} disabled={loading || !apiKey}>
                {loading ? 'Getting Answer...' : 'Get Answer'}
              </PrimaryButton>
              <SecondaryButton onClick={() => setStep('routing')}>
                Back
              </SecondaryButton>
            </div>
          </div>
        )}

        {step === 'answer' && session.answer && (
          <div className="step-container">
            <h2>Model Answer</h2>
            <div className="answer-box">
              {session.answer.answer}
            </div>
            <p className="tokens-estimate">Tokens used: {session.answer.tokens_used}</p>

            <p className="label">How was this answer?</p>
            <div className="feedback-buttons">
              <PrimaryButton onClick={() => handleFeedback('good')}>Good Answer ✓</PrimaryButton>
              <DefaultButton onClick={() => handleFeedback('partial')}>Good but Not Perfect</DefaultButton>
              <DefaultButton onClick={() => handleFeedback('bad')}>Not Helpful</DefaultButton>
            </div>
          </div>
        )}

        {step === 'settings' && (
          <div className="step-container">
            <h2>Settings</h2>
            <TextField
              label="Anthropic API Key"
              type="password"
              value={apiKey}
              onChange={(e, value) => setApiKey(value || '')}
            />
            <p className="help-text">Your API key is stored locally and never sent to our servers.</p>

            <div className="button-group">
              <PrimaryButton onClick={saveApiKey}>
                Save Settings
              </PrimaryButton>
              <SecondaryButton onClick={() => setStep('input')}>
                Cancel
              </SecondaryButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
