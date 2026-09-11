// src/utils/dom.js
import { SELECTORS } from './constants.js';

export const DOMHelpers = {
  detectPlatform() {
    try {
      const url = window.location.href;
      if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) {
        return 'chatgpt';
      } else if (url.includes('claude.ai')) {
        return 'claude';
      } else if (url.includes('gemini.google.com')) {
        return 'gemini';
      }
      return 'unknown';
    } catch (error) {
      console.log('Platform detection error:', error);
      return 'unknown';
    }
  },

  findMessageContainer(element) {
    try {
      if (!element) return null;

      const platform = this.detectPlatform();
      const selectors = SELECTORS[platform.toUpperCase()] || SELECTORS.CHATGPT;

      // Try platform-specific selectors
      for (const key in selectors) {
        const selector = selectors[key];
        if (typeof selector === 'string') {
          try {
            const container = element.closest(selector);
            if (container) return container;
          } catch (e) {
            // Continue to next selector
          }
        }
      }

      // Fallback: try generic selectors
      const genericSelectors = [
        '[data-message-author-role]',
        '[data-testid="conversation-turn"]',
        '.message',
        '.text-message',
        '.prose',
        '.markdown',
        '.message-content',
        '.markdown-body'
      ];

      for (const selector of genericSelectors) {
        try {
          const container = element.closest(selector);
          if (container) return container;
        } catch (e) {
          // Continue
        }
      }

      // Last resort: find parent with role attribute
      let current = element;
      while (current && current !== document.body) {
        if (current.hasAttribute && current.hasAttribute('data-message-author-role')) {
          return current;
        }
        current = current.parentElement;
      }

      return null;
    } catch (error) {
      console.log('findMessageContainer error:', error);
      return null;
    }
  },

  getMessageRole(element) {
    try {
      if (!element) return 'unknown';

      const roleAttr = element.getAttribute('data-message-author-role');
      if (roleAttr) return roleAttr.toLowerCase();

      // Check classes
      if (element.classList.contains('user') || element.classList.contains('user-query')) {
        return 'user';
      }
      if (element.classList.contains('assistant') || element.classList.contains('model-response')) {
        return 'assistant';
      }

      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  },

  findPreviousQuestion(messageElement) {
    try {
      if (!messageElement) return 'Unknown question';

      const platform = this.detectPlatform();

      // Try platform-specific methods
      if (platform === 'chatgpt') {
        const messages = document.querySelectorAll('[data-message-author-role]');
        let foundCurrent = false;

        for (let i = messages.length - 1; i >= 0; i--) {
          const msg = messages[i];
          if (msg === messageElement) {
            foundCurrent = true;
            continue;
          }
          if (foundCurrent) {
            const role = msg.getAttribute('data-message-author-role');
            if (role === 'user' || role === 'User') {
              return msg.textContent.trim();
            }
          }
        }
      }

      // Fallback: just get the previous sibling
      const previousMessage = messageElement.previousElementSibling;
      if (previousMessage) {
        const text = previousMessage.textContent.trim();
        if (text.length > 0) return text;
      }

      return 'Unknown question';
    } catch (error) {
      console.log('findPreviousQuestion error:', error);
      return 'Unknown question';
    }
  }
};
