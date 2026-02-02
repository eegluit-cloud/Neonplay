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

export interface Pay247BalanceResponse {
  balance: Record<string, number>;
}

export enum Pay247TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export enum Pay247Status {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
