// @ts-nocheck
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/business/Dashboard';
import ChatInterface from './components/ChatInterface';
import BidProcessingEngine from './components/business/BidProcessingEngine';
import './App.css';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ConversationMessages {
  [key: string]: Message[];
}

// Simple placeholder components for pages we haven't built yet
const EventsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">📅 Events Management</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Management Coming Soon</h2>
        <p className="text-gray-600">Advanced event tracking and management features</p>
      </div>
    </div>
  </div>
);

const HotelsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">🏨 Hotel Partners</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🏨</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Hotel Partner Management Coming Soon</h2>
        <p className="text-gray-600">Partner performance tracking and relationship management</p>
      </div>
    </div>
  </div>
);

const AnalyticsPage: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">📈 Analytics</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics Coming Soon</h2>
        <p className="text-gray-600">Detailed reporting and business intelligence insights</p>
      </div>
    </div>
  </div>
);

const Settings: React.FC = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">⚙️ Settings</h1>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Platform Settings Coming Soon</h2>
        <p className="text-gray-600">User preferences, API configuration, and platform settings</p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  // Global chat state - persists across navigation
  const [chatConversations, setChatConversations] = useState(() => {
    const id = Math.random().toString(36).substring(2, 15);
    return [id];
  });
  
  const [chatActiveConversation, setChatActiveConversation] = useState(() => {
    return chatConversations[0];
  });
  
  const [chatMessages, setChatMessages] = useState(() => {
    return { [chatConversations[0]]: [] };
  });

  return (
    <Router>
      <div className="App min-h-screen bg-slate-50">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/chat" element={
              <ChatInterface 
                conversations={chatConversations}
                setConversations={setChatConversations}
                activeConversationId={chatActiveConversation}
                setActiveConversationId={setChatActiveConversation}
                conversationMessages={chatMessages}
                setConversationMessages={setChatMessages}
              />
            } />
            <Route path="/bid-processor" element={<BidProcessingEngine />} />
            <Route path="/simulator" element={<BidProcessingEngine />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
};

export default App;