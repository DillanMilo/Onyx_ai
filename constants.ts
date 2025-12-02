import { BusinessConfig, LLMConfig } from './types';

// ============================================================================
// TEMPLATE CONFIGURATION
// Edit these values to rebrand the application for a different business.
// ============================================================================

export const BUSINESS_CONFIG: BusinessConfig = {
  name: "ONYX AI",
  themeColor: "accent", 
  welcomeMessage: "Welcome to Onyx.",
  systemInstruction: `You are Onyx, a high-performance AI assistant. 
  Your tone is sophisticated, concise, and professional. 
  You provide direct, actionable answers without fluff. 
  Use Markdown for formatting.`,
};

export const AI_CONFIG: LLMConfig = {
  modelName: 'gemini-2.5-flash', 
  temperature: 0.7,
};

// Use this to toggle between different services if you implement others (e.g., OpenAI)
export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI', // Placeholder for future implementation
}

export const ACTIVE_PROVIDER = AIProvider.GEMINI;