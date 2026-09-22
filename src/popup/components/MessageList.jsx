// src/popup/components/MessageList.jsx
import React from 'react';
import MessageItem from './MessageItem.jsx';

function MessageList({ messages, onDelete }) {
  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default MessageList;
