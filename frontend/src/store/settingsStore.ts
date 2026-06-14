import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Theme } from '@/types';

export type AiProvider = 'groq' | 'gemini';

interface SettingsState {
  language: Language;
  theme: Theme;
  fontSize: 'small' | 'medium' | 'large';
  provider: AiProvider;
  apiKey: string;
  model: string;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: 'small' | 'medium' | 'large') => void;
  setProvider: (provider: AiProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModel: (model: string) => void;
}

const DEFAULT_MODELS: Record<AiProvider, string> = {
  groq: 'llama-3.1-8b-instant',
  gemini: 'gemini-1.5-flash',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'system',
      fontSize: 'medium',
      provider: 'groq',
      apiKey: '',
      model: DEFAULT_MODELS.groq,
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setProvider: (provider) => set({ provider, model: DEFAULT_MODELS[provider] }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
    }),
    {
      name: 'ai-reverse-tutor-settings',
    }
  )
);
