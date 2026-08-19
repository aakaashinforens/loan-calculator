'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white">
      {/* Hero Section */}
      <section className="animate-fade-in px-4 py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold text-slate-900 sm:text-5xl lg:text-6xl">
            Find Your Perfect Education Loan
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
            Compare interest rates across banks and save thousands. Or transfer your current loan to get better rates.
          </p>
          <p className="mx-auto mt-4 text-base text-slate-500">
            No hidden charges. No credit check required. Transparent estimates in under 2 minutes.
          </p>
        </div>
      </section>

      {/* Tool Selection Cards */}
      <section className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Education Loan Calculator Card */}
            <Link href="/calculator">
              <div className="animate-slide-up-1 group relative overflow-hidden rounded-lg border border-orange-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-orange-300 hover:shadow-lg cursor-pointer">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex rounded-lg bg-orange-100 p-3">
                    <svg
                      className="h-6 w-6 text-orange-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-2xl font-bold text-slate-900">Education Loan Calculator</h2>

                  {/* Description */}
                  <p className="mt-3 text-slate-600">
                    Compare interest rates across PSU banks, Private banks, and NBFCs. Find the best loan option for your education goals.
                  </p>

                  {/* Benefits */}
                  <ul className="mt-6 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Compare 9+ banks instantly
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      See total interest over tenure
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      No hidden charges
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">2 min to compare</span>
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 group-hover:bg-orange-200 transition-colors">
                      Compare Now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Balance Transfer Calculator Card */}
            <Link href="/balance-transfer">
              <div className="animate-slide-up-2 group relative overflow-hidden rounded-lg border border-blue-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg cursor-pointer">
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="inline-flex rounded-lg bg-blue-100 p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>

                  {/* Title */}
                  <h2 className="mt-6 text-2xl font-bold text-slate-900">Balance Transfer Calculator</h2>

                  {/* Description */}
                  <p className="mt-3 text-slate-600">
                    Check if transferring your existing education loan to another bank can reduce your EMI and total interest burden.
                  </p>

                  {/* Benefits */}
                  <ul className="mt-6 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Check potential monthly savings
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Get expert assistance
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-3 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Simple, transparent process
                    </li>
                  </ul>

                  {/* CTA Button */}
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Check savings</span>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 group-hover:bg-blue-200 transition-colors">
                      Check Now →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-orange-100 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
            Trusted by Students Across India
          </p>
          <p className="mt-4 text-2xl font-bold text-slate-900">
            50,000+ Students Have Compared Loans with Inforens
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">₹500Cr+</p>
              <p className="text-sm text-slate-600">Total Loans Compared</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">9+</p>
              <p className="text-sm text-slate-600">Major Banks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">₹50L+</p>
              <p className="text-sm text-slate-600">Potential Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-4">
            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 group-open:text-orange-600">
                How accurate are your loan estimates?
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">
                Our estimates are based on typical interest rates offered by banks as of today. Actual rates may vary based on your credit score, co-applicant income, and collateral. We recommend confirming with banks before finalizing.
              </p>
            </details>
            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 group-open:text-orange-600">
                Is there any charge for using this calculator?
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">
                No, our loan calculators are completely free. We aim to help you make informed decisions about your education financing.
              </p>
            </details>
            <details className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-orange-200 hover:bg-orange-50">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-900 group-open:text-orange-600">
                Will using this calculator affect my credit score?
                <span className="transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-slate-600">
                No. Our calculator generates estimates without making any credit inquiries. It's only when you apply with a bank that they conduct a credit check.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Ready to Find the Best Loan?</h2>
          <p className="mt-4 text-lg text-slate-600">
            Start comparing loans or check balance transfer potential in under 2 minutes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/calculator">
              <button className="w-full sm:w-auto rounded-md bg-orange-600 px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-orange-700 hover:shadow-lg active:scale-95">
                Compare Loans →
              </button>
            </Link>
            <Link href="/balance-transfer">
              <button className="w-full sm:w-auto rounded-md bg-white px-8 py-3 font-semibold text-orange-600 border-2 border-orange-600 transition-all duration-200 hover:bg-orange-50">
                Check Balance Transfer →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
        <p>
          This calculator is for educational purposes only. It does not constitute a loan offer or approval.
          Actual EMI and interest rates may vary based on individual circumstances.
        </p>
        <p className="mt-4">© 2025 Inforens. All rights reserved.</p>
      </footer>
    </div>
  );
}
