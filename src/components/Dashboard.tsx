import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { DollarSign, IndianRupee, ShoppingCart, Users, AlertTriangle, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Mail, ClipboardCopy, Send } from 'lucide-react';
import { Product, Customer, Order, Insight } from '../types';
import { REVENUE_HISTORY, CATEGORY_REVENUE } from '../mockData';
import { getDashboardInsights } from '../lib/gemini';
import { formatCurrency } from '../lib/format';

interface DashboardProps {
  products: Product[];
  customers: Customer[];
  orders: Order[];
  insights: Insight[];
  onNavigateToCopilot: (initialPrompt?: string) => void;
  onNavigateToInventory: () => void;
  currency?: string;
}

export default function Dashboard({
  products,
  customers,
  orders,
  insights,
  onNavigateToCopilot,
  onNavigateToInventory,
  currency = 'INR'
}: DashboardProps) {
  const [aiInsight, setAiInsight] = useState<string>('Analyzing business pipelines and outstanding accounts...');
  const [healthScore, setHealthScore] = useState<number>(84);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(true);
  const [actionLog, setActionLog] = useState<string | null>(null);

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // Load insights from client-side Gemini on mount
  useEffect(() => {
    async function fetchServerInsights() {
      try {
        const data = await getDashboardInsights();
        setAiInsight(data.recommendation);
        setHealthScore(data.score);
      } catch (err) {
        console.error('Failed to load insights, using fallback.', err);
      } finally {
        setLoadingInsights(false);
      }
    }
    fetchServerInsights();
  }, []);

  // Compute stats dynamically
  const totalRevenue = REVENUE_HISTORY.reduce((acc, curr) => acc + curr.revenue, 0);
  const currentMonthRevenue = REVENUE_HISTORY[REVENUE_HISTORY.length - 1].revenue;
  const currentMonthProfit = REVENUE_HISTORY[REVENUE_HISTORY.length - 1].profit;
  
  const pendingPaymentsAmount = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  const activeCustomersCount = customers.length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  
  const topProducts = [...products]
    .sort((a, b) => b.salesGrowth - a.salesGrowth)
    .slice(0, 3);

  const handleTriggerAction = (actionType: string, recipient?: string) => {
    setActionLog(`Dispatched action: ${actionType} ${recipient ? `sent to ${recipient}` : ''}`);
    setTimeout(() => {
      setActionLog(null);
    }, 4000);
  };

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* Action logs */}
      {actionLog && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/90 text-emerald-400 text-sm shadow-xl shadow-emerald-950/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>{actionLog}</span>
        </div>
      )}

      {/* Hero Welcome Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">Apex Builders Supply & Paints • ERP COCKPIT</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Dashboard Summary
          </h1>
        </div>
        
        {/* Dynamic Business Health Score Badge - Re-designed for premium look */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-5 bg-gradient-to-tr from-[#09090b]/80 to-zinc-950/80 border border-brand-indigo/20 p-4.5 rounded-2xl shadow-xl shadow-brand-indigo/5 relative overflow-hidden group"
        >
          {/* Subtle glowing background accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-brand-indigo/10 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
          
          <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
            {/* Health Score circle representation */}
            <svg className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5" fill="transparent" />
              <motion.circle 
                cx="32" 
                cy="32" 
                r="26" 
                stroke="url(#healthGrad)" 
                strokeWidth="4.5" 
                fill="transparent"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - healthScore / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeDasharray={`${2 * Math.PI * 26}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs font-mono font-extrabold text-white leading-none">{healthScore}</span>
              <span className="text-[7px] text-slate-500 font-mono font-bold uppercase tracking-tighter mt-0.5">/100</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-mono font-extrabold tracking-widest uppercase">Business Health</p>
            <p className="text-sm font-extrabold text-emerald-400 font-display mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Excellent
            </p>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block leading-tight">Solvency & inventory stable</span>
          </div>
        </motion.div>
      </div>

      {/* Dynamic AI Recommendation Highlight Board */}
      <div className="p-6 rounded-2xl border border-brand-indigo/20 bg-gradient-to-r from-brand-indigo/10 via-brand-indigo/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 rounded-full blur-[60px] -z-10" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <div className="p-3.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-indigo tracking-wider uppercase font-mono">Live Copilot Recommendation</span>
                {loadingInsights && <Clock className="w-3.5 h-3.5 text-brand-indigo animate-spin" />}
              </div>
              <p className="text-sm font-medium text-slate-200 mt-1 max-w-3xl leading-relaxed">
                {loadingInsights ? 'AI Copilot is reviewing cash flow and paint distribution thresholds...' : aiInsight}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToCopilot('How can I optimize our overall SME margins and resolve late payments?')}
            className="shrink-0 flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold text-white bg-brand-indigo/80 hover:bg-brand-indigo rounded-xl border border-brand-indigo/30 transition-all cursor-pointer shadow-md shadow-brand-indigo/10"
          >
            Consult Advisory AI
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, translateY: -2, boxShadow: '0 10px 30px -10px rgba(6, 182, 212, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl glass-panel border border-slate-800/60 relative overflow-hidden transition-all duration-300 group cursor-pointer"
          onClick={() => onNavigateToCopilot('Analyze our monthly revenue growth trends')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-400 font-medium">Monthly Revenue</span>
            <div className="p-2 rounded-xl bg-brand-cyan/10 text-brand-cyan">
              {currency === 'INR' ? <IndianRupee className="w-4.5 h-4.5" /> : <DollarSign className="w-4.5 h-4.5" />}
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatCurrency(currentMonthRevenue)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-xs font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% MoM</span>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ scale: 1.02, translateY: -2, boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl glass-panel border border-slate-800/60 relative overflow-hidden transition-all duration-300 group cursor-pointer"
          onClick={() => onNavigateToCopilot('How can I optimize our overall SME margins and resolve freight leakage?')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-indigo/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-400 font-medium">Net Profit Margin</span>
            <div className="p-2 rounded-xl bg-brand-indigo/10 text-brand-indigo">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatCurrency(currentMonthProfit)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs font-semibold">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-3% freight slip</span>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, translateY: -2, boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl glass-panel border border-slate-800/60 relative overflow-hidden transition-all duration-300 group cursor-pointer"
          onClick={() => onNavigateToCopilot('Generate follow-up email for Sharma Traders outstanding overdue balance')}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-400 font-medium">Overdue Accounts Receivables</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{formatCurrency(pendingPaymentsAmount)}</p>
          <div className="flex items-center gap-1.5 mt-2 text-amber-500 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>2 accounts late</span>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02, translateY: -2, boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          className="p-5 rounded-2xl glass-panel border border-slate-800/60 relative overflow-hidden transition-all duration-300 group cursor-pointer"
          onClick={onNavigateToInventory}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs text-slate-400 font-medium">Low Stock Safety Alerts</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="w-4.5 h-4.5" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-white">{lowStockCount}</p>
          <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5 animate-bounce" />
            <span>Paint, Sand, Plywood</span>
          </div>
        </motion.div>

      </div>

      {/* Financial Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Revenue Trend */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-base font-bold font-display text-white">Revenue vs. Operating Profit</h2>
              <p className="text-xs text-slate-500 mt-0.5">Performance tracking from Jan - Jun 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan" />
                <span className="text-slate-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-indigo" />
                <span className="text-slate-400">Profit</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="revenue" stroke="#c084fc" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Categories Breakdown */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-white">Sales Category Weights</h2>
            <p className="text-xs text-slate-500 mt-0.5">Relative demand distributions by volume</p>
          </div>

          <div className="h-44 relative flex items-center justify-center my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_REVENUE}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {CATEGORY_REVENUE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {CATEGORY_REVENUE.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="font-semibold font-mono text-slate-300">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>      {/* AI Business Insights Cards */}
      <div>
        <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-indigo" />
          AI Enterprise Insights Cockpit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Today's Opportunity */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#818cf8' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-indigo-500/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/15">
              ₹1,45,350 opportunity
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Strategic Buying</span>
              <h3 className="text-sm font-bold text-white mt-1">Today's Opportunity</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Consolidate and pre-buy Steel reinforcement bars from Tata Steel Corp before tariffs increase by 4% next Monday.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Secure Tata pricing shield</p>
                <button
                  onClick={() => onNavigateToCopilot('Generate a purchase order for 10 bundles of TMT Steel from Tata Steel to lock the lower rate')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3" />
                  Pre-Purchase Steel
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Potential Revenue */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#10b981' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-emerald-500/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/15">
              ₹4,19,254 pipeline
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Pipeline Conversion</span>
              <h3 className="text-sm font-bold text-white mt-1">Potential Revenue</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Secure Verma Construction's open plywood and cement quotation by dispatching a 14-day price shield contract.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Convert quotation to contract</p>
                <button
                  onClick={() => onNavigateToCopilot('Generate quotation for Verma Construction')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3" />
                  Settle Verma Deal
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Potential Loss */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#f59e0b' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-amber-500/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/15">
              ₹1,33,000 late balance
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Credit Risk Management</span>
              <h3 className="text-sm font-bold text-white mt-1">Potential Loss</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Sharma Traders balance of ₹1.33L is overdue. Failure to collect may cause bad debt provisions to rise by 2.1%.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Issue collection reminder notice</p>
                <button
                  onClick={() => onNavigateToCopilot('Draft a friendly overdue payment reminder email to Sharma Traders')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Mail className="w-3 h-3" />
                  Enforce Collection
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Urgent Tasks */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#ef4444' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-rose-500/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/15">
              3 items low
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Logistics & Supply</span>
              <h3 className="text-sm font-bold text-white mt-1">Urgent Tasks</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Replenish UltraShield Premium Paint (5 left), Premium Teak Plywood (4 left), and River Sand (2 left) immediately.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Draft urgent restock PO</p>
                <button
                  onClick={() => onNavigateToCopilot('Draft a restocking purchase order for 20 sheets of Plywood and 30 tubs of paint')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3" />
                  Draft Restocking PO
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Hidden Risks */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#6366f1' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-brand-indigo/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/15">
              3% margin leak
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Cost Containment</span>
              <h3 className="text-sm font-bold text-white mt-1">Hidden Risks</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Absorbing metal freight logistics for Tata Steel dispatches has caused a 3% net profit margin leakage.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Adjust commercial shipping thresholds</p>
                <button
                  onClick={() => onNavigateToCopilot('How can we optimize our shipping transport margins to resolve the 3% freight leakage?')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3" />
                  Adjust Freight Fees
                </button>
              </div>
            </div>
          </motion.div>

          {/* Card 6: Growth Suggestions */}
          <motion.div 
            whileHover={{ scale: 1.02, translateY: -2, borderLeftColor: '#d946ef' }}
            className="p-5 rounded-2xl glass-panel border-l-2 border-l-fuchsia-500/60 flex flex-col justify-between h-52 relative overflow-hidden group"
          >
            <div className="absolute top-2 right-4 text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-1 rounded-full border border-fuchsia-500/15">
              15% order boost
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Promotional Strategy</span>
              <h3 className="text-sm font-bold text-white mt-1">Growth Suggestions</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Bundle slow-moving paint accessories (Heavy Duty Brushes, Wood Primers) directly into retail checkout flows.</p>
            </div>
            <div className="border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-[9px] text-brand-cyan font-mono block">SUGGESTED ACTION</span>
              <div className="flex justify-between items-center mt-1">
                <p className="text-[11px] text-slate-300 font-medium">Launch accessories bundle promo</p>
                <button
                  onClick={() => onNavigateToCopilot('Draft a Q3 strategic marketing campaign for premium paint bundles')}
                  className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-500/20 rounded-lg cursor-pointer transition-all"
                >
                  <Send className="w-3 h-3" />
                  Create Paint Bundle
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Row - Top Items & Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent orders */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold font-display text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Direct checkout records of this week</p>
            </div>
            <button
              onClick={onNavigateToInventory}
              className="text-xs font-semibold text-brand-indigo hover:underline flex items-center gap-1 cursor-pointer"
            >
              Analyze Products
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/50 text-slate-500">
                  <th className="py-2.5 font-semibold">Order ID</th>
                  <th className="py-2.5 font-semibold">Buyer Name</th>
                  <th className="py-2.5 font-semibold">Value</th>
                  <th className="py-2.5 font-semibold">Payment Date</th>
                  <th className="py-2.5 font-semibold text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id} className="border-b border-slate-800/30 text-slate-300 hover:bg-white/1">
                    <td className="py-3 font-mono text-slate-400 font-semibold">{order.id}</td>
                    <td className="py-3 font-medium text-white">{order.customerName}</td>
                    <td className="py-3 font-mono font-bold">{formatCurrency(order.amount)}</td>
                    <td className="py-3 text-slate-500 font-mono">{order.date}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'completed' 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Growing Products list */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/60">
          <h2 className="text-base font-bold font-display text-white mb-4">Trending Materials</h2>
          <p className="text-xs text-slate-500 mb-6">Inventory lines displaying the fastest sales velocity</p>
          
          <div className="space-y-4">
            {topProducts.map((p, index) => (
              <div key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-800/40 bg-zinc-950/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white max-w-[150px] truncate block">{p.name}</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan font-mono text-[9px] font-bold">
                      #{index + 1}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5">In Stock: {p.stock} {p.unit}s</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400 font-mono flex items-center justify-end">
                    <ArrowUpRight className="w-3 h-3" />
                    +{p.salesGrowth}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">MoM growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
