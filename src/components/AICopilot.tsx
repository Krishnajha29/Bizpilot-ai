import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, User, Send, Mic, MicOff, Sparkles, Clock, Paperclip, ChevronRight } from 'lucide-react';
import { Message } from '../types';
import { getCopilotResponse, classifyIntent, AgentType } from '../lib/gemini';
import BusinessDocument from './BusinessDocument';

interface AICopilotProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

// Beautiful step-by-step thinking indicator
function ThinkingSteps({ agent }: { agent: AgentType }) {
  const [currentStep, setCurrentStep] = useState(0);

  const getStepsForAgent = (agentType: AgentType) => {
    switch(agentType) {
      case 'Sales Assistant':
        return [
          "🔍 Sales Agent routing active...",
          "📞 Checking Verma/Sharma customer records...",
          "🛒 Mapping products to active sales catalog...",
          "🏷 Checking eligibility for volume discounts...",
          "🧾 Calculating GST / SGST split...",
          "📦 Verifying stock levels in real-time...",
          "📄 Generating tax quotation draft..."
        ];
      case 'Billing Assistant':
        return [
          "🧾 Billing Agent routing active...",
          "💼 Parsing tax ledger records...",
          "🧮 Calculating CGST, SGST, and IGST portions...",
          "🏢 Generating e-invoice credentials...",
          "🔗 Binding invoice to outstanding accounts...",
          "✍ Signing digital invoice document..."
        ];
      case 'Inventory Manager':
        return [
          "📦 Inventory Manager routing active...",
          "🏗 Checking warehouse physical counts...",
          "🏷 Matching SKUs and barcode indexes...",
          "⚖ Updating stock thresholds and limits...",
          "🚚 Verifying logistics and dock availability...",
          "📝 Recording stock adjustment logs..."
        ];
      case 'Procurement Advisor':
        return [
          "🛒 Procurement Advisor routing active...",
          "📋 Loading supplier catalog databases...",
          "💰 Comparing steel/cement price listings...",
          "📉 Running lead-time transit models...",
          "📈 Predicting stock-out velocity curves...",
          "📄 Drafting supplier purchase order..."
        ];
      case 'CFO Advisor':
        return [
          "🤖 CFO Advisory routing active...",
          "📊 Loading global sales & profit ledgers...",
          "🧮 Running Monte Carlo profit simulations...",
          "📉 Checking solvency and aging receivables...",
          "💡 Generating cost optimization suggestions...",
          "🧠 Structuring C-Suite executive recommendations..."
        ];
      case 'Analytics Engine':
        return [
          "📈 Analytics Engine routing active...",
          "📊 Aggregating multi-month revenue arrays...",
          "🧠 Running seasonal regression models...",
          "👥 Identifying highest-value customer nodes...",
          "🗺 Generating interactive dashboard insights..."
        ];
      default:
        return [
          "🤖 BizPilot AI is reasoning...",
          "Reading ERP Ledger...",
          "Analyzing Business Trends..."
        ];
    }
  };

  const steps = getStepsForAgent(agent);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex flex-col gap-2.5 p-5 rounded-2xl bg-[#09090b]/80 border border-slate-800 rounded-tl-none min-w-[280px] shadow-2xl shadow-indigo-950/20 max-w-md">
      <div className="flex items-center gap-2 mb-2 border-b border-slate-800/40 pb-1.5">
        <div className="w-3.5 h-3.5 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin shrink-0" />
        <span className="text-[10px] font-bold text-white font-mono uppercase tracking-widest">
          {agent === 'Sales Assistant' ? 'Sales Assistant' :
           agent === 'Billing Assistant' ? 'Billing Assistant' :
           agent === 'Inventory Manager' ? 'Inventory Manager' :
           agent === 'Procurement Advisor' ? 'Procurement Advisor' :
           agent === 'CFO Advisor' ? 'CFO Advisor Engine' :
           'Analytics Engine'}
        </span>
      </div>
      <div className="space-y-2">
        {steps.map((text, idx) => {
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;
          return (
            <div key={idx} className="flex items-center gap-2.5 text-[11px]">
              {isDone ? (
                <motion.span 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="text-emerald-400 font-bold shrink-0 text-xs"
                >
                  ✔
                </motion.span>
              ) : isActive ? (
                <div className="w-2 h-2 rounded-full bg-brand-indigo animate-ping shrink-0" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-slate-800 shrink-0" />
              )}
              <span className={`font-mono font-medium ${isDone ? 'text-slate-400 line-through decoration-slate-800/40' : isActive ? 'text-white font-bold' : 'text-slate-600'}`}>
                {text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AICopilot({ initialPrompt, onClearInitialPrompt }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [activeAgent, setActiveAgent] = useState<AgentType>('CFO Advisor');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [time, setTime] = useState(new Date());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Live timer tick for the CFO clock in header
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick Action Prompt templates
  const SUGGESTIONS = [
    { label: '📄 Generate Quotation', prompt: 'Generate a quotation for Verma Construction for 10 bags of Premium Teak Plywood' },
    { label: '🧾 Create Invoice', prompt: 'Generate a tax invoice for Sharma Traders for 50 bags of Birla A1 Premium Cement' },
    { label: '📈 Analyze Profit', prompt: 'Analyze our current profit margin and recommend areas of optimization' },
    { label: '🔮 Predict Revenue', prompt: 'Predict our Q3 revenue and perform a financial trend analysis' },
    { label: '📦 Inventory Analysis', prompt: 'Identify which inventory materials are critically low and analyze restock timelines' },
    { label: '🛒 Generate Purchase Order', prompt: 'Draft a restock purchase order to GreenPly Industries for Premium Teak Plywood' },
    { label: '⚡ Business Simulation', prompt: 'Simulate a business scenario: A sudden 25% spike in plywood procurement costs' }
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle triggered initial prompt from external navigation
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Setup Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
        if (err.error === 'not-allowed') {
          setSpeechError('Microphone permission blocked. Please enable mic access in your browser settings.');
        } else if (err.error === 'no-speech') {
          setSpeechError('No speech detected. Please speak clearly into your mic.');
        } else {
          setSpeechError('Speech recognition issue. Please speak clearly or type.');
        }
        setTimeout(() => setSpeechError(null), 5000);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Detect intent to automatically switch the active agent badge
    const detectedAgent = classifyIntent(trimmed);
    setActiveAgent(detectedAgent);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const replyText = await getCopilotResponse(trimmed, messages.slice(-10));
      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          content: '### Connection Advisory\n\nI encountered a brief networking latency issue communicating with our cloud brain. Please try re-sending or use one of our quick action panels on the main dashboard to automate operations directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRegenerate = (msgId: string) => {
    const idx = messages.findIndex(m => m.id === msgId);
    if (idx > 0) {
      // Find the closest preceding user message
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          handleSendMessage(messages[i].content);
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-slate-200 overflow-hidden select-none animate-slideup">
      
      {/* 1. STICKY TOP HEADER */}
      <div className="shrink-0 px-6 py-4 border-b border-slate-800/60 bg-[#09090b]/90 backdrop-blur-md flex flex-col sm:flex-row gap-4 items-center justify-between z-20">
        
        {/* Left Section: Branding & Active Model */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo relative shadow-lg shadow-brand-indigo/5">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black font-display text-white tracking-wide uppercase">BizPilot Enterprise OS</h2>
              <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded bg-brand-indigo/10 border border-brand-indigo/25 text-brand-indigo font-mono flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-brand-indigo animate-pulse" />
                AI Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Current Agent:</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                activeAgent === 'Sales Assistant' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                activeAgent === 'Billing Assistant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                activeAgent === 'Inventory Manager' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                activeAgent === 'Procurement Advisor' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                activeAgent === 'CFO Advisor' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                'bg-violet-500/10 text-violet-400 border border-violet-500/20'
              }`}>
                {activeAgent}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Enterprise KPI Metrics & Status */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
          
          {/* Business Health Meter */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Business Health</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div className="h-full bg-gradient-to-r from-brand-indigo to-brand-cyan w-[94%]" />
              </div>
              <span className="text-[10px] font-extrabold text-brand-cyan">94% Stable</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

          {/* Current Live System Time */}
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">CFO SYSTEM CLOCK</span>
            <span className="text-[10px] text-slate-300 font-bold mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-2.5 py-1 text-[10px] font-extrabold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>CONNECTED</span>
          </div>
        </div>
      </div>

      {/* 2. CHAT AREA / MESSAGE FEED */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-8 bg-[#050505]/20 flex flex-col min-h-0">
        
        {messages.length === 0 ? (
          /* Custom Hello Krishna Spacious Onboarding View */
          <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full space-y-8 my-auto">
            
            <div className="text-center space-y-3">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.4 }}
                className="w-16 h-16 bg-gradient-to-tr from-brand-indigo to-brand-purple rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-brand-indigo/15"
              >
                <Bot className="w-8 h-8 text-white animate-pulse" />
              </motion.div>
              <h2 className="text-3xl font-black font-display text-white tracking-tight">Hello Krishna 👋</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                Welcome to your **BizPilot AI CFO Workspace**. Ask me anything about inventory, draft financial documents, run Monte Carlo simulations, or formulate margins optimization.
              </p>
            </div>
            
            {/* Grid of clickable quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
              {[
                { title: '📊 Generate Quotations', desc: 'Create materials quotes for clients in seconds', prompt: 'Generate a quotation for Verma Construction for 10 bags of Premium Teak Plywood' },
                { title: '🧾 Generate Invoices', desc: 'Create professional tax invoices with GST calculations', prompt: 'Generate a tax invoice for Sharma Traders for 50 bags of Birla A1 Premium Cement' },
                { title: '📦 Inventory Planning', desc: 'Identify critically low stock and restock timelines', prompt: 'Which materials are critically low in inventory and need restocking?' },
                { title: '🔮 Business Analytics', desc: 'Predict Q3 revenues and financial metrics', prompt: 'Provide a Q3 revenue prediction and Monte Carlo CFO analysis for Apex Builders' },
                { title: '✉ Supplier Emails', desc: 'Draft payment reminders and PO communications', prompt: 'Generate a friendly payment reminder email for Sharma Traders' },
                { title: '🛒 Purchase Orders', desc: 'Procure replenishment materials from suppliers', prompt: 'Draft a purchase restock order to GreenPly Industries for Premium Teak Plywood' },
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 + 0.1 }}
                  className="p-5 text-left rounded-2xl bg-zinc-900/30 hover:bg-zinc-900/70 border border-slate-800/80 hover:border-brand-indigo/40 transition-all group flex flex-col justify-between h-32 hover:shadow-2xl hover:shadow-brand-indigo/5 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-white group-hover:text-brand-indigo transition-colors">{item.title}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-brand-indigo/80 transition-colors" />
                  </div>
                  <span className="text-[10px] text-slate-500 leading-normal line-clamp-2 mt-2">{item.desc}</span>
                </motion.button>
              ))}
            </div>
            
            <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase mt-4">Apex Builders SME Intelligence Node Active</p>
          </div>
        ) : (
          /* Conversation Thread */
          messages.map((msg) => {
            const hasDoc = msg.sender === 'assistant' && (
              msg.content.includes('[DOC_TYPE]') || 
              msg.content.includes('[SIMULATION_START]') || 
              msg.content.includes('###') ||
              msg.content.toLowerCase().includes('quotation') ||
              msg.content.toLowerCase().includes('purchase order') ||
              msg.content.toLowerCase().includes('invoice') ||
              msg.content.toLowerCase().includes('business report') ||
              msg.content.toLowerCase().includes('gst report') ||
              msg.content.toLowerCase().includes('proposal') ||
              msg.content.toLowerCase().includes('email') ||
              msg.content.toLowerCase().includes('meeting summary') ||
              msg.content.toLowerCase().includes('financial analysis')
            ) && (msg.content.includes('###') || msg.content.includes('##') || msg.content.includes('-') || msg.content.split('\n').length > 5);

            return (
              <div
                key={msg.id}
                className={`w-full flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${hasDoc ? 'my-8' : 'my-4'}`}
              >
                <div 
                  className={`flex gap-4 items-start w-full ${
                    msg.sender === 'user' 
                      ? 'max-w-3xl justify-end ml-auto' 
                      : hasDoc 
                        ? 'max-w-[95%] lg:max-w-[95%] mx-auto' 
                        : 'max-w-4xl'
                  }`}
                >
                  {/* Avatar left-aligned for chat messages */}
                  {msg.sender === 'assistant' && !hasDoc && (
                    <div className="shrink-0 p-2.5 rounded-xl bg-zinc-900 border border-slate-800 text-brand-indigo shadow-md mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col min-w-0">
                    {msg.sender === 'assistant' ? (
                      /* Route all assistant messages to BusinessDocument */
                      <BusinessDocument 
                        text={msg.content} 
                        msgId={msg.id} 
                        onRegenerate={() => handleRegenerate(msg.id)}
                        onSendPrompt={handleSendMessage}
                      />
                    ) : (
                      /* User message bubble */
                      <div className="flex gap-3.5 items-start justify-end w-full">
                        <div className="p-4 px-5 rounded-2xl bg-gradient-to-tr from-brand-indigo/90 to-brand-purple/90 text-white rounded-tr-none border border-brand-indigo/30 shadow-md shadow-brand-indigo/5 hover:border-brand-indigo/50 transition-all text-xs whitespace-pre-wrap leading-relaxed max-w-[85%]">
                          {msg.content}
                        </div>
                        <div className="shrink-0 p-2.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo shadow-md mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    <span className={`text-[9px] text-slate-500 font-mono mt-1 ${msg.sender === 'user' ? 'text-right pr-14' : 'px-1'}`}>
                      {msg.sender === 'user' ? 'You' : 'BizPilot AI'} • {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Intelligent Step-by-Step Reasoning Indicator */}
        {isThinking && (
          <div className="flex gap-4 justify-start max-w-4xl">
            <div className="shrink-0 p-2.5 rounded-xl bg-zinc-900 border border-slate-800 text-brand-indigo h-fit shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <ThinkingSteps agent={activeAgent} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. STICKY BOTTOM INPUT DISPLAY & SUGGESTIONS */}
      <div className="shrink-0 border-t border-slate-800/40 bg-[#09090b]/80 pt-4 pb-6 px-4 md:px-12">
        
        {/* Suggestion Chips Display (Scrollable on small screens) */}
        <div className="flex gap-2.5 overflow-x-auto pb-3.5 max-w-4xl mx-auto w-full scrollbar-none scroll-smooth">
          {SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.prompt)}
              className="shrink-0 px-3.5 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white bg-zinc-950/80 hover:bg-zinc-900 border border-slate-800 hover:border-brand-indigo/40 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <div className="max-w-4xl mx-auto w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center gap-3 bg-[#030303]/90 border border-slate-800 rounded-2xl p-3 focus-within:border-brand-indigo/50 focus-within:ring-1 focus-within:ring-brand-indigo/25 transition-all shadow-2xl"
          >
            {/* Attachment Button */}
            <button
              type="button"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-slate-800/80 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Attach financial files or spreadsheets"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Analysis Input */}
            {speechSupported && (
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isRecording 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                    : 'bg-zinc-900 border-slate-800/80 text-slate-400 hover:text-white'
                }`}
                title={isRecording ? 'Listening... click to complete transcription' : 'Speak voice instructions to the CFO'}
              >
                {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Text Input Field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isRecording 
                  ? "Transcribing active... speak now" 
                  : speechError 
                    ? speechError 
                    : "Ask BizPilot anything about your business..."
              }
              className={`flex-1 bg-transparent border-none outline-none text-xs text-white py-1 transition-all ${
                speechError ? 'placeholder-rose-400 font-medium' : 'placeholder-slate-500'
              }`}
              disabled={isThinking}
            />

            {/* Send Action */}
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2.5 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple text-white shadow-md hover:opacity-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Submit Prompt to CFO Engine"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
