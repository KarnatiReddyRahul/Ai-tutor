import api from './apiClient';

interface ChatMessage {
  role: string;
  content: string;
}

export const chatService = {
  ask: async (topic: string, question: string, history: ChatMessage[], apiKey: string, provider: string) => {
    const headers: Record<string, string> = {};
    if (apiKey && provider === 'gemini') headers['x-gemini-api-key'] = apiKey;
    if (apiKey && provider === 'groq') headers['x-groq-api-key'] = apiKey;

    const { data } = await api.post<{ answer: string }>('/chat/ask', {
      topic,
      question,
      history,
    }, { headers });
    return data.answer;
  },
};
