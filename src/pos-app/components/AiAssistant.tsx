// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  RefreshCcw,
  PlusCircle,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const AiAssistant: React.FC = () => {
  const { products, sales, theme } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingStock, setAnalyzingStock] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ insights: string[]; summaryTitle: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts in Bengali
  const quickPrompts = [
    { title: "কম স্টক সতর্কবার্তা", label: "আমার দোকানে কম স্টক থাকা পণ্যগুলোর তালিকা দিন এবং কোনো সতর্কতা প্রয়োজন কিনা বলুন।" },
    { title: "বিক্রয় বৃদ্ধির কৌশল", label: "দোকানের বিক্রয় ও লাভ বাড়ানোর জন্য কি কি প্রমোশনাল অফার বা কৌশল ব্যবহার করতে পারি?" },
    { title: "Fardous POS প্রিন্টার সেটআপ", label: "কম্পিউটারে Fardous POS সফটওয়্যারের সাথে ক্যাশ ড্রয়ার এবং থার্মাল প্রিন্টার কীভাবে সেটআপ করব?" },
    { title: "স্টক ব্যালেন্স টিপস", label: "স্টক রেজিস্টার সঠিকভাবে মেইনটেইন করার প্রয়োজনীয় ৩টি টিপস দিন।" }
  ];

  // Auto scroll to chat bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          text: `আসসালামু আলাইকুম! আমি **Fardous IT POS এআই অ্যাসিস্ট্যান্ট**। ফায়ারবেস ক্লাউড ও এআই ইঞ্জিনের সাহায্যে আমি আপনার ব্যবসার পারফরম্যান্স ট্র্যাক করতে সাহায্য করব। 

