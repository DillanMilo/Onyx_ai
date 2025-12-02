export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

// Business Configuration Type to make the template reusable
export interface BusinessConfig {
  name: string;
  logoUrl?: string; // Optional URL
  themeColor: string; // Tailwind color class prefix (e.g., 'blue', 'emerald')
  welcomeMessage: string;
  systemInstruction: string;
}

export interface LLMConfig {
  modelName: string;
  temperature?: number;
}