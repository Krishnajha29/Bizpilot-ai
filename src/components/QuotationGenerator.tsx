import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  AlertCircle, 
  ShoppingCart, 
  CheckCircle, 
  Save, 
  RefreshCw, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Building, 
  CreditCard, 
  Percent, 
  FileCheck 
} from 'lucide-react';
import { Product, Customer } from '../types';
import { formatCurrency } from '../lib/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotationGeneratorProps {
  products: Product[];
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  onAddQuotation: (quotation: any) => void;
  currency?: string;
}

interface QuotationItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function QuotationGenerator({ 
  products, 
  customers, 
  setCustomers, 
  onAddQuotation, 
  currency = 'INR' 
}: QuotationGeneratorProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [discountPercent, setDiscountPercent] = useState(5);
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<QuotationItem[]>([]);
  
  // Custom document remarks & terms
  const [notes, setNotes] = useState(
    '1. Material dispatch within 3 working days following verified purchase order receipt.\n2. Goods once sold cannot be returned or exchanged under any circumstances.\n3. Please inspect material physical condition at the time of site delivery.'
  );
  const [terms, setTerms] = useState(
    'Standard interest-free credit from dispatch date. Material dispatch is subject to credit-limit clearance. Logistics freight and state taxes computed F.O.R site delivery.'
  );

  // Smart Product Search States
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [searchQuantityMap, setSearchQuantityMap] = useState<{ [productId: string]: number }>({});
  
  // Add Customer Modal States
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGst, setNewCustGst] = useState('');
  const [newCustBilling, setNewCustBilling] = useState('');
  const [newCustShipping, setNewCustShipping] = useState('');
  const [newCustCredit, setNewCustCredit] = useState(1000000);
  const [newCustTerms, setNewCustTerms] = useState('Net 30');

  const [exporting, setExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Live filtering for Smart Product Search
  const filteredProducts = products.filter(p => {
    if (!productSearchTerm.trim()) return false;
    const term = productSearchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.supplier && p.supplier.toLowerCase().includes(term))
    );
  });

  const defaultQuickProducts = products.slice(0, 4);

  const handleAddProduct = (product: Product, quantity: number) => {
    if (!product) return;
    
    const existingIndex = items.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      setItems(updated);
    } else {
      setItems([...items, {
        productId: product.id,
        name: product.name,
        quantity: quantity,
        price: product.price
      }]);
    }
  };

  const handleRemoveItem = (pId: string) => {
    setItems(items.filter(item => item.productId !== pId));
  };

  const handleUpdateItemQuantity = (productId: string, qty: number) => {
    setItems(items.map(item => item.productId === productId ? { ...item, quantity: qty } : item));
  };

  const handleUpdateItemPrice = (productId: string, price: number) => {
    setItems(items.map(item => item.productId === productId ? { ...item, price: price } : item));
  };

  // Financial computations
  const grossTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (grossTotal * discountPercent) / 100;
  const taxableAmount = grossTotal - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = taxableAmount + gstAmount;

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('invoice-element');
    if (!element) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${selectedCustomer?.company.replace(/\s+/g, '_') || 'Customer'}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF quotation', err);
    } finally {
      setExporting(false);
    }
  };

  const handleSaveQuotation = () => {
    if (items.length === 0 || !selectedCustomer) return;
    
    onAddQuotation({
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      items: items,
      discount: discountPercent,
      gstRate: gstRate,
      total: grandTotal,
      status: 'sent'
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setItems([]);
    }, 3000);
  };

  const handleSaveCustomer = () => {
    if (!newCustCompany || !newCustName) return;

    const newId = `c-${Date.now()}`;
    const createdCust: Customer = {
      id: newId,
      name: newCustName,
      company: newCustCompany,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@${newCustCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      phone: newCustPhone || '+91 99999 12345',
      outstandingBalance: 0,
      totalSpent: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      gstNumber: newCustGst || '07AAAAA1111A1Z1',
      billingAddress: newCustBilling || 'Corporate Head Office, Industrial Zone, New Delhi',
      shippingAddress: newCustShipping || newCustBilling || 'Corporate Head Office, Industrial Zone, New Delhi',
      creditLimit: Number(newCustCredit) || 1000000,
      paymentTerms: newCustTerms
    };

    setCustomers(prev => [...prev, createdCust]);
    setSelectedCustomerId(newId);
    
    // Clear states
    setNewCustCompany('');
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustGst('');
    setNewCustBilling('');
    setNewCustShipping('');
    setIsCustomerModalOpen(false);
  };

  const getUnitString = (nameStr: string) => {
    const ns = nameStr.toLowerCase();
    if (ns.includes('cement') || ns.includes('putty')) return 'Bag';
    if (ns.includes('steel') || ns.includes('tmt')) return 'Ton';
    if (ns.includes('brick')) return 'Pack';
    if (ns.includes('paint') || ns.includes('primer')) return 'Liter';
    if (ns.includes('plywood')) return 'Sheet';
    if (ns.includes('screws')) return 'Box';
    return 'Unit';
  };

  return (
    <div className="space-y-8 animate-slideup print:p-0 print:space-y-0">
      
      {/* Page Title Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <p className="text-xs text-slate-500 font-mono tracking-wider">OFFICIAL B2B SALES COGNIZANCE & ESTIMATION</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Quotation Workspace
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        
        {/* Left Column: Pure Quotation Editor Controls */}
        <div className="space-y-6 xl:col-span-2 print:hidden">
          
          <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="text-brand-indigo w-4 h-4" />
                Configure Quotation Details
              </h2>
            </div>

            {/* Customer Selection Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-400">Target B2B Buyer</label>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="text-brand-indigo hover:text-brand-indigo/80 font-bold flex items-center gap-1 cursor-pointer hover:underline text-[11px]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Register Customer
                </button>
              </div>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo/50 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-950">
                    {c.company} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Smart Product Search Picker & Multi-Product Builder */}
            <div className="space-y-4 border-t border-slate-800/60 pt-5">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block">Smart Product Search & Multi-Builder</span>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    placeholder="Search catalog by Name, SKU, Category, Brand..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-slate-800/80 rounded-xl text-xs text-white outline-none focus:border-brand-indigo/50 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Product search results list */}
              {productSearchTerm.trim() ? (
                <div className="space-y-2.5 bg-zinc-950/60 p-3 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider pb-1 border-b border-slate-900">
                    <span>Search Results ({filteredProducts.length})</span>
                    <span>Quick-Add Panel</span>
                  </div>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const currentQty = searchQuantityMap[p.id] || 10;
                      return (
                        <div key={p.id} className="flex items-center justify-between gap-3 p-2 bg-zinc-900/40 hover:bg-zinc-900/80 rounded-lg border border-slate-800/50 transition-all text-xs">
                          <div className="max-w-[50%]">
                            <span className="font-semibold text-white truncate block">{p.name}</span>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono mt-0.5">
                              <span className="text-brand-cyan">{p.sku || 'NO-SKU'}</span>
                              <span>•</span>
                              <span className={p.stock < 15 ? 'text-rose-400 font-bold' : ''}>Stk: {p.stock}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex flex-col text-right font-mono text-[10px] text-slate-400 pr-1">
                              <span>{formatCurrency(p.price, true)}</span>
                              <span className="text-[9px] text-slate-600">per {p.unit}</span>
                            </div>
                            <input
                              type="number"
                              min={1}
                              value={currentQty}
                              onChange={(e) => setSearchQuantityMap({
                                ...searchQuantityMap,
                                [p.id]: Math.max(1, parseInt(e.target.value) || 1)
                              })}
                              className="w-11 py-1 bg-zinc-950 border border-slate-800 rounded text-center text-xs font-bold text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                handleAddProduct(p, currentQty);
                              }}
                              className="px-2.5 py-1.5 bg-brand-indigo hover:bg-brand-indigo/90 text-[10px] font-extrabold text-white rounded transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-slate-500 italic text-center py-4">
                      No matching catalog items found.
                    </p>
                  )}
                </div>
              ) : (
                /* Quick Favorites suggestions when search is empty */
                <div className="space-y-2 bg-[#09090b]/40 p-3 rounded-xl border border-slate-900">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    Quick-Add Favorites (ERP Inventory)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {defaultQuickProducts.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleAddProduct(p, 10)}
                        className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-slate-800/60 rounded-xl text-left transition-all group flex flex-col justify-between cursor-pointer"
                      >
                        <span className="text-[11px] text-slate-300 group-hover:text-white font-semibold truncate block w-full">{p.name}</span>
                        <div className="flex justify-between items-center w-full mt-1.5">
                          <span className="text-[9px] text-slate-500 font-mono">{formatCurrency(p.price, true)}</span>
                          <span className="text-[8px] px-1 bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo rounded font-bold font-mono">
                            +10 QTY
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Configured Item List with Direct Qty and Price Inputs */}
            {items.length > 0 && (
              <div className="border-t border-slate-800/60 pt-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">Quoted Materials & Valuation</span>
                  <span className="text-[10px] text-brand-cyan font-mono font-bold bg-brand-cyan/5 px-2 py-0.5 rounded-md border border-brand-cyan/10">
                    {items.length} Products Active
                  </span>
                </div>
                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const dbProd = products.find(p => p.id === item.productId);
                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-zinc-950 border border-slate-800 text-xs space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="max-w-[80%]">
                            <span className="font-semibold text-white block truncate">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              SKU: {dbProd?.sku || 'NO-SKU'} • {dbProd?.category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Quantity</label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                handleUpdateItemQuantity(item.productId, val);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-brand-indigo/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">Unit Price ({symbol})</label>
                            <input
                              type="number"
                              min={0}
                              value={item.price}
                              onChange={(e) => {
                                const val = Math.max(0, parseFloat(e.target.value) || 0);
                                handleUpdateItemPrice(item.productId, val);
                              }}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-slate-800 rounded-lg text-xs font-bold text-white outline-none focus:border-brand-indigo/50"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Taxes and Discounts */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-brand-indigo" />
                  Trade Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white font-mono outline-none focus:border-brand-indigo"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-brand-indigo" />
                  Integrated GST (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={28}
                  value={gstRate}
                  onChange={(e) => setGstRate(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white font-mono outline-none focus:border-brand-indigo"
                />
              </div>
            </div>

            {/* Notes & Terms Editing Panel (Word/Figma editor style) */}
            <div className="border-t border-slate-800/60 pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Custom Remarks & Memo (Notes)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter remarks to display on quotation document..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 outline-none focus:border-brand-indigo placeholder:text-slate-700 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Commercial Contract Terms</label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Enter custom payment & dispatch terms..."
                  className="w-full px-3 py-2 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 outline-none focus:border-brand-indigo placeholder:text-slate-700 resize-none"
                />
              </div>
            </div>

          </div>

          {/* Action triggers */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleSaveQuotation}
                className="w-full py-3 bg-gradient-to-tr from-brand-indigo to-brand-purple hover:opacity-95 text-xs font-bold text-white rounded-xl shadow-md shadow-brand-indigo/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-white" />
                    Quotation Saved & Sent Successfully
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Approve & Save Quotation
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Premium Preview Panel */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Top Panel controls */}
          <div className="flex justify-between items-center bg-[#09090b]/40 p-4 rounded-2xl border border-slate-800/60 print:hidden">
            <span className="text-xs font-semibold text-slate-400">Live Corporate Document Sheet</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-[#09090b] border border-slate-800 text-slate-300 hover:text-white hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleExportPDF}
                disabled={items.length === 0 || exporting}
                className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-gray-950 font-bold flex items-center gap-1.5 text-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {exporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
            </div>
          </div>

          {/* Dynamic Switch: Clean professional empty state vs Elegant B2B Document Sheet */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-zinc-950/40 border border-slate-800/60 text-center min-h-[500px] space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-white font-display">Quotation Preview</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a B2B consignee and add catalog materials on the left editing panel to generate the live estimate sheets.
                </p>
              </div>
              <div className="pt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-indigo bg-brand-indigo/10 border border-brand-indigo/25 px-3 py-1.5 rounded-full">
                  Editor Status: Idle & Ready
                </span>
              </div>
            </div>
          ) : (
            /* Premium Commercial Document rendering (SAP/Oracle corporate guidelines) */
            <div 
              id="invoice-element"
              className="p-8 md:p-10 bg-white text-slate-800 shadow-2xl rounded-2xl border border-gray-200 w-full font-sans relative overflow-hidden print:shadow-none print:border-none print:p-0"
              style={{ minHeight: 'auto' }}
            >
              {/* Elegant Accent Header border */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-950 via-slate-800 to-slate-900" />
              
              {/* Corporate Identity Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-6 mt-2">
                <div>
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                    B2B OFFICIAL SALES ESTIMATE
                  </span>
                  <h2 className="text-xl font-bold tracking-tight mt-2 text-slate-950 font-display">
                    BizPilot AI (India) Private Limited
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Regd Office: Corporate Towers, Sector 62, Noida, UP, 201301</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    GSTIN: 09AAACB3192H1Z5 • Email: billing@bizpilot.ai • Support: +91 120 4567890
                  </p>
                </div>
                <div className="text-left md:text-right font-mono text-[11px]">
                  <span className="text-[8px] font-bold text-slate-400 block tracking-widest">ESTIMATE SERIAL NO</span>
                  <span className="text-base font-extrabold text-slate-900 block mt-0.5">QT-2026-904-01</span>
                  <p className="text-slate-500 mt-2">Date: {new Date().toISOString().split('T')[0]}</p>
                  <p className="text-slate-400">Validity: 15 Days (Valid Until: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]})</p>
                  <p className="text-slate-500 font-bold">Incoterms: F.O.R Site Delivery</p>
                </div>
              </div>

              {/* Consignee Billing/Shipping breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-gray-200">
                {/* Dispatch Origin / Seller */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] space-y-1">
                  <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">SELLER / DISPATCH FROM</span>
                  <p className="font-bold text-slate-900 text-xs">BizPilot AI (India) Private Limited</p>
                  <p className="text-slate-500">Logistics & Warehousing Division (Delhi-NCR)</p>
                  <p className="text-slate-400">GSTIN: 09AAACB3192H1Z5</p>
                  <p className="text-slate-400">Representative: Sanjay Sharma (Corporate Sales Lead)</p>
                </div>

                {/* Client / Buyer */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] space-y-1 md:text-right">
                  <span className="text-[8px] font-bold text-slate-400 tracking-wider uppercase block">CONSIGNEE / BILL TO</span>
                  {selectedCustomer ? (
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 text-xs">{selectedCustomer.company}</p>
                      <p className="text-slate-400">GSTIN / TAX ID: {selectedCustomer.gstNumber || 'Unregistered Client'}</p>
                      <p className="text-slate-400">Attn Rep: {selectedCustomer.name} ({selectedCustomer.phone})</p>
                      <p className="text-slate-400 max-w-[280px] md:ml-auto leading-relaxed text-[10px]">
                        📍 <b>Billing:</b> {selectedCustomer.billingAddress}
                      </p>
                      <p className="text-slate-400 max-w-[280px] md:ml-auto leading-relaxed text-[10px]">
                        🚚 <b>Shipping:</b> {selectedCustomer.shippingAddress || selectedCustomer.billingAddress}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No buyer entity specified</p>
                  )}
                </div>
              </div>

              {/* High-Density Materials Table */}
              <div className="py-6">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[9px] bg-slate-50">
                      <th className="py-2 px-1 text-left">SKU / HSN</th>
                      <th className="py-2 px-1 text-left">Material Description</th>
                      <th className="py-2 px-1 text-center">Qty / Unit</th>
                      <th className="py-2 px-1 text-right">Unit Rate</th>
                      <th className="py-2 px-1 text-right">Discount</th>
                      <th className="py-2 px-1 text-right">GST Rate</th>
                      <th className="py-2 px-1 text-right">Line Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => {
                      const dbProd = products.find(p => p.id === item.productId);
                      const unit = getUnitString(item.name);
                      
                      const lineBase = item.price * item.quantity;
                      const lineDiscount = (lineBase * discountPercent) / 100;
                      const lineTaxable = lineBase - lineDiscount;
                      const lineGst = (lineTaxable * gstRate) / 100;
                      const lineTotal = lineTaxable + lineGst;

                      return (
                        <tr key={index} className="text-slate-700 hover:bg-slate-50/40 transition-colors font-mono">
                          <td className="py-2 px-1 text-left text-[10px] text-slate-400">
                            {dbProd?.sku || `SKU-${dbProd?.id?.toUpperCase()}`}
                            <span className="block text-[8px] text-slate-500">HSN: {dbProd?.hsnCode || '3209'}</span>
                          </td>
                          <td className="py-2 px-1 text-left font-sans text-xs">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400">Category: {dbProd?.category} • Supplier: {dbProd?.supplier || 'Approved Supplier'}</span>
                          </td>
                          <td className="py-2 px-1 text-center text-slate-900">
                            <span className="font-bold">{item.quantity}</span>
                            <span className="text-[9px] text-slate-500 block font-sans">{unit}s</span>
                          </td>
                          <td className="py-2 px-1 text-right">{formatCurrency(item.price, true)}</td>
                          <td className="py-2 px-1 text-right text-emerald-600">
                            -{formatCurrency(lineDiscount, true)}
                            <span className="text-[8px] text-slate-400 block font-sans">({discountPercent}%)</span>
                          </td>
                          <td className="py-2 px-1 text-right text-slate-500">
                            {formatCurrency(lineGst, true)}
                            <span className="text-[8px] text-slate-400 block font-sans">({gstRate}%)</span>
                          </td>
                          <td className="py-2 px-1 text-right font-bold text-slate-950">{formatCurrency(lineTotal, true)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Notes, terms, bank records, and calculations splits */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-900 mt-4">
                
                {/* Custom remarks, contracts & payment accounts */}
                <div className="text-[10px] text-slate-500 max-w-sm space-y-4">
                  {notes && (
                    <div>
                      <span className="font-bold text-slate-800 block text-[9px] uppercase tracking-wider">NOTES / REMARKS</span>
                      <p className="mt-1 leading-relaxed text-slate-600 whitespace-pre-line">
                        {notes}
                      </p>
                    </div>
                  )}

                  {terms && (
                    <div>
                      <span className="font-bold text-slate-800 block text-[9px] uppercase tracking-wider">COMMERCIAL CONTRACT TERMS</span>
                      <p className="mt-1 leading-relaxed text-slate-600 whitespace-pre-line">
                        {terms}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-slate-800 block text-[9px] uppercase tracking-wider font-sans">CORPORATE BANK SETTLEMENT</span>
                    <p className="mt-1 font-mono text-[9px] leading-relaxed">
                      Beneficiary: BizPilot AI India Pvt Ltd<br />
                      Bank: ICICI Bank Ltd — Corporate Branch Noida<br />
                      A/C No: 99882200114455 (Current A/C)<br />
                      NEFT / IFSC Code: ICIC0000104
                    </p>
                  </div>
                </div>

                {/* Right totals breakdown (SAP dense format) */}
                <div className="w-full md:w-72 p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Gross Material Cost:</span>
                    <span className="text-slate-900">{formatCurrency(grossTotal, true)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Trade Discount ({discountPercent}%):</span>
                    <span>-{formatCurrency(discountAmount, true)}</span>
                  </div>
                  
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                    <span>Taxable Subtotal:</span>
                    <span>{formatCurrency(taxableAmount, true)}</span>
                  </div>

                  {/* Integrated Tax split visualization */}
                  <div className="border-t border-dashed border-slate-200 pt-2 space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Central Tax CGST ({gstRate / 2}%):</span>
                      <span>+{formatCurrency(gstAmount / 2, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Tax SGST ({gstRate / 2}%):</span>
                      <span>+{formatCurrency(gstAmount / 2, true)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-800 font-medium">
                    <span>Integrated Tax IGST ({gstRate}%):</span>
                    <span>+{formatCurrency(gstAmount, true)}</span>
                  </div>

                  <div className="flex justify-between text-slate-950 border-t border-slate-900 pt-2.5 text-xs font-bold bg-slate-100 p-1.5 rounded">
                    <span>NET PAYABLE VALUE:</span>
                    <span>{formatCurrency(grandTotal, true)}</span>
                  </div>
                </div>

              </div>

              {/* Corporate seal signs */}
              <div className="grid grid-cols-2 gap-6 pt-10 mt-10 border-t border-slate-100">
                <div className="text-center font-mono">
                  <div className="h-12 flex items-end justify-center pb-1">
                    <span className="font-serif italic text-slate-800 text-sm select-none">Sanjay Sharma</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-400">
                    <p className="font-bold text-slate-700">Sanjay Sharma</p>
                    <p>Sales Approval Seal</p>
                    <p className="text-[8px]">For BizPilot AI Pvt Ltd</p>
                  </div>
                </div>
                <div className="text-center font-mono">
                  <div className="h-12 flex items-end justify-center pb-1">
                    <span className="text-slate-300 italic text-[10px] select-none">Consignee Site Seal & Sign</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-400">
                    <p className="font-bold text-slate-700">Authorized B2B Signatory</p>
                    <p>Client Acceptance Seal</p>
                    <p className="text-[8px]">For {selectedCustomer?.company || 'The Buyer'}</p>
                  </div>
                </div>
              </div>

              {/* Fine Print footer */}
              <div className="border-t border-slate-100 pt-6 mt-8 text-center text-[8px] text-slate-400">
                <p>Computer generated proforma estimate. Verified electronic record with integrated logistics tracing.</p>
                <p className="font-bold text-slate-300 mt-0.5">Apex Logistics ERP Network • CRM Quoting Module</p>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* B2B CUSTOMER REGISTER MODAL */}
      {/* ========================================================= */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadein">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl bg-[#09090b] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-indigo" />
                <h3 className="text-base font-bold font-display text-white">Register B2B Customer (Customer Master)</h3>
              </div>
              <button 
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-5 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC Construction Pvt Ltd"
                    value={newCustCompany}
                    onChange={(e) => setNewCustCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">GST Number (GSTIN)</label>
                  <input
                    type="text"
                    placeholder="e.g. 07AAAAA1111A1Z1"
                    value={newCustGst}
                    onChange={(e) => setNewCustGst(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Contact Person (Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Verma"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 99999 88888"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. procurement@abcconstructions.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Billing Address</label>
                  <textarea
                    rows={2}
                    placeholder="Corporate Billing Location Address..."
                    value={newCustBilling}
                    onChange={(e) => setNewCustBilling(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Shipping Address</label>
                  <textarea
                    rows={2}
                    placeholder="Material Delivery Yard Location Address..."
                    value={newCustShipping}
                    onChange={(e) => setNewCustShipping(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none placeholder:text-slate-700 resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Credit Limit ({symbol})</label>
                  <input
                    type="number"
                    value={newCustCredit}
                    onChange={(e) => setNewCustCredit(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 font-semibold block">Payment Terms</label>
                  <select
                    value={newCustTerms}
                    onChange={(e) => setNewCustTerms(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800 rounded-xl text-white outline-none cursor-pointer"
                  >
                    <option value="Net 30">Net 30 (30 Days Credit)</option>
                    <option value="Net 15">Net 15 (15 Days Credit)</option>
                    <option value="Advance Only">Advance Only</option>
                    <option value="COD">COD (Cash on Delivery)</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button 
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveCustomer}
                className="px-5 py-2.5 bg-brand-indigo hover:bg-brand-indigo/90 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
              >
                Register & Select Customer
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
