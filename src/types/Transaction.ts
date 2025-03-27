export interface Transaction {
  id: string;
  code: string;
  date: number; // Unix timestamp of when transaction occured
  description: string;
  status: string;
  amount: number;
  account: string;
  balance: number;
  transactionType: TransactionTypes;
  category: string;
  createdAt: number; // Unix timestamp of when added to db

  // Extra fields for more expressive querying
  year: number;
  month: number; // 1-12
  dayOfWeek: string; // e.g., "Tuesday"
  hour: string; // e.g., "14:00"
  mode: MoneyMode;
}

export enum TransactionTypes {
  TillNo = 'Till Number',
  Paybill = 'Paybill',
  Fuliza = 'Fuliza',
  Airtime = 'Airtime Purchase',
  Mshwari = 'Mshwari',
  Agent = 'Agent',
  SendMoney = 'Send Money',
  KCBMpesa = 'KCB M-Pesa',
  MoneyTransfer = 'Cash Transfer'
}

export interface ExtractedTransaction {
    code: string;
    date: number; // Unix timestamp of when transaction occured
    description: string;
    status: string;
    amount: number;
    account: string;
    balance: number;
    type: TransactionTypes;
    category: string;
}

export enum MoneyMode {
  MoneyIn = 'moneyIn',
  MoneyOut = 'moneyOut',
}