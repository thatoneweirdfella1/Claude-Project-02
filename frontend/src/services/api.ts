import axios, { AxiosInstance } from 'axios';
import { TranslationResult, RoutingResult, CompositionResult, AskResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async translate(rawInput: string): Promise<TranslationResult> {
    const response = await api.post('/translate', { raw_input: rawInput });
    return response.data.data;
  },

  async route(sessionId: string, translatedText: string, domain: string = 'exploratory'): Promise<RoutingResult> {
    const response = await api.post('/route', {
      session_id: sessionId,
      translated_text: translatedText,
      domain,
    });
    return response.data.data;
  },

  async compose(
    sessionId: string,
    translatedText: string,
    routedModel: string,
    domain: string
  ): Promise<CompositionResult> {
    const response = await api.post('/compose', {
      session_id: sessionId,
      translated_text: translatedText,
      routed_model: routedModel,
      domain,
    });
    return response.data.data;
  },

  async ask(
    sessionId: string,
    finalPrompt: string,
    routedModel: string,
    apiKey: string
  ): Promise<AskResult> {
    const response = await api.post('/ask', {
      session_id: sessionId,
      final_prompt: finalPrompt,
      routed_model: routedModel,
      api_key: apiKey,
    });
    return response.data.data;
  },

  async sendFeedback(answerId: string, rating: string, notes?: string): Promise<void> {
    await api.post('/feedback', {
      answer_id: answerId,
      rating,
      notes,
    });
  },

  async getInsights() {
    const response = await api.get('/insights');
    return response.data.data;
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  },
};
