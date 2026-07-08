import { Product, Customer, Order, Insight, Quotation, CompanyProfile, BusinessPreferences } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'UltraShield Premium Wall Paint (20L)',
    category: 'Paints & Coatings',
    stock: 5, // low stock!
    minStock: 20,
    supplier: 'Apex Chemical Industries',
    price: 3800,
    cost: 2800,
    unit: 'Tub',
    salesGrowth: 15,
    aiRecommendation: 'Stock is critically low. Sales of paints are climbing 15% month-on-month. Reorder 30 tubs immediately to meet summer demand.'
  },
  {
    id: 'p2',
    name: 'Portland Cement Grade 43 (50kg Bag)',
    category: 'Building Materials',
    stock: 450,
    minStock: 100,
    supplier: 'UltraTech Cement Ltd',
    price: 450,
    cost: 320,
    unit: 'Bag',
    salesGrowth: 28,
    aiRecommendation: 'Demand is up 28% due to local construction boom. Maintain current stock level but monitor logistics delays.'
  },
  {
    id: 'p3',
    name: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)',
    category: 'Metal & Structure',
    stock: 12,
    minStock: 5,
    supplier: 'Tata Steel Corp',
    price: 52000,
    cost: 44000,
    unit: 'Bundle',
    salesGrowth: 8,
    aiRecommendation: 'Steel prices are expected to rise by 4% next week. Pre-order 8 bundles now to lock in lower rates.'
  },
  {
    id: 'p4',
    name: 'Clay Red Bricks (Pack of 1000)',
    category: 'Building Materials',
    stock: 45,
    minStock: 25,
    supplier: 'Local Brick Kilns Asso.',
    price: 6500,
    cost: 4800,
    unit: 'Pack',
    salesGrowth: 12,
    aiRecommendation: 'Steady demand. Stock levels are healthy. No immediate reorder required.'
  },
  {
    id: 'p5',
    name: 'Fine River Sand (1 Brass Truckload)',
    category: 'Building Materials',
    stock: 2, // low stock!
    minStock: 8,
    supplier: 'Sand Miners Syndicate',
    price: 4200,
    cost: 3000,
    unit: 'Truck',
    salesGrowth: -5,
    aiRecommendation: 'Monsoon season is starting; sand mining restrictions will apply. Stock up 5 truckloads before the price increases.'
  },
  {
    id: 'p6',
    name: 'Heavy Duty Brush Set (Pack of 5)',
    category: 'Tools & Accessories',
    stock: 85,
    minStock: 30,
    supplier: 'PaintTools Mfg',
    price: 350,
    cost: 220,
    unit: 'Pack',
    salesGrowth: 4,
    aiRecommendation: 'Healthy inventory level. High profit margins (40%). Bundle with UltraShield Paint tubs to drive premium paint sales.'
  },
  {
    id: 'p7',
    name: 'Industrial Wood Primer (5L)',
    category: 'Paints & Coatings',
    stock: 18,
    minStock: 15,
    supplier: 'Apex Chemical Industries',
    price: 950,
    cost: 700,
    unit: 'Can',
    salesGrowth: 6,
    aiRecommendation: 'Stock is approaching min limit. Reorder 10 cans along with the premium paint shipment to save on delivery fees.'
  },
  {
    id: 'p8',
    name: 'Premium Teak Plywood (8x4 ft, 18mm)',
    category: 'Timber & Hardware',
    stock: 4, // low stock!
    minStock: 15,
    supplier: 'GreenPly Industries',
    price: 2400,
    cost: 1800,
    unit: 'Sheet',
    salesGrowth: 22,
    aiRecommendation: 'Sales are up 22%. Reorder 20 sheets. Plywood pricing is currently stable but supply lead time is 7 days.'
  },
  {
    id: 'p9',
    name: 'Universal Screws Box (1000 Pcs)',
    category: 'Timber & Hardware',
    stock: 140,
    minStock: 50,
    supplier: 'Fastener Works',
    price: 180,
    cost: 110,
    unit: 'Box',
    salesGrowth: 2,
    aiRecommendation: 'Stock is well above threshold. Avoid fresh capital blockage. Keep monitoring.'
  },
  {
    id: 'p10',
    name: 'Birla White WallCare Putty (40kg Bag)',
    category: 'Building Materials',
    stock: 80,
    minStock: 30,
    supplier: 'UltraTech Cement Ltd',
    price: 850,
    cost: 650,
    unit: 'Bag',
    salesGrowth: 19,
    aiRecommendation: 'High-velocity item in pre-paint prep. Maintain safety stock as summer painting season remains active.'
  },
  {
    id: 'p11',
    name: 'Acro-Pure Premium Interior Emulsion Paint (10L)',
    category: 'Paints & Coatings',
    stock: 35,
    minStock: 15,
    supplier: 'Apex Chemical Industries',
    price: 2150,
    cost: 1550,
    unit: 'Can',
    salesGrowth: 24,
    aiRecommendation: 'Premium interior emulsions represent high customer-retention categories. Bundle with brushes to improve cart depth.'
  },
  {
    id: 'p12',
    name: 'WeatherShield Exterior Max Coating (20L)',
    category: 'Paints & Coatings',
    stock: 3,
    minStock: 10,
    supplier: 'Apex Chemical Industries',
    price: 5400,
    cost: 3900,
    unit: 'Tub',
    salesGrowth: 31,
    aiRecommendation: 'Demand spiked 31% prior to monsoons. Restock 15 tubs immediately to capture pre-rain exterior wall treatments.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Sharma Traders',
    email: 'sharma.traders@example.com',
    phone: '+91 98765 43210',
    company: 'Sharma Trading & Co',
    outstandingBalance: 4200, // Pending payment!
    totalSpent: 28500,
    lastOrderDate: '2026-06-25'
  },
  {
    id: 'c2',
    name: 'Verma Construction',
    email: 'contact@vermaconstruct.com',
    phone: '+91 98234 56789',
    company: 'Verma Infrastructure Group',
    outstandingBalance: 0,
    totalSpent: 48900,
    lastOrderDate: '2026-07-02'
  },
  {
    id: 'c3',
    name: 'Gupta & Sons Ltd',
    email: 'info@guptasons.com',
    phone: '+91 94567 12345',
    company: 'Gupta Hardware Retailers',
    outstandingBalance: 1250,
    totalSpent: 18200,
    lastOrderDate: '2026-06-18'
  },
  {
    id: 'c4',
    name: 'Elite Builders & Architects',
    email: 'purchasing@elitebuilders.com',
    phone: '+91 88888 77777',
    company: 'Elite Housing Projects',
    outstandingBalance: 8500, // Large outstanding balance
    totalSpent: 92400,
    lastOrderDate: '2026-07-05'
  },
  {
    id: 'c5',
    name: 'Royal Paints Decor',
    email: 'royaldecor@example.com',
    phone: '+91 71234 56789',
    company: 'Royal Decorators',
    outstandingBalance: 0,
    totalSpent: 12400,
    lastOrderDate: '2026-05-12'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    customerId: 'c1',
    customerName: 'Sharma Traders',
    date: '2026-06-25',
    amount: 4200,
    status: 'pending', // Pending payment
    items: [
      { productId: 'p1', name: 'UltraShield Premium Wall Paint (20L)', quantity: 30, price: 120 },
      { productId: 'p7', name: 'Industrial Wood Primer (5L)', quantity: 20, price: 45 }
    ]
  },
  {
    id: 'ord-102',
    customerId: 'c2',
    customerName: 'Verma Construction',
    date: '2026-07-02',
    amount: 9800,
    status: 'completed',
    items: [
      { productId: 'p2', name: 'Portland Cement Grade 43 (50kg Bag)', quantity: 1000, price: 8.5 },
      { productId: 'p3', name: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)', quantity: 1, price: 820 }
    ]
  },
  {
    id: 'ord-103',
    customerId: 'c4',
    customerName: 'Elite Builders & Architects',
    date: '2026-07-05',
    amount: 8500,
    status: 'pending',
    items: [
      { productId: 'p3', name: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)', quantity: 10, price: 820 },
      { productId: 'p4', name: 'Clay Red Bricks (Pack of 1000)', quantity: 2, price: 150 }
    ]
  },
  {
    id: 'ord-104',
    customerId: 'c3',
    customerName: 'Gupta & Sons Ltd',
    date: '2026-06-18',
    amount: 3200,
    status: 'completed',
    items: [
      { productId: 'p8', name: 'Premium Teak Plywood (8x4 ft, 18mm)', quantity: 40, price: 65 },
      { productId: 'p9', name: 'Universal Screws Box (1000 Pcs)', quantity: 50, price: 12 }
    ]
  },
  {
    id: 'ord-105',
    customerId: 'c1',
    customerName: 'Sharma Traders',
    date: '2026-05-14',
    amount: 15200,
    status: 'completed',
    items: [
      { productId: 'p2', name: 'Portland Cement Grade 43 (50kg Bag)', quantity: 1500, price: 8.5 },
      { productId: 'p3', name: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)', quantity: 3, price: 820 }
    ]
  },
  {
    id: 'ord-106',
    customerId: 'c5',
    customerName: 'Royal Paints Decor',
    date: '2026-05-12',
    amount: 6400,
    status: 'completed',
    items: [
      { productId: 'p1', name: 'UltraShield Premium Wall Paint (20L)', quantity: 50, price: 120 },
      { productId: 'p6', name: 'Heavy Duty Brush Set (Pack of 5)', quantity: 16, price: 25 }
    ]
  }
];

