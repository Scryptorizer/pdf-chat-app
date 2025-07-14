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

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (sidebarOpen) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          setSidebarOpen(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [sidebarOpen]);

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
        <Header onMenuClick={toggleSidebar} />

        {/* Main Content Area - Mobile-optimized scrolling */}
        <main className="flex-1 relative overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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

      {/* Enhanced Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
          onTouchStart={toggleSidebar} // Better mobile touch handling
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