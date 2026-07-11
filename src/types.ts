export interface PurchaseHistoryItem {
  date: string;
  invoiceNumber: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  gstPaid: number;
  totalAmount: number;
}

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
  // ERP Extensions
  hsnCode?: string;
  gstRate?: number;
  warehouseLocation?: string;
  purchaseHistory?: PurchaseHistoryItem[];
  sku?: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Purchase' | 'Sale' | 'Adjustment' | 'Return';
  quantity: number;
  date: string;
  reference: string;
  user: string;
  stockAfter: number;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierName: string;
  date: string;
  transactionType: 'Bill' | 'Payment' | 'Opening Balance';
  reference: string;
  amount: number;
  balance: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  date: string;
  status: 'Pending' | 'Received' | 'Partially Received';
  items: Array<{
    productName: string;
    productId?: string;
    quantity: number;
    receivedQuantity: number;
    unit: string;
    price: number;
    hsnCode?: string;
    gstRate?: number;
  }>;
  totalAmount: number;
}

export interface Supplier {
  id: string;
  companyName: string;
  gst?: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTerms?: string;
  outstandingBalance: number;
  purchaseHistory?: Array<{
    date: string;
    invoiceNumber: string;
    amount: number;
    status: string;
  }>;
  productsSupplied?: string[];
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
  gstNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  creditLimit?: number;
  paymentTerms?: string;
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

export interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  affectedRecord: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED' | 'PENDING' | 'BLOCKED';
}