export const INITIAL_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    type: 'warning',
    category: 'inventory',
    title: 'UltraShield Paint Stock Critical',
    description: 'Paint stock is down to 5 tubs. Based on current seasonal demand, paint stock will finish in 2 days.',
    suggestedAction: 'Reorder 30 tubs of UltraShield Premium Wall Paint today.',
    metric: '5 tubs left'
  },
  {
    id: 'ins-2',
    type: 'trending',
    category: 'sales',
    title: 'Cement Demand Increasing',
    description: 'Portland Cement Grade 43 has shown a 28% week-on-week demand growth spike due to several surrounding infrastructure startups.',
    suggestedAction: 'Secure logistics priority and schedule raw gypsum supplies ahead.',
    metric: '+28% demand'
  },
  {
    id: 'ins-3',
    type: 'warning',
    category: 'payments',
    title: 'Pending Payment: Sharma Traders',
    description: 'An outstanding invoice of ₹42,000 from Sharma Traders has exceeded its 30-day payment cycle terms.',
    suggestedAction: 'Send automated GST-invoice payment reminder with active ledger.',
    metric: '₹42,000 overdue'
  },
  {
    id: 'ins-4',
    type: 'success',
    category: 'sales',
    title: 'Revenue Up 18% This Month',
    description: 'Monthly gross revenue reached ₹3,21,500, marking a healthy 18% improvement over the preceding 30 days.',
    suggestedAction: 'Allocate 5% additional capital to high-margin structural metals (TMT Bars) to compounding profits.',
    metric: '+18% gross rev'
  },
  {
    id: 'ins-5',
    type: 'warning',
    category: 'profit',
    title: 'Profit Margin Slippage',
    description: 'Average business profit margin slipped by 3% due to high freight charges on TMT Reinforcement Steel deliveries.',
    suggestedAction: 'Renegotiate with Tata Steel suppliers or shift logistics burden to buyer.',
    metric: '-3% margin'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-201',
    customerName: 'Verma Construction',
    customerEmail: 'contact@vermaconstruct.com',
    date: '2026-07-04',
    validUntil: '2026-07-18',
    items: [
      { productId: 'p2', name: 'Portland Cement Grade 43 (50kg Bag)', quantity: 300, price: 8.5 },
      { productId: 'p3', name: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)', quantity: 2, price: 820 }
    ],
    discount: 5,
    gstRate: 18,
    total: 4181.30,
    status: 'sent'
  },
  {
    id: 'qt-202',
    customerName: 'Gupta & Sons Ltd',
    customerEmail: 'info@guptasons.com',
    date: '2026-07-06',
    validUntil: '2026-07-20',
    items: [
      { productId: 'p1', name: 'UltraShield Premium Wall Paint (20L)', quantity: 15, price: 120 },
      { productId: 'p7', name: 'Industrial Wood Primer (5L)', quantity: 10, price: 45 }
    ],
    discount: 10,
    gstRate: 18,
    total: 2148.30,
    status: 'draft'
  }
];

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'Apex Builders Supply & Paints',
  email: 'ops@apexbuilders.com',
  phone: '+91 99988 87776',
  address: 'Plot 45, Industrial Growth Centre, Sector 4, New Delhi, India',
  gstNumber: '07AAAAA1111A1Z1',
  currency: 'INR'
};

export const DEFAULT_PREFERENCES: BusinessPreferences = {
  autoOrderLowStock: false,
  alertThresholdPercent: 20,
  paymentReminderDays: 7
};

export const REVENUE_HISTORY = [
  { month: 'Jan', revenue: 21500, expenses: 14500, profit: 7000 },
  { month: 'Feb', revenue: 24200, expenses: 16800, profit: 7400 },
  { month: 'Mar', revenue: 28900, expenses: 19100, profit: 9800 },
  { month: 'Apr', revenue: 26500, expenses: 18200, profit: 8300 },
  { month: 'May', revenue: 31200, expenses: 21500, profit: 9700 },
  { month: 'Jun', revenue: 32150, expenses: 23100, profit: 9050 }
];

export const CATEGORY_REVENUE = [
  { name: 'Building Materials', value: 16400, color: '#3b82f6' },
  { name: 'Paints & Coatings', value: 8900, color: '#ec4899' },
  { name: 'Metal & Structure', value: 4800, color: '#10b981' },
  { name: 'Timber & Hardware', value: 3450, color: '#f59e0b' },
  { name: 'Tools & Accessories', value: 1200, color: '#8b5cf6' }
];

export const SUPPLIERS = [
  { name: 'Apex Chemical Industries', contact: 'Manoj Kumar', phone: '+91 98333 44444', email: 'sales@apexchem.com' },
  { name: 'UltraTech Cement Ltd', contact: 'Ramesh Shah', phone: '+91 98444 55555', email: 'b2b@ultratech.com' },
  { name: 'Tata Steel Corp', contact: 'Vikram Singh', phone: '+91 98555 66666', email: 'distributors@tatasteel.com' },
  { name: 'GreenPly Industries', contact: 'Anjali Sharma', phone: '+91 98666 77777', email: 'orders@greenply.com' },
  { name: 'Sand Miners Syndicate', contact: 'Rajesh Yadav', phone: '+91 98777 88888', email: 'sandco@example.com' }
];
