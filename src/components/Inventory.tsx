import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, ArrowUpDown, Sparkles, AlertTriangle, CheckCircle2, TrendingUp, ShoppingBag, Edit, Plus, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  products: Product[];
  onRestock: (productId: string, quantity: number) => void;
  onNavigateToCopilot: (initialPrompt?: string) => void;
  currency?: string;
}

type SortField = 'name' | 'stock' | 'price' | 'category';
type SortOrder = 'asc' | 'desc';

export default function Inventory({ products, onRestock, onNavigateToCopilot, currency = 'INR' }: InventoryProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('stock');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<{ [key: string]: number }>({});

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  // Unique category lists
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Status helper based on safety margins
  const getStockStatus = (p: Product) => {
    if (p.stock <= p.minStock) {
      return { label: 'Low Stock', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' };
    }
    if (p.stock <= p.minStock * 2) {
      return { label: 'Moderate', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' };
    }
    return { label: 'Healthy', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
  };

  // Filter & Search & Sort logical pipeline
  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.supplier.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'stock') comparison = a.stock - b.stock;
      if (sortField === 'price') comparison = a.price - b.price;
      if (sortField === 'category') comparison = a.category.localeCompare(b.category);

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const triggerManualRestock = (pId: string) => {
    const qty = restockAmount[pId] || 50;
    onRestock(pId, qty);
    // Reset amount
    setRestockAmount(prev => ({ ...prev, [pId]: 0 }));
  };

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* Header and top metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">SME LOGISTICS CONTROL</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            Inventory & Warehouse
          </h1>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#09090b]/40 p-4 rounded-2xl border border-slate-800/60">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products by title, supplier brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white placeholder-slate-500 focus:border-brand-indigo/50 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-slate-300 outline-none focus:border-brand-indigo/50 cursor-pointer"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat} className="bg-zinc-950">
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-panel border border-slate-800/60 rounded-2xl overflow-hidden shadow-xl shadow-[#050505]/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-950/60 border-b border-slate-800/60 text-slate-500">
                <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    Product Line
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    Sector Category
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('stock')}>
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    Stock Level
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4 font-semibold font-display">Supplier</th>
                <th className="p-4 font-semibold font-display cursor-pointer" onClick={() => handleSort('price')}>
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                    Unit Price
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="p-4 font-semibold font-display">Alert Status</th>
                <th className="p-4 font-semibold font-display text-center">AI Copilot</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const status = getStockStatus(p);
                const isExpanded = expandedId === p.id;
                return (
                  <React.Fragment key={p.id}>
                    <tr 
                      className={`border-b border-slate-800/30 text-slate-300 hover:bg-white/1 cursor-pointer transition-colors ${isExpanded ? 'bg-brand-indigo/5' : ''}`}
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${p.stock <= p.minStock ? 'bg-rose-500 animate-ping' : 'bg-transparent'}`} />
                          <span className="font-semibold text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">{p.category}</td>
                      <td className="p-4">
                        <span className="font-mono font-bold text-gray-200">{p.stock}</span>
                        <span className="text-[10px] text-slate-500 ml-1">/{p.minStock} {p.unit}</span>
                      </td>
                      <td className="p-4 text-slate-400">{p.supplier}</td>
                      <td className="p-4 font-mono font-bold">{symbol}{p.price.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(isExpanded ? null : p.id);
                          }}
                          className="p-1.5 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo hover:text-white transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>

                    {/* Expandable AI Recommendation Drawer */}
                    {isExpanded && (
                      <tr className="bg-zinc-950/40 border-b border-slate-800/60">
                        <td colSpan={7} className="p-6">
                          <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
                            
                            {/* Recommendation Text */}
                            <div className="flex gap-4 max-w-3xl">
                              <div className="p-3 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo h-fit">
                                <Sparkles className="w-5 h-5 animate-spin-slow" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">BIZPILOT SUPPLY ADVICE</h4>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{p.aiRecommendation}</p>
                              </div>
                            </div>

                            {/* Manual restock form */}
                            <div className="flex items-center gap-3 bg-[#09090b] p-3 rounded-xl border border-slate-800 shrink-0">
                              <input
                                type="number"
                                min={10}
                                placeholder="Qty"
                                value={restockAmount[p.id] || ''}
                                onChange={(e) => setRestockAmount({ ...restockAmount, [p.id]: parseInt(e.target.value) || 0 })}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 px-2 py-1.5 bg-zinc-950 border border-slate-800 text-xs text-white outline-none rounded-lg focus:border-brand-indigo"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerManualRestock(p.id);
                                }}
                                className="px-3.5 py-1.5 text-[10px] font-bold bg-brand-cyan hover:bg-brand-cyan/90 text-gray-950 rounded-lg transition-all cursor-pointer"
                              >
                                Restock {p.unit}s
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToCopilot(`Draft a purchase restock order to ${p.supplier} for ${p.name}`);
                                }}
                                className="px-3.5 py-1.5 text-[10px] font-bold bg-[#050505] hover:bg-zinc-900 text-slate-300 rounded-lg border border-slate-800/80 cursor-pointer"
                              >
                                Ask Copilot
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
