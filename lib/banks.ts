export type BankType = 'psu' | 'private' | 'nbfc';

export interface Bank {
  id: string;
  name: string;
  type: BankType;
  educationRates: {
    min: number;
    max: number;
    typical: number; // midpoint for calculations
  };
  balanceTransferRate: {
    min: number;
    max: number;
    typical: number;
  };
  acceptsBalanceTransfer: boolean;
  fees: {
    processingFee: number; // percentage
    other: string;
  };
  eligibility: string[];
}

export const BANKS: Bank[] = [
  // PSU Banks
  {
    id: 'sbi',
    name: 'SBI',
    type: 'psu',
    educationRates: {
      min: 8.0,
      max: 10.0,
      typical: 9.0,
    },
    balanceTransferRate: {
      min: 7.5,
      max: 8.75,
      typical: 8.0,
    },
    acceptsBalanceTransfer: true,
    fees: {
      processingFee: 0.5,
      other: 'Lower than private banks',
    },
    eligibility: [
      'Clear repayment history required',
      'Balance transfer for rate reduction or loan enhancement',
      'Minimum outstanding amount requirement',
    ],
  },
  {
    id: 'pnb',
    name: 'PNB (Punjab National Bank)',
    type: 'psu',
    educationRates: {
      min: 8.0,
      max: 10.0,
      typical: 9.0,
    },
    balanceTransferRate: {
      min: 7.5,
      max: 8.75,
      typical: 8.0,
    },
    acceptsBalanceTransfer: true,
    fees: {
      processingFee: 0.5,
      other: 'Competitive PSU rates',
    },
    eligibility: [
      'Clear repayment history required',
      'Balance transfer for rate reduction or loan enhancement',
      'Minimum outstanding amount requirement',
    ],
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    type: 'psu',
    educationRates: {
      min: 8.0,
      max: 10.0,
      typical: 9.0,
    },
    balanceTransferRate: {
      min: 8.0,
      max: 9.5,
      typical: 8.75,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 0.5,
      other: 'Lower than private banks',
    },
    eligibility: [
      'Clear repayment history for BT',
      'Approved institutions',
    ],
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    type: 'psu',
    educationRates: {
      min: 8.0,
      max: 10.0,
      typical: 9.0,
    },
    balanceTransferRate: {
      min: 8.0,
      max: 9.5,
      typical: 8.75,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 0.5,
      other: 'Competitive',
    },
    eligibility: [
      'Good repayment record for BT',
      'Listed universities only',
    ],
  },

  // Private Banks
  {
    id: 'icici',
    name: 'ICICI Bank',
    type: 'private',
    educationRates: {
      min: 9.8,
      max: 11.5,
      typical: 10.65,
    },
    balanceTransferRate: {
      min: 8.5,
      max: 10.0,
      typical: 9.25,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 1.0,
      other: 'Variable based on profile',
    },
    eligibility: [
      'Credit score 720+ preferred',
      'Balance enhancement available',
      'Can transfer from 2 of 2 factors',
    ],
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    type: 'private',
    educationRates: {
      min: 9.8,
      max: 11.5,
      typical: 10.65,
    },
    balanceTransferRate: {
      min: 8.75,
      max: 9.65,
      typical: 9.0,
    },
    acceptsBalanceTransfer: true,
    fees: {
      processingFee: 1.0,
      other: 'Negotiable',
    },
    eligibility: [
      'Clear repayment history required',
      'Rate reduction of 1-1.25% typical',
      'Applicant academics and income (if employed) considered',
      'Balance transfer for rate reduction or loan enhancement',
    ],
  },
  {
    id: 'idfc',
    name: 'IDFC Bank',
    type: 'private',
    educationRates: {
      min: 9.8,
      max: 11.5,
      typical: 10.65,
    },
    balanceTransferRate: {
      min: 8.75,
      max: 9.65,
      typical: 9.0,
    },
    acceptsBalanceTransfer: true,
    fees: {
      processingFee: 1.0,
      other: 'Negotiable',
    },
    eligibility: [
      'Clear repayment history required',
      'Rate reduction of 1-1.25% typical',
      'Academic credentials and employment status important',
      'Balance transfer for rate reduction or loan enhancement',
    ],
  },

  // NBFC
  {
    id: 'avanse',
    name: 'Avanse',
    type: 'nbfc',
    educationRates: {
      min: 10.0,
      max: 12.5,
      typical: 11.25,
    },
    balanceTransferRate: {
      min: 9.0,
      max: 11.0,
      typical: 10.0,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 1.5,
      other: 'Flexible repayment options',
    },
    eligibility: [
      'Clear repayment history',
      'BT 1-1.25% reduction typical',
    ],
  },
  {
    id: 'auxilo',
    name: 'Auxilo',
    type: 'nbfc',
    educationRates: {
      min: 10.0,
      max: 12.5,
      typical: 11.25,
    },
    balanceTransferRate: {
      min: 9.0,
      max: 11.0,
      typical: 10.0,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 1.5,
      other: 'Competitive for BT',
    },
    eligibility: [
      'Academics and income considered',
      'Quick processing',
    ],
  },
  {
    id: 'credila',
    name: 'Credila',
    type: 'nbfc',
    educationRates: {
      min: 10.0,
      max: 12.5,
      typical: 11.25,
    },
    balanceTransferRate: {
      min: 9.0,
      max: 10.25,
      typical: 9.75,
    },
    acceptsBalanceTransfer: true,
    fees: {
      processingFee: 1.5,
      other: 'Flexible',
    },
    eligibility: [
      'Clear repayment history required',
      'Rate reduction of 1-1.25% typical',
      'Applicant academics weighted highly',
      'Co-applicant income important if applicant not employed',
    ],
  },
  {
    id: 'poonawalla',
    name: 'Poonawalla Fincorp',
    type: 'nbfc',
    educationRates: {
      min: 10.0,
      max: 12.5,
      typical: 11.25,
    },
    balanceTransferRate: {
      min: 9.0,
      max: 11.0,
      typical: 10.0,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 1.5,
      other: 'Value-added services',
    },
    eligibility: [
      'Overall profile assessment',
      'Quick approval',
    ],
  },
  {
    id: 'tata-capital',
    name: 'Tata Capital',
    type: 'nbfc',
    educationRates: {
      min: 10.0,
      max: 12.5,
      typical: 11.25,
    },
    balanceTransferRate: {
      min: 9.0,
      max: 11.0,
      typical: 10.0,
    },
    acceptsBalanceTransfer: false,
    fees: {
      processingFee: 1.5,
      other: 'Trusted brand',
    },
    eligibility: [
      'Comprehensive eligibility check',
      'Fast processing',
    ],
  },
];

export function getBanksByType(type: BankType): Bank[] {
  return BANKS.filter((bank) => bank.type === type);
}

export function getBankById(id: string): Bank | undefined {
  return BANKS.find((bank) => bank.id === id);
}

export function getBankName(id: string): string {
  return getBankById(id)?.name || 'Unknown Bank';
}
