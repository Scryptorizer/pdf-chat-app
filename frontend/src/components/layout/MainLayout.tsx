import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when clicking outside on mobile or when screen resizes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      const sidebar = document.querySelector('[data-sidebar]');
      const menuButton = document.querySelector('[data-menu-button]');
      
      if (
        window.innerWidth < 1024 && 
        sidebarOpen && 
        sidebar && 
        !sidebar.contains(target) && 
        !menuButton?.contains(target)
      ) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    
    // Listen for URL changes (React Router navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Enhanced loading state with mobile-optimized styling
  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center mobile-loading">
        <div className="text-center">
          <div className="mobile-loading-spinner mx-auto mb-4"></div>
          <p className="mobile-loading-text">Loading MCW Digital Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Enhanced Sidebar with mobile-specific classes */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />

      {/* Main Content Container - Enhanced for mobile */}
      <div className="flex-1 flex flex-col min-h-0 lg:ml-0">
        {/* Enhanced Header with mobile-specific styling */}
        <div data-menu-button>
          <Header onMenuClick={toggleSidebar} />
        </div>

        {/* Main Content Area - Mobile-optimized scrolling */}
        <main 
          className="flex-1 relative overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
          onClick={() => {
            // Close sidebar when clicking on main content on mobile
            if (window.innerWidth < 1024 && sidebarOpen) {
              setSidebarOpen(false);
            }
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

          {/* Content Container - Mobile-responsive padding */}
          <div className="relative z-10 max-w-7xl mx-auto mobile-container px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Content with Animation */}
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Mobile Sidebar Overlay with better touch handling */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={(e) => {
            e.preventDefault();
            setSidebarOpen(false);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setSidebarOpen(false);
          }}
        />
      )}
      
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
    </div>
  );
};

export default MainLayout;