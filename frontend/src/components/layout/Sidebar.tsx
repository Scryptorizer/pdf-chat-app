import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
}

const navigation: NavigationItem[] = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    href: '/', 
    icon: '📊',
    badge: 'Live',
    badgeColor: 'bg-emerald-500',
    description: 'Business overview'
  },
  { 
    id: 'events', 
    name: 'Active Events', 
    href: '/events', 
    icon: '🎯',
    badge: '8',
    badgeColor: 'bg-blue-500',
    description: 'Event management'
  },
  { 
    id: 'hotels', 
    name: 'Hotel Partners', 
    href: '/hotels', 
    icon: '🏨',
    description: 'Partner network'
  },
  { 
    id: 'analytics', 
    name: 'Analytics', 
    href: '/analytics', 
    icon: '📈',
    description: 'Business intelligence'
  },
  { 
    id: 'chat', 
    name: 'AI Assistant', 
    href: '/chat', 
    icon: '🤖',
    badge: 'AI',
    badgeColor: 'bg-purple-500',
    description: 'Intelligent insights'
  },
  
  { 
    id: 'settings', 
    name: 'Settings', 
    href: '/settings', 
    icon: '⚙️',
    description: 'Platform config'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
    // Close mobile sidebar after navigation
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 
      bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
      transform transition-all duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static lg:inset-0
      border-r border-slate-700/50
      shadow-2xl lg:shadow-none
    `}>
      
      {/* Enhanced Logo Section */}
      <div className="relative h-20 px-6 bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            {/* Logo with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">M</span>
              </div>
            </div>
            
            <div className="text-white">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                MCW Digital
              </h1>
              <p className="text-xs text-slate-300 font-medium">Event Intelligence Platform</p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-[1.02] shadow-blue-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                  relative overflow-hidden
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-lg"></div>
                )}
                
                {/* Icon with enhanced styling */}
                <span className={`
                  text-xl mr-4 transition-transform duration-200
                  ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                `}>
                  {item.icon}
                </span>
                
                {/* Text content */}
                <div className="flex-1 text-left">
                  <div className="font-semibold">{item.name}</div>
                  {item.description && (
                    <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.description}
                    </div>
                  )}
                </div>
                
                {/* Enhanced Badge */}
                {item.badge && (
                  <span className={`
                    ml-3 px-2.5 py-1 text-xs font-bold rounded-full text-white
                    ${item.badgeColor || 'bg-slate-600'}
                    ${isActive ? 'bg-white/20 shadow-lg' : ''}
                    animate-pulse
                  `}>
                    {item.badge}
                  </span>
                )}
                
                {/* Hover glow effect */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${isActive ? 'hidden' : ''}
                `}></div>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Enhanced User Profile Section */}
      <div className="p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group">
          {/* Enhanced Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-60"></div>
            <div className="relative w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SJ</span>
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800 shadow-lg animate-pulse"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-blue-200 transition-colors">
              Sarah Johnson
            </p>
            <p className="text-xs text-slate-400 truncate">
              Senior Event Manager
            </p>
          </div>
          
          {/* Status indicator */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 mt-1">Online</span>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Pipeline Value</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
              $835K
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Active Events</span>
            <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-1 rounded-full">
              8
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Win Rate</span>
            <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-full">
              41.8%
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced System Status */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
            <span className="text-xs text-slate-400 font-medium">All Systems Operational</span>
          </div>
          <div className="text-xs text-slate-500">
            v2.1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;