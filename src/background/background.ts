// src/background/background.js
import {
  APP,
  STORAGE,
  MESSAGE_TYPES,
  AI_CONFIG,
  type ArchivedMessage,
  type ArchiveMessageData,
  type ChatMessage,
  type ChatSession,
  type PendingChatDraft
} from '../utils/constants';
import { AIClient } from '../utils/aiClient';

console.log(`${APP.NAME} v${APP.VERSION} background script loaded`);

// Listen for installation
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log(`${APP.NAME} installed!`, details);

  if (details.reason === 'install') {
    console.log('First time install - initializing storage');
    await initializeStorage();
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Initialize storage
async function initializeStorage() {
  try {
    const result = await chrome.storage.local.get([STORAGE.KEY]);
    if (!result[STORAGE.KEY]) {
      await chrome.storage.local.set({ [STORAGE.KEY]: STORAGE.DEFAULT_VALUE });
      console.log('Storage initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type);

  switch (request.type) {
    case MESSAGE_TYPES.ARCHIVE_MESSAGE:
      handleArchiveMessage(request.data)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.GET_MESSAGES:
      getMessages()
        .then(messages => sendResponse({ success: true, messages }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.DELETE_MESSAGE:
      deleteMessage(request.id)
        .then(result => sendResponse({ success: true, messages: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.CLEAR_ALL:
      clearAllMessages()
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.GET_STATS:
      getStats()
        .then(stats => sendResponse({ success: true, stats }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    // ---- Chat ----
    case MESSAGE_TYPES.GET_CHAT_SESSIONS:
      getChatSessions()
        .then(sessions => sendResponse({ success: true, sessions }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.CREATE_CHAT_SESSION:
      createChatSession(request.title)
        .then(session => sendResponse({ success: true, session }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.SEND_CHAT_MESSAGE:
      sendChatMessage(request.sessionId, request.content)
        .then(session => sendResponse({ success: true, session }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.RENAME_CHAT_SESSION:
      renameChatSession(request.sessionId, request.title)
        .then(session => sendResponse({ success: true, session }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.DELETE_CHAT_SESSION:
      deleteChatSession(request.sessionId)
        .then(sessions => sendResponse({ success: true, sessions }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    // ---- Pending draft (notification -> popup handoff) ----
    case MESSAGE_TYPES.SAVE_PENDING_DRAFT:
      savePendingDraft(request.draft ?? null)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.GET_PENDING_DRAFT:
      getPendingDraft()
        .then(draft => sendResponse({ success: true, draft }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case MESSAGE_TYPES.OPEN_POPUP_CHAT:
      openChatWindow(request.draftText)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Helper functions
async function handleArchiveMessage(data: ArchiveMessageData): Promise<ArchivedMessage> {
  try {
    const result = await chrome.storage.local.get([STORAGE.KEY]);
    const messages = (result[STORAGE.KEY] as ArchivedMessage[] | undefined) || [];
    const newMessage = {
      ...data,
      id: data.id || Date.now().toString(),
      archivedAt: new Date().toISOString()
    };
    messages.push(newMessage);
    await chrome.storage.local.set({ [STORAGE.KEY]: messages });
    console.log(`Message archived successfully. Total: ${messages.length}`);
    return newMessage;
  } catch (error) {
    console.error('Error archiving message:', error);
    throw error;
  }
}

async function getMessages(): Promise<ArchivedMessage[]> {
  try {
    const result = await chrome.storage.local.get([STORAGE.KEY]);
    return (result[STORAGE.KEY] as ArchivedMessage[] | undefined) || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

async function deleteMessage(id: string): Promise<ArchivedMessage[]> {
  try {
    const messages = await getMessages();
    const filtered = messages.filter(msg => msg.id !== id);
    await chrome.storage.local.set({ [STORAGE.KEY]: filtered });
    console.log(`Message deleted. Remaining: ${filtered.length}`);
    return filtered;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
}

async function clearAllMessages() {
  try {
    await chrome.storage.local.set({ [STORAGE.KEY]: [] });
    console.log('All messages cleared');
  } catch (error) {
    console.error('Error clearing messages:', error);
    throw error;
  }
}

async function getStats(): Promise<{ total: number; todayCount: number; platforms: Record<string, number> }> {
  try {
    const messages = await getMessages();
    const total = messages.length;
    const today = new Date().toDateString();
    const todayCount = messages.filter(msg =>
      new Date(msg.timestamp).toDateString() === today
    ).length;

    const platforms: Record<string, number> = {};
    messages.forEach(msg => {
      const platform = msg.platform || 'unknown';
      platforms[platform] = (platforms[platform] || 0) + 1;
    });

    return { total, todayCount, platforms };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}

// ---- Chat helpers ----
async function getChatSessions(): Promise<ChatSession[]> {
  try {
    const result = await chrome.storage.local.get([STORAGE.CHAT_SESSIONS_KEY]);
    const sessions = (result[STORAGE.CHAT_SESSIONS_KEY] as ChatSession[] | undefined) || [];
    return [...sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch (error) {
    console.error('Error getting chat sessions:', error);
    throw error;
  }
}

async function createChatSession(title?: string): Promise<ChatSession> {
  try {
    const now = new Date().toISOString();
    const session: ChatSession = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title || 'New chat',
      createdAt: now,
      updatedAt: now,
      messages: []
    };
    const sessions = await getChatSessions();
    sessions.unshift(session);
    await chrome.storage.local.set({ [STORAGE.CHAT_SESSIONS_KEY]: sessions });
    console.log(`Chat session created: ${session.id}`);
    return session;
  } catch (error) {
    console.error('Error creating chat session:', error);
    throw error;
  }
}

async function withChatSession(
  sessionId: string,
  mutate: (session: ChatSession) => ChatSession | Promise<ChatSession>
): Promise<ChatSession> {
  const sessions = await getChatSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index === -1) {
    throw new Error('Chat session not found');
  }
  const updated = await mutate(sessions[index]);
  sessions[index] = updated;
  await chrome.storage.local.set({ [STORAGE.CHAT_SESSIONS_KEY]: sessions });
  return updated;
}

async function sendChatMessage(sessionId: string, content: string): Promise<ChatSession> {
  try {
    const trimmed = content.trim();
    if (!trimmed) throw new Error('Message is empty');

    const now = new Date().toISOString();
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: trimmed,
      timestamp: now,
      status: 'done'
    };
    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: '',
      timestamp: now,
      status: 'pending'
    };

    // Store the user turn first so nothing is lost if the AI call fails.
    let history: ChatMessage[] = [];
    await withChatSession(sessionId, (session) => {
      history = [...session.messages, userMessage];
      return {
        ...session,
        title: session.title === 'New chat'
          ? deriveTitle(trimmed)
          : session.title,
        messages: history,
        updatedAt: now
      };
    });

    // TODO: replace with a fetch to the Go backend (see src/utils/aiClient.ts).
    let replyText = '';
    try {
      replyText = AIClient.stubReply(history.map(m => ({ role: m.role, content: m.content })));
    } catch (aiError) {
      console.error('AI reply failed:', aiError);
      replyText = 'Sorry, the AI is not reachable right now. Please try again.';
    }

    return await withChatSession(sessionId, (session) => ({
      ...session,
      messages: session.messages.map(m =>
        m.id === assistantMessage.id
          ? { ...m, content: replyText, status: 'done' as const, timestamp: new Date().toISOString() }
          : m
      ),
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

function deriveTitle(text: string): string {
  return text.length > 32 ? text.slice(0, 32).trimEnd() + '…' : text;
}

async function renameChatSession(sessionId: string, title: string): Promise<ChatSession> {
  try {
    const trimmed = title.trim();
    if (!trimmed) throw new Error('Title is empty');
    return await withChatSession(sessionId, (session) => ({
      ...session,
      title: trimmed,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error renaming chat session:', error);
    throw error;
  }
}

async function deleteChatSession(sessionId: string): Promise<ChatSession[]> {
  try {
    const sessions = await getChatSessions();
    const remaining = sessions.filter(s => s.id !== sessionId);
    await chrome.storage.local.set({ [STORAGE.CHAT_SESSIONS_KEY]: remaining });
    console.log(`Chat session deleted. Remaining: ${remaining.length}`);
    return remaining;
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
}

// ---- Pending draft helpers ----
async function savePendingDraft(draft: PendingChatDraft | null): Promise<void> {
  try {
    if (draft === null) {
      await chrome.storage.local.remove([STORAGE.PENDING_CHAT_DRAFT_KEY]);
    } else {
      await chrome.storage.local.set({ [STORAGE.PENDING_CHAT_DRAFT_KEY]: draft });
    }
  } catch (error) {
    console.error('Error saving pending draft:', error);
    throw error;
  }
}

async function getPendingDraft(): Promise<PendingChatDraft | null> {
  try {
    const result = await chrome.storage.local.get([STORAGE.PENDING_CHAT_DRAFT_KEY]);
    return (result[STORAGE.PENDING_CHAT_DRAFT_KEY] as PendingChatDraft | undefined) || null;
  } catch (error) {
    console.error('Error getting pending draft:', error);
    throw error;
  }
}

// Opens the popup page in a small standalone window and seeds the chat draft.
// Used by the notification's "Go to chat" action.
async function openChatWindow(draftText?: string): Promise<void> {
  try {
    if (draftText) {
      await savePendingDraft({
        text: draftText,
        chatTitle: 'From archive',
        platform: 'unknown',
        sourceUrl: '',
        createdAt: new Date().toISOString()
      });
    }
    await chrome.windows.create({
      url: chrome.runtime.getURL('popup.html?view=chat'),
      type: 'popup',
      width: 420,
      height: 600
    });
  } catch (error) {
    console.error('Error opening chat window:', error);
    throw error;
  }
}

// Context menu for archiving
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'archive-selection',
    title: 'Archive with Brava',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'archive-selection' && info.selectionText && tab?.id !== undefined) {
    // Send message to content script
    chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TYPES.ARCHIVE_SELECTION,
      text: info.selectionText
    });
  }
});

// Optional: Badge update
async function updateBadge() {
  try {
    const stats = await getStats();
    const count = stats.total;
    if (count > 0) {
      chrome.action.setBadgeText({ text: count.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#007bff' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Update badge on storage change
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes[STORAGE.KEY]) {
    updateBadge();
  }
});

// Initial badge update
updateBadge();
