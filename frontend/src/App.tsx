import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface StreamResponse {
  type: 'content' | 'error' | 'done';
  content?: string;
  conversation_id?: string;
  message_id?: string;
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState(() => {
    const id = Math.random().toString(36).substring(2, 15);
    return [id];
  });
  const [activeConversationId, setActiveConversationId] = useState(() => conversations[0]);
  const [conversationMessages, setConversationMessages] = useState<{[key: string]: Message[]}>(() => ({
    [conversations[0]]: []
  }));
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [tokenStats, setTokenStats] = useState({ total_messages: 0, total_conversations: 0 });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = conversationMessages[activeConversationId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const fetchTokenStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/usage/tokens');
      if (response.ok) {
        const stats = await response.json();
        setTokenStats(stats);
      }
    } catch (error) {
      console.warn('Failed to fetch token stats:', error);
    }
  };

  useEffect(() => {
    fetchTokenStats();
    const interval = setInterval(fetchTokenStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 15),
      content,
      role,
      timestamp: new Date()
    };
    
    setConversationMessages(prev => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMessage]
    }));
    
    return newMessage.id;
  };

  const updateLastMessage = (content: string) => {
    setConversationMessages(prev => {
      const currentMessages = prev[activeConversationId] || [];
      if (currentMessages.length > 0) {
        const updatedMessages = [...currentMessages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content
        };
        return {
          ...prev,
          [activeConversationId]: updatedMessages
        };
      }
      return prev;
    });
  };

  const createNewConversation = () => {
    const newId = Math.random().toString(36).substring(2, 15);
    setConversations(prev => [...prev, newId]);
    setActiveConversationId(newId);
    setConversationMessages(prev => ({
      ...prev,
      [newId]: []
    }));
  };

  const switchConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
  
    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
  
    addMessage(userMessage, 'user');
  
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: activeConversationId
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }
  
      let assistantMessageId: string | null = null;
      let accumulatedContent = '';
      const decoder = new TextDecoder();
  
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsLoading(false);
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last line in buffer (might be incomplete)
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.includes('{"type":')) {
              try {
                // Find the JSON part (skip any "data:" prefixes)
                const jsonStart = line.indexOf('{"type":');
                const jsonStr = line.substring(jsonStart).trim();
                if (!jsonStr) continue;
                const data = JSON.parse(jsonStr);
                
                if (data.type === 'content' && data.content) {
                  accumulatedContent += data.content;
                  
                  if (!assistantMessageId) {
                    assistantMessageId = addMessage(accumulatedContent, 'assistant');
                  } else {
                    updateLastMessage(accumulatedContent);
                  }
                } else if (data.type === 'done') {
                  setIsLoading(false);
                  return;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
  
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's a rate limit error
      if (error instanceof Error && error.message.includes('429')) {
        addMessage('🚦 Whoa, slow down there! You\'ve hit the rate limit (10 messages per minute). Take a coffee break and try again in a minute! ☕', 'assistant');
      } else {
        addMessage('Sorry, I encountered a connection error. Please try again.', 'assistant');
      }
      
      setIsLoading(false);
      setIsConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        setIsConnected(true);
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    try {
      // Call backend to clear conversation
      await fetch(`http://localhost:8000/api/conversations/${activeConversationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.warn('Failed to clear conversation on backend:', error);
    }
    
    setConversationMessages(prev => ({
      ...prev,
      [activeConversationId]: []
    }));
  };
  
  const exportConversation = async (format: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/conversations/${activeConversationId}/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${activeConversationId}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const trySampleQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* MAIN HEADER - Clean and minimal */}
      <header className="app-header">
        <div className="header-main">
          <div className="title-section">
            <h1>PDF Chat Assistant</h1>
            <p>Ask questions about accessible travel laws and regulations</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* STATUS BAR - Centered connection info */}
      <div className="status-bar">
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </span>
        <span className="token-stats">
          📊 Messages: {tokenStats.total_messages} | Conversations: {tokenStats.total_conversations}
        </span>
      </div>

      {/* CONVERSATION TABS - With action buttons */}
      <div className="conversation-controls">
        <div className="chat-actions-left">
          <button 
            onClick={createNewConversation}
            className="action-button"
          >
            ➕ New Chat
          </button>
          <button 
            onClick={clearConversation}
            className="action-button"
            disabled={currentMessages.length === 0}
          >
            🗑️ Clear
          </button>
        </div>

        {conversations.length > 1 && (
          <div className="conversation-tabs">
            {conversations.map((convId, index) => (
              <button
                key={convId}
                onClick={() => switchConversation(convId)}
                className={`conversation-tab ${convId === activeConversationId ? 'active' : ''}`}
              >
                Chat {index + 1}
              </button>
            ))}
          </div>
        )}

        <div className="chat-actions-right">
          <select 
            onChange={(e) => e.target.value && exportConversation(e.target.value)}
            className="export-select"
            disabled={currentMessages.length === 0}
          >
            <option value="">📤 Export...</option>
            <option value="txt">📝 Text</option>
            <option value="markdown">📄 Markdown</option>
            <option value="json">📋 JSON</option>
          </select>
        </div>
      </div>

      <main className="chat-container">
        <div className="messages-container">
          {currentMessages.length === 0 ? (
            <div className="welcome-message">
              <h2>👋 Welcome!</h2>
              <p>I'm here to answer questions about accessible travel laws and regulations based on the loaded PDF document.</p>
              <div className="sample-questions">
                <p><strong>Try asking:</strong></p>
                <ul>
                  {[
                    "What is the ADA?",
                    "Tell me about accessibility laws in Canada",
                    "How many people globally have disabilities?",
                    "What does the document say about transportation?"
                  ].map((question, index) => (
                    <li key={index} onClick={() => trySampleQuestion(question)}>
                      "{question}"
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            currentMessages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-header">
                  <span className="message-role">
                    {message.role === 'user' ? '👤 You' : '🤖 Assistant'}
                  </span>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="message assistant-message loading">
              <div className="message-header">
                <span className="message-role">🤖 Assistant</span>
                <span className="message-time">typing...</span>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about accessible travel..."
              disabled={isLoading || !isConnected}
              rows={1}
              className="message-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || !isConnected}
              className="send-button"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
            {!isConnected && ' • Backend connection lost'}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;