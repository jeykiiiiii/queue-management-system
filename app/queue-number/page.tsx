import { Suspense } from 'react';
import QueueNumberContent from './QueueNumberContent';

export default function QueueNumberPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#003049] flex items-center justify-center p-6">
        <div className="bg-[#EAE2B7] rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <QueueNumberContent />
    </Suspense>
  );
}