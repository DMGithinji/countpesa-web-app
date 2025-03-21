export interface Category {
  id?: number;
  name: string;
}

export interface Subcategory {
  id?: number;
  name: string;
  categoryId: number;
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
    name: 'Housing',
    subCategories: [
      'Rent',
      'Mortgage',
      'Property Tax',
      'Maintenance',
      'Furniture',
      'Home Decor',
      'Security',
      'House Help',
    ],
  },
  {
    name: 'Utilities',
    subCategories: [
      'Electricity',
      'Water',
      'Gas',
      'Internet',
      'Cable/TV',
      'Phone Bill',
      'Garbage Collection',
    ],
  },
  {
    name: 'Transportation',
    subCategories: [
      'Fuel',
      'Matatu',
      'Boda Boda',
      'Cab/Taxi',
      'Bus',
      'Vehicle Maintenance',
      'Car Insurance',
      'Parking',
      'Tolls',
      'Car Wash',
    ],
  },
  {
    name: 'Food & Dining',
    subCategories: [
      'Groceries',
      'Restaurants',
      'Fast Food',
      'Coffee Shops',
      'Food Delivery',
      'Street Food',
      'Alcohol',
    ],
  },
  {
    name: 'Personal Care',
    subCategories: [
      'Barber/Salon',
      'Cosmetics',
      'Clothing',
      'Shoes',
      'Accessories',
      'Laundry',
      'Gym',
      'Spa',
    ],
  },
  {
    name: 'Health & Wellness',
    subCategories: [
      'Medical Bills',
      'Medication',
      'Health Insurance',
      'Dental Care',
      'Eye Care',
      'Fitness',
      'Vitamins & Supplements',
    ],
  },
  {
    name: 'Education',
    subCategories: [
      'Tuition',
      'Books',
      'School Supplies',
      'Online Courses',
      'Workshops',
      'Training',
      'Student Loans',
    ],
  },
  {
    name: 'Entertainment',
    subCategories: [
      'Movies',
      'Concerts',
      'Events',
      'Streaming Services',
      'Gaming',
      'Hobbies',
      'Party',
      'Travel',
    ],
  },
  {
    name: 'Family',
    subCategories: [
      'Child Care',
      'Baby Supplies',
      'Family Support',
      'School Fees',
      'Children Activities',
      'Gifts for Family',
      'Elder Care',
    ],
  },
  {
    name: 'Digital Services',
    subCategories: [
      'App Subscriptions',
      'Software',
      'Cloud Storage',
      'Digital Content',
      'Domain Names',
      'Online Tools',
    ],
  },
  {
    name: 'Financial',
    subCategories: [
      'Bank Fees',
      'Transaction Fees',
      'Currency Exchange',
      'Investment Fees',
      'Financial Advisory',
      'Tax Preparation',
    ],
  },
  {
    name: 'Income',
    subCategories: [
      'Salary',
      'Freelance',
      'Business Income',
      'Side Hustle',
      'Commissions',
      'Bonus',
      'Gift Received',
      'Dividends',
    ],
  },
  {
    name: 'Debt Repayment',
    subCategories: [
      'Bank Loan',
      'M-Shwari',
      'Fuliza',
      'KCB M-Pesa',
      'Credit Card',
      'Loan App',
      'Friendly Debt',
      'SACCO Loan',
    ],
  },
  {
    name: 'Savings & Investments',
    subCategories: [
      'Emergency Fund',
      'Retirement',
      'SACCO Savings',
      'MMF',
      'Stocks',
      'Bonds',
      'Real Estate',
      'Cryptocurrency',
    ],
  },
  {
    name: 'M-Pesa Transactions',
    subCategories: [
      'Paybill',
      'TillNo',
      'Agent',
      'SendMoney',
      'M-Pesa Fee',
      'M-Shwari Transfer',
      'KCB M-Pesa',
    ],
  },
  {
    name: 'Insurance',
    subCategories: [
      'Health Insurance',
      'Life Insurance',
      'Vehicle Insurance',
      'Home Insurance',
      'Business Insurance',
      'Travel Insurance',
    ],
  },
  {
    name: 'Gifts & Donations',
    subCategories: [
      'Birthday Gifts',
      'Holiday Gifts',
      'Wedding Gifts',
      'Charity',
      'Church Offering',
      'Fundraiser',
      'Tips',
    ],
  },
  {
    name: 'Business Expenses',
    subCategories: [
      'Office Supplies',
      'Equipment',
      'Advertising',
      'Business Travel',
      'Client Meetings',
      'Professional Services',
      'Business Insurance',
    ],
  },
  {
    name: 'Transfer',
    subCategories: [
      'Bank Transfer',
      'M-Pesa to Bank',
      'Bank to M-Pesa',
      'Agent Withdrawal',
      'Agent Deposit',
      'International Transfer',
    ],
  },
];
