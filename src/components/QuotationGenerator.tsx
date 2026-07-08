import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Plus, Trash2, Printer, Download, Sparkles, AlertCircle, ShoppingCart, CheckCircle, Save, Mail, RefreshCw } from 'lucide-react';
import { Product, Customer } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuotationGeneratorProps {
  products: Product[];
  customers: Customer[];
  onAddQuotation: (quotation: any) => void;
  currency?: string;
}

interface QuotationItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function QuotationGenerator({ products, customers, onAddQuotation, currency = 'INR' }: QuotationGeneratorProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [discountPercent, setDiscountPercent] = useState(5);
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [currentProductId, setCurrentProductId] = useState(products[0]?.id || '');
  const [currentQuantity, setCurrentQuantity] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const activeProduct = products.find(p => p.id === currentProductId);

  const handleAddItem = () => {
    if (!activeProduct) return;
    
    // Check if item is already added
    const existingIndex = items.findIndex(item => item.productId === activeProduct.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += currentQuantity;
      setItems(updated);
    } else {
      setItems([...items, {
        productId: activeProduct.id,
        name: activeProduct.name,
        quantity: currentQuantity,
        price: activeProduct.price
      }]);
    }
    // reset qty input
    setCurrentQuantity(10);
  };

  const handleRemoveItem = (pId: string) => {
    setItems(items.filter(item => item.productId !== pId));
  };

  // Financial computations
  const grossTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (grossTotal * discountPercent) / 100;
  const taxableAmount = grossTotal - discountAmount;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const grandTotal = taxableAmount + gstAmount;

  // Print quotation using browser drivers
  const handlePrint = () => {
    window.print();
  };

  // Export beautiful PDF using jsPDF + html2canvas
  const handleExportPDF = async () => {
    const element = document.getElementById('invoice-element');
    if (!element) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution capture
        useCORS: true,
        backgroundColor: '#ffffff' // Force white background for PDF print output
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${selectedCustomer?.name.replace(/\s+/g, '_') || 'Customer'}.pdf`);
    } catch (err) {
      console.error('Failed to export high-res PDF invoice', err);
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

  return (
    <div className="space-y-8 animate-slideup print:p-0 print:space-y-0">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">OFFICIAL B2B SALES COGNIZANCE</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Quotation & Estimate Generator
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        
        {/* Form Controls Column (Print: hidden) */}
        <div className="space-y-6 xl:col-span-2 print:hidden">
          
          <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-6">
            <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="text-brand-indigo w-4 h-4" />
              Configure Estimations
            </h2>

            {/* Select Customer */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 block">Select Target B2B Buyer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo/50 cursor-pointer"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-950">
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>
            </div>

            {/* Add Products */}
            <div className="space-y-4 border-t border-slate-800/60 pt-5">
              <span className="text-xs font-semibold text-slate-400 block">Add Warehouse Products</span>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <select
                    value={currentProductId}
                    onChange={(e) => setCurrentProductId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo/50 cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id} className="bg-zinc-950">
                        {p.name} ({symbol}{p.price}/{p.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min={1}
                    value={currentQuantity}
                    onChange={(e) => setCurrentQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white text-center font-bold outline-none focus:border-brand-indigo"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="w-full py-2.5 bg-[#09090b] hover:bg-zinc-900 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 border border-slate-800 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-brand-indigo" />
                Add Item To List
              </button>
            </div>

            {/* Taxes and Discounts */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Trade Discount (%)</label>
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
                <label className="text-xs font-semibold text-slate-400 block">Integrated GST (%)</label>
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

            {/* Configured Item Feed */}
            {items.length > 0 && (
              <div className="border-t border-slate-800/60 pt-5 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 font-mono uppercase">CONFIGURED LINE ITEMS</span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-zinc-950/40 border border-slate-800/60 text-xs">
                      <div className="max-w-[70%]">
                        <span className="font-semibold text-white block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-500">{item.quantity} Qty • {symbol}{item.price} each</span>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                    Estimate Saved & Sent Successfully
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Approve & Save Estimate
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Live Vector Invoice Preview column (Printable) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Top Panel Controls (Print: hidden) */}
          <div className="flex justify-between items-center bg-[#09090b]/40 p-4 rounded-2xl border border-slate-800/60 print:hidden">
            <span className="text-xs font-semibold text-slate-400">Live Invoice PDF Slate</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="p-2.5 rounded-xl bg-[#09090b] border border-slate-800 text-slate-300 hover:text-white hover:bg-zinc-900 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="Print Estimate Form"
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
                Export Vector PDF
              </button>
            </div>
          </div>

          {/* Captured Invoice Document Div */}
          <div 
            id="invoice-element"
            className="p-8 md:p-12 rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 w-full font-sans relative overflow-hidden print:shadow-none print:border-none print:p-0"
            style={{ minHeight: '650px' }}
          >
            {/* Elegant Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
            
            {/* Header section */}
            <div className="flex justify-between items-start gap-6 border-b border-gray-200 pb-8 mt-2">
              <div>
                <span className="text-xs font-bold font-display uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">B2B VALUATION ESTIMATE</span>
                <h2 className="text-2xl font-bold tracking-tight mt-3 text-gray-900 font-display">Apex Builders Supply & Paints</h2>
                <p className="text-xs text-gray-500 font-medium mt-1">Plot 45, Industrial Growth Centre, Sector 4, New Delhi</p>
                <p className="text-xs text-gray-400">GSTIN: 07AAAAA1111A1Z1 • ops@apexbuilders.com</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-gray-400 block">ESTIMATE NUMBER</span>
                <span className="text-base font-bold font-mono text-gray-900 block mt-0.5">EST-2026-92A</span>
                <p className="text-xs text-gray-500 font-mono mt-3">Date: {new Date().toISOString().split('T')[0]}</p>
                <p className="text-xs text-gray-400 font-mono">Valid Until: July 21, 2026</p>
              </div>
            </div>

            {/* Addresses section */}
            <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">PREPARED BY</span>
                <p className="text-xs font-bold text-gray-800 mt-1">Operations Delivery Team</p>
                <p className="text-xs text-gray-500">Apex Builders Supply Logistics</p>
                <p className="text-xs text-gray-400 mt-0.5">+91 99988 87776</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">PREPARED FOR</span>
                {selectedCustomer ? (
                  <div className="text-xs mt-1">
                    <p className="font-bold text-gray-800">{selectedCustomer.name}</p>
                    <p className="text-gray-500">{selectedCustomer.company}</p>
                    <p className="text-gray-400">{selectedCustomer.email}</p>
                    <p className="text-gray-400">{selectedCustomer.phone}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mt-1 italic">No buyer selected</p>
                )}
              </div>
            </div>

            {/* Configured item listing table */}
            <div className="py-8">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="py-2 text-[10px]">HSN</th>
                    <th className="py-2 text-[10px]">Product description</th>
                    <th className="py-2 text-[10px] text-center">Qty</th>
                    <th className="py-2 text-[10px] text-right">Unit Rate</th>
                    <th className="py-2 text-[10px] text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 text-gray-700">
                        <td className="py-3 font-mono text-gray-400 text-[10px]">3209</td>
                        <td className="py-3 font-semibold text-gray-800">{item.name}</td>
                        <td className="py-3 text-center font-mono">{item.quantity}</td>
                        <td className="py-3 text-right font-mono">{symbol}{item.price.toFixed(2)}</td>
                        <td className="py-3 text-right font-semibold font-mono text-gray-900">{symbol}{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-gray-400 italic">
                        No materials selected. Add warehouse products on the left column controls.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations and payment terms breakdown */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-8 border-t border-gray-200 mt-6">
              
              {/* Left terms & advice */}
              <div className="text-xs text-gray-400 max-w-sm space-y-3 mt-1.5">
                <div>
                  <span className="font-bold text-gray-600 block text-[10px]">PAYMENT SCHEDULE TERMS</span>
                  <p className="mt-0.5 leading-relaxed text-[11px]">50% Advance with official PO placement, balance upon freight delivery. Settle inside 14 business days.</p>
                </div>
                <div>
                  <span className="font-bold text-gray-600 block text-[10px]">DELIVERY WINDOW</span>
                  <p className="mt-0.5 leading-relaxed text-[11px]">3 business days following verified advance transfer. Shipping handled directly by Apex Fleet Corp.</p>
                </div>
              </div>

              {/* Right figures totalizer */}
              <div className="w-full md:w-64 space-y-3 font-mono text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Gross Subtotal:</span>
                  <span>{symbol}{grossTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Trade Discount ({discountPercent}%):</span>
                  <span>-{symbol}{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-800 border-t border-gray-100 pt-2 font-semibold">
                  <span>Taxable Amount:</span>
                  <span>{symbol}{taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST/Tax ({gstRate}%):</span>
                  <span>+{symbol}{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 border-t-2 border-gray-200 pt-3 text-sm font-bold">
                  <span>Grand Total:</span>
                  <span>{symbol}{grandTotal.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer stamp section */}
            <div className="border-t border-gray-100 pt-8 mt-16 text-center text-[10px] text-gray-400">
              <p>Generated automatically via BizPilot AI platform. Verified electronic corporate ledger record. No physical signature mandated.</p>
              <p className="mt-1 font-semibold text-gray-300">Apex Builders Supply & Paints • Digitizing SME Growth Globally</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
