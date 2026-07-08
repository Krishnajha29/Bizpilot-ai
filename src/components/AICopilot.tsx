import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bot, User, Send, Mic, MicOff, Copy, ClipboardCheck, Sparkles, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Message } from '../types';

interface AICopilotProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

// Custom High-Quality Markdown Renderer to avoid version conflicts and support beautiful styling
function MarkdownRenderer({ text }: { text: string }) {
  const parseMarkdown = (rawText: string) => {
    const lines = rawText.split('\n');
    let insideTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    const elements = lines.map((line, idx) => {
      const trimmed = line.trim();

      // Horizontal rules
      if (trimmed === '---') {
        insideTable = false;
        return <hr key={idx} className="my-6 border-slate-800/60" />;
      }

      // Headers
      if (trimmed.startsWith('###')) {
        insideTable = false;
        return <h3 key={idx} className="text-lg font-bold font-display text-white mt-5 mb-2.5">{trimmed.replace('###', '').trim()}</h3>;
      }
      if (trimmed.startsWith('##')) {
        insideTable = false;
        return <h2 key={idx} className="text-xl font-bold font-display text-brand-indigo mt-6 mb-3">{trimmed.replace('##', '').trim()}</h2>;
      }
      if (trimmed.startsWith('#')) {
        insideTable = false;
        return <h1 key={idx} className="text-2xl font-bold font-display text-white mt-7 mb-4 tracking-tight border-b border-slate-800/60 pb-2">{trimmed.replace('#', '').trim()}</h1>;
      }

      // Tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const parts = trimmed.split('|').map(p => p.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
        
        // Skip separator line e.g., | :--- | :--- |
        if (trimmed.includes(':---') || trimmed.includes('---:')) {
          return null;
        }

        if (!insideTable) {
          insideTable = true;
          tableHeaders = parts;
          tableRows = [];
          return null; // Don't render header yet, wait for rows or end of table
        } else {
          tableRows.push(parts);
          return null;
        }
      }

      // If we were inside a table and this line is NOT a table line, render the accumulated table
      if (insideTable && (!trimmed.startsWith('|') || !trimmed.endsWith('|'))) {
        insideTable = false;
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        tableHeaders = [];
        tableRows = [];
        
        return (
          <div key={`table-${idx}`} className="overflow-x-auto my-5 border border-slate-800/60 rounded-xl bg-zinc-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 border-b border-slate-800/60 text-slate-400">
                  {currentHeaders.map((header, hIdx) => (
                    <th key={hIdx} className="p-3 font-semibold font-display">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-800/40 text-slate-300 hover:bg-white/1">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 font-mono font-medium">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Bullet Lists
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        insideTable = false;
        const listText = trimmed.replace(/^[-*]\s+/, '');
        return (
          <ul key={idx} className="list-disc pl-5 mb-2.5 text-xs text-gray-300 leading-relaxed">
            <li>{renderInlineStyles(listText)}</li>
          </ul>
        );
      }

      // Numbered Lists
      if (/^\d+\.\s+/.test(trimmed)) {
        insideTable = false;
        const listText = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <ol key={idx} className="list-decimal pl-5 mb-2.5 text-xs text-gray-300 leading-relaxed">
            <li>{renderInlineStyles(listText)}</li>
          </ol>
        );
      }

      // Empty Lines
      if (trimmed === '') {
        return null;
      }

      // Plain paragraphs
      insideTable = false;
      return (
        <p key={idx} className="text-xs text-gray-300 mb-3.5 leading-relaxed">
          {renderInlineStyles(trimmed)}
        </p>
      );
    });

    return elements;
  };

  // Helper to parse bold (**text**) and highlights
  const renderInlineStyles = (raw: string) => {
    const parts = raw.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return <div className="markdown-body text-xs">{parseMarkdown(text)}</div>;
}

export default function AICopilot({ initialPrompt, onClearInitialPrompt }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      content: "### Welcome to BizPilot AI CFO Advisor\n\nI am connected to the live operational database of **Apex Builders Supply & Paints**. Ask me to analyze files, predict revenues, or generate templates:\n\n- 📑 **Generate a quotation** for materials\n- 💰 **Analyze sales and unpaid accounts**\n- 📈 **Predict revenue models** for Q3\n- ✉️ **Generate a collection follow-up email** for outstanding balances",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Quick prompt templates
  const SUGGESTIONS = [
    'Generate quotation for Verma Construction',
    'Summarize today\'s business health',
    'How can I increase profit margin?',
    'Create marketing campaign for paints',
    'Generate follow-up email for Sharma Traders'
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle triggered initial prompt from Dashboard/Insights navigation
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Setup Web Speech Recognition
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
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
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
      // Send message to Express full-stack API route
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmed,
          history: messages.slice(-10) // provide matching window of previous conversations
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.error(err);
      // Hard fallback if backend completely crashes
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

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[800px] glass-panel border border-slate-800/60 rounded-2xl overflow-hidden animate-slideup">
      
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800/60 bg-[#09090b]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-white">BizPilot CFO Advisor</h2>
            <p className="text-[10px] text-slate-500 font-mono">MODEL: GEMINI-3.5-FLASH</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold">Operational Context Loaded</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#050505]/20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Left AI Avatar */}
            {msg.sender === 'assistant' && (
              <div className="shrink-0 p-2.5 rounded-xl bg-[#09090b] border border-slate-800 text-brand-indigo h-fit">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className="flex flex-col max-w-[85%] group">
              <div className={`p-4.5 rounded-2xl relative ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-brand-indigo/80 to-brand-purple/80 text-white rounded-tr-none border border-brand-indigo/30'
                  : 'bg-[#09090b]/50 border border-slate-800/60 rounded-tl-none'
              }`}>
                {/* Text Content */}
                {msg.sender === 'user' ? (
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <MarkdownRenderer text={msg.content} />
                )}

                {/* Micro Copy Button for Assistant messages */}
                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.content, msg.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950 border border-slate-800/60 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all cursor-pointer"
                    title="Copy Markdown Contents"
                  >
                    {copiedId === msg.id ? (
                      <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
              <span className={`text-[10px] text-slate-500 font-mono mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </span>
            </div>

            {/* Right User Avatar */}
            {msg.sender === 'user' && (
              <div className="shrink-0 p-2.5 rounded-xl bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo h-fit">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* AI Thinking Animation */}
        {isThinking && (
          <div className="flex gap-4 justify-start">
            <div className="shrink-0 p-2.5 rounded-xl bg-[#09090b] border border-slate-800 text-brand-indigo h-fit animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <div className="p-4.5 rounded-2xl bg-[#09090b]/50 border border-slate-800/60 rounded-tl-none flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">BizPilot is forecasting cash assets...</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions Prompt Container */}
      <div className="px-6 py-3 border-t border-slate-800/60 bg-[#050505]/20 overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s)}
            className="shrink-0 px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 hover:text-white bg-[#09090b]/50 hover:bg-[#09090b] border border-slate-800/60 rounded-full transition-all cursor-pointer hover:border-brand-indigo/50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Form Area */}
      <div className="p-4 border-t border-slate-800/60 bg-[#09090b]/60 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-3 bg-[#09090b]/80 border border-slate-800/60 rounded-xl p-2.5 focus-within:border-brand-indigo/50 transition-all"
        >
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={handleToggleRecord}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse' 
                  : 'bg-zinc-950 border-slate-800/60 text-slate-400 hover:text-white'
              }`}
              title={isRecording ? 'Listening... click to end' : 'Start voice analysis input'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Recording active... speak now" : "Ask BizPilot to predict, analyze, draft invoices, or plan..."}
            className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-slate-500"
            disabled={isThinking}
          />

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2.5 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple text-white shadow-md hover:opacity-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
