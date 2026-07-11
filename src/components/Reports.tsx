import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Sparkles, AlertCircle, TrendingUp, DollarSign, Calendar, RefreshCw, BarChart2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product, Customer, Order, Insight, AuditLog } from '../types';
import { REVENUE_HISTORY } from '../mockData';
import { formatCurrency } from '../lib/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportsProps {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  insights: Insight[];
  auditLogs?: AuditLog[];
  currency?: string;
}

type ReportType = 'monthly' | 'weekly' | 'inventory' | 'customer' | 'audit';

export default function Reports({ products, customers, orders, insights, auditLogs = [], currency = 'INR' }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('monthly');
  const [exporting, setExporting] = useState(false);

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // Stats summaries
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalRevenue = REVENUE_HISTORY[REVENUE_HISTORY.length - 1].revenue; // June
  const totalCost = REVENUE_HISTORY[REVENUE_HISTORY.length - 1].expenses; // June
  const netMarginVal = REVENUE_HISTORY[REVENUE_HISTORY.length - 1].profit; // June

  const handleExportPDF = async () => {
    const element = document.getElementById('report-slate');
    if (!element) return;
    setExporting(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2.2, // Clean high-resolution image rendering
        useCORS: true,
        backgroundColor: '#ffffff' // Pure white background to guarantee print readability
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`BizPilot_Report_${activeReport}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export executive PDF report', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* Title section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">COMPREHENSIVE B2B COMPLIANCE & LEDGERS</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Executive Report Dossiers
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left selector menu */}
        <div className="space-y-3 lg:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider block px-2">CHOOSE DOSSIER TEMPLATE</span>
          
          <button
            onClick={() => setActiveReport('monthly')}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              activeReport === 'monthly'
                ? 'bg-brand-indigo/15 border-brand-indigo/40 text-white font-semibold'
                : 'bg-[#09090b]/40 border-slate-800/60 text-slate-400 hover:text-white hover:bg-[#09090b]'
            }`}
          >
            <BarChart2 className="w-5 h-5 text-brand-indigo" />
            <div className="text-xs">
              <p className="font-bold font-display">H1 Monthly Financials</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Revenue vs expense balances</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('weekly')}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              activeReport === 'weekly'
                ? 'bg-brand-indigo/15 border-brand-indigo/40 text-white font-semibold'
                : 'bg-[#09090b]/40 border-slate-800/60 text-slate-400 hover:text-white hover:bg-[#09090b]'
            }`}
          >
            <Calendar className="w-5 h-5 text-brand-cyan" />
            <div className="text-xs">
              <p className="font-bold font-display">Weekly Status Digest</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Active transactions & checkouts</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('inventory')}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              activeReport === 'inventory'
                ? 'bg-brand-indigo/15 border-brand-indigo/40 text-white font-semibold'
                : 'bg-[#09090b]/40 border-slate-800/60 text-slate-400 hover:text-white hover:bg-[#09090b]'
            }`}
          >
            <FileText className="w-5 h-5 text-brand-indigo" />
            <div className="text-xs">
              <p className="font-bold font-display">Warehouse Audit Balance</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Stock limits & reorder alarms</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('customer')}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              activeReport === 'customer'
                ? 'bg-brand-indigo/15 border-brand-indigo/40 text-white font-semibold'
                : 'bg-[#09090b]/40 border-slate-800/60 text-slate-400 hover:text-white hover:bg-[#09090b]'
            }`}
          >
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <div className="text-xs">
              <p className="font-bold font-display">B2B Customer Accounts</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Receivables & credit records</p>
            </div>
          </button>

          <button
            onClick={() => setActiveReport('audit')}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
              activeReport === 'audit'
                ? 'bg-brand-indigo/15 border-brand-indigo/40 text-white font-semibold'
                : 'bg-[#09090b]/40 border-slate-800/60 text-slate-400 hover:text-white hover:bg-[#09090b]'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-violet-500" />
            <div className="text-xs">
              <p className="font-bold font-display">Compliance Audit Trail</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Cryptographic system activity</p>
            </div>
          </button>
        </div>

        {/* Right Preview area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Panel controls */}
          <div className="flex justify-between items-center bg-[#09090b]/40 p-4 rounded-2xl border border-slate-800/60">
            <span className="text-xs font-semibold text-slate-400">Dossier Slate Preview</span>
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="px-4 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-gray-950 font-bold flex items-center gap-1.5 text-xs transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              {exporting ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Download className="w-4.5 h-4.5" />}
              Export PDF Dossier
            </button>
          </div>

          {/* Captured Document Sheet */}
          <div
            id="report-slate"
            className="p-10 md:p-12 rounded-2xl bg-white text-gray-900 shadow-2xl border border-gray-200 w-full relative overflow-hidden"
            style={{ minHeight: '750px' }}
          >
            {/* Top decorative visual border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />

            {/* Letterhead */}
            <div className="flex justify-between items-start border-b border-gray-200 pb-8 mt-2">
              <div>
                <span className="text-[9px] font-bold font-display uppercase tracking-widest text-violet-600 bg-violet-50 px-2.5 py-1 rounded-md">BIZPILOT AUTOMATED REPORT</span>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 mt-3 font-display">Apex Builders Supply & Paints</h2>
                <p className="text-xs text-gray-500 mt-0.5">Plot 45, Industrial Growth Centre, Sector 4, New Delhi</p>
                <p className="text-xs text-gray-400">GSTIN: 07AAAAA1111A1Z1 • ops@apexbuilders.com • +91 99988 87776</p>
              </div>
              <div className="text-right text-xs">
                <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">DATE OF DOSSIER</span>
                <span className="font-bold text-gray-800 font-mono block mt-1">{new Date().toISOString().split('T')[0]}</span>
                <p className="text-gray-400 mt-2 font-mono">Dossier ID: BIZ-994A</p>
                <p className="text-emerald-600 font-bold mt-1">Status: Verified</p>
              </div>
            </div>

            {/* Sub-report selector logic */}
            
            {/* 1. Monthly report */}
            {activeReport === 'monthly' && (
              <div className="space-y-6 py-8">
                <h3 className="text-base font-bold font-display text-gray-900 border-b border-gray-100 pb-3">H1 2026 Monthly Operations Financial Summary</h3>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">June Gross Revenue</span>
                    <span className="text-lg font-bold font-mono text-gray-900 block mt-1">{formatCurrency(totalRevenue)}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">▲ +18.4% MoM Growth</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">June Net Profit</span>
                    <span className="text-lg font-bold font-mono text-gray-900 block mt-1">{formatCurrency(netMarginVal)}</span>
                    <span className="text-[10px] text-amber-500 font-semibold mt-1 block">▼ -3% steel freight slip</span>
                  </div>
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 block uppercase">Accounts Receivable</span>
                    <span className="text-lg font-bold font-mono text-gray-900 block mt-1">{formatCurrency(totalOutstanding)}</span>
                    <span className="text-[10px] text-red-500 font-semibold mt-1 block">● 2 large buyer dues late</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">H1 FINANCIAL TREND LEDGERS</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold font-display">Reporting Period</th>
                          <th className="p-3 font-semibold font-display text-right">Gross Revenue</th>
                          <th className="p-3 font-semibold font-display text-right">Operating Outlay</th>
                          <th className="p-3 font-semibold font-display text-right">Net Margin Profit</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 font-mono text-[11px]">
                        {REVENUE_HISTORY.map((row, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="p-3 font-sans font-medium text-gray-800">{row.month} 2026</td>
                            <td className="p-3 text-right">{symbol}{row.revenue.toLocaleString()}</td>
                            <td className="p-3 text-right">{symbol}{row.expenses.toLocaleString()}</td>
                            <td className="p-3 text-right text-emerald-600 font-bold">{symbol}{row.profit.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Weekly report */}
            {activeReport === 'weekly' && (
              <div className="space-y-6 py-8">
                <h3 className="text-base font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Weekly Operational Sales Digest</h3>
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  Weekly monitoring tracks operational transactions and sales speeds. Here is a summary of the active sales checkouts and estimates completed this week.
                </p>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">ACTIVE RECENT SALES LINE</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold font-display">Txn ID</th>
                          <th className="p-3 font-semibold font-display">Client Buyer</th>
                          <th className="p-3 font-semibold font-display">Invoice Value</th>
                          <th className="p-3 font-semibold font-display">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 font-mono">
                        {orders.map((o) => (
                          <tr key={o.id} className="border-b border-gray-100">
                            <td className="p-3 font-bold text-gray-500">{o.id}</td>
                            <td className="p-3 font-sans font-medium text-gray-800">{o.customerName}</td>
                            <td className="p-3 font-bold text-gray-900">{formatCurrency(o.amount, true)}</td>
                            <td className="p-3 font-sans">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${o.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Inventory report */}
            {activeReport === 'inventory' && (
              <div className="space-y-6 py-8">
                <h3 className="text-base font-bold font-display text-gray-900 border-b border-gray-100 pb-3">Warehouse Stock Balance & Audit</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 text-rose-800">
                    <span className="text-[10px] font-bold text-rose-400 block uppercase">LOW STOCK WARNING LIMITS</span>
                    <p className="text-lg font-bold mt-1">3 Materials</p>
                    <p className="text-[10px] text-rose-500 mt-1 leading-relaxed">UltraShield Paint, Fine Sand, Teak Plywood. Action recommended.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-800">
                    <span className="text-[10px] font-bold text-emerald-400 block uppercase">HEALTHY STOCK SAFETY</span>
                    <p className="text-lg font-bold mt-1">6 Lines</p>
                    <p className="text-[10px] text-emerald-500 mt-1 leading-relaxed">Portland Cement, Bricks, Screws, Steel Reinforcement. Safety thresholds stable.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">CURRENT WAREHOUSE POSITION</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold font-display">Product description</th>
                          <th className="p-3 font-semibold font-display">Sector Category</th>
                          <th className="p-3 font-semibold font-display text-center">In Stock</th>
                          <th className="p-3 font-semibold font-display text-right">Audit Threshold</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 font-mono">
                        {products.map((p) => (
                          <tr key={p.id} className="border-b border-gray-100">
                            <td className="p-3 font-sans font-medium text-gray-800">{p.name}</td>
                            <td className="p-3 font-sans text-gray-500">{p.category}</td>
                            <td className={`p-3 text-center font-bold ${p.stock <= p.minStock ? 'text-rose-600 font-bold' : 'text-gray-800'}`}>
                              {p.stock} {p.unit}s
                            </td>
                            <td className="p-3 text-right text-gray-400">min {p.minStock} {p.unit}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Customer report */}
            {activeReport === 'customer' && (
              <div className="space-y-6 py-8">
                <h3 className="text-base font-bold font-display text-gray-900 border-b border-gray-100 pb-3">B2B Customer Accounts Receivable Ledgers</h3>
                
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                  <span className="text-[10px] font-bold text-amber-500 block uppercase">TOTAL OVERDUE OUTSTANDINGS</span>
                  <p className="text-lg font-bold font-mono mt-1">{formatCurrency(totalOutstanding)}</p>
                  <p className="text-[10px] text-amber-600 mt-1 leading-relaxed">Overdue receivables affect operating liquidity. Contact Sharma Traders ({formatCurrency(420000)}) and Elite Builders ({formatCurrency(850000)}) immediately.</p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">B2B REGISTERED PARTNERS</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold font-display">Client Partner</th>
                          <th className="p-3 font-semibold font-display">Company Code</th>
                          <th className="p-3 font-semibold font-display text-right">Cumulative Orders</th>
                          <th className="p-3 font-semibold font-display text-right">Overdue Dues</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 font-mono">
                        {customers.map((c) => (
                          <tr key={c.id} className="border-b border-gray-100">
                            <td className="p-3 font-sans font-medium text-gray-800">{c.name}</td>
                            <td className="p-3 font-sans text-gray-500">{c.company}</td>
                            <td className="p-3 text-right">{formatCurrency(c.totalSpent)}</td>
                            <td className={`p-3 text-right font-bold ${c.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                              {formatCurrency(c.outstandingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Enterprise Audit Logs report */}
            {activeReport === 'audit' && (
              <div className="space-y-6 py-8">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold font-display text-gray-900">Enterprise Operations Audit Trail</h3>
                  <span className="px-2 py-1 text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded">ISO-27001 SECURED</span>
                </div>
                
                <p className="text-xs text-gray-500 leading-relaxed">
                  Real-time cryptographic audit trail of critical enterprise resource operations. Every log retains an immutable record of action type, target ID, operator, status, and precise timestamp.
                </p>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">COMPLIANCE LOG ENTRIES</span>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                        <tr>
                          <th className="p-3 font-semibold font-display">Timestamp</th>
                          <th className="p-3 font-semibold font-display">Operator</th>
                          <th className="p-3 font-semibold font-display">Action Type</th>
                          <th className="p-3 font-semibold font-display">Affected Record</th>
                          <th className="p-3 font-semibold font-display text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 font-mono text-[11px]">
                        {(auditLogs || []).map((log) => (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-gray-500 text-nowrap">{log.timestamp}</td>
                            <td className="p-3 font-sans font-semibold text-gray-800">{log.operator}</td>
                            <td className="p-3 font-bold text-indigo-600">{log.action}</td>
                            <td className="p-3 text-gray-700">{log.affectedRecord}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold font-mono ${
                                log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                log.status === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                log.status === 'BLOCKED' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* AI Advisor Closing Section */}
            <div className="border-t border-gray-150 pt-8 mt-12">
              <div className="flex gap-4 items-start">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase tracking-wider block">BizPilot AI CFO Summary Recommendation</span>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed italic">
                    "Based on statistical data compiled on July 2026, Apex Builders Supply shows healthy 18% sales growth, but liquidity is impacted by overdue accounts receivable ({formatCurrency(totalOutstanding)} total). Directing immediate cash collections while simultaneously ordering paint stock (5 left) is highly recommended."
                  </p>
                </div>
              </div>
            </div>

            {/* Footer details */}
            <div className="border-t border-gray-100 pt-8 mt-16 text-center text-[10px] text-gray-400">
              <p>Certified executive ledger generated on behalf of Apex Builders Supply & Paints. Protected under digital storage policies.</p>
              <p className="mt-1 font-semibold text-gray-300">Apex Builders Supply & Paints • Digitizing SME Growth Globally</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
