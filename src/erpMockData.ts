import { INITIAL_PRODUCTS } from './mockData';
import { Product, InventoryMovement, SupplierLedgerEntry, PurchaseOrder, Supplier } from './types';

// Enriches initial mock products with SAP/Oracle compliant ERP attributes
export const getEnrichedProducts = (): Product[] => {
  return INITIAL_PRODUCTS.map((p, idx) => {
    const hsnCodes = ['3208', '2523', '7214', '6815', '2505', '9603', '3208', '4412', '7318', '2523', '3208', '3208'];
    const warehouseLocations = [
      'WH-A1-Shelf3', 'WH-B2-Shelf1', 'WH-A3-Shelf2', 'WH-C1-Shelf4',
      'WH-Yard-SecB', 'WH-A4-Shelf5', 'WH-A1-Shelf4', 'WH-B1-Shelf2',
      'WH-C2-Shelf3', 'WH-B2-Shelf2', 'WH-A1-Shelf1', 'WH-A2-Shelf1'
    ];
    const hsn = hsnCodes[idx] || '3208';
    const loc = warehouseLocations[idx] || 'WH-A1-Shelf1';
    const gst = idx % 3 === 0 ? 18 : (idx % 3 === 1 ? 12 : 28); // Standard GST brackets

    return {
      ...p,
      hsnCode: hsn,
      gstRate: gst,
      warehouseLocation: loc,
      purchaseHistory: [
        {
          date: '2026-06-10',
          invoiceNumber: `INV-2026-0${idx + 10}`,
          supplierName: p.supplier,
          quantity: 50,
          unitPrice: p.cost,
          gstPaid: Math.round((p.cost * 50) * (gst / 100)),
          totalAmount: Math.round((p.cost * 50) * (1 + gst / 100))
        }
      ]
    };
  });
};

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    productName: 'UltraShield Premium Wall Paint (20L)',
    type: 'Purchase',
    quantity: 30,
    date: '2026-06-25',
    reference: 'Invoice #APEX-2026-104',
    user: 'System AI',
    stockAfter: 35
  },
  {
    id: 'm2',
    productId: 'p1',
    productName: 'UltraShield Premium Wall Paint (20L)',
    type: 'Sale',
    quantity: -30,
    date: '2026-06-25',
    reference: 'Sales Order #ord-101',
    user: 'Admin User',
    stockAfter: 5
  },
  {
    id: 'm3',
    productId: 'p2',
    productName: 'Portland Cement Grade 43 (50kg Bag)',
    type: 'Purchase',
    quantity: 1000,
    date: '2026-07-02',
    reference: 'Invoice #UT-88371',
    user: 'Manojit Roy (Warehouse Ops)',
    stockAfter: 1450
  },
  {
    id: 'm4',
    productId: 'p2',
    productName: 'Portland Cement Grade 43 (50kg Bag)',
    type: 'Sale',
    quantity: -1000,
    date: '2026-07-02',
    reference: 'Sales Order #ord-102',
    user: 'Admin User',
    stockAfter: 450
  },
  {
    id: 'm5',
    productId: 'p3',
    productName: 'TMT Steel Reinforcement Bars (12mm, 1 Ton)',
    type: 'Adjustment',
    quantity: 2,
    date: '2026-07-08',
    reference: 'Annual Stock Audit Discrepancy',
    user: 'System Auditor',
    stockAfter: 12
  },
  {
    id: 'm6',
    productId: 'p8',
    productName: 'Premium Teak Plywood (8x4 ft, 18mm)',
    type: 'Return',
    quantity: 2,
    date: '2026-07-09',
    reference: 'Customer Return (Unused Material)',
    user: 'Operations Lead',
    stockAfter: 4
  }
];

