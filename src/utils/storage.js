// src/utils/storage.js
import { STORAGE, MESSAGE_TYPES } from './constants.js';

export const StorageManager = {
  async addMessage(data) {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.ARCHIVE_MESSAGE,
        data
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to archive message');
      }
      return result.data;
    } catch (error) {
      console.error('StorageManager.addMessage error:', error);
      throw error;
    }
  },

  async getMessages() {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_MESSAGES
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to get messages');
      }
      return result.messages;
    } catch (error) {
      console.error('StorageManager.getMessages error:', error);
      throw error;
    }
  },

  async deleteMessage(id) {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.DELETE_MESSAGE,
        id
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete message');
      }
      return result.messages;
    } catch (error) {
      console.error('StorageManager.deleteMessage error:', error);
      throw error;
    }
  },

  async clearAll() {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CLEAR_ALL
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to clear messages');
      }
    } catch (error) {
      console.error('StorageManager.clearAll error:', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_STATS
      });
      if (!result.success) {
        throw new Error(result.error || 'Failed to get stats');
      }
      return result.stats;
    } catch (error) {
      console.error('StorageManager.getStats error:', error);
      throw error;
    }
  }
};
