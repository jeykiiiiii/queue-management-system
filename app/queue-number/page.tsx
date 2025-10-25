'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function QueueNumber() {
  const searchParams = useSearchParams();
  const queueNumber = searchParams.get('number');
  const name = searchParams.get('name');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!queueNumber || !name) {
    return (
      <div className="min-h-screen bg-[#003049] flex items-center justify-center p-6">
        <div className="bg-[#EAE2B7] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[#003049] mb-4">Invalid Queue Number</h2>
          <p className="text-[#003049]">Please go back and get a queue number.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#003049] flex items-center justify-center p-6">
      <div className="bg-[#EAE2B7] rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#003049] mb-2">THANK YOU</h1>
          <div className="w-16 h-1 bg-[#F77F00] mx-auto rounded-full"></div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[#003049] text-lg font-semibold mb-4">YOUR QUEUE NUMBER:</p>
          
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            <div className="bg-[#FCBF49] border-4 border-[#F77F00] rounded-2xl p-6 mx-auto max-w-xs">
              <div className="text-6xl font-bold text-[#003049] tracking-wider">
                {queueNumber.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border-2 border-[#FCBF49]">
            <p className="text-sm text-[#003049] mb-1">Name</p>
            <p className="text-xl font-semibold text-[#003049]">{decodeURIComponent(name)}</p>
          </div>
        </div>

        <div className="text-center mt-8 pt-6 border-t border-[#FCBF49]">
          <p className="text-[#003049] text-sm font-semibold mb-2">
            PLEASE WAIT FOR YOUR NUMBER TO BE CALLED
          </p>
          <p className="text-[#003049] text-xs">
            Your number will be displayed on the screen when it's your turn
          </p>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => window.location.href = '/add-queue'}
            className="flex-1 bg-[#F77F00] hover:bg-[#e67400] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            GET ANOTHER NUMBER
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-[#003049] hover:bg-[#00253a] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            GO HOME
          </button>
        </div>
      </div>
    </div>
  );
}