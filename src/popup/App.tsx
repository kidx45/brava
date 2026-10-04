// src/popup/App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import MessageList from './components/MessageList';
import Controls from './components/Controls';
import ChatSessionList from './components/ChatSessionList';
import ChatView from './components/ChatView';
import { StorageManager } from '../utils/storage';
import type { ArchivedMessage, ChatSession } from '../utils/constants';

type PopupView = 'archive' | 'chat';

function App() {
  const [view, setView] = useState<PopupView>('archive');

  // Archive state
  const [messages, setMessages] = useState<ArchivedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    const data = await StorageManager.getMessages();
    // Newest first
    setMessages([...data].reverse());
    setLoading(false);
  };

  const loadChatSessions = useCallback(async () => {
    setChatLoading(true);
    try {
      const data = await StorageManager.getChatSessions();
      setSessions(data);
      return data;
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
      setSessions([]);
      return [];
    } finally {
      setChatLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, []);

  // Open directly on the chat tab when the popup URL has ?view=chat
  // (used by the "Go to chat" notification action).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'chat') {
      setView('chat');
      loadChatSessions();
    }
  }, [loadChatSessions]);

  // Pick up the draft saved by the notification's "Go to chat" action.
  useEffect(() => {
    (async () => {
      const pending = await StorageManager.getPendingDraft();
      if (pending?.text) {
        setDraft(pending.text);
        setView('chat');
        await StorageManager.clearPendingDraft();
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    await StorageManager.deleteMessage(id);
    await loadMessages();
  };

  const handleClearAll = async () => {
    if (!confirm('Delete all archived messages? This cannot be undone.')) return;
    await StorageManager.clearAll();
    await loadMessages();
  };

  // ---- Chat handlers ----
  const handleNewChat = async () => {
    const session = await StorageManager.createChatSession();
    await loadChatSessions();
    setActiveSessionId(session.id);
  };

  const handleSelectChat = async (id: string) => {
    setActiveSessionId(id);
  };

  const handleRenameChat = async (id: string, title: string) => {
    await StorageManager.renameChatSession(id, title);
    await loadChatSessions();
  };

  const handleDeleteChat = async (id: string) => {
    await StorageManager.deleteChatSession(id);
    const remaining = await loadChatSessions();
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0]?.id ?? null);
    }
  };

  const handleSendChat = async (text: string) => {
    setChatError(null);
    let sessionId = activeSessionId;

    // First message in a fresh session creates one on the fly.
    if (!sessionId) {
      try {
        const session = await StorageManager.createChatSession();
        sessionId = session.id;
        setActiveSessionId(sessionId);
      } catch (error) {
        setChatError(error instanceof Error ? error.message : 'Failed to create chat');
        return;
      }
    }

    setSending(true);
    try {
      const updated = await StorageManager.sendChatMessage(sessionId, text);
      setSessions(prev => {
        const others = prev.filter(s => s.id !== updated.id);
        return [updated, ...others];
      });
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Brava</h1>
        <span className="count">
          {view === 'archive' ? `${messages.length} archived` : `${sessions.length} chats`}
        </span>
      </header>

      <nav className="tab-bar">
        <button
          className={view === 'archive' ? 'tab active' : 'tab'}
          onClick={() => setView('archive')}
        >
          📚 Archive
        </button>
        <button
          className={view === 'chat' ? 'tab active' : 'tab'}
          onClick={() => setView('chat')}
        >
          💬 Chat
        </button>
      </nav>

      {view === 'archive' ? (
        <>
          <Controls messages={messages} onClearAll={handleClearAll} />
          {loading ? (
            <div className="empty">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="empty">
              <p>No archived messages yet.</p>
              <p className="hint">
                Select text in ChatGPT, Claude, or Gemini and click Archive.
              </p>
            </div>
          ) : (
            <MessageList messages={messages} onDelete={handleDelete} />
          )}
        </>
      ) : activeSession ? (
        <ChatView
          session={activeSession}
          draft={draft}
          onDraftChange={setDraft}
          onBack={() => setActiveSessionId(null)}
          onSend={handleSendChat}
          sending={sending}
        />
      ) : (
        <>
          {chatError && <div className="chat-error">{chatError}</div>}
          {chatLoading ? (
            <div className="empty">Loading chats...</div>
          ) : (
            <ChatSessionList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={handleSelectChat}
              onNew={handleNewChat}
              onRename={handleRenameChat}
              onDelete={handleDeleteChat}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
