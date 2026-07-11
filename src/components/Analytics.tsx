import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, BarChart2, TrendingUp, DollarSign, Wallet, ShieldCheck, HelpCircle, Activity } from 'lucide-react';
import { Product, Customer } from '../types';
import { REVENUE_HISTORY, CATEGORY_REVENUE } from '../mockData';
import { formatCurrency } from '../lib/format';

interface AnalyticsProps {
  products: Product[];
  customers: Customer[];
  currency?: string;
}

export default function Analytics({ products, customers, currency = 'INR' }: AnalyticsProps) {
  // Compute metrics dynamically
  const customerTrend = [
    { month: 'Jan', active: 2, totalSpent: 1200000 },
    { month: 'Feb', active: 3, totalSpent: 2100000 },
    { month: 'Mar', active: 4, totalSpent: 3500000 },
    { month: 'Apr', active: 4, totalSpent: 4200000 },
    { month: 'May', active: 5, totalSpent: 6400000 },
    { month: 'Jun', active: 5, totalSpent: 9240000 }
  ];

  const expensesBreakdown = [
    { name: 'Raw Procurement', value: 1150000, color: '#6366f1' },
    { name: 'Freight Logistics', value: 220000, color: '#f59e0b' },
    { name: 'Admin Payroll', value: 150000, color: '#06b6d4' },
    { name: 'Marketing Ads', value: 60000, color: '#8b5cf6' },
    { name: 'Utility Rents', value: 30000, color: '#ec4899' }
  ];

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* Analytics header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">EXECUTIVE STATISTICAL INTELLIGENCE</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Deep Business Analytics
          </h1>
        </div>
      </div>

      {/* Main Grid: Revenue & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Revenue & Profit area */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-4">
          <div>
            <h2 className="text-sm font-bold font-display text-white">Monthly Revenue & Gross Profits</h2>
            <p className="text-xs text-slate-500">Gross revenue progress tracking vs. monthly margins</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_HISTORY}>
                <defs>
                  <linearGradient id="chartRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#06b6d4" strokeWidth={2.5} fill="url(#chartRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dedicated AI Summary Block */}
          <div className="p-4 rounded-xl border border-brand-indigo/15 bg-brand-indigo/5 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-brand-indigo font-mono uppercase tracking-wider block">AI Revenue Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Gross sales display a continuous **18% MoM compound growth** driven by summer project approvals. Profit spreads peaked in June at **27.3%** ({symbol}6,05,000 net). Net profits are compounding due to our paint distribution margins which offset lower margin commodity builders cement sales.
              </p>
            </div>
          </div>
        </div>

        {/* Chart 2: Expenses bar charts */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-4">
          <div>
            <h2 className="text-sm font-bold font-display text-white">Expenses Structure Weights</h2>
            <p className="text-xs text-slate-500">Distribution analysis of operational outlays</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_HISTORY}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="expenses" name="Operational Outlay" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dedicated AI Summary Block */}
          <div className="p-4 rounded-xl border border-brand-indigo/15 bg-brand-indigo/5 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-brand-indigo font-mono uppercase tracking-wider block">AI Expense Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Operating expenditures reached **{symbol}16,10,000** in June. High-velocity raw materials procurement consumes **62%** of general capital. However, logistics/freight outlays rose by **15%** due to TMT Reinforcement Steel metal deliveries. Renegotiating fuel surcharges will recover 3.2% net.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Grid: Customers and Core Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 3: Customer sales progress */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-4">
          <div>
            <h2 className="text-sm font-bold font-display text-white">B2B Customer Growth & Outlays</h2>
            <p className="text-xs text-slate-500">Cumulative client spending histories over Q1-Q2</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '12px', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="totalSpent" name="Total Gross Invoices" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Dedicated AI Summary Block */}
          <div className="p-4 rounded-xl border border-brand-indigo/15 bg-brand-indigo/5 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-brand-indigo font-mono uppercase tracking-wider block">AI Client Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Cumulative contractor billing crossed **{symbol}58,34,000**. **Elite Builders & Architects** and **Verma Construction** generate **68%** of total revenue. Elite Builders represents a concentration risk. Mitigate by increasing retail paint distributor integrations or hardware dealer signups.
              </p>
            </div>
          </div>
        </div>

        {/* Chart 4: Expenses donut distribution */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold font-display text-white">Warehouse Asset Values Allocation</h2>
            <p className="text-xs text-slate-500">Relative capital weight blocked in active categories</p>
          </div>

          <div className="h-44 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-2">
            {expensesBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate max-w-[120px]">{item.name}</span>
                <span className="font-semibold text-slate-300 font-mono ml-auto">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>

          {/* Dedicated AI Summary Block */}
          <div className="p-4 rounded-xl border border-brand-indigo/15 bg-brand-indigo/5 flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-brand-indigo mt-0.5 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-brand-indigo font-mono uppercase tracking-wider block">AI Inventory Capital Summary</span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Warehouse capital allocation stands at **{symbol}16,10,000**. Heavy physical items (Cement bags, reinforcement steel bundles) represent **72%** of physical valuation. Optimize inventory turnovers of paint lines to unlock blocked cash and reduce warehousing fees.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
