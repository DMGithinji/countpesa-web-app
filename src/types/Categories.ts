import { TransactionTypes } from "./Transaction";

export interface Category {
  id?: string;
  name: string;
}

export interface Subcategory {
  id?: string;
  name: string;
  categoryId: string;
}

export interface CombinedCategory extends Category {
  subcategories: Subcategory[];
}

export const UNCATEGORIZED = 'Uncategorized';

export const DEFAULT_CATEGORIES: {
  name: string;
  subCategories: string[];
}[] = [
  {
    name: 'Bills & Utilities',
    subCategories: [
      'Water',
      'Electricity',
      'Internet',
      'Rent',
      'Gas',
      'Phone Bill',
      'House Help',
    ],
  },
  {
    name: 'Debt Financing',
    subCategories: [
      'Friendly Debt',
      'M-Shwari',
      'Fuliza',
      'KCB M-Pesa',
      'Bank Loan',
      'Loan App',
    ],
  },
  {
    name: 'Income',
    subCategories: ['Salary', 'Bonus', 'Dividends', 'Investment', 'Other'],
  },
  {
    name: 'Entertainment',
    subCategories: ['Party', 'Movies'],
  },
  {
    name: 'Family',
    subCategories: ['Family Support', 'Child care'],
  },
  {
    name: 'Transaction Cost',
    subCategories: [
      TransactionTypes.Paybill,
      TransactionTypes.TillNo,
      TransactionTypes.Agent,
      TransactionTypes.SendMoney,
    ],
  },
  {
    name: 'Food',
    subCategories: ['Groceries', 'Eating Out'],
  },
  {
    name: 'Health',
    subCategories: ['Hospital Bill', 'Medicine'],
  },
  {
    name: 'Fitness',
    subCategories: ['Gym', 'Swimming', 'Cycling', 'Hiking'],
  },
  {
    name: 'Gifts & Contributions',
    subCategories: ['Tips', 'Charity', 'Church offering', 'Gift'],
  },
  {
    name: 'Personal Care',
    subCategories: ['Barber/Salon'],
  },
  {
    name: 'Shopping',
    subCategories: [
      'Clothes',
      'Shoes',
      'Supermarket',
      'Electronics',
      'House Items',
    ],
  },
  {
    name: 'Transport',
    subCategories: [
      'Fuel',
      'Cab',
      'Boda boda',
      'Matatu',
      'Parking',
      'Car Wash',
      'Tolls',
    ],
  },
  {
    name: 'Transfer',
    subCategories: ['M-Shwari', 'Bank', 'Agent'],
  },
  {
    name: 'Investment',
    subCategories: ['SACCO', 'MMF', 'Stocks', 'Bonds'],
  },
  {
    name: 'Insurance',
    subCategories: ['Health', 'Life', 'Vehicle', 'Home'],
  },
];
