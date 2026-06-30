import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import InputBox from './components/InputBox';
import TranslationReview from './components/TranslationReview';
import RoutingExplainer from './components/RoutingExplainer';
import TechniqueReview from './components/TechniqueReview';
import ModelResponse from './components/ModelResponse';
import FeedbackCollector from './components/FeedbackCollector';

interface PipelineState {
  stage: 'input' | 'translation' | 'routing' | 'techniques' | 'response' | 'feedback' | 'complete';
  rawInput: string;
  translationOutput?: any;
  routingOutput?: any;
  techniqueOutput?: any;
  finalPrompt?: string;
  modelResponse?: string;
  modelMetadata?: any;
  interactionId?: string;
  loading: boolean;
  error?: string;
}

function App() {
  const [state, setState] = useState<PipelineState>({
    stage: 'input',
    rawInput: '',
    loading: false,
  });

  const handleSubmit = async (input: string) => {
    setState(prev => ({ ...prev, rawInput: input, loading: true, error: undefined }));

    try {
      const response = await axios.post('http://localhost:8000/process', {
        raw_input: input,
      });

      setState(prev => ({
        ...prev,
        translationOutput: response.data.translation,
        routingOutput: response.data.routing,
        techniqueOutput: response.data.techniques,
        finalPrompt: response.data.final_prompt,
        modelResponse: response.data.model_response,
        modelMetadata: response.data.model_metadata,
        interactionId: response.data.interaction_id,
        stage: 'response',
        loading: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.response?.data?.detail || err.message,
        loading: false,
      }));
    }
  };

  const handleFeedback = async (rating: number, comment: string) => {
    if (!state.interactionId) return;

    try {
      await axios.post(`http://localhost:8000/feedback/${state.interactionId}`, {
        user_rating: rating,
        user_comment: comment,
      });

      setState(prev => ({ ...prev, stage: 'complete' }));
    } catch (err) {
      console.error('Feedback error:', err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ADHD-to-AI Translator</h1>
        <p className="subtitle">Transform rambling into clarity</p>
      </header>

      <main className="app-main">
        {state.error && (
          <div className="error-box">
            <strong>Error:</strong> {state.error}
          </div>
        )}

        {state.stage === 'input' && (
          <InputBox onSubmit={handleSubmit} loading={state.loading} />
        )}

        {state.stage === 'response' && (
          <div className="pipeline-container">
            <div className="pipeline-section">
              <h2>Translation</h2>
              <TranslationReview output={state.translationOutput} />
            </div>

            <div className="pipeline-section">
              <h2>Routing</h2>
              <RoutingExplainer output={state.routingOutput} />
            </div>

            <div className="pipeline-section">
              <h2>Techniques</h2>
              <TechniqueReview output={state.techniqueOutput} />
            </div>

            <div className="pipeline-section">
              <h2>Response</h2>
              <ModelResponse
                response={state.modelResponse}
                metadata={state.modelMetadata}
              />
            </div>

            <div className="pipeline-section">
              <h2>Feedback</h2>
              <FeedbackCollector onSubmit={handleFeedback} />
            </div>
          </div>
        )}

        {state.stage === 'complete' && (
          <div className="complete-box">
            <h2>Thank you for your feedback!</h2>
            <p>Your interaction has been logged and will help improve the system.</p>
            <button onClick={() => setState(prev => ({ ...prev, stage: 'input', rawInput: '' }))}>
              Ask another question
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
