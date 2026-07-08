import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, BarChart3, Receipt, Settings as SettingsIcon, ShieldCheck, Zap, Sparkles, TrendingUp, HelpCircle, LayoutDashboard, ShoppingBag, ClipboardList, Menu, X, ArrowLeft, ExternalLink } from 'lucide-react';

import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AICopilot from './components/AICopilot';
import Inventory from './components/Inventory';
import QuotationGenerator from './components/QuotationGenerator';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import Settings from './components/Settings';
import FloatingAssistant from './components/FloatingAssistant';

import { Product, Customer, Order, Insight, CompanyProfile, BusinessPreferences } from './types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_INSIGHTS,
  DEFAULT_COMPANY,
  DEFAULT_PREFERENCES
} from './mockData';

export default function App() {
  // Core Page Router states
  const [isLaunched, setIsLaunched] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copilotInitialPrompt, setCopilotInitialPrompt] = useState<string | undefined>(undefined);

  // Dynamic SME business states
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);
  const [preferences, setPreferences] = useState<BusinessPreferences>(DEFAULT_PREFERENCES);

  // Core Mutators to keep mock databases functional
  const handleRestockProduct = (productId: string, quantity: number) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, stock: p.stock + quantity } : p))
    );
  };

  const handleAddQuotationAsOrder = (newOrderData: any) => {
    const newOrder: Order = {
      id: `ord-${100 + orders.length + 1}`,
      customerId: 'c2', // Default to Verma Construction
      customerName: newOrderData.customerName,
      date: new Date().toISOString().split('T')[0],
      amount: newOrderData.total,
      status: 'pending',
      items: newOrderData.items
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  const handleNavigateToCopilot = (promptText?: string) => {
    setCopilotInitialPrompt(promptText);
    setActiveView('copilot');
  };

  // Sidebar Menu mapping
  const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, isAi: true },
    { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
    { id: 'quotation', label: 'Quotation Gen', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: SettingsIcon }
  ];

  if (!isLaunched) {
    return <LandingPage onLaunchApp={() => setIsLaunched(true)} />;
  }

  return (
    <div className="relative min-h-screen bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/15 via-[#050505] to-[#050505] text-slate-200 flex flex-col md:flex-row font-sans selection:bg-brand-indigo/30 selection:text-brand-cyan print:bg-white print:text-gray-900">
      
      {/* Decorative Radial Background Lights (Print: hidden) */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-brand-indigo/5 blur-[100px] pointer-events-none print:hidden" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-brand-purple/5 blur-[120px] pointer-events-none print:hidden" />

      {/* Persistent Floating AI Assistant on operational panels */}
      <FloatingAssistant />

      {/* Top Mobile Navbar (Print: hidden) */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#09090b] border-b border-slate-800/60 md:hidden print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-bold font-display tracking-tight text-white">
            BizPilot<span className="text-brand-indigo">.AI</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Left Sidebar (Desktop & Mobile Panel) (Print: hidden) */}
      <aside className={`fixed md:sticky top-0 bottom-0 left-0 z-30 flex flex-col w-64 p-6 bg-[#09090b]/95 md:bg-[#09090b] border-r border-slate-800/60 shrink-0 transform transition-transform duration-300 md:translate-x-0 print:hidden ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo and Head Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple shadow-md shadow-brand-indigo/10">
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-base font-bold font-display tracking-tight text-white">
              BizPilot<span className="text-brand-indigo">.AI</span>
            </span>
          </div>
          <button
            onClick={() => setIsLaunched(false)}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation Item Feed */}
        <nav className="flex-1 space-y-1.5">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-indigo/10 text-indigo-400 border-l-2 border-brand-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-indigo' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.isAi && (
                  <span className="px-1.5 py-0.5 rounded-md bg-brand-indigo/20 text-brand-indigo font-bold text-[9px] font-mono uppercase tracking-wider animate-pulse">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Company Quick Profile Footer */}
        <div className="border-t border-slate-800/60 pt-5 mt-auto text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-300 truncate">{companyProfile.name}</p>
          <p className="font-mono text-[9px] text-slate-500 truncate">{companyProfile.gstNumber}</p>
          <div className="flex justify-between items-center text-[10px] text-brand-cyan font-bold mt-2 font-mono">
            <span>SECURE SYSTEM</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>STABLE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden print:p-0">
        
        {/* Render View Components */}
        {activeView === 'dashboard' && (
          <Dashboard
            products={products}
            customers={customers}
            orders={orders}
            insights={insights}
            onNavigateToCopilot={handleNavigateToCopilot}
            onNavigateToInventory={() => setActiveView('inventory')}
            currency={companyProfile.currency}
          />
        )}

        {activeView === 'copilot' && (
          <AICopilot
            initialPrompt={copilotInitialPrompt}
            onClearInitialPrompt={() => setCopilotInitialPrompt(undefined)}
          />
        )}

        {activeView === 'inventory' && (
          <Inventory
            products={products}
            onRestock={handleRestockProduct}
            onNavigateToCopilot={handleNavigateToCopilot}
            currency={companyProfile.currency}
          />
        )}

        {activeView === 'quotation' && (
          <QuotationGenerator
            products={products}
            customers={customers}
            onAddQuotation={handleAddQuotationAsOrder}
            currency={companyProfile.currency}
          />
        )}

        {activeView === 'analytics' && (
          <Analytics
            products={products}
            customers={customers}
            currency={companyProfile.currency}
          />
        )}

        {activeView === 'reports' && (
          <Reports
            products={products}
            customers={customers}
            orders={orders}
            insights={insights}
            currency={companyProfile.currency}
          />
        )}

        {activeView === 'settings' && (
          <Settings
            companyProfile={companyProfile}
            preferences={preferences}
            onUpdateProfile={setCompanyProfile}
            onUpdatePreferences={setPreferences}
          />
        )}

      </main>

    </div>
  );
}
