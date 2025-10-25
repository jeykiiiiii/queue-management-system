'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddQueue() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        router.push(`/queue-number?number=${data.queueNumber}&name=${encodeURIComponent(name.trim())}`);
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003049] flex items-center justify-center p-6">
      <div className="bg-[#EAE2B7] rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#003049] mb-2">WELCOME</h1>
          <div className="w-20 h-1 bg-[#F77F00] mx-auto rounded-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#003049] text-lg font-semibold mb-3 text-center">
              NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white border-2 border-[#FCBF49] rounded-lg text-[#003049] placeholder-gray-500 focus:outline-none focus:border-[#F77F00] focus:ring-2 focus:ring-[#F77F00]/20 text-center text-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-[#F77F00] hover:bg-[#e67400] text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                PROCESSING...
              </div>
            ) : (
              'GET QUEUE'
            )}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-[#FCBF49]">
          <p className="text-[#003049] text-sm">
            YOUR NUMBER WILL BE SHOWN ON THE SCREEN
          </p>
        </div>
      </div>
    </div>
  );
}