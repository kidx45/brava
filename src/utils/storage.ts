// src/utils/storage.ts
import { MESSAGE_TYPES, type ArchiveMessageData, type ArchivedMessage } from './constants';

type ResponseError = { success: false; error: string };
type Response<T> = { success: true } & T | ResponseError;
type Stats = { total: number; todayCount: number; platforms: Record<string, number> };

export const StorageManager = {
  async addMessage(data: ArchiveMessageData): Promise<ArchivedMessage> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.ARCHIVE_MESSAGE,
        data
      });
      if (!(result as Response<{ data: ArchivedMessage }>).success) {
        throw new Error(result.error || 'Failed to archive message');
      }
      return (result as { success: true; data: ArchivedMessage }).data;
    } catch (error) {
      console.error('StorageManager.addMessage error:', error);
      throw error;
    }
  },

  async getMessages(): Promise<ArchivedMessage[]> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_MESSAGES
      });
      if (!(result as Response<{ messages: ArchivedMessage[] }>).success) {
        throw new Error(result.error || 'Failed to get messages');
      }
      return (result as { success: true; messages: ArchivedMessage[] }).messages;
    } catch (error) {
      console.error('StorageManager.getMessages error:', error);
      throw error;
    }
  },

  async deleteMessage(id: string): Promise<ArchivedMessage[]> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.DELETE_MESSAGE,
        id
      });
      if (!(result as Response<{ messages: ArchivedMessage[] }>).success) {
        throw new Error(result.error || 'Failed to delete message');
      }
      return (result as { success: true; messages: ArchivedMessage[] }).messages;
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
      if (!(result as Response<Record<string, never>>).success) {
        throw new Error(result.error || 'Failed to clear messages');
      }
    } catch (error) {
      console.error('StorageManager.clearAll error:', error);
      throw error;
    }
  },

  async getStats(): Promise<Stats> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_STATS
      });
      if (!(result as Response<{ stats: Stats }>).success) {
        throw new Error(result.error || 'Failed to get stats');
      }
      return (result as { success: true; stats: Stats }).stats;
    } catch (error) {
      console.error('StorageManager.getStats error:', error);
      throw error;
    }
  }
};
