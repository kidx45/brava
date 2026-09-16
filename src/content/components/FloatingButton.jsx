// src/content/components/FloatingButton.jsx
import React from 'react';

function FloatingButton({ position, onArchive, selectedText, isArchiving, platform }) {
  const maxLength = 30;
  const displayText = selectedText.length > maxLength
    ? selectedText.substring(0, maxLength) + '...'
    : selectedText;

  const platformColors = {
    chatgpt: '#ad1766',
    claude: '#d97757',
    gemini: '#4285f4',
    unknown: '#6c757d'
  };

  return (
    <div
      className="floating-archive-btn"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        zIndex: 9999,
        display: 'flex',
        gap: '8px',
        background: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        border: '1px solid #e0e0e0',
        alignItems: 'center',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={onArchive}
        disabled={isArchiving}
        className="archive-action-btn"
        style={{
          padding: '6px 16px',
          background: isArchiving ? '#6c757d' : platformColors[platform] || '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isArchiving ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s',
        }}
      >
        {isArchiving ? '⏳ Saving...' : '📥 Archive'}
      </button>
      <span style={{
        fontSize: '12px',
        color: '#666',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        background: '#f8f9fa',
        borderRadius: '4px',
      }}>
        "{displayText}"
      </span>
      {platform && (
        <span style={{
          fontSize: '10px',
          color: '#999',
          textTransform: 'uppercase',
          padding: '2px 6px',
          background: '#f0f0f0',
          borderRadius: '3px',
        }}>
          {platform}
        </span>
      )}
    </div>
  );
}

export default FloatingButton;
