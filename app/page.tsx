'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState({
    totalServed: 0,
    activeQueues: 0,
    currentlyServing: null as string | null
  });
  const [searchName, setSearchName] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      
      const totalServed = data.filter((q: any) => q.status === 'done').length;
      const activeQueues = data.filter((q: any) => q.status === 'waiting').length;
      const serving = data.find((q: any) => q.status === 'serving');
      
      setStats({
        totalServed,
        activeQueues,
        currentlyServing: serving ? `#${serving.queue_number}` : null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const searchQueueByName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) {
      setSearchError('Please enter your name');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/queue/search?name=${encodeURIComponent(searchName.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to search queue');
      }

      setSearchResult(data);
    } catch (error: any) {
      setSearchError(error.message || 'Failed to find your queue number');
    } finally {
      setSearchLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add to Queue',
      description: 'Register new customers',
      href: '/add-queue',
      icon: '➕',
      bgColor: 'from-[#F77F00] to-[#FCBF49]'
    },
    {
      title: 'View Display',
      description: 'Real-time queue monitor',
      href: '/display-queue',
      icon: '📺',
      bgColor: 'from-[#003049] to-[#EAE2B7]'
    },
    {
      title: 'Staff Login',
      description: 'Manage queue system',
      href: '/staff/login',
      icon: '👨‍💼',
      bgColor: 'from-[#EAE2B7] to-[#FCBF49]'
    },
    {
      title: 'Check Number',
      description: 'Check your queue number',
      href: '#check-queue', 
      icon: '🔍', 
      bgColor: 'from-[#FCBF49] to-[#F77F00]',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('check-queue-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  const statsCards = [
    {
      label: 'Currently Serving',
      value: stats.currentlyServing || 'None',
      icon: '🎯',
      color: 'text-[#F77F00]'
    },
    {
      label: 'Waiting in Line',
      value: stats.activeQueues,
      icon: '👥',
      color: 'text-[#EAE2B7]'
    },
    {
      label: 'Total Served Today',
      value: stats.totalServed,
      icon: '✅',
      color: 'text-[#FCBF49]'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'serving': return 'bg-[#F77F00]';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting in line';
      case 'serving': return 'Currently being served';
      case 'done': return 'Already served';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003049] via-[#003049] to-[#002137] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#FCBF49] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#F77F00] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-[#EAE2B7] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🎯</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#EAE2B7] via-[#FCBF49] to-[#F77F00] bg-clip-text text-transparent">
              Queue System
            </h1>
            <p className="text-xl md:text-2xl text-[#EAE2B7] max-w-3xl mx-auto leading-relaxed">
              Efficient queue management with real-time updates and seamless customer experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-[#EAE2B7] text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAE2B7] mb-4">
            Quick Actions
          </h2>
          <p className="text-[#FCBF49] text-lg">
            Choose what you'd like to do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <div key={index} className="group cursor-pointer">
              {action.href.startsWith('#') ? (
                <div 
                  onClick={action.onClick}
                  className={`bg-gradient-to-br ${action.bgColor} rounded-2xl p-6 h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border border-white/20 cursor-pointer`}
                >
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#003049] mb-2">
                    {action.title}
                  </h3>
                  <p className="text-[#003049]/80 text-sm">
                    {action.description}
                  </p>
                  
                  <div className="mt-4 flex justify-end">
                    <div className="w-8 h-8 bg-[#003049] rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-[#EAE2B7]">→</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={action.href}>
                  <div className={`bg-gradient-to-br ${action.bgColor} rounded-2xl p-6 h-full transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl border border-white/20`}>
                    <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-bold text-[#003049] mb-2">
                      {action.title}
                    </h3>
                    <p className="text-[#003049]/80 text-sm">
                      {action.description}
                    </p>
                    
                    <div className="mt-4 flex justify-end">
                      <div className="w-8 h-8 bg-[#003049] rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
                        <span className="text-[#EAE2B7]">→</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div id="check-queue-section" className="max-w-2xl mx-auto px-4 pb-20">
        <div className="bg-[#EAE2B7] rounded-2xl p-8 shadow-2xl border border-[#FCBF49]">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-3xl font-bold text-[#003049] mb-2">
              Check Your Queue Number
            </h2>
            <p className="text-[#003049]/70">
              Enter your name to find your current queue status
            </p>
          </div>

          <form onSubmit={searchQueueByName} className="space-y-4">
            <div>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-[#FCBF49] focus:outline-none focus:ring-2 focus:ring-[#F77F00] text-[#003049] placeholder-[#003049]/50"
                disabled={searchLoading}
              />
            </div>
            
            {searchError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {searchError}
              </div>
            )}

            <button
              type="submit"
              disabled={searchLoading}
              className="w-full bg-[#F77F00] hover:bg-[#e67400] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? 'Searching...' : 'Check Queue Status'}
            </button>
          </form>

          {searchResult && (
            <div className="mt-6 p-4 bg-white rounded-lg border border-[#FCBF49]">
              {searchResult.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-[#003049] mb-3">
                    Queue Information Found:
                  </h3>
                  {searchResult.map((queue: any, index: number) => (
                    <div
                      key={queue.id || index}
                      className="p-4 bg-gradient-to-r from-[#EAE2B7] to-[#FCBF49]/30 rounded-lg border border-[#FCBF49]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-2xl font-bold text-[#003049]">
                            #{queue.queue_number}
                          </div>
                          <div className="text-lg font-semibold text-[#003049]">
                            {queue.name}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor(queue.status)}`}>
                          {queue.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-[#003049]/70">
                        {getStatusText(queue.status)}
                      </div>
                      <div className="text-xs text-[#003049]/50 mt-2">
                        Joined: {new Date(queue.created_at).toLocaleString()}
                      </div>
                      {queue.served_at && (
                        <div className="text-xs text-[#003049]/50">
                          Served: {new Date(queue.served_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">❌</div>
                  <p className="text-[#003049] font-semibold">
                    No queue found for "{searchName}"
                  </p>
                  <p className="text-[#003049]/70 text-sm mt-1">
                    Please check your spelling or register at the counter
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#EAE2B7] text-[#003049] py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-[#003049]/70 text-lg">
              Designed for efficiency and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Real-time Updates',
                description: 'Instant queue status updates for both staff and customers'
              },
              {
                icon: '🎨',
                title: 'Beautiful Interface',
                description: 'Clean, modern design that enhances user experience'
              },
              {
                icon: '🔧',
                title: 'Easy Management',
                description: 'Simple tools for staff to manage queues efficiently'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-[#FCBF49] hover:bg-white/70 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#003049]/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#F77F00] to-[#FCBF49] py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#003049] mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-[#003049]/80 mb-6">
            Join thousands of businesses using our queue management system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/add-queue">
              <button className="bg-[#003049] text-[#EAE2B7] px-8 py-3 rounded-full font-semibold hover:bg-[#002137] transition-all duration-300 transform hover:scale-105">
                Add Customer to Queue
              </button>
            </Link>
            <Link href="/display-queue">
              <button className="border-2 border-[#003049] text-[#003049] px-8 py-3 rounded-full font-semibold hover:bg-[#003049] hover:text-[#EAE2B7] transition-all duration-300 transform hover:scale-105">
                View Live Display
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-[#003049] border-t border-[#EAE2B7]/20 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[#EAE2B7]/60 text-sm">
            Queue Management System © 2025 - Efficient. Reliable. Beautiful.
          </p>
        </div>
      </div>
    </div>
  );
}