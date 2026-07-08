import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, X, Send, RefreshCw, MessageSquareCode, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { getCopilotResponse } from '../lib/gemini';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'f1',
      sender: 'assistant',
      content: "Hi! I am your quick BizPilot assistant. Ask me anything about stock, invoices, or business health right here.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendQuickMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: `fu-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const replyText = await getCopilotResponse(trimmed, messages.slice(-4));
      const assistantMsg: Message = {
        id: `fa-${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `fa-${Date.now()}`,
          sender: 'assistant',
          content: "I'm experiencing a minor connection lag. Feel free to re-submit or consult the full-screen Copilot workspace.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-gradient-to-tr from-brand-indigo to-brand-purple text-white shadow-2xl hover:scale-110 transition-transform cursor-pointer border border-brand-indigo/20 flex items-center justify-center relative group"
        >
          <Bot className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-cyan rounded-full border border-zinc-950 animate-pulse" />
        </button>
      )}

      {/* Tiny Overlay Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-96 glass-panel border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-brand-indigo/10">
          
          {/* Header */}
          <div className="p-3.5 bg-zinc-950/80 border-b border-slate-800/60 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-brand-indigo animate-pulse" />
              <span className="text-xs font-bold text-white font-display">BizPilot Quick Advisor</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Quick Chat feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/30">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'assistant' && (
                  <div className="p-1.5 rounded-lg bg-[#09090b] border border-slate-800 text-brand-indigo h-fit shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-indigo/80 text-white rounded-tr-none'
                    : 'bg-[#09090b]/60 border border-slate-800 text-slate-300 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-2.5 justify-start">
                <div className="p-1.5 rounded-lg bg-[#09090b] border border-slate-800 text-brand-indigo h-fit animate-spin shrink-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-xl bg-[#09090b]/60 border border-slate-800 text-slate-400 text-xs rounded-tl-none">
                  <span className="animate-pulse">Analyzing stats...</span>
                </div>
              </div>
            )}
            <div ref={feedEndRef} />
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={handleSendQuickMessage}
            className="p-2 border-t border-slate-800/60 bg-zinc-950/60 flex gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about materials, profit, bills..."
              className="flex-1 bg-[#09090b] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand-indigo/50"
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="p-2 bg-brand-indigo text-white rounded-lg hover:opacity-95 disabled:opacity-30 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
