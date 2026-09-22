// src/background/background.js
import { APP, STORAGE, MESSAGE_TYPES } from '../utils/constants.js';

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

    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Helper functions
async function handleArchiveMessage(data) {
  try {
    const result = await chrome.storage.local.get([STORAGE.KEY]);
    const messages = result[STORAGE.KEY] || [];
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

async function getMessages() {
  try {
    const result = await chrome.storage.local.get([STORAGE.KEY]);
    return result[STORAGE.KEY] || [];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

async function deleteMessage(id) {
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

async function getStats() {
  try {
    const messages = await getMessages();
    const total = messages.length;
    const today = new Date().toDateString();
    const todayCount = messages.filter(msg =>
      new Date(msg.timestamp).toDateString() === today
    ).length;

    const platforms = {};
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

// Context menu for archiving
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'archive-selection',
    title: 'Archive with Brava',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'archive-selection' && info.selectionText) {
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
