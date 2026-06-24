export interface Translation {
  id: string;
  translated_text: string;
  operations_applied: string[];
  confidence: number;
  explanation: string;
}

export interface Analysis {
  emotional_content: string;
  scope: string;
  num_questions: number;
  assumptions: string[];
  clarity: string;
}

export interface TranslationResult {
  session_id: string;
  original_input: string;
  translations: Translation[];
  analysis: Analysis;
}

export interface Dimensions {
  complexity: number;
  domain: string;
  scope: string;
  certainty: string;
  time_sensitivity: string;
  depth_requirement: string;
}

export interface RoutingData {
  id: string;
  question_text: string;
  routed_model: string;
  reasoning: string;
  confidence: number;
  dimensions: Dimensions;
}

export interface RoutingResult {
  session_id: string;
  routing: RoutingData;
}

export interface Technique {
  id: string;
  name: string;
  description: string;
  confidence: number;
  tokens_overhead: number;
}

export interface CompositionResult {
  session_id: string;
  composition: {
    id: string;
    techniques: Technique[];
    final_prompt: string;
    estimated_tokens: number;
    confidence: number;
  };
}

export interface AskResult {
  session_id: string;
  answer: string;
  tokens_used: number;
}
