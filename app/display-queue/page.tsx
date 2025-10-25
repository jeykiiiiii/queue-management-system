'use client';

import { useEffect, useState } from 'react';

export default function QueueDisplay() {
  const [queue, setQueue] = useState<any[]>([]);

  const fetchQueue = async () => {
    const res = await fetch('/api/queue');
    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort queues properly
  const waitingQueues = queue
    .filter(q => q.status === 'waiting')
    .sort((a, b) => a.queue_number - b.queue_number); // Ensure ascending order

  const servingQueue = queue.find(q => q.status === 'serving');
  const nextQueue = waitingQueues[0]; // First in waiting line (lowest queue_number)
  
  // Calculate total served (queues with status 'done')
  const totalServed = queue.filter(q => q.status === 'done').length;

  return (
    <div className="min-h-screen bg-[#003049] text-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#EAE2B7]">Queue Management System</h1>
        <p className="text-[#FCBF49] mt-2">Real-time Queue Monitoring</p>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* Left Column - Current Serving (Biggest) */}
        <div className="lg:col-span-2">
          <div className="bg-[#EAE2B7] rounded-2xl p-6 h-full">
            <h2 className="text-2xl font-bold mb-6 text-center border-b border-[#FCBF49] pb-4 text-[#003049]">
              Currently Serving
            </h2>
            
            {servingQueue ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-r from-[#F77F00] to-[#FCBF49] rounded-2xl p-8 mx-auto max-w-md transform hover:scale-105 transition-transform duration-300">
                  <div className="text-6xl font-bold mb-4 text-[#003049]">
                    #{servingQueue.queue_number}
                  </div>
                  <div className="text-2xl font-semibold mb-2 text-[#003049]">
                    {servingQueue.name}
                  </div>
                  <div className="text-lg text-[#003049]/80">
                    Being served now
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl text-[#FCBF49] mb-4">📭</div>
                <div className="text-xl text-[#003049]">No one is being served</div>
                <div className="text-[#003049]/70 mt-2">Waiting for next customer...</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Two sections stacked */}
        <div className="space-y-6">
          
          {/* Upper Right - Up Next */}
          <div className="bg-[#EAE2B7] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-center border-b border-[#FCBF49] pb-3 text-[#003049]">
              Up Next
            </h2>
            
            {nextQueue ? (
              <div className="text-center p-4 bg-[#FCBF49]/20 border border-[#FCBF49] rounded-xl">
                <div className="text-3xl font-bold text-[#F77F00] mb-2">
                  #{nextQueue.queue_number}
                </div>
                <div className="text-lg font-semibold text-[#003049]">{nextQueue.name}</div>
                <div className="text-sm text-[#F77F00] mt-2">Ready when called</div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-2xl text-[#FCBF49] mb-2">⏸️</div>
                <div className="text-[#003049]">No one in line</div>
              </div>
            )}
          </div>

          {/* Lower Right - All Incoming Queues */}
          <div className="bg-[#EAE2B7] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-center border-b border-[#FCBF49] pb-3 text-[#003049]">
              Waiting Line
              <span className="ml-2 bg-[#FCBF49] text-[#003049] px-2 py-1 rounded-full text-sm">
                {waitingQueues.length}
              </span>
            </h2>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {waitingQueues.length > 0 ? (
                waitingQueues.map((q, index) => (
                  <div
                    key={q.queue_number}
                    className={`p-3 rounded-lg border ${
                      index === 0 
                        ? 'bg-[#FCBF49]/20 border-[#FCBF49]' 
                        : 'bg-white/50 border-[#FCBF49]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-[#003049]">#{q.queue_number}</div>
                        <div className="text-sm text-[#003049]/80">{q.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#003049]/60">Position</div>
                        <div className="font-bold text-[#003049]">#{index + 1}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-3xl text-[#FCBF49] mb-2">🎉</div>
                  <div className="text-[#003049]">No waiting queues</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-[#EAE2B7] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#F77F00]">{totalServed}</div>
            <div className="text-sm text-[#003049]">Total Served</div>
          </div>
          <div className="bg-[#EAE2B7] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#F77F00]">{nextQueue ? 1 : 0}</div>
            <div className="text-sm text-[#003049]">Up Next</div>
          </div>
          <div className="bg-[#EAE2B7] rounded-lg p-4">
            <div className="text-2xl font-bold text-[#F77F00]">{waitingQueues.length}</div>
            <div className="text-sm text-[#003049]">In Line</div>
          </div>
        </div>
      </div>
    </div>
  );
}