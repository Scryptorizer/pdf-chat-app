import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setMounted(true);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced mobile sidebar handling
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      // Prevent body scroll when mobile sidebar is open
      document.body.style.overflow = 'hidden';
      
      // Close sidebar on escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSidebarOpen(false);
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [sidebarOpen, isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Enhanced loading state with mobile optimization
  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center mobile-loading">
        <div className="text-center mobile-p-4">
          <div className="mobile-loading-spinner mx-auto mb-4"></div>
          <p className="mobile-loading-text">Loading MCW Digital Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Enhanced Mobile Sidebar */}
      {isMobile ? (
        <>
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={toggleSidebar}
              onTouchStart={(e) => {
                e.preventDefault();
                toggleSidebar();
              }}
            />
          )}
          
          {/* Mobile Sidebar */}
          <div className={`sidebar-mobile ${sidebarOpen ? 'open' : ''}`}>
            {/* Mobile Sidebar Header */}
            <div className="sidebar-header">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-lg font-bold">MCW Digital</h1>
                  <p className="text-xs text-slate-300">Event Intelligence</p>
                </div>
              </div>
              
              <button
                onClick={toggleSidebar}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-700/50 touch-target"
                aria-label="Close sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="sidebar-nav mobile-scroll">
              <MobileNavigation onItemClick={toggleSidebar} />
            </nav>
            
            {/* Mobile User Profile */}
            <div className="p-4 border-t border-slate-700/50">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-700/30">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SJ</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">Sarah Johnson</p>
                  <p className="text-xs text-slate-400 truncate">Senior Event Manager</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Desktop Sidebar */
        <Sidebar isOpen={true} onToggle={toggleSidebar} />
      )}

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Enhanced Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Main Content Area with Mobile Optimizations */}
        <main 
          id="main-content"
          className="flex-1 relative overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 mobile-scroll"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

          {/* Enhanced Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto mobile-container px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Content with Enhanced Animation */}
            <div className={`${isMobile ? 'animate-slide-in-bottom' : 'animate-fadeIn'}`}>
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Skip to content link - FIXED */}
      <a 
        href="#main-content" 
        className="skip-to-content focus-mobile"
        onFocus={(e) => e.target.style.transform = 'translateY(0)'}
        onBlur={(e) => e.target.style.transform = 'translateY(-100%)'}
      >
        Skip to main content
      </a>
    </div>
  );
};

// Enhanced Mobile Navigation Component
const MobileNavigation: React.FC<{ onItemClick: () => void }> = ({ onItemClick }) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', href: '/', icon: '📊', badge: 'Live' },
    { id: 'events', name: 'Active Events', href: '/events', icon: '🎯', badge: '8' },
    { id: 'hotels', name: 'Hotel Partners', href: '/hotels', icon: '🏨' },
    { id: 'analytics', name: 'Analytics', href: '/analytics', icon: '📈' },
    { id: 'chat', name: 'AI Assistant', href: '/chat', icon: '🤖', badge: 'AI' },
    { id: 'settings', name: 'Settings', href: '/settings', icon: '⚙️' }
  ];

  const location = window.location.pathname;

  const handleNavigation = (href: string) => {
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    onItemClick();
  };

  return (
    <div className="space-y-2">
      {navigation.map((item) => {
        const isActive = location === item.href;
        
        return (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.href)}
            className={`nav-item touch-feedback ${isActive ? 'active' : ''}`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  isActive ? 'bg-white/20' : 'bg-blue-500'
                } text-white`}>
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default MainLayout;