// src/content/components/Notification.jsx
import React, { useEffect } from 'react';

function Notification({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: '#280888',
    error: '#dc3545',
    info: '#17a2b8'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      background: colors[type] || colors.info,
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '400px',
    }}>
      {message}
    </div>
  );
}

export default Notification;
