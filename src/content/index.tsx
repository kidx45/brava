// src/content/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/content.css';

// Function to safely inject our app
function injectApp() {
  try {
    // Check if we're on a supported page
    const isChatGPT = window.location.href.includes('chat.openai.com') ||
      window.location.href.includes('chatgpt.com');
    const isClaude = window.location.href.includes('claude.ai');
    const isGemini = window.location.href.includes('gemini.google.com');

    if (!isChatGPT && !isClaude && !isGemini) {
      console.log('Brava: Not on a supported platform');
      return;
    }

    // Create container for our React app
    const container = document.createElement('div');
    container.id = 'brava-root';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 99999;
    `;
    document.body.appendChild(container);

    // Mount React with error boundary
    try {
      const root = ReactDOM.createRoot(container);
      root.render(<App />);
      console.log('Brava: Successfully mounted');
    } catch (error) {
      console.error('Brava: Failed to mount React:', error);
      // Fallback: Remove container if React fails
      container.remove();
    }
  } catch (error) {
    console.error('Brava: Injection failed:', error);
  }
}

// Wait for page to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectApp);
} else {
  // Use setTimeout to ensure DOM is fully ready
  setTimeout(injectApp, 100);
}