নিচের যেকোনো প্রশ্নে ক্লিক করতে পারেন অথবা সরাসরি পণ্য তালিকা, লাভ-ক্ষতি হিসাব, অথবা থার্মাল প্রিন্টার সেটআপ নিয়ে যেকোনো প্রশ্ন করতে পারেন।`,
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  // Run stock and sales analytics on demand
  const runStockAnalysis = async () => {
    setAnalyzingStock(true);
    try {
      // Create lightweight models for API context
      const simplifiedProducts = products.map(p => ({
        name: p.name,
        category: p.category,
        stock: p.stock,
        minStock: p.minStock,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice
      }));

      const simplifiedSales = sales.slice(0, 20).map(s => ({
        total: s.totalAmount,
        profit: s.profit,
        date: s.date,
        itemsCount: s.items.length
      }));

      const res = await fetch('/api/ai/analyze-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: simplifiedProducts, sales: simplifiedSales })
      });

      if (!res.ok) throw new Error("স্টক এনালাইসিস রিকোয়েস্টে সমস্যা হয়েছে।");
      const data = await res.json();
      setAiInsights(data);
    } catch (err: any) {
      console.error(err);
      // Fallback local analytical engine if API key is not ready or fails
      generateLocalInsights();
    } finally {
      setAnalyzingStock(false);
    }
  };

  const generateLocalInsights = () => {
    // Elegant local POS fallback analytics
    const lowStockItems = products.filter(p => p.stock <= (p.minStock || 5));
    const totalStockVal = products.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);
    const insightsList = [
      `দোকানে মোট স্টক মূল্য প্রায় ৳${totalStockVal.toLocaleString('bn-BD')} টাকা।`,
      lowStockItems.length > 0 
        ? `বর্তমানে ${lowStockItems.length}টি পণ্যের স্টক শেষ পর্যায়ে আছে (যেমন: ${lowStockItems.slice(0, 2).map(i => i.name).join(', ')})। দ্রুত রি-অর্ডার করার পরামর্শ দেওয়া হচ্ছে।`
        : `সব পণ্যের স্টক সন্তোষজনক অবস্থায় আছে। কোনো রি-অর্ডার এলার্ট নেই।`,
      `গড় প্রফিট মার্জিন চেক করে নতুন আইটেম যুক্ত করার কথা ভাবুন। ক্যাশ ফ্লো বাড়াতে দ্রুত ডেড স্টক ক্লিয়ারেন্স অফার দিন।`
    ];
    setAiInsights({
      summaryTitle: "লোকাল ড্যাশবোর্ড এনালাইসিস (অফলাইন মোড)",
      insights: insightsList
    });
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setLoading(true);

    try {
      // Get recent history for context (last 5 messages)
      const simplifiedHistory = messages.slice(-5).map(m => ({
        role: m.role,
        text: m.text
      }));

      // Dynamic lightweight business context
      const context = {
        totalProductsCount: products.length,
        lowStockCount: products.filter(p => p.stock <= (p.minStock || 5)).length,
        totalSalesCount: sales.length,
        totalRevenue: sales.reduce((sum, s) => sum + s.totalAmount, 0)
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: simplifiedHistory,
          context
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gemini API-র সাথে যোগাযোগ ব্যাহত হয়েছে।');
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.response || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
        timestamp: new Date()
      }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `ক্ষমা করবেন! একটি সমস্যা দেখা দিয়েছে। \n\n**ত্রুটির বিবরণ:** ${err.message || 'নেটওয়ার্ক সংযোগ বা এপিআই কী যাচাইকরণ ব্যর্থ হয়েছে।'}\n\n*পরামর্শ:* অনুগ্রহ করে চেক করুন আপনার **Settings > Secrets** প্যানেলে সঠিক \`GEMINI_API_KEY\` যুক্ত আছে কিনা।`,
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse double asterisks and bullet points into styled HTML elements
  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;
      
      // Handle list items
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      const cleanLine = isListItem ? line.trim().substring(2) : line;

      // Simple markdown bold converter (**text**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-amber-500">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      content = parts.length > 0 ? parts : cleanLine;

      if (isListItem) {
        return (
          <li key={idx} className="ml-5 list-disc mb-1 text-sm leading-relaxed">
            {content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm leading-relaxed mb-2 min-h-[1rem]">
          {content}
        </p>
      );
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header and Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5 border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-slate-800 dark:text-white">
              এআই স্মার্ট বিজনেস অ্যাসিস্ট্যান্ট
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Powered by Gemini AI Engine | Custom Integrated Support for Fardous IT
          </p>
        </div>

        {/* Dynamic Stock & Sales health button */}
        <button
          onClick={runStockAnalysis}
          disabled={analyzingStock}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-blue-500/15 disabled:opacity-75 shrink-0"
        >
          {analyzingStock ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>বিজনেস ডাটা বিশ্লেষণ হচ্ছে...</span>
            </>
          ) : (
            <>
              <TrendingUp size={14} />
              <span>এআই স্টক ও লাভ বিশ্লেষণ রান করুন</span>
            </>
          )}
        </button>
      </div>

      {/* Grid Layout: Insights on Left, Active Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Insights Panel */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-start">
          
          {/* Real-time statistics Widget */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
            <h2 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileCheck size={14} className="text-slate-500" />
              ইনস্ট্যান্ট স্টোর কাউন্টারস
            </h2>
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold block">মোট পণ্য আইটেম</span>
                <span className="text-xl font-bold font-mono text-slate-800 dark:text-white mt-1 block">
                  {products.length}
                </span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-900 rounded-xl">
                <span className="text-[10px] text-amber-500 font-bold block">কম স্টক প্রোডাক্টস</span>
                <span className="text-xl font-bold font-mono text-amber-500 mt-1 block">
                  {products.filter(p => p.stock <= (p.minStock || 5)).length}
                </span>
              </div>
            </div>
          </div>

          {/* AI Automated Insight Card */}
          <div className="bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent border border-amber-500/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-3">
              <Lightbulb size={18} className="animate-pulse" />
              <h2 className="font-bold text-sm">এআই অটোমেটেড ইনসাইটস</h2>
            </div>

            {aiInsights ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold font-display text-slate-700 dark:text-slate-200 border-b border-amber-500/10 pb-1.5 flex items-center justify-between">
                  <span>{aiInsights.summaryTitle}</span>
                  <button onClick={runStockAnalysis} className="p-1 rounded bg-slate-200/10 hover:bg-slate-200/20 text-slate-400 transition" title="রিফ্রেশ করুন">
                    <RefreshCcw size={10} />
                  </button>
                </h3>
                <ul className="space-y-2.5">
                  {aiInsights.insights.map((ins, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="text-amber-500 shrink-0 font-bold font-mono font-display">{i + 1}.</span>
                      <span>{ins}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-3.5 py-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  আপনার পণ্য স্টক এবং বিক্রয় ইতিহাসের উপর ভিত্তি કરીને রিয়েল-টাইম ব্যবসায়িক পরামর্শ পেতে এনালাইসিস রান করুন।
                </p>
                <button
                  onClick={runStockAnalysis}
                  disabled={analyzingStock}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition cursor-pointer hover:scale-103 active:scale-95 flex items-center gap-1.5 mx-auto disabled:opacity-50"
                >
                  <RefreshCcw size={10} className={analyzingStock ? "animate-spin" : ""} />
                  ভিজ্যুয়াল ইনসাইটস জেনারেট করুন
                </button>
              </div>
            )}
          </div>

          {/* Quick Support Guidelines of Fardous IT */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <HelpCircle size={14} className="text-blue-500" />
              মেইনটেন্যান্স ও হেল্প ডেস্ক
            </h3>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mb-2">
              Fardous IT POS-2 অ্যাপ্লিকেশনটি যেকোনো উইন্ডোজ, ল্যাপটপ বা ম্যাকে ফুল স্ক্রিনে মসৃণভাবে চলে। থার্মাল প্রিন্টার সংযোগ বা ডাটা ব্যাকআপ সংক্রান্ত যেকোনো জরুরি প্রয়োজনে সরাসরি কল অথবা হোয়াটসঅ্যাপ করতে পারেন।
            </p>
            <div className="p-2.5 rounded-lg bg-white/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              📞 সাপোর্ট ডিরেক্টরি: <span className="font-mono text-blue-500 block mt-0.5">01747-046052 (Fardous Computer)</span>
            </div>
          </div>

        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-8 flex flex-col h-[620px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          
          {/* Chat Window Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">এআই বিজনেস এডভাইসার</h3>
                <p className="text-[10px] text-slate-500">স্টোর ও স্টক সংক্রান্ত যেকোনো প্রশ্নের সমাধান খুঁজুন</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if(window.confirm("আপনি কি চ্যাট হিস্ট্রি রিসেট করতে চান?")) {
                  setMessages([
                    {
                      role: 'assistant',
                      text: `চ্যাট হিস্ট্রি রিসেট করা হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি বলুন?`,
                      timestamp: new Date()
                    }
                  ]);
                }
              }}
              className="text-[10px] text-red-500 font-bold hover:underline transition"
            >
              হিস্ট্রি মুছুন
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
            {messages.map((m, index) => (
              <div 
                key={index}
                className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-xs ${
                  m.role === 'user' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-amber-500'
                }`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>

                {/* Bubble */}
                <div className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}>
                  {formatText(m.text)}
                  <span className={`text-[8px] font-mono block text-right mt-1.5 ${m.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Simulated Typester Loading State */}
            {loading && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-amber-500 shrink-0">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-amber-500" />
                  <span className="text-[10px] text-slate-500 font-bold font-mono animate-pulse">Gemini thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick Bengali Prompts Buttons */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 px-1">সহজে প্রশ্ন করার জন্য ক্লিক করুন:</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSendMessage(qp.label)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[10px] text-slate-700 dark:text-slate-300 font-semibold hover:border-amber-500/50 hover:bg-amber-500/5 dark:hover:bg-amber-500/5 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
                >
                  {qp.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Input Field */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMsg);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="এআই অ্যাসিস্ট্যান্টকে বাংলায় যেকোনো প্রশ্ন করুন... (যেমন: লাভ বৃদ্ধি বা রিকোভারি টিপস)"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-amber-500/50 outline-none text-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim() || loading}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white font-semibold transition cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};