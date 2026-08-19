'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export function ThankYouPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'Friend';
  const savings = parseFloat(searchParams.get('savings') || '0');
  const bank = searchParams.get('bank') || 'your bank';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Icon and Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl mb-3">
            Thank You, {name}! ✨
          </h1>
          <p className="text-xl text-slate-600">
            We've received your request for balance transfer assistance.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="rounded-lg border border-green-200 bg-white shadow-lg p-8 mb-8">
          {/* What's Next */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What Happens Next?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                    <span className="text-orange-600 font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Expert Review</h3>
                  <p className="text-slate-600">
                    Our loan experts will review your application within 2-4 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                    <span className="text-orange-600 font-bold">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Personalized Options</h3>
                  <p className="text-slate-600">
                    You'll receive personalized loan transfer options from multiple banks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                    <span className="text-orange-600 font-bold">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Guided Support</h3>
                  <p className="text-slate-600">
                    Our team will guide you through documentation and approval process.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-100">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Quick Approval</h3>
                  <p className="text-slate-600">
                    Get approved and start saving within 7-10 business days.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          {savings > 0 && (
            <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-300 p-6 mb-8">
              <p className="text-sm font-semibold text-green-700 mb-2">POTENTIAL SAVINGS</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">
                  ₹{(savings / 100000).toFixed(1)}L
                </span>
                <span className="text-slate-700">over your remaining loan tenure</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                This is your estimated total savings. Actual savings may vary based on bank approval and final terms.
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 mb-8">
            <h3 className="font-bold text-slate-900 mb-3">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold text-slate-900">Phone:</span>{' '}
                <span className="text-slate-600">+91 1234-567-890</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Email:</span>{' '}
                <span className="text-slate-600">support@inforens.com</span>
              </p>
              <p>
                <span className="font-semibold text-slate-900">Hours:</span>{' '}
                <span className="text-slate-600">Mon-Fri: 9 AM - 6 PM IST</span>
              </p>
            </div>
          </div>

          {/* Important Notes */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-8">
            <p className="text-xs font-semibold text-blue-700 mb-2">IMPORTANT NOTES</p>
            <ul className="text-xs text-blue-900 space-y-1">
              <li>• Check your email for updates from our team.</li>
              <li>
                • Loan balance transfer is subject to eligibility criteria and bank approval.
              </li>
              <li>
                • Your actual savings may vary based on the final approved interest rate.
              </li>
              <li>• Early repayment penalties (if any) will be considered in calculations.</li>
            </ul>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/balance-transfer">
            <button className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors">
              Check Another Loan
            </button>
          </Link>
          <Link href="/landing">
            <button className="px-8 py-3 border-2 border-slate-300 text-slate-900 font-semibold rounded-md hover:bg-slate-50 transition-colors">
              Back to Home
            </button>
          </Link>
        </div>

        {/* Footer Message */}
        <p className="text-center text-sm text-slate-600 mt-8">
          We're committed to helping you find the best financing solution. Thank you for trusting Inforens! 🙏
        </p>
      </div>
    </div>
  );
}
