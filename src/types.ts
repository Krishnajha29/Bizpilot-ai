export interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  supplier: string;
  price: number;
  cost: number;
  unit: string;
  aiRecommendation: string;
  salesGrowth: number; // monthly %
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  outstandingBalance: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'trending';
  title: string;
  description: string;
  suggestedAction: string;
  metric?: string;
  category: 'inventory' | 'sales' | 'payments' | 'profit';
}

export interface Quotation {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  validUntil: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  discount: number;
  gstRate: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isThinking?: boolean;
}

export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  currency: string;
}

export interface BusinessPreferences {
  autoOrderLowStock: boolean;
  alertThresholdPercent: number;
  paymentReminderDays: number;
}
