// src/popup/components/ChatView.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ChatSession } from '../../utils/constants';

type ChatViewProps = {
  session: ChatSession | null;
  draft: string;
  onDraftChange: (text: string) => void;
  onBack: () => void;
  onSend: (text: string) => Promise<void>;
  sending: boolean;
};

function ChatView({ session, draft, onDraftChange, onBack, onSend, sending }: ChatViewProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-fill the composer when a draft arrives (e.g. "Go to chat" action).
  useEffect(() => {
    if (draft) setInput(draft);
  }, [draft]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages.length, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    onDraftChange('');
    await onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="icon-btn" onClick={onBack} title="Back to chats">←</button>
        <span className="chat-header-title">{session?.title ?? 'Chat'}</span>
        <span className="chat-concise-badge">concise mode</span>
      </div>

      <div className="chat-messages">
        {!session || session.messages.length === 0 ? (
          <div className="chat-welcome">
            <p>💬 Ask anything.</p>
            <p className="hint">Answers are kept short and simple on purpose.</p>
          </div>
        ) : (
          session.messages.map((msg) => (
            <div key={msg.id} className={`chat-msg ${msg.role}${msg.status === 'error' ? ' error' : ''}`}>
              <div className="chat-bubble">{msg.content || (msg.status === 'pending' ? 'Thinking…' : '…')}</div>
            </div>
          ))
        )}
        {sending && <div className="chat-typing">AI is typing…</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something… (Enter to send, Shift+Enter for newline)"
          rows={2}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()}>
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  );
}

export default ChatView;
