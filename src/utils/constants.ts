// src/utils/constants.js
export const APP = {
  NAME: 'Brava',
  VERSION: '1.0.0',
  STORAGE_KEY: 'bravaArchivedMessages',
  DESCRIPTION: 'Archive LLM responses without breaking your flow'
};

export const SELECTORS = {
  // ChatGPT
  CHATGPT: {
    MESSAGE_ROLE: '[data-message-author-role]',
    CONVERSATION_TURN: '[data-testid="conversation-turn"]',
    USER_MESSAGE: '[data-message-author-role="user"]',
    ASSISTANT_MESSAGE: '[data-message-author-role="assistant"]'
  },
  // Claude
  CLAUDE: {
    MESSAGE: '.text-message',
    USER_MESSAGE: '.text-message.user',
    ASSISTANT_MESSAGE: '.text-message.assistant'
  },
  // Gemini
  GEMINI: {
    MESSAGE: '.message-content',
    USER_MESSAGE: '.user-query',
    ASSISTANT_MESSAGE: '.model-response'
  }
};

export const KEYBOARD_SHORTCUTS = {
  ARCHIVE: { key: 'a', ctrl: true, shift: true },
  OPEN_POPUP: { key: 'b', ctrl: true, shift: true }
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

export const STORAGE = {
  KEY: APP.STORAGE_KEY,  // Alias for easier access
  DEFAULT_VALUE: [],
  CHAT_SESSIONS_KEY: 'bravaChatSessions',
  PENDING_CHAT_DRAFT_KEY: 'bravaPendingChatDraft'
};

export const AI_CONFIG = {
  // TODO: point this at the Go backend when it is ready
  ENDPOINT: 'http://localhost:8080/api/chat',
  TIMEOUT_MS: 30000,
  SYSTEM_PROMPT: 'Answer in the most concise and simple way possible. Be brief, clear and direct. Avoid filler, disclaimers and long explanations unless explicitly asked.'
};

export type Platform = 'chatgpt' | 'claude' | 'gemini' | 'unknown';

export type ArchivedMessage = {
  id: string;
  selectedText: string;
  fullText: string;
  question: string;
  url: string;
  role: string;
  platform: Platform;
  timestamp: string;
  chatTitle: string;
  archivedAt?: string;
};

export type ArchiveMessageData = Omit<ArchivedMessage, 'id' | 'archivedAt'> & {
  id?: string;
};

export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  status?: 'pending' | 'done' | 'error';
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

// Draft dropped by the content script when the user picks "Go to chat"
export type PendingChatDraft = {
  text: string;
  chatTitle: string;
  platform: Platform;
  sourceUrl: string;
  createdAt: string;
};

// Message types for communication
export const MESSAGE_TYPES = {
  ARCHIVE_MESSAGE: 'ARCHIVE_MESSAGE',
  GET_MESSAGES: 'GET_MESSAGES',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  CLEAR_ALL: 'CLEAR_ALL',
  GET_STATS: 'GET_STATS',
  ARCHIVE_SELECTION: 'ARCHIVE_SELECTION',
  // Chat
  GET_CHAT_SESSIONS: 'GET_CHAT_SESSIONS',
  CREATE_CHAT_SESSION: 'CREATE_CHAT_SESSION',
  SEND_CHAT_MESSAGE: 'SEND_CHAT_MESSAGE',
  RENAME_CHAT_SESSION: 'RENAME_CHAT_SESSION',
  DELETE_CHAT_SESSION: 'DELETE_CHAT_SESSION',
  SAVE_PENDING_DRAFT: 'SAVE_PENDING_DRAFT',
  GET_PENDING_DRAFT: 'GET_PENDING_DRAFT',
  OPEN_POPUP_CHAT: 'OPEN_POPUP_CHAT'
};
