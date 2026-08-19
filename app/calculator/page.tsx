import { EducationLoanCalculator } from '@/components/EducationLoanCalculator';

export const metadata = {
  title: 'Education Loan Calculator - Compare Banks',
  description: 'Compare education loan interest rates across 9+ banks. Find the best loan option in seconds.',
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <EducationLoanCalculator />
      </div>
    </div>
  );
}
