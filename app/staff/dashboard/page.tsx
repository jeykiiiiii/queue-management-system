'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffDashboard() {
  const [staff, setStaff] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'waiting' | 'served' | 'staff' | 'reports'>('waiting');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const router = useRouter();

  useEffect(() => {
    const staffData = localStorage.getItem('staff');
    if (!staffData) {
      router.push('/staff/login');
      return;
    }
    
    const parsedStaff = JSON.parse(staffData);
    setStaff(parsedStaff);
    fetchQueue();
    
    if (parsedStaff.role === 'admin') {
      fetchAllStaff();
      fetchStaffPerformance();
    }
    
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      if (!res.ok) throw new Error('Failed to fetch queue');
      const data = await res.json();
      setQueue(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching queue:', err);
      setError('Failed to load queue');
    }
  };

  const fetchAllStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setAllStaff(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchStaffPerformance = async () => {
    try {
      const res = await fetch(`/api/reports/staff-performance?start=${dateRange.start}&end=${dateRange.end}`);
      if (!res.ok) throw new Error('Failed to fetch staff performance');
      const data = await res.json();
      
      const formattedData = data.map((perf: any) => ({
        ...perf,
        avg_serve_time_formatted: formatAverageTime(perf.avg_serve_time)
      }));
      
      setStaffPerformance(formattedData);
    } catch (err) {
      console.error('Error fetching staff performance:', err);
    }
  };

  const formatAverageTime = (avgTime: number | null) => {
    if (!avgTime || avgTime === 0) return 'N/A';
    
    if (avgTime < 1) {
      const seconds = Math.round(avgTime * 60);
      return `${seconds} sec`;
    } else if (avgTime < 60) {
      const minutes = Math.round(avgTime);
      return `${minutes} min`;
    } else {
      const hours = Math.floor(avgTime / 60);
      const minutes = Math.round(avgTime % 60);
      return `${hours}h ${minutes}m`;
    }
  };

  const updateStatus = async (identifier: any, status: string) => {
    const queueNumber = identifier;
    
    if (!queueNumber) {
      setError('No queue identifier found');
      return;
    }

    setLoading(queueNumber);
    setError(null);
    
    try {
      const updateData: any = { status };
      
      if (status === 'done' && staff) {
        updateData.staffId = staff.id;
      }

      const res = await fetch(`/api/queue/${queueNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP error: ${res.status}`);
      }

      setTimeout(() => {
        fetchQueue();
        if (staff.role === 'admin') {
          fetchStaffPerformance();
        }
      }, 500);
      
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const addStaffMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/staff/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add staff');
      }

      setNewStaff({ name: '', email: '', password: '', role: 'staff' });
      setShowAddStaff(false);
      fetchAllStaff();
      
    } catch (err: any) {
      console.error('Add staff error:', err);
      setError(err.message);
    }
  };

  const deleteStaffMember = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete staff');
      }

      fetchAllStaff();
      fetchStaffPerformance();
      
    } catch (err: any) {
      console.error('Delete staff error:', err);
      setError(err.message);
    }
  };

  const getIdentifier = (q: any) => {
    if (q.queue_number) return q.queue_number;
    if (q.id) return q.id;
    if (q.queueNumber) return q.queueNumber;
    return null;
  };

  const handleLogout = () => {
    localStorage.removeItem('staff');
    router.push('/staff/login');
  };

  const waitingQueues = queue
    .filter(q => q.status === 'waiting' || q.status === 'serving')
    .sort((a, b) => a.queue_number - b.queue_number);

  const servedQueues = queue
    .filter(q => q.status === 'done')
    .sort((a, b) => new Date(b.served_at || b.updated_at).getTime() - new Date(a.served_at || a.updated_at).getTime());

  const currentQueues = activeTab === 'waiting' ? waitingQueues : 
                       activeTab === 'served' ? servedQueues : [];

  const personalStats = staff ? {
    servedToday: servedQueues.filter(q => q.served_by === staff.id && 
      new Date(q.served_at).toDateString() === new Date().toDateString()).length,
    servedThisWeek: servedQueues.filter(q => q.served_by === staff.id && 
      new Date(q.served_at) >= new Date(new Date().setDate(new Date().getDate() - 7))).length,
    totalServed: servedQueues.filter(q => q.served_by === staff.id).length
  } : { servedToday: 0, servedThisWeek: 0, totalServed: 0 };

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#003049] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const isAdmin = staff.role === 'admin';

  return (
    <div className="min-h-screen bg-[#003049]">
      <div className="bg-[#EAE2B7] p-4 shadow-lg">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-[#003049]">
              {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
            </h1>
            <p className="text-[#003049]">
              Welcome, {staff.name} 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                isAdmin ? 'bg-[#F77F00] text-white' : 'bg-[#FCBF49] text-[#003049]'
              }`}>
                {staff.role.toUpperCase()}
              </span>
            </p>
            {!isAdmin && (
              <p className="text-sm text-[#003049]/70 mt-1">
                Served Today: {personalStats.servedToday} | This Week: {personalStats.servedThisWeek} | Total: {personalStats.totalServed}
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {isAdmin && (
              <button
                onClick={() => router.push('/staff/register')}
                className="bg-[#003049] hover:bg-[#002137] text-[#EAE2B7] px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Add Staff
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-[#F77F00] hover:bg-[#e67400] text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-[#EAE2B7] rounded-lg p-1 mb-6 inline-flex mx-auto flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'waiting'
                  ? 'bg-[#F77F00] text-white shadow-md'
                  : 'text-[#003049] hover:bg-[#FCBF49]/50'
              }`}
            >
              <span>Queue</span>
              <span className="bg-[#003049] text-[#EAE2B7] px-2 py-1 rounded-full text-xs">
                {waitingQueues.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('served')}
              className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'served'
                  ? 'bg-[#F77F00] text-white shadow-md'
                  : 'text-[#003049] hover:bg-[#FCBF49]/50'
              }`}
            >
              <span>History</span>
              <span className="bg-[#003049] text-[#EAE2B7] px-2 py-1 rounded-full text-xs">
                {servedQueues.length}
              </span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('staff')}
                  className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'staff'
                      ? 'bg-[#F77F00] text-white shadow-md'
                      : 'text-[#003049] hover:bg-[#FCBF49]/50'
                  }`}
                >
                  <span>Staff</span>
                  <span className="bg-[#003049] text-[#EAE2B7] px-2 py-1 rounded-full text-xs">
                    {allStaff.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    fetchStaffPerformance();
                  }}
                  className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'reports'
                      ? 'bg-[#F77F00] text-white shadow-md'
                      : 'text-[#003049] hover:bg-[#FCBF49]/50'
                  }`}
                >
                  <span>Reports</span>
                  <span className="text-xs">📊</span>
                </button>
              </>
            )}
          </div>

          {(activeTab === 'waiting' || activeTab === 'served') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentQueues.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-4xl text-[#FCBF49] mb-4">
                    {activeTab === 'waiting' ? '📭' : '✅'}
                  </div>
                  <p className="text-[#EAE2B7] text-lg">
                    {activeTab === 'waiting' 
                      ? 'No waiting or serving queues' 
                      : 'No served clients yet'
                    }
                  </p>
                </div>
              ) : (
                currentQueues.map((q) => {
                  const identifier = getIdentifier(q);
                  
                  return (
                    <div
                      key={identifier || q.name}
                      className={`bg-[#EAE2B7] rounded-xl p-4 shadow-lg border-2 ${
                        q.status === 'serving'
                          ? 'border-[#F77F00] bg-gradient-to-br from-[#EAE2B7] to-[#FCBF49]/30'
                          : q.status === 'done'
                          ? 'border-green-500 bg-gradient-to-br from-[#EAE2B7] to-green-100'
                          : 'border-[#FCBF49]'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-2xl font-bold text-[#003049]">
                            #{q.queue_number}
                          </div>
                          <div className="text-sm text-[#003049]/70">
                            {new Date(q.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          q.status === 'serving'
                            ? 'bg-[#F77F00] text-white'
                            : q.status === 'done'
                            ? 'bg-green-500 text-white'
                            : 'bg-[#FCBF49] text-[#003049]'
                        }`}>
                          {q.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-[#003049]/60">Customer</div>
                        <div className="text-lg font-semibold text-[#003049] truncate">
                          {q.name}
                        </div>
                      </div>

                      {q.served_by && (
                        <div className="mb-3">
                          <div className="text-sm text-[#003049]/60">Served by</div>
                          <div className="text-sm font-semibold text-[#003049]">
                            {q.staff_name || `Staff ${q.served_by}`}
                          </div>
                          {q.served_at && (
                            <div className="text-xs text-[#003049]/50">
                              {new Date(q.served_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'waiting' && (
                        <div className="flex gap-2">
                          {q.status === 'waiting' && (
                            <button
                              onClick={() => updateStatus(identifier, 'serving')}
                              className="flex-1 bg-[#F77F00] hover:bg-[#e67400] text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading === identifier}
                            >
                              {loading === identifier ? '...' : 'Start Serving'}
                            </button>
                          )}
                          {q.status === 'serving' && (
                            <button
                              onClick={() => updateStatus(identifier, 'done')}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={loading === identifier}
                            >
                              {loading === identifier ? '...' : 'Mark Done'}
                            </button>
                          )}
                        </div>
                      )}

                      {q.status === 'done' && (
                        <div className="text-center mt-2">
                          <div className="text-sm text-green-600 font-semibold">
                            ✅ Completed
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {isAdmin && activeTab === 'staff' && (
            <div className="bg-[#EAE2B7] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#003049]">Staff Management</h2>
                <button
                  onClick={() => setShowAddStaff(true)}
                  className="bg-[#F77F00] hover:bg-[#e67400] text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  Add New Staff
                </button>
              </div>

              {showAddStaff && (
                <div className="bg-white rounded-lg p-6 mb-6 border border-[#FCBF49]">
                  <h3 className="text-lg font-semibold text-[#003049] mb-4">Add New Staff Member</h3>
                  <form onSubmit={addStaffMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                      className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                      required
                    />
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                      className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddStaff(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-[#F77F00] hover:bg-[#e67400] text-white px-4 py-2 rounded-lg transition-colors duration-300"
                      >
                        Add Staff
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allStaff.map((staffMember) => (
                  <div
                    key={staffMember.id}
                    className="bg-white rounded-lg p-4 border border-[#FCBF49]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-[#003049] text-lg">
                          {staffMember.name}
                        </div>
                        <div className="text-sm text-[#003049]/70">
                          {staffMember.email}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        staffMember.role === 'admin'
                          ? 'bg-[#F77F00] text-white'
                          : 'bg-[#FCBF49] text-[#003049]'
                      }`}>
                        {staffMember.role.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-[#003049]/60 mb-3">
                      Joined: {new Date(staffMember.created_at).toLocaleDateString()}
                    </div>

                    {staffMember.id !== staff.id && (
                      <button
                        onClick={() => deleteStaffMember(staffMember.id)}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors duration-300 text-sm"
                      >
                        Remove Staff
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isAdmin && activeTab === 'reports' && (
            <div className="bg-[#EAE2B7] rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#003049]">Staff Performance Reports</h2>
                <div className="flex gap-4">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="border border-[#FCBF49] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
                  />
                  <button
                    onClick={fetchStaffPerformance}
                    className="bg-[#F77F00] hover:bg-[#e67400] text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center border border-[#FCBF49]">
                  <div className="text-2xl font-bold text-[#F77F00]">
                    {allStaff.length}
                  </div>
                  <div className="text-sm text-[#003049]">Total Staff</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-[#FCBF49]">
                  <div className="text-2xl font-bold text-[#F77F00]">
                    {staffPerformance.reduce((sum, perf) => sum + perf.total_served, 0)}
                  </div>
                  <div className="text-sm text-[#003049]">Total Served</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-[#FCBF49]">
                  <div className="text-2xl font-bold text-[#F77F00]">
                    {Math.round(staffPerformance.reduce((sum, perf) => sum + perf.total_served, 0) / allStaff.length) || 0}
                  </div>
                  <div className="text-sm text-[#003049]">Avg per Staff</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-[#FCBF49]">
                  <div className="text-2xl font-bold text-[#F77F00]">
                    {staffPerformance.length > 0 ? 
                      Math.max(...staffPerformance.map(p => p.total_served)) : 0}
                  </div>
                  <div className="text-sm text-[#003049]">Most Served</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-[#FCBF49] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#FCBF49]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#003049] font-semibold">Staff Member</th>
                      <th className="px-4 py-3 text-center text-[#003049] font-semibold">Role</th>
                      <th className="px-4 py-3 text-center text-[#003049] font-semibold">Total Served</th>
                      <th className="px-4 py-3 text-center text-[#003049] font-semibold">Today</th>
                      <th className="px-4 py-3 text-center text-[#003049] font-semibold">This Week</th>
                      <th className="px-4 py-3 text-center text-[#003049] font-semibold">Avg Serve Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffPerformance.map((perf, index) => (
                      <tr key={perf.staff_id} className={index % 2 === 0 ? 'bg-[#EAE2B7]/20' : 'bg-white'}>
                        <td className="px-4 py-3 text-[#003049] font-semibold">
                          {perf.staff_name}
                          {perf.staff_id === staff.id && (
                            <span className="ml-2 text-xs bg-[#F77F00] text-white px-2 py-1 rounded-full">You</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            perf.role === 'admin'
                              ? 'bg-[#F77F00] text-white'
                              : 'bg-[#FCBF49] text-[#003049]'
                          }`}>
                            {perf.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[#003049] font-bold text-lg">
                          {perf.total_served}
                        </td>
                        <td className="px-4 py-3 text-center text-[#003049]">
                          {perf.served_today}
                        </td>
                        <td className="px-4 py-3 text-center text-[#003049]">
                          {perf.served_this_week}
                        </td>
                        <td className="px-4 py-3 text-center text-[#003049]">
                          {perf.avg_serve_time_formatted || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {staffPerformance.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl text-[#FCBF49] mb-4">📊</div>
                  <p className="text-[#003049] text-lg">No performance data available for the selected period</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-[#EAE2B7] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#F77F00]">
                {waitingQueues.filter(q => q.status === 'waiting').length}
              </div>
              <div className="text-sm text-[#003049]">Waiting</div>
            </div>
            <div className="bg-[#EAE2B7] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#F77F00]">
                {waitingQueues.filter(q => q.status === 'serving').length}
              </div>
              <div className="text-sm text-[#003049]">Serving</div>
            </div>
            <div className="bg-[#EAE2B7] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#F77F00]">
                {servedQueues.length}
              </div>
              <div className="text-sm text-[#003049]">Total Served</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}