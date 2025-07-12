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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Updated state with initial empty values
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalPipeline: 0,
    activeEvents: 0,
    pendingDecisions: 0,
    winRate: 0,
    avgDealSize: 0,
    deadlinesThisWeek: 0,
    newRfpsToday: 0,
    bidsSubmittedToday: 0,
    monthlyGrowth: 0,
    quarterlyGrowth: 0
  });

  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch real business data from backend
  const fetchBusinessData = async () => {
    try {
      const response = await fetch('https://pdf-chat-app-h0ew.onrender.com/api/business-metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setRecentEvents(data.events);
        setLastUpdated(new Date());
        setError(null);
      } else {
        console.error('Failed to fetch business data:', response.status);
        setError('Failed to load business data');
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
      setError('Network error - using cached data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBusinessData();
  }, []);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusinessData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 border-red-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    if (status.includes('Evaluating')) return 'text-blue-700 bg-blue-100';
    if (status.includes('Open')) return 'text-green-700 bg-green-100';
    if (status.includes('Planning')) return 'text-gray-700 bg-gray-100';
    if (status.includes('Submitted')) return 'text-purple-700 bg-purple-100';
    return 'text-gray-700 bg-gray-100';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business intelligence...</p>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Pipeline',
      value: formatCurrency(metrics.totalPipeline),
      change: `+${metrics.monthlyGrowth}%`,
      changeType: 'positive',
      icon: '💰',
      gradient: 'from-emerald-500 to-teal-600',
      description: 'from last month'
    },
    {
      title: 'Active Events',
      value: metrics.activeEvents.toString(),
      change: `${metrics.deadlinesThisWeek} closing this week`,
      changeType: 'info',
      icon: '🎯',
      gradient: 'from-blue-500 to-cyan-600',
      description: 'opportunities'
    },
    {
      title: 'Win Rate',
      value: `${metrics.winRate.toFixed(1)}%`,
      change: 'vs 35% industry avg',
      changeType: 'positive',
      icon: '📈',
      gradient: 'from-purple-500 to-pink-600',
      description: 'conversion rate'
    },
    {
      title: 'Avg Deal Size',
      value: formatCurrency(metrics.avgDealSize),
      change: `+${metrics.quarterlyGrowth}%`,
      changeType: 'positive',
      icon: '💎',
      gradient: 'from-orange-500 to-red-600',
      description: 'this quarter'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Business Intelligence Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Real-time insights driving event bidding success</p>
          <div className="flex items-center mt-3 space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${error ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
              <span className="text-sm font-medium text-slate-600">
                {error ? 'Offline Mode' : 'Live Data Stream'}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-300"></div>
            <span className="text-sm text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
            {error && (
              <>
                <div className="h-4 w-px bg-slate-300"></div>
                <button 
                  onClick={fetchBusinessData}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/analytics')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            📊 Advanced Analytics
          </button>
          <button 
            onClick={() => navigate('/chat')}
            className="px-6 py-3 bg-white border-2 border-blue-600 text-slate-900 rounded-xl font-semibold hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
          >
            💬 Ask AI
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-orange-600 mr-2">⚠️</span>
            <span className="text-orange-800">{error}</span>
          </div>
        </div>
      )}

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div 
            key={index}
            className="group relative bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            {/* Background Gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${metric.gradient} opacity-80`}></div>
            
            {/* Floating Icon */}
            <div className={`absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-r ${metric.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{metric.icon}</span>
            </div>

            <div className="relative z-10">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
                {metric.title}
              </p>
              <p className="text-3xl font-bold text-slate-900 mb-3">
                {metric.value}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  metric.changeType === 'positive' ? 'text-emerald-700 bg-emerald-100' :
                  metric.changeType === 'negative' ? 'text-red-700 bg-red-100' :
                  'text-blue-700 bg-blue-100'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* High-Priority Events */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">High-Priority Events</h3>
                <p className="text-slate-600 mt-1">Track your most valuable opportunities</p>
              </div>
              <button 
                onClick={() => navigate('/events')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View All Events →
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="group p-5 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate('/events')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {event.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(event.priority)}`}>
                            {event.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-600 font-medium">{event.company}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <span>Due: {formatDate(event.deadline)}</span>
                          <span>•</span>
                          <span className={event.daysLeft <= 30 ? 'text-red-600 font-medium' : ''}>
                            {event.daysLeft} days left
                          </span>
                          <span>•</span>
                          <span>{event.guests} guests</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(event.value)}</p>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{event.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${event.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-3">
                      <span>Manager: {event.manager}</span>
                      <span>{event.bidCount} bids received</span>
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

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Today's Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
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

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: '💬', label: 'Ask AI Assistant', action: () => navigate('/chat'), gradient: 'from-blue-500 to-purple-600' },
                { icon: '🚀', label: 'Process New Bid', action: () => navigate('/bid-processor'), gradient: 'from-emerald-500 to-teal-600' },
                { icon: '📊', label: 'Export Reports', action: () => navigate('/analytics'), gradient: 'from-orange-500 to-red-600' },
                { icon: '🏨', label: 'Partner Performance', action: () => navigate('/hotels'), gradient: 'from-purple-500 to-pink-600' }
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`w-full flex items-center space-x-3 p-4 bg-gradient-to-r ${action.gradient} text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200`}
                >
                  <span className="text-xl">{action.icon}</span>
                  <span className="font-semibold">{action.label}</span>
                  <span className="ml-auto">→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Urgent Alerts */}
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
              {recentEvents.filter(e => e.daysLeft <= 30).length === 0 && (
                <div className="p-3 bg-white rounded-lg border border-red-200">
                  <p className="text-sm text-red-800 font-medium">
                    <strong>No urgent deadlines</strong> - All events are on track
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Revenue Pipeline Trend</h3>
            <p className="text-slate-600 mt-1">Monthly performance and growth trajectory</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-slate-500">This Month:</span>
              <span className="font-bold text-emerald-600 ml-2">+{metrics.monthlyGrowth}%</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Quarter:</span>
              <span className="font-bold text-blue-600 ml-2">+{metrics.quarterlyGrowth}%</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300">
          <div className="text-center">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-slate-700 font-semibold text-lg">Interactive Revenue Chart</p>
            <p className="text-slate-500 mt-2">Real-time pipeline: {formatCurrency(metrics.totalPipeline)}</p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-600">Revenue Growth: +{metrics.monthlyGrowth}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-slate-600">Pipeline Health: Excellent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;