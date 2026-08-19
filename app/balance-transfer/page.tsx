import { BalanceTransferCalculator } from '@/components/BalanceTransferCalculator';

export const metadata = {
  title: 'Balance Transfer Calculator - Check Savings',
  description: 'Check if transferring your education loan to another bank can reduce your EMI and save thousands.',
};

export default function BalanceTransferPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <BalanceTransferCalculator />
      </div>
    </div>
  );
}
