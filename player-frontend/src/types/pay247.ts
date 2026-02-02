export enum Pay247Currency {
  USDT = 'USDT',
  INR = 'INR',
  PHP = 'PHP',
}

export enum Pay247DepositMethod {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
  UPI = 'UPI',
  UPI_INTENT = 'UPI_INTENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  GCASH = 'GCASH',
  MAYA = 'MAYA',
}

export enum Pay247WithdrawalMethod {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  GCASH = 'GCASH',
  MAYA = 'MAYA',
}

export interface Pay247DepositResponse {
  depositId: string;
  paymentUrl: string;
  merchantOrderId: string;
  pay247OrderId: string;
}

export interface Pay247WithdrawalResponse {
  withdrawalId: string;
  merchantOrderId: string;
  pay247OrderId: string;
  status: string;
}

export interface Pay247TransactionStatus {
  orderId: string;
  merchantOrderId: string;
  status: string;
  amount: number;
  currency: string;
  pay247Status?: any;
}

export interface UpiAccountDetails {
  upiId: string;
}

export interface BankAccountDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName?: string;
}

export interface CryptoAccountDetails {
  walletAddress: string;
  network?: string;
}

export interface GCashAccountDetails {
  mobileNumber: string;
  accountName: string;
}

export type Pay247AccountDetails =
  | UpiAccountDetails
  | BankAccountDetails
  | CryptoAccountDetails
  | GCashAccountDetails;

// Currency limits
export const PAY247_LIMITS = {
  USDT: { min: 10, max: 100000 },
  INR: { min: 500, max: 500000 },
  PHP: { min: 500, max: 500000 },
};

// Payment method display names
export const PAY247_METHOD_NAMES: Record<string, string> = {
  TRC20: 'USDT (TRC20)',
  ERC20: 'USDT (ERC20)',
  BEP20: 'USDT (BEP20)',
  UPI: 'UPI',
  UPI_INTENT: 'UPI Intent',
  BANK_TRANSFER: 'Bank Transfer',
  GCASH: 'GCash',
  MAYA: 'Maya',
};

// Available methods per currency
export const PAY247_METHODS_BY_CURRENCY = {
  USDT: [Pay247DepositMethod.TRC20, Pay247DepositMethod.ERC20, Pay247DepositMethod.BEP20],
  INR: [Pay247DepositMethod.UPI, Pay247DepositMethod.UPI_INTENT, Pay247DepositMethod.BANK_TRANSFER],
  PHP: [Pay247DepositMethod.GCASH, Pay247DepositMethod.MAYA, Pay247DepositMethod.BANK_TRANSFER],
};
