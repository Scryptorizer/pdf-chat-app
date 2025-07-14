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

  // FIXED: Better mobile handling with proper cleanup
  useEffect(() => {
    let isHandlingResize = false;
    
    const handleResize = () => {
      if (isHandlingResize) return;
      isHandlingResize = true;
      
      // Close sidebar on desktop
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
      
      // Reset flag after animation
      setTimeout(() => {
        isHandlingResize = false;
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // FIXED: Simplified outside click handler with better mobile support
  useEffect(() => {
    if (!sidebarOpen || window.innerWidth >= 1024) return;

    const handleOutsideClick = (event: TouchEvent | MouseEvent) => {
      const target = event.target as Element;
      const sidebar = document.querySelector('[data-sidebar]');
      const menuButton = document.querySelector('[data-menu-button]');
      
      // Don't close if clicking inside sidebar or menu button
      if (sidebar?.contains(target) || menuButton?.contains(target)) {
        return;
      }
      
      // Close sidebar
      setSidebarOpen(false);
    };

    // Add event listeners with passive option for better mobile performance
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('mousedown', handleOutsideClick, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sidebarOpen]);

  // FIXED: Better route change handling using React Router
  useEffect(() => {
    // Close mobile sidebar when route changes
    if (window.innerWidth < 1024 && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]); // Simplified dependency

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Enhanced loading state with mobile-optimized styling
  if (!mounted) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading MCW Digital Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* FIXED: Enhanced Sidebar with better mobile support */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />

      {/* FIXED: Enhanced mobile overlay with better touch handling */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          onTouchStart={() => setSidebarOpen(false)}
          style={{ touchAction: 'none' }} // Prevent scroll during touch
        />
      )}

      {/* Main Content Container - Enhanced for mobile */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Enhanced Header with mobile-specific styling */}
        <div data-menu-button>
          <Header onMenuClick={toggleSidebar} />
        </div>

        {/* FIXED: Main Content Area with better mobile scrolling */}
        <main 
          className="flex-1 relative overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"
          style={{ 
            WebkitOverflowScrolling: 'touch', // Better iOS scrolling
            height: 'calc(100vh - 64px)' // Account for header height
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

          {/* FIXED: Content Container with proper mobile spacing */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Content with Animation */}
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default MainLayout;