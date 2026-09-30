// src/content/App.tsx
import React, { useState, useEffect } from 'react';
import FloatingButton from './components/FloatingButton';
import Notification from './components/Notification';
import { StorageManager } from '../utils/storage';
import { DOMHelpers } from '../utils/dom';
import { KEYBOARD_SHORTCUTS, type Platform } from '../utils/constants';

function App() {
  const [selectedText, setSelectedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');

  useEffect(() => {
    // Detect platform
    setPlatform(DOMHelpers.detectPlatform());
    console.log(`Brava running on: somthing`);

    // Listen for text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? '';

      if (selection && text.length > 0) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        const messageElement = DOMHelpers.findMessageContainer(container);

        // Keep the selection action available even when ChatGPT changes its
        // message markup and findMessageContainer cannot identify the message.
        setSelectedText(text);
        setShowButton(true);
        setButtonPosition({
          x: window.innerWidth / 2 - 80,
          y: 20
        });
      } else {
        setShowButton(false);
      }
    };

    // Keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, ctrl, shift } = KEYBOARD_SHORTCUTS.ARCHIVE;
      if (e.ctrlKey === ctrl && e.shiftKey === shift && e.key === key) {
        e.preventDefault();
        const selection = window.getSelection();
        if (selection?.toString().trim()) {
          handleArchive();
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [platform]);

  const handleArchive = async () => {
    if (isArchiving) return;
    setIsArchiving(true);

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        throw new Error('No text is selected');
      }
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const messageElement = DOMHelpers.findMessageContainer(container);
      const fullText = messageElement?.textContent ?? selectedText;
      const question = messageElement
        ? DOMHelpers.findPreviousQuestion(messageElement)
        : 'Unknown question';
      const role = messageElement ? DOMHelpers.getMessageRole(messageElement) : 'unknown';
      const url = window.location.href;

      const archiveData = {
        selectedText: selectedText,
        fullText: fullText,
        question: question,
        url: url,
        role: role,
        platform: platform,
        timestamp: new Date().toISOString(),
        chatTitle: document.title || 'Untitled Chat'
      };

      await StorageManager.addMessage(archiveData);

      setNotification({
        type: 'success',
        message: '✨ Archived successfully! (Ctrl+Shift+A)'
      });

      window.getSelection()?.removeAllRanges();
      setShowButton(false);
      setSelectedText('');

    } catch (error) {
      console.error('Archive failed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to archive: ' + (error instanceof Error ? error.message : String(error))
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(null);
  };

  return (
    <>
      {showButton && (
        <FloatingButton
          position={buttonPosition}
          onArchive={handleArchive}
          selectedText={selectedText}
          isArchiving={isArchiving}
          platform={platform}
        />
      )}
      {notification && (
        <Notification
          {...notification}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
}

export default App;

type NotificationState = {
  type: 'success' | 'error' | 'info';
  message: string;
};