export const INITIAL_SUPPLIER_LEDGERS: SupplierLedgerEntry[] = [
  {
    id: 'l1',
    supplierName: 'Apex Chemical Industries',
    date: '2026-06-01',
    transactionType: 'Opening Balance',
    reference: 'FY27 Balance Carryforward',
    amount: 150000,
    balance: 150000
  },
  {
    id: 'l2',
    supplierName: 'Apex Chemical Industries',
    date: '2026-06-10',
    transactionType: 'Bill',
    reference: 'Invoice #APEX-2026-101',
    amount: 85000,
    balance: 235000
  },
  {
    id: 'l3',
    supplierName: 'Apex Chemical Industries',
    date: '2026-06-15',
    transactionType: 'Payment',
    reference: 'NEFT Ref #992812039',
    amount: -100000,
    balance: 135000
  },
  {
    id: 'l4',
    supplierName: 'UltraTech Cement Ltd',
    date: '2026-07-01',
    transactionType: 'Bill',
    reference: 'Invoice #UT-88371',
    amount: 320000,
    balance: 320000
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po1',
    poNumber: 'PO-2026-801',
    supplierName: 'Apex Chemical Industries',
    date: '2026-07-01',
    status: 'Pending',
    items: [
      {
        productName: 'UltraShield Premium Wall Paint (20L)',
        quantity: 25,
        receivedQuantity: 0,
        unit: 'Tub',
        price: 2800,
        hsnCode: '3208',
        gstRate: 18
      },
      {
        productName: 'Industrial Wood Primer (5L)',
        quantity: 15,
        receivedQuantity: 0,
        unit: 'Can',
        price: 700,
        hsnCode: '3208',
        gstRate: 18
      }
    ],
    totalAmount: 94990
  },
  {
    id: 'po2',
    poNumber: 'PO-2026-802',
    supplierName: 'UltraTech Cement Ltd',
    date: '2026-07-05',
    status: 'Pending',
    items: [
      {
        productName: 'Portland Cement Grade 43 (50kg Bag)',
        quantity: 300,
        receivedQuantity: 0,
        unit: 'Bag',
        price: 320,
        hsnCode: '2523',
        gstRate: 12
      }
    ],
    totalAmount: 107520
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup1',
    companyName: 'Apex Chemical Industries',
    gst: '07APEXA1111A1Z1',
    phone: '+91 98765 43210',
    email: 'ops@apexchemical.com',
    address: 'A-24, Chemical Zone, Phase II, Okhla, New Delhi',
    paymentTerms: 'Net 30',
    outstandingBalance: 135000,
    purchaseHistory: [
      { date: '2026-06-10', invoiceNumber: 'INV-2026-010', amount: 85000, status: 'Paid' },
      { date: '2026-06-25', invoiceNumber: 'APEX-2026-104', amount: 50000, status: 'Unpaid' }
    ],
    productsSupplied: ['UltraShield Premium Wall Paint (20L)', 'Industrial Wood Primer (5L)']
  },
  {
    id: 'sup2',
    companyName: 'UltraTech Cement Ltd',
    gst: '08ULTRA8888C1Z2',
    phone: '+91 99887 76655',
    email: 'distrib@ultratech.com',
    address: 'Cement House, Sector 5, Rohini, New Delhi',
    paymentTerms: 'Net 15',
    outstandingBalance: 320000,
    purchaseHistory: [
      { date: '2026-07-01', invoiceNumber: 'UT-88371', amount: 320000, status: 'Unpaid' }
    ],
    productsSupplied: ['Portland Cement Grade 43 (50kg Bag)']
  },
  {
    id: 'sup3',
    companyName: 'Jindal Steel & Power Ltd',
    gst: '09JINDAL9999S3Z3',
    phone: '+91 97766 55443',
    email: 'b2bsales@jindalsteel.com',
    address: 'Jindal Centre, Bhikaiji Cama Place, New Delhi',
    paymentTerms: 'Advance',
    outstandingBalance: 0,
    purchaseHistory: [],
    productsSupplied: ['TMT Steel Reinforcement Bars (12mm, 1 Ton)']
  }
];

