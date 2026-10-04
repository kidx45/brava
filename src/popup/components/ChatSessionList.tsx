// src/popup/components/ChatSessionList.tsx
import React from 'react';
import type { ChatSession } from '../../utils/constants';

type ChatSessionListProps = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onNew: () => Promise<void>;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function lastMessagePreview(session: ChatSession): string {
  const last = session.messages[session.messages.length - 1];
  if (!last) return 'No messages yet';
  const text = last.content || '…';
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function ChatSessionList({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onRename,
  onDelete
}: ChatSessionListProps) {
  return (
    <div className="chat-session-list">
      <button className="new-chat-btn" onClick={onNew}>
        ＋ New chat
      </button>

      {sessions.length === 0 ? (
        <div className="empty">
          <p>No chats yet.</p>
          <p className="hint">Start a new chat or archive a message and pick "Go to chat".</p>
        </div>
      ) : (
        <ul>
          {sessions.map((session) => (
            <li
              key={session.id}
              className={`chat-session-item${session.id === activeSessionId ? ' active' : ''}`}
            >
              <button className="session-main" onClick={() => onSelect(session.id)}>
                <span className="session-title">{session.title}</span>
                <span className="session-preview">{lastMessagePreview(session)}</span>
                <span className="session-date">{relativeDate(session.updatedAt)}</span>
              </button>
              <div className="session-actions">
                <button
                  title="Rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    const title = prompt('Rename chat', session.title);
                    if (title && title.trim()) onRename(session.id, title.trim());
                  }}
                >
                  ✏️
                </button>
                <button
                  title="Delete"
                  className="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${session.title}"? This cannot be undone.`)) {
                      onDelete(session.id);
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ChatSessionList;
