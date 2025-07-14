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

  // Page titles mapping - Much shorter titles
  const pageTitles: { [key: string]: { title: string; subtitle: string } } = {
    '/': { title: 'Event Manager', subtitle: 'Real-time insights for event bidding operations' },
    '/events': { title: 'Events', subtitle: 'Track and manage your event opportunities' },
    '/hotels': { title: 'Hotels', subtitle: 'Manage relationships and performance metrics' },
    '/analytics': { title: 'Analytics', subtitle: 'Deep insights and business intelligence' },
    '/chat': { title: 'AI Chat', subtitle: 'Conversational business intelligence' },
    '/bid-processor': { title: 'Bid Processor', subtitle: 'AI-powered bid processing and analysis' },
    '/simulator': { title: 'Bid Processor', subtitle: 'AI-powered bid processing and analysis' },
    '/settings': { title: 'Settings', subtitle: 'Configure your preferences and integrations' }
  };

  const currentPage = pageTitles[location.pathname] || { title: 'Event Manager', subtitle: 'Event bidding intelligence' };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-2 sm:px-4">
      {/* Left Section - Ultra Compact */}
      <div className="flex items-center space-x-1 sm:space-x-3">
        {/* Mobile Menu Button - Smaller */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Ultra Compact Page Title */}
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
            {currentPage.title}
          </h1>
        </div>
      </div>

      {/* Center Section - Search (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Ultra Compact */}
      <div className="flex items-center space-x-1">
        {/* Time Display - Hidden on Mobile & Tablet */}
        <div className="hidden xl:block text-xs text-slate-600 mr-2">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>

        {/* Ultra Compact Action Buttons */}
        <button 
          onClick={() => navigate('/chat')}
          className="px-1.5 sm:px-2 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          💬
        </button>

        <button 
          onClick={() => navigate('/bid-processor')}
          className="px-1.5 sm:px-2 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-xs font-medium"
        >
          📧
        </button>

        {/* Ultra Compact Notifications */}
        <button className="relative p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5a5 5 0 0010 0z" />
          </svg>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
        </button>

        {/* Ultra Compact User Profile */}
        <div className="flex items-center space-x-1 sm:space-x-2 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
          <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xs">SJ</span>
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-slate-900">Sarah</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;