// src/content/components/Notification.tsx
import React, { useEffect } from 'react';

export type NotificationAction = {
  label: string;
  kind: 'primary' | 'secondary';
  onClick: () => void | Promise<void>;
};

type NotificationProps = {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  actions?: NotificationAction[];
};

function Notification({ type, message, onClose, actions }: NotificationProps) {
  // Auto-dismiss only when there are no action buttons; with actions the
  // user decides (e.g. "Save for later" vs "Go to chat").
  useEffect(() => {
    if (actions && actions.length > 0) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose, actions]);

  const colors: Record<NotificationProps['type'], string> = {
    success: '#280888',
    error: '#dc3545',
    info: '#17a2b8'
  };

  return (
    <div className="brava-notification" style={{
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
      <div>{message}</div>
      {actions && actions.length > 0 && (
        <div className="brava-notification-actions" style={{
          display: 'flex',
          gap: '8px',
          marginTop: '10px'
        }}>
          {actions.map((action) => (
            <button
              key={action.label}
              className="brava-notification-btn"
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                cursor: 'pointer',
                border: action.kind === 'primary'
                  ? '1px solid rgba(255,255,255,0.9)'
                  : '1px solid rgba(255,255,255,0.4)',
                background: action.kind === 'primary'
                  ? 'rgba(255,255,255,0.95)'
                  : 'transparent',
                color: action.kind === 'primary' ? colors[type] : 'white',
                fontWeight: action.kind === 'primary' ? 600 : 400
              }}
              onClick={() => {
                void action.onClick();
                onClose();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notification;
