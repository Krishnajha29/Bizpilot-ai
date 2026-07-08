import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, BarChart3, Receipt, Settings as SettingsIcon, ShieldCheck, Zap, Sparkles, TrendingUp, HelpCircle, Star, Users, CheckCircle, Smartphone } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export default function LandingPage({ onLaunchApp }: LandingPageProps) {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/15 via-[#050505] to-[#050505] text-slate-200 font-sans selection:bg-brand-indigo/30 selection:text-brand-cyan">
      
      {/* Decorative Radial Background Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-brand-indigo/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-purple/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/60 bg-[#09090b]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple shadow-md shadow-brand-indigo/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold font-display tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              BizPilot<span className="text-brand-indigo">.AI</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#metrics" className="hover:text-white transition-colors">Performance</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <button
            onClick={onLaunchApp}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-purple hover:from-brand-indigo hover:to-brand-indigo/90 rounded-xl transition-all duration-300 shadow-md shadow-brand-indigo/20 cursor-pointer group hover:scale-[1.02]"
          >
            Launch Platform
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-indigo/30 bg-brand-indigo/5 text-xs font-semibold text-brand-indigo tracking-wide mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            THE NEXT-GEN SME OPERATING SYSTEM
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold font-display tracking-tight text-white leading-tight mb-6"
          >
            The Autonomous Copilot For Your <span className="bg-gradient-to-r from-brand-indigo via-indigo-400 to-brand-cyan bg-clip-text text-transparent">Entire Business</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 font-light leading-relaxed max-w-3xl mx-auto mb-10"
          >
            Empower your small or medium enterprise with generative AI. Streamline inventory shortages, automate complex professional quotations, analyze sales margins, and consult an intelligent corporate partner.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button
              onClick={onLaunchApp}
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-brand-indigo to-brand-purple rounded-xl shadow-lg shadow-brand-indigo/20 transition-all cursor-pointer group hover:scale-102"
            >
              Start Free Trial (No Card)
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 hover:text-white bg-[#09090b] hover:bg-zinc-900 rounded-xl border border-slate-800/60 transition-all cursor-pointer"
            >
              Explore Features
            </a>
          </motion.div>
        </div>

        {/* Dashboard Mockup Display */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl shadow-brand-purple/10 border border-gray-800/60 bg-gray-900/40 p-4 mb-28"
        >
          {/* Top Window Bar */}
          <div className="flex items-center justify-between border-b border-gray-800/60 pb-3 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="px-6 py-1 rounded-md bg-gray-950 border border-gray-800/50 tracking-wider">
              bizpilot.ai/dashboard
            </div>
            <div className="w-14" />
          </div>

          {/* Simulated App Screenshot / Visual */}
          <div className="aspect-[16/9] relative bg-gray-950 rounded-lg overflow-hidden flex flex-col p-6 border border-gray-900">
            {/* Mock Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-xs text-gray-500 font-mono">FINANCIAL FORECAST</p>
                <p className="text-xl font-bold font-display">Apex Builders Supply</p>
              </div>
              <div className="px-3 py-1 text-xs rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-semibold">
                AI Copilot Synced
              </div>
            </div>

            {/* Mock Dashboard Layout */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
                <span className="text-xs text-gray-500">Monthly Revenue</span>
                <p className="text-2xl font-bold font-mono text-brand-cyan">$32,150</p>
                <span className="text-[10px] text-green-500 font-semibold">+18% this MoM</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
                <span className="text-xs text-gray-500">Net Profit Margin</span>
                <p className="text-2xl font-bold font-mono text-brand-purple">28.1%</p>
                <span className="text-[10px] text-red-500 font-semibold">-3% freight slip</span>
              </div>
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/60">
                <span className="text-xs text-gray-500">Biz Health Score</span>
                <p className="text-2xl font-bold font-mono text-emerald-500">84/100</p>
                <span className="text-[10px] text-emerald-400 font-semibold">Excellent cash reserves</span>
              </div>
            </div>

            {/* Simulated Chat Pop */}
            <div className="mt-auto p-4 rounded-xl border border-brand-purple/20 bg-brand-purple/5 max-w-lg self-end text-sm animate-pulse shadow-md shadow-brand-purple/5">
              <div className="flex gap-2.5 items-start">
                <Bot className="w-5 h-5 text-brand-purple mt-0.5" />
                <div>
                  <p className="font-semibold text-white">BizPilot AI CFO Advice:</p>
                  <p className="text-xs text-gray-400 mt-1">
                    "Paint stocks will terminate in 2 days. Fine sand is critically low. Sharma Traders payment is 12 days overdue. Reorder low inventory & trigger reminder."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <section id="features" className="mb-28 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">
              Everything Your Business Needs To Scale
            </h2>
            <p className="text-gray-400 font-light">
              We replaced four disconnected SaaS tools with a single, deeply collaborative, AI-integrated cockpit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl border border-gray-800/80 bg-gray-900/20 glass-panel-hover group">
              <div className="p-3.5 rounded-xl bg-brand-purple/10 text-brand-purple w-fit mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-3 text-white">Interactive AI Copilot</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Chat with an advanced corporate advisor. Request automatic drafting of customer emails, marketing campaigns, purchase orders, or revenue forecasts instantly.
              </p>
              <ul className="text-xs text-gray-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-purple" /> Markdown report generation</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-purple" /> Contextual mock fallback option</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl border border-gray-800/80 bg-gray-900/20 glass-panel-hover group">
              <div className="p-3.5 rounded-xl bg-brand-cyan/10 text-brand-cyan w-fit mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-3 text-white">Smart Inventory & Alerts</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Deep tracking of stock levels with threshold margins. Low, medium, and high statuses styled clearly with actionable automatic restock intelligence.
              </p>
              <ul className="text-xs text-gray-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-cyan" /> Automatic safety calculations</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-cyan" /> Critical category warning cards</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl border border-gray-800/80 bg-gray-900/20 glass-panel-hover group">
              <div className="p-3.5 rounded-xl bg-brand-indigo/10 text-brand-indigo w-fit mb-6 group-hover:scale-110 transition-transform">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display mb-3 text-white">Professional Quotations</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Seamlessly formulate professional corporate estimations. Configure discounts, specify GST parameters, and generate high-fidelity PDF outputs.
              </p>
              <ul className="text-xs text-gray-500 space-y-2">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-indigo" /> Clean PDF invoice styling</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-brand-indigo" /> Instant print/export integrations</li>
              </ul>
            </div>

          </div>
        </section>

        {/* Statistics Section */}
        <section id="metrics" className="mb-28 p-12 rounded-3xl border border-gray-800/60 bg-gray-950/60 relative overflow-hidden text-center scroll-mt-24">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-brand-purple/5 blur-[80px]" />
          
          <div className="max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-brand-cyan uppercase tracking-wider">Operational Growth</span>
            <h2 className="text-3xl font-bold font-display mt-2 mb-4">Real Impact for Business Owners</h2>
            <p className="text-gray-400 text-sm font-light">BizPilot is designed to produce measurable improvements across cash flow, back-office labor, and margins.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="p-4">
              <p className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-white mb-2">22 hrs</p>
              <p className="text-xs sm:text-sm text-gray-500">Saved in Admin Work/Wk</p>
            </div>
            <div className="p-4">
              <p className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-brand-purple mb-2">14.2%</p>
              <p className="text-xs sm:text-sm text-gray-500">Average Profit Increase</p>
            </div>
            <div className="p-4">
              <p className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-brand-cyan mb-2">3.5x</p>
              <p className="text-xs sm:text-sm text-gray-500">Faster Invoice Settlements</p>
            </div>
            <div className="p-4">
              <p className="text-4xl sm:text-5xl font-bold font-display tracking-tight text-white mb-2">99.8%</p>
              <p className="text-xs sm:text-sm text-gray-500">Inventory Supply Accuracy</p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="mb-28 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold font-display text-white mb-4">
              Trusted by Innovative Operators
            </h2>
            <p className="text-gray-400 font-light">
              See how builders, painters, and hardware retailers use BizPilot to manage scaling teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Testimonial 1 */}
            <div className="p-8 rounded-2xl border border-gray-800/60 bg-gray-900/10 flex flex-col justify-between">
              <div className="flex gap-1.5 mb-6 text-brand-purple">
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-6">
                "We were losing track of cement truck dispatch orders and outstanding builder fees. BizPilot consolidated our pipeline in one hour. The AI quotation output alone saved us dozens of manual estimates."
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Anil Verma</p>
                <p className="text-xs text-gray-500">Founder, Verma Builders & Construction</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-8 rounded-2xl border border-gray-800/60 bg-gray-900/10 flex flex-col justify-between">
              <div className="flex gap-1.5 mb-6 text-brand-purple">
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-6">
                "Our chemical paint distributions are highly seasonal. BizPilot's predictive analysis is extremely precise. Its low-stock warning triggered paint reorders exactly before the prices went up by 15%."
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Rajeev Sharma</p>
                <p className="text-xs text-gray-500">Managing Director, Sharma Paints & Decors</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-8 rounded-2xl border border-gray-800/60 bg-gray-900/10 flex flex-col justify-between">
              <div className="flex gap-1.5 mb-6 text-brand-purple">
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
                <Star className="w-4.5 h-4.5 fill-current" />
              </div>
              <p className="text-gray-300 text-sm italic leading-relaxed mb-6">
                "The email generator for collecting outstanding debt is magical. We had two major customers with delayed accounts receivable for 6 weeks. After the AI drafted custom reminders, they settled inside 24 hours."
              </p>
              <div>
                <p className="text-sm font-semibold text-white">Sonia Gupta</p>
                <p className="text-xs text-gray-500">Finance Lead, Gupta & Sons Hardware</p>
              </div>
            </div>

          </div>
        </section>

        {/* Pricing Cards Section */}
        <section id="pricing" className="mb-28 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-brand-purple uppercase tracking-wider">Simple Tier Plan</span>
            <h2 className="text-3xl font-bold font-display mt-2 mb-4">
              Transparent Pricing For Any SME Size
            </h2>
            <p className="text-gray-400 font-light">
              Get full capabilities without any hidden surcharges or lock-in durations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Plan 1 */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-gray-950 flex flex-col justify-between relative">
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-2">Essential</h3>
                <p className="text-xs text-gray-500 mb-6">Perfect for solo distributors or local retailers.</p>
                <p className="text-3xl font-bold font-mono text-white mb-6">$29<span className="text-xs text-gray-500 font-sans font-normal"> / month</span></p>
                
                <ul className="text-xs text-gray-400 space-y-4 border-t border-gray-900 pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> up to 250 Inventory Products</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Unlimited Quotations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Standard PDF Reports</li>
                  <li className="flex items-center gap-2 text-gray-600 line-through"><CheckCircle className="w-4 h-4" /> Server-side Gemini AI Copilot</li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 text-xs font-bold text-center text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors"
              >
                Launch Now
              </button>
            </div>

            {/* Plan 2 - Featured */}
            <div className="p-8 rounded-2xl border-2 border-brand-purple bg-gray-900/40 flex flex-col justify-between relative shadow-xl shadow-brand-purple/10">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-brand-purple rounded-full text-[10px] font-bold text-white tracking-wider">
                POPULAR CHOICE
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-2">Growth AI</h3>
                <p className="text-xs text-gray-400 mb-6">Designed for scaling operations needing deep AI automation.</p>
                <p className="text-3xl font-bold font-mono text-brand-purple mb-6">$79<span className="text-xs text-gray-400 font-sans font-normal"> / month</span></p>
                
                <ul className="text-xs text-gray-300 space-y-4 border-t border-gray-800 pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-purple" /> Unlimited Products & Customers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-purple" /> Professional PDF Invoice Engine</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-purple" /> **Server-Side Gemini AI Advisor**</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-purple" /> Smart low-stock threshold triggers</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-purple" /> Dynamic custom finance analysis</li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 text-xs font-bold text-center text-white bg-gradient-to-r from-brand-purple to-brand-indigo rounded-xl shadow-md shadow-brand-purple/20 transition-all hover:opacity-95"
              >
                Launch Growth Platform
              </button>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-2xl border border-gray-800 bg-gray-950 flex flex-col justify-between relative">
              <div>
                <h3 className="text-lg font-bold font-display text-white mb-2">Enterprise</h3>
                <p className="text-xs text-gray-500 mb-6">For high-volume retail chains & suppliers.</p>
                <p className="text-3xl font-bold font-mono text-white mb-6">$199<span className="text-xs text-gray-500 font-sans font-normal"> / month</span></p>
                
                <ul className="text-xs text-gray-400 space-y-4 border-t border-gray-900 pt-6 mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Multi-location Warehouse Sync</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Custom API Access Integrations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Dedicated Account Strategist</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> SLA & Security audit credentials</li>
                </ul>
              </div>
              <button
                onClick={onLaunchApp}
                className="w-full py-3 text-xs font-bold text-center text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors"
              >
                Contact Sales
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-gray-950 px-6 py-12 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-900">
              <Bot className="w-5 h-5 text-brand-purple" />
            </div>
            <span className="font-bold text-white font-display tracking-tight">BizPilot<span className="text-brand-purple">.AI</span></span>
          </div>
          <p>© 2026 BizPilot AI, Inc. Built for prestigious global Hackathon evaluation. Open source license. Powered by Google Gemini.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Security</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
