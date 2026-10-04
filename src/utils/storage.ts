// src/utils/storage.ts
import {
  MESSAGE_TYPES,
  type ArchiveMessageData,
  type ArchivedMessage,
  type ChatMessage,
  type ChatSession,
  type PendingChatDraft
} from './constants';

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
  },

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_CHAT_SESSIONS
      });
      if (!(result as Response<{ sessions: ChatSession[] }>).success) {
        throw new Error(result.error || 'Failed to get chat sessions');
      }
      return (result as { success: true; sessions: ChatSession[] }).sessions;
    } catch (error) {
      console.error('StorageManager.getChatSessions error:', error);
      throw error;
    }
  },

  async createChatSession(title?: string): Promise<ChatSession> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CREATE_CHAT_SESSION,
        title
      });
      if (!(result as Response<{ session: ChatSession }>).success) {
        throw new Error(result.error || 'Failed to create chat session');
      }
      return (result as { success: true; session: ChatSession }).session;
    } catch (error) {
      console.error('StorageManager.createChatSession error:', error);
      throw error;
    }
  },

  // Sends the user message and returns the full updated session,
  // including the AI reply (or an error placeholder).
  async sendChatMessage(sessionId: string, content: string): Promise<ChatSession> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SEND_CHAT_MESSAGE,
        sessionId,
        content
      });
      if (!(result as Response<{ session: ChatSession }>).success) {
        throw new Error(result.error || 'Failed to send chat message');
      }
      return (result as { success: true; session: ChatSession }).session;
    } catch (error) {
      console.error('StorageManager.sendChatMessage error:', error);
      throw error;
    }
  },

  async renameChatSession(sessionId: string, title: string): Promise<ChatSession> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.RENAME_CHAT_SESSION,
        sessionId,
        title
      });
      if (!(result as Response<{ session: ChatSession }>).success) {
        throw new Error(result.error || 'Failed to rename chat session');
      }
      return (result as { success: true; session: ChatSession }).session;
    } catch (error) {
      console.error('StorageManager.renameChatSession error:', error);
      throw error;
    }
  },

  async deleteChatSession(sessionId: string): Promise<ChatSession[]> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.DELETE_CHAT_SESSION,
        sessionId
      });
      if (!(result as Response<{ sessions: ChatSession[] }>).success) {
        throw new Error(result.error || 'Failed to delete chat session');
      }
      return (result as { success: true; sessions: ChatSession[] }).sessions;
    } catch (error) {
      console.error('StorageManager.deleteChatSession error:', error);
      throw error;
    }
  },

  // Persisted by the content script right after an archive, so the popup
  // can pick it up (the popup cannot read the page's React state).
  async savePendingDraft(draft: PendingChatDraft | null): Promise<void> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_PENDING_DRAFT,
        draft
      });
      if (!(result as Response<Record<string, never>>).success) {
        throw new Error(result.error || 'Failed to save pending draft');
      }
    } catch (error) {
      console.error('StorageManager.savePendingDraft error:', error);
      throw error;
    }
  },

  async getPendingDraft(): Promise<PendingChatDraft | null> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.GET_PENDING_DRAFT
      });
      if (!(result as Response<{ draft: PendingChatDraft | null }>).success) {
        throw new Error(result.error || 'Failed to get pending draft');
      }
      return (result as { success: true; draft: PendingChatDraft | null }).draft;
    } catch (error) {
      console.error('StorageManager.getPendingDraft error:', error);
      throw error;
    }
  },

  async clearPendingDraft(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.SAVE_PENDING_DRAFT,
        draft: null
      });
    } catch (error) {
      console.error('StorageManager.clearPendingDraft error:', error);
      throw error;
    }
  },

  // Opens the extension popup directly on the chat tab. Chrome closes the
  // popup when focus leaves it, so we open a small window instead.
  async openChatPopup(initialDraftText?: string): Promise<void> {
    try {
      const result = await chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.OPEN_POPUP_CHAT,
        draftText: initialDraftText
      });
      if (!(result as Response<Record<string, never>>).success) {
        throw new Error(result.error || 'Failed to open chat popup');
      }
    } catch (error) {
      console.error('StorageManager.openChatPopup error:', error);
      throw error;
    }
  }
};
