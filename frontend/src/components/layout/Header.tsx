import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Page titles mapping
  const pageTitles: { [key: string]: { title: string; subtitle: string } } = {
    '/': { title: 'Business Intelligence Dashboard', subtitle: 'Real-time insights for event bidding operations' },
    '/events': { title: 'Events Management', subtitle: 'Track and manage your event opportunities' },
    '/hotels': { title: 'Hotel Partners', subtitle: 'Manage relationships and performance metrics' },
    '/analytics': { title: 'Analytics', subtitle: 'Deep insights and business intelligence' },
    '/chat': { title: 'AI Assistant', subtitle: 'Conversational business intelligence' },
    '/simulator': { title: 'Email Simulator', subtitle: 'Test and simulate incoming requests' },
    '/settings': { title: 'Settings', subtitle: 'Configure your preferences and integrations' }
  };

  const currentPage = pageTitles[location.pathname] || { title: 'MCW Digital Platform', subtitle: 'Event bidding intelligence' };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-6">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Clean Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {currentPage.title}
          </h1>
        </div>
      </div>

      {/* Center Section - Clean Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events, hotels, or ask AI..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Minimal */}
      <div className="flex items-center space-x-4">
        {/* Time Display */}
        <div className="hidden lg:block text-right text-sm text-slate-600">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>

        {/* Quick Action Buttons */}
        <button 
          onClick={() => navigate('/chat')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          💬 Ask AI
        </button>

        <button 
          onClick={() => navigate('/simulator')}
          className="hidden md:block px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          📧 New RFP
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5a5 5 0 0010 0z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SJ</span>
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-slate-900">Sarah Johnson</p>
            <p className="text-xs text-slate-600">Senior Event Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;