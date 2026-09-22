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
  DEFAULT_VALUE: []
};

// Message types for communication
export const MESSAGE_TYPES = {
  ARCHIVE_MESSAGE: 'ARCHIVE_MESSAGE',
  GET_MESSAGES: 'GET_MESSAGES',
  DELETE_MESSAGE: 'DELETE_MESSAGE',
  CLEAR_ALL: 'CLEAR_ALL',
  GET_STATS: 'GET_STATS',
  ARCHIVE_SELECTION: 'ARCHIVE_SELECTION'
};
