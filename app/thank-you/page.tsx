import { Suspense } from 'react';
import { ThankYouPage } from '@/components/ThankYouPage';

export const metadata = {
  title: 'Thank You - Balance Transfer Request Received',
  description: 'Your balance transfer request has been received. Our experts will contact you shortly.',
};

function ThankYouFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full animate-pulse">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-green-100 rounded-full mb-6" />
          <div className="h-12 w-2/3 mx-auto rounded bg-slate-200 mb-3" />
          <div className="h-6 w-1/2 mx-auto rounded bg-slate-200" />
        </div>
        <div className="rounded-lg border border-green-200 bg-white shadow-lg p-8 h-96" />
      </div>
    </div>
  );
}

export default function ThankYouPageRoute() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <ThankYouPage />
    </Suspense>
  );
}
