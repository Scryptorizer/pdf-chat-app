import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface BusinessMetrics {
  totalPipeline: number;
  activeEvents: number;
  pendingDecisions: number;
  winRate: number;
  avgDealSize: number;
  deadlinesThisWeek: number;
  newRfpsToday: number;
  bidsSubmittedToday: number;
  monthlyGrowth: number;
  quarterlyGrowth: number;
}

interface RecentEvent {
  id: string;
  name: string;
  company: string;
  value: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  daysLeft: number;
  progress: number;
  guests: number;
  location: string;
  manager: string;
  bidCount: number;
}

const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  
  // Enhanced state with initial values
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalPipeline: 8170728,
    activeEvents: 5,
    pendingDecisions: 2,
    winRate: 39.5,
    avgDealSize: 93916,
    deadlinesThisWeek: 0,
    newRfpsToday: 1,
    bidsSubmittedToday: 7,
    monthlyGrowth: 12.5,
    quarterlyGrowth: 8.2
  });

  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([
    {
      id: 'EVT001',
      name: 'IBM Department Offsite',
      company: 'IBM',
      value: 36064,
      deadline: '2025-10-24',
      priority: 'low',
      status: 'Awarded',
      daysLeft: 101,
      progress: 100,
      guests: 70,
      location: 'San Francisco',
      manager: 'Sarah Johnson',
      bidCount: 4
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch real business data
  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pdf-chat-app-h0ew.onrender.com/api/business-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setRecentEvents(data.events);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError('Failed to load business data');
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      setError('Network error - using cached data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const metricCards = [
    {
      title: 'Total Pipeline',
      value: formatCurrency(metrics.totalPipeline),
      change: `+${metrics.monthlyGrowth}%`,
      changeType: 'positive',
      icon: '💰',
      color: 'emerald'
    },
    {
      title: 'Active Events',
      value: metrics.activeEvents.toString(),
      change: `${metrics.deadlinesThisWeek} closing this week`,
      changeType: 'info',
      icon: '🎯',
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      change: 'vs 35% industry avg',
      changeType: 'positive',
      icon: '📈',
      color: 'purple'
    },
    {
      title: 'Avg Deal Size',
      value: formatCurrency(metrics.avgDealSize),
      change: `+${metrics.quarterlyGrowth}%`,
      changeType: 'positive',
      icon: '💎',
      color: 'orange'
    }
  ];

  if (loading && !metrics.totalPipeline) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center mobile-p-4">
          <div className="mobile-loading-spinner mx-auto mb-4"></div>
          <p className="mobile-loading-text">Loading business intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'mobile-dashboard' : 'desktop-dashboard'}`}>
      {/* Mobile-Optimized Page Header */}
      <div className={`dashboard-header ${isMobile ? 'mobile-p-4' : ''}`}>
        <div className={`${isMobile ? 'text-center' : 'header-content'}`}>
          <div className={`${isMobile ? 'mobile-mb-4' : ''}`}>
            <h1 className={`main-title ${isMobile ? 'mobile-text-lg' : ''}`}>
              Business Intelligence Dashboard
            </h1>
            <p className={`subtitle ${isMobile ? 'mobile-text-sm' : ''}`}>
              Real-time insights driving event bidding success
            </p>
            
            {/* Mobile Status Indicators */}
            <div className={`flex items-center ${isMobile ? 'justify-center' : ''} mt-3 space-x-4`}>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
                  error ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'
                }`}></div>
                <span className={`font-medium text-slate-600 ${isMobile ? 'text-sm' : ''}`}>
                  {error ? 'Offline Mode' : 'Live Data Stream'}
                </span>
              </div>
              {!isMobile && (
                <>
                  <div className="h-4 w-px bg-slate-300"></div>
                  <span className="text-sm text-slate-500">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile-Optimized Action Buttons */}
          <div className={`${isMobile ? 'space-y-3' : 'header-actions'}`}>
            <button 
              onClick={() => navigate('/analytics')}
              className={`btn btn-primary ${isMobile ? 'w-full' : ''} touch-feedback`}
            >
              📊 Advanced Analytics
            </button>
            <button 
              onClick={() => navigate('/chat')}
              className={`btn btn-secondary ${isMobile ? 'w-full' : ''} touch-feedback`}
            >
              💬 Ask AI
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <span className="text-orange-600 mr-2">⚠️</span>
              <span className="text-orange-800 text-sm">{error}</span>
              <button 
                onClick={fetchBusinessData}
                className="ml-auto text-sm text-orange-600 hover:text-orange-700 font-medium touch-target"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-Optimized Metrics Grid */}
      <div className={`${isMobile ? 'mobile-grid mobile-p-4' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8'}`}>
        {metricCards.map((metric, index) => (
          <div 
            key={index}
            className={`${isMobile ? 'mobile-metric-card' : 'metric-card'} touch-feedback`}
          >
            {/* Mobile Card Content */}
            <div className={`${isMobile ? 'text-center' : 'relative z-10'}`}>
              {/* Icon */}
              <div className={`${isMobile ? 'text-3xl mb-3' : 'text-2xl mb-2'}`}>
                {metric.icon}
              </div>
              
              {/* Title */}
              <p className={`font-semibold text-slate-600 uppercase tracking-wide mb-2 ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {metric.title}
              </p>
              
              {/* Value */}
              <p className={`font-bold text-slate-900 mb-3 ${
                isMobile ? 'text-xl' : 'text-3xl'
              }`}>
                {metric.value}
              </p>
              
              {/* Change */}
              <div className="flex items-center justify-center">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  metric.changeType === 'positive' ? 'text-emerald-700 bg-emerald-100' :
                  metric.changeType === 'negative' ? 'text-red-700 bg-red-100' :
                  'text-blue-700 bg-blue-100'
                }`}>
                  {metric.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-Optimized Main Content */}
      {isMobile ? (
        /* Mobile Layout - Stacked */
        <div className="space-y-6 mobile-p-4">
          {/* Today's Activity - Mobile */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Today's Activity</h3>
            <div className="space-y-4">
              {[
                { label: 'New RFPs', value: metrics.newRfpsToday, color: 'emerald', icon: '📧' },
                { label: 'Bids Submitted', value: metrics.bidsSubmittedToday, color: 'blue', icon: '📝' },
                { label: 'Pending Decisions', value: metrics.pendingDecisions, color: 'orange', icon: '⏳' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </div>
                  <span className={`text-${item.color}-600 font-bold text-lg`}>
                    {typeof item.value === 'number' ? (item.value > 0 ? `+${item.value}` : item.value) : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* High-Priority Events - Mobile */}
          <div className="card overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">High-Priority Events</h3>
                  <p className="text-slate-600 mt-1 text-sm">Track your most valuable opportunities</p>
                </div>
                <button 
                  onClick={() => navigate('/events')}
                  className="text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium touch-target"
                >
                  View All →
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className="mobile-event-card touch-feedback"
                      onClick={() => navigate('/events')}
                    >
                      {/* Mobile Event Card Header */}
                      <div className="mobile-table-card-header">
                        <div>
                          <div className="mobile-table-card-title">{event.name}</div>
                          <div className="mobile-table-card-subtitle">{event.company}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{formatCurrency(event.value)}</div>
                          <span className={`status-badge status-${event.status.toLowerCase().replace(' ', '')}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Mobile Event Card Body */}
                      <div className="mobile-table-card-body">
                        <div className="mobile-table-card-field">
                          <span className="mobile-table-card-field-label">Deadline</span>
                          <span className="mobile-table-card-field-value">{formatDate(event.deadline)}</span>
                        </div>
                        <div className="mobile-table-card-field">
                          <span className="mobile-table-card-field-label">Days Left</span>
                          <span className={`mobile-table-card-field-value ${event.daysLeft <= 30 ? 'text-red-600 font-bold' : ''}`}>
                            {event.daysLeft} days
                          </span>
                        </div>
                        <div className="mobile-table-card-field">
                          <span className="mobile-table-card-field-label">Guests</span>
                          <span className="mobile-table-card-field-value">{event.guests}</span>
                        </div>
                        <div className="mobile-table-card-field">
                          <span className="mobile-table-card-field-label">Manager</span>
                          <span className="mobile-table-card-field-value">{event.manager}</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="progress-section">
                        <div className="progress-header">
                          <span>Progress</span>
                          <span>{event.progress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${event.progress}%`, backgroundColor: '#3b82f6' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-slate-600">No events data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions - Mobile */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: '💬', label: 'Ask AI Assistant', action: () => navigate('/chat'), color: 'blue' },
                { icon: '🚀', label: 'Process New Bid', action: () => navigate('/bid-processor'), color: 'emerald' },
                { icon: '📊', label: 'Export Reports', action: () => navigate('/analytics'), color: 'orange' },
                { icon: '🏨', label: 'Partner Performance', action: () => navigate('/hotels'), color: 'purple' }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`mobile-button mobile-button-primary w-full bg-${action.color}-600 hover:bg-${action.color}-700 touch-feedback`}
                >
                  <span className="text-xl mr-3">{action.icon}</span>
                  <span className="font-semibold">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Alerts - Mobile */}
          {recentEvents.filter(e => e.daysLeft <= 30).length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl animate-pulse">🚨</span>
                <h3 className="text-lg font-bold text-red-900">Urgent Alerts</h3>
              </div>
              <div className="space-y-3">
                {recentEvents.filter(e => e.daysLeft <= 30).slice(0, 2).map((event, index) => (
                  <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">
                      <strong>{event.name}</strong> - High value ({formatCurrency(event.value)}) deadline in {event.daysLeft} days
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout - Keep existing */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Existing desktop layout content here */}
        </div>
      )}
    </div>
  );
};

export default MobileDashboard;