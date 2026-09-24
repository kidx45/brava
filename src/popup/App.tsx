// src/popup/App.tsx
import React, { useState, useEffect } from 'react';
import MessageList from './components/MessageList';
import Controls from './components/Controls';
import { StorageManager } from '../utils/storage';
import type { ArchivedMessage } from '../utils/constants';

function App() {
  const [messages, setMessages] = useState<ArchivedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    const data = await StorageManager.getMessages();
    // Newest first
    setMessages([...data].reverse());
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Brava</h1>
        <span className="count">{messages.length} archived</span>
      </header>

      <Controls
        messages={messages}
        onClearAll={handleClearAll}
      />

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
    </div>
  );
}

export default App;
