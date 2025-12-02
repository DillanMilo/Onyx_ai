import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, Role } from '../types';
import { AI_CONFIG, BUSINESS_CONFIG } from '../constants';

// Initialize the Gemini Client
// NOTE: Ideally, in a production app, you might want to proxy requests through a backend 
// to keep your API_KEY hidden. For this template, we use the env variable directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends a message to the LLM and streams the response.
 * This function abstracts the specific LLM implementation (Gemini).
 */
export const streamChatResponse = async (
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    // 1. Optimize Context Window (Memory Management)
    // We only keep the last 20 messages (approx 10 exchanges: 10 User + 10 AI)
    // This keeps the context fresh and prevents token limits or confusion from very old topics.
    const MAX_CONTEXT_MESSAGES = 20;
    
    // Filter out error messages first
    const validHistory = history.filter(msg => !msg.isError);
    
    // Slice to get the most recent messages
    const recentHistory = validHistory.slice(-MAX_CONTEXT_MESSAGES);

    // 2. Format for Gemini
    const chatHistory = recentHistory.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // 3. Create a chat session with system instructions
    const chat = ai.chats.create({
      model: AI_CONFIG.modelName,
      config: {
        systemInstruction: BUSINESS_CONFIG.systemInstruction,
        temperature: AI_CONFIG.temperature,
      },
      history: chatHistory, 
    });

    // 4. Send message and handle stream
    const resultStream = await chat.sendMessageStream({
      message: newMessage,
    });

    let fullText = '';

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText); // Update UI with partial text
      }
    }

    return fullText;

  } catch (error) {
    console.error("LLM Service Error:", error);
    throw error;
  }
};

/**
 * Generates a title for a new chat session based on the first message.
 */
export const generateChatTitle = async (firstMessage: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a very short (max 4 words) title for a conversation that starts with: "${firstMessage}". Return ONLY the title text.`,
        });
        return response.text?.trim() || "New Chat";
    } catch (e) {
        return "New Chat";
    }
}