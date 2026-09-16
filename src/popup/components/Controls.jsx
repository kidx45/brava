// src/popup/components/Controls.jsx
import React from 'react';

function Controls({ messages, onClearAll }) {
  const exportAll = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Brava',
      total: messages.length,
      messages
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brava-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="controls">
      <button onClick={exportAll} disabled={messages.length === 0}>
        📤 Export all
      </button>
      <button
        className="danger"
        onClick={onClearAll}
        disabled={messages.length === 0}
      >
        🗑️ Clear all
      </button>
    </div>
  );
}

export default Controls;
