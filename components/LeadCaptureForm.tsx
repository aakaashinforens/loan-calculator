'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeadCaptureFormProps {
  loanAmount: number;
  currentEmi: number;
  potentialSavings: number;
  currentBank: string;
  onBack: () => void;
}

export function LeadCaptureForm({
  loanAmount,
  currentEmi,
  potentialSavings,
  currentBank,
  onBack,
}: LeadCaptureFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentBank: currentBank,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      setError('Phone number must be 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare lead data with auto-filled calculations
      const leadData = {
        ...formData,
        loanAmount,
        currentEmi,
        potentialSavings,
        toolType: 'balance-transfer',
      };

      // Call API endpoint
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      // Redirect to thank you page with data
      const params = new URLSearchParams({
        name: formData.name,
        savings: potentialSavings.toString(),
        bank: formData.currentBank,
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl">
          Let's Get You Connected
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Share your details, and our experts will guide you through the balance transfer process.
        </p>
      </div>

      {/* Form Container */}
      <div className="mx-auto max-w-2xl">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                  required
                />
              </div>

              {/* Current Bank (auto-filled but editable) */}
              <div>
                <label htmlFor="currentBank" className="block text-sm font-semibold text-slate-900 mb-2">
                  Current Lender Bank
                </label>
                <input
                  type="text"
                  id="currentBank"
                  name="currentBank"
                  value={formData.currentBank}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-slate-400 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Connect with Expert →'}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={onBack}
                className="w-full px-6 py-3 border-2 border-slate-300 text-slate-900 font-semibold rounded-md hover:bg-slate-50 transition-colors"
              >
                Back to Calculator
              </button>

              {/* Privacy Note */}
              <p className="text-xs text-slate-600 text-center">
                We respect your privacy. Your information will only be used to assist with your loan transfer.
              </p>
            </form>
          </div>

          {/* Summary Card */}
          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Your Loan Summary</h3>

              <div className="space-y-3">
                {/* Loan Amount */}
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-slate-700">Outstanding Loan</span>
                  <span className="font-bold text-slate-900">
                    ₹{(loanAmount / 100000).toFixed(1)}L
                  </span>
                </div>

                {/* Current EMI */}
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-slate-700">Current Monthly EMI</span>
                  <span className="font-bold text-slate-900">
                    ₹{currentEmi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Potential Savings */}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-slate-900 font-semibold">Potential Total Savings</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{(potentialSavings / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits Card */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Why Transfer?</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Lower interest rate = Lower EMI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Significant savings over tenure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Expert assistance throughout process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Faster approval with online process</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Flexible repayment options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
