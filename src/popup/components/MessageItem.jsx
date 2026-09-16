// src/popup/components/MessageItem.jsx
import React, { useState } from 'react';

function MessageItem({ message, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const platformColors = {
    chatgpt: '#10a37f',
    claude: '#d97757',
    gemini: '#4285f4',
    unknown: '#6c757d'
  };

  const preview = message.selectedText || message.fullText || '(no text)';
  const shortPreview = preview.length > 100
    ? preview.substring(0, 100) + '...'
    : preview;

  const date = new Date(message.timestamp).toLocaleString();

  const openOriginal = () => {
    if (message.url) {
      chrome.tabs.create({ url: message.url });
    }
  };

  return (
    <li className="message-item">
      <div className="message-meta">
        <span
          className="platform-badge"
          style={{ background: platformColors[message.platform] || '#6c757d' }}
        >
          {message.platform || 'unknown'}
        </span>
        <span className="timestamp">{date}</span>
      </div>

      <div className="message-preview">{shortPreview}</div>

      <div className="message-actions">
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'Show'} full
        </button>
        <button onClick={openOriginal}>Open chat</button>
        <button className="danger" onClick={() => onDelete(message.id)}>
          Delete
        </button>
      </div>

      {expanded && (
        <div className="message-expanded">
          {message.question && (
            <div className="expanded-section">
              <strong>Question:</strong>
              <p>{message.question}</p>
            </div>
          )}
          <div className="expanded-section">
            <strong>Selected:</strong>
            <p>{message.selectedText}</p>
          </div>
          <div className="expanded-section">
            <strong>Full response:</strong>
            <p>{message.fullText}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export default MessageItem;
