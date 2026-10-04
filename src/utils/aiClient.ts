// src/utils/aiClient.ts
import { AI_CONFIG } from './constants';

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type AICompletion = { text: string };

export const AIClient = {
  // Request shape intentionally mirrors what a small Go handler reads via
  // encoding/json, e.g.:
  //   type chatRequest struct {
  //     SessionID string     `json:"sessionId"`
  //     Messages  []chatTurn `json:"messages"`
  //     System    string     `json:"system"`
  //   }
  //
  // The expected reply body is { "text": "..." }.
  requestBody(sessionId: string, messages: ChatTurn[]) {
    return {
      sessionId,
      messages,
      system: AI_CONFIG.SYSTEM_PROMPT
    };
  },

  // Placeholder completion used until the Go backend is wired up.
  // Generates a short, simple reply so the UI behaves realistically.
  stubReply(messages: ChatTurn[]): string {
    const last = [...messages].reverse().find((m) => m.role === 'user');
    const question = last ? last.content.trim() : '';
    const topic = question.length > 40 ? question.slice(0, 40) + '…' : question;

    if (!topic) {
      return 'OK.';
    }
    return `Here's the short answer about "${topic}": I'll process this with the AI backend once it's connected. Your message was saved to this chat.`;
  },

  // Future switch to the Go backend: uncomment once the server exists.
  //
  // export async function sendMessage(sessionId: string, messages: ChatTurn[]): Promise<AICompletion> {
  //   const controller = new AbortController();
  //   const timer = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);
  //   try {
  //     const res = await fetch(AI_CONFIG.ENDPOINT, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(AIClient.requestBody(sessionId, messages)),
  //       signal: controller.signal
  //     });
  //     if (!res.ok) throw new Error(`AI API error ${res.status}`);
  //     const data = (await res.json()) as AICompletion;
  //     return { text: data.text };
  //   } finally {
  //     clearTimeout(timer);
  //   }
  // }
};
