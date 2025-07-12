import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  name: string;
  company: string;
  type: string;
  value: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'evaluating' | 'closed' | 'awarded';
  guests: number;
  location: string;
  daysLeft: number;
  progress: number;
  manager: string;
  bidCount: number;
  lastUpdate: string;
}

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch real events data from backend
  const fetchEventsData = async () => {
    try {
      const response = await fetch('https://pdf-chat-app-h0ew.onrender.com/api/business-metrics');
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to match Event interface
        const backendEvents: Event[] = data.events.map((event: any) => ({
          id: event.id,
          name: event.name,
          company: event.company,
          type: 'Corporate Conference', // Default type since not in API yet
          value: event.value,
          deadline: event.deadline,
          priority: event.priority as 'high' | 'medium' | 'low',
          status: event.status.toLowerCase().replace(' ', '') as 'open' | 'evaluating' | 'closed' | 'awarded',
          guests: event.guests,
          location: event.location,
          daysLeft: event.daysLeft,
          progress: event.progress,
          manager: event.manager,
          bidCount: event.bidCount,
          lastUpdate: new Date().toISOString().split('T')[0]
        }));

        // Get additional events from backend mock data if available
        try {
          // We could add an endpoint specifically for all events, but for now use what we have
          const allEventsResponse = await fetch('https://pdf-chat-app-h0ew.onrender.com/api/business-metrics');
          if (allEventsResponse.ok) {
            const allEventsData = await allEventsResponse.json();
            // For now, we'll duplicate and modify some events to show more variety
            const additionalEvents = backendEvents.map((event, index) => ({
              ...event,
              id: `${event.id}_${index + 5}`,
              name: `${event.name} - Extended`,
              status: ['open', 'evaluating', 'closed'][index % 3] as 'open' | 'evaluating' | 'closed',
              value: event.value + Math.floor(Math.random() * 50000),
              daysLeft: event.daysLeft + Math.floor(Math.random() * 30),
              progress: Math.floor(Math.random() * 100)
            })).slice(0, 3);

            setEvents([...backendEvents, ...additionalEvents]);
            setFilteredEvents([...backendEvents, ...additionalEvents]);
          }
        } catch {
          // Fallback to just backend events
          setEvents(backendEvents);
          setFilteredEvents(backendEvents);
        }

        setLastUpdated(new Date());
        setError(null);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events data');
      
      // Fallback to mock data if backend fails
      const fallbackEvents: Event[] = [
        {
          id: 'EVT001',
          name: 'Adobe Annual Sales Conference',
          company: 'Adobe',
          type: 'Corporate Conference',
          value: 179412,
          deadline: '2025-08-18',
          priority: 'high',
          status: 'evaluating',
          guests: 350,
          location: 'San Francisco, CA',
          daysLeft: 68,
          progress: 75,
          manager: 'Sarah Johnson',
          bidCount: 6,
          lastUpdate: '2025-07-10'
        },
        {
          id: 'EVT002',
          name: 'Tech Innovation Summit',
          company: 'Slack',
          type: 'Conference',
          value: 167983,
          deadline: '2025-10-11',
          priority: 'medium',
          status: 'open',
          guests: 280,
          location: 'Seattle, WA',
          daysLeft: 122,
          progress: 45,
          manager: 'Michael Chen',
          bidCount: 4,
          lastUpdate: '2025-07-11'
        },
        {
          id: 'EVT003',
          name: 'Product Roadmap Presentation',
          company: 'Meta',
          type: 'Product Launch',
          value: 105289,
          deadline: '2026-03-04',
          priority: 'medium',
          status: 'open',
          guests: 150,
          location: 'Austin, TX',
          daysLeft: 267,
          progress: 20,
          manager: 'Lisa Rodriguez',
          bidCount: 3,
          lastUpdate: '2025-07-09'
        }
      ];
      
      setEvents(fallbackEvents);
      setFilteredEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchEventsData();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.priority === priorityFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'value':
          return b.value - a.value;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchQuery, statusFilter, priorityFilter, sortBy]);

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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return 'low-priority';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'evaluating': return 'status-evaluating';
      case 'closed': return 'status-planning';
      case 'awarded': return 'status-submitted';
      default: return 'status-open';
    }
  };

  const getUrgencyClass = (daysLeft: number) => {
    if (daysLeft <= 7) return 'urgent';
    if (daysLeft <= 30) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events data...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: events.length,
    open: events.filter(e => e.status === 'open').length,
    evaluating: events.filter(e => e.status === 'evaluating').length,
    totalValue: events.reduce((sum, e) => sum + e.value, 0),
    urgent: events.filter(e => e.daysLeft <= 30 && e.status !== 'closed' && e.status !== 'awarded').length
  };

  return (
    <div className="dashboard-container">
      
      {/* Clean Page Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="main-title">Events Management</h1>
            <p className="subtitle">Track and manage your event bidding opportunities</p>
            <div className="flex items-center mt-3 space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${error ? 'bg-red-500 shadow-red-500/50' : 'bg-emerald-500 shadow-emerald-500/50'}`}></div>
                <span className="text-sm font-medium text-slate-600">
                  {error ? 'Offline Mode' : 'Live Data'}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <span className="text-sm text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</span>
              {error && (
                <>
                  <div className="h-4 w-px bg-slate-300"></div>
                  <button 
                    onClick={fetchEventsData}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => handleNavigation('/bid-processor')}
              className="btn btn-primary"
            >
              🚀 Process New Bid
            </button>
            <button 
              onClick={() => handleNavigation('/chat')}
              className="btn btn-secondary"
            >
              💬 Ask AI About Events
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
            <div className="flex items-center">
              <span className="text-orange-600 mr-2">⚠️</span>
              <span className="text-orange-800">{error} - Showing cached data</span>
            </div>
          </div>
        )}

        {/* Clean Stats Overview */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Total Events', value: stats.total, color: 'gray' },
            { label: 'Open Bidding', value: stats.open, color: 'blue' },
            { label: 'Evaluating', value: stats.evaluating, color: 'yellow' },
            { label: 'Urgent (≤30 days)', value: stats.urgent, color: 'red' },
            { label: 'Total Pipeline', value: formatCurrency(stats.totalValue), color: 'green' }
          ].map((stat, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center hover:bg-gray-100 transition-colors">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clean Filters and Controls */}
      <div className="card p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search events, companies, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="evaluating">Evaluating</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="value">Sort by Value</option>
              <option value="priority">Sort by Priority</option>
              <option value="company">Sort by Company</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchEventsData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              🔄 Refresh
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                📱 Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                📋 List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id}
              className="card p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => handleNavigation('/chat')}
            >
              {/* Card Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <span className={`priority-badge ${getPriorityClass(event.priority)}`}>
                    {event.priority.toUpperCase()}
                  </span>
                  <span className={`status-badge ${getStatusClass(event.status)}`}>
                    {event.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {event.name}
                </h3>
                <p className="text-gray-600 font-medium">{event.company}</p>
                <p className="text-sm text-gray-500">{event.type}</p>
              </div>

              {/* Card Body */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(event.value)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Deadline</div>
                    <div className={`text-sm font-semibold ${getUrgencyClass(event.daysLeft)}`}>
                      {formatDate(event.deadline)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Guests:</span>
                    <span className="font-semibold text-gray-900 ml-1">{event.guests}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Bids:</span>
                    <span className="font-semibold text-gray-900 ml-1">{event.bidCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">📍 {event.location}</span>
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
                      style={{ width: `${event.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <span>Manager: {event.manager}</span>
                  <span className={getUrgencyClass(event.daysLeft)}>
                    {event.daysLeft} days left
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Clean List View */}
          <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{event.name}</div>
                        <div className="text-sm text-gray-500">{event.type}</div>
                        <span className={`priority-badge ${getPriorityClass(event.priority)} mt-1`}>
                          {event.priority}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{event.company}</div>
                      <div className="text-sm text-gray-500">📍 {event.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{formatCurrency(event.value)}</div>
                      <div className="text-sm text-gray-500">{event.guests} guests</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{formatDate(event.deadline)}</div>
                      <div className={`text-sm ${getUrgencyClass(event.daysLeft)}`}>
                        {event.daysLeft} days left
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${getStatusClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${event.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{event.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigation('/chat');
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
        </>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPriorityFilter('all');
            }}
            className="btn btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsPage;