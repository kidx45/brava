// src/popup/components/MessageList.tsx
import React from 'react';
import MessageItem from './MessageItem';
import type { ArchivedMessage } from '../../utils/constants';

type MessageListProps = {
  messages: ArchivedMessage[];
  onDelete: (id: string) => Promise<void>;
};

function MessageList({ messages, onDelete }: MessageListProps) {
  return (
    <ul className="message-list">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} onDelete={onDelete} />
      ))}
    </ul>
  );
}

export default MessageList;
