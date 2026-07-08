import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Building2, ShieldCheck, HelpCircle, Bell, Sliders, ToggleLeft, ToggleRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CompanyProfile, BusinessPreferences } from '../types';

interface SettingsProps {
  companyProfile: CompanyProfile;
  preferences: BusinessPreferences;
  onUpdateProfile: (p: CompanyProfile) => void;
  onUpdatePreferences: (pref: BusinessPreferences) => void;
}

export default function Settings({
  companyProfile,
  preferences,
  onUpdateProfile,
  onUpdatePreferences
}: SettingsProps) {
  // Local form states
  const [name, setName] = useState(companyProfile.name);
  const [email, setEmail] = useState(companyProfile.email);
  const [phone, setPhone] = useState(companyProfile.phone);
  const [address, setAddress] = useState(companyProfile.address);
  const [gstNumber, setGstNumber] = useState(companyProfile.gstNumber);
  const [currency, setCurrency] = useState(companyProfile.currency);

  const [autoOrder, setAutoOrder] = useState(preferences.autoOrderLowStock);
  const [threshold, setThreshold] = useState(preferences.alertThresholdPercent);
  const [reminderDays, setReminderDays] = useState(preferences.paymentReminderDays);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, phone, address, gstNumber, currency });
    onUpdatePreferences({ autoOrderLowStock: autoOrder, alertThresholdPercent: threshold, paymentReminderDays: reminderDays });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-slideup">
      
      {/* Settings title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-gray-400 font-mono tracking-wider">SME OPERATIONAL DECREES</p>
          <h1 className="text-3xl font-bold font-display tracking-tight text-white mt-1">
            System Settings & Preferences
          </h1>
        </div>
      </div>

      {/* Floating success toast */}
      {savedSuccess && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border border-emerald-500/30 bg-emerald-950/90 text-emerald-400 text-sm shadow-xl shadow-emerald-950/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span>SME System preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left column: Company Profile details */}
        <div className="xl:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-6">
            <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2.5">
              <Building2 className="text-brand-indigo w-4.5 h-4.5" />
              Company Ledger Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">SME Legal Corporate Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Corporate Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">GSTIN / VAT Identification Code</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Support Phone Hotline</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo"
                  required
                />
              </div>

            </div>

            <div className="space-y-2 border-t border-slate-800/60 pt-5">
              <label className="text-xs font-semibold text-slate-400 block">Warehouse Street Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-800/60 pt-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 block">Operational Base Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white outline-none focus:border-brand-indigo cursor-pointer"
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Right column: Copilot threshold preferences */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-slate-800/60 space-y-6">
            <h2 className="text-sm font-bold font-display text-white uppercase tracking-wider flex items-center gap-2.5">
              <Sliders className="text-brand-indigo w-4.5 h-4.5" />
              Automated AI Trigger rules
            </h2>

            {/* Safety margin slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-400">Inventory Alert safety limit</span>
                <span className="font-bold font-mono text-brand-indigo">{threshold}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full accent-brand-indigo bg-zinc-950 h-1.5 rounded-lg appearance-none cursor-pointer border border-slate-800/60"
              />
              <span className="text-[10px] text-slate-500 leading-normal block">Triggers low-stock warnings when physical counts slip below this percentage of safe bounds.</span>
            </div>

            {/* Overdue offset days */}
            <div className="space-y-2 border-t border-slate-800/60 pt-5">
              <label className="text-xs font-semibold text-slate-400 block">Dues billing payment reminder terms (Days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={reminderDays}
                onChange={(e) => setReminderDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-slate-800/60 rounded-xl text-xs text-white font-mono outline-none focus:border-brand-indigo"
              />
              <span className="text-[10px] text-slate-500 leading-normal block">Days before sending polite automated ledger reminders to late customers.</span>
            </div>

            {/* Auto ordering toggle */}
            <div className="flex justify-between items-center border-t border-slate-800/60 pt-5">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">AI Auto-Restock drafting</span>
                <span className="text-[10px] text-slate-500 leading-normal block max-w-[180px]">Draft supplier POs automatically when stock bounds are breached.</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoOrder(!autoOrder)}
                className="text-brand-indigo focus:outline-none cursor-pointer"
              >
                {autoOrder ? (
                  <ToggleRight className="w-10 h-10 text-brand-indigo" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600" />
                )}
              </button>
            </div>

          </div>

          {/* Core save all trigger */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-tr from-brand-indigo to-brand-purple hover:opacity-95 text-xs font-bold text-white rounded-xl shadow-md shadow-brand-indigo/20 transition-all cursor-pointer"
          >
            Save All SME Settings
          </button>
        </div>

      </form>

    </div>
  );
}
