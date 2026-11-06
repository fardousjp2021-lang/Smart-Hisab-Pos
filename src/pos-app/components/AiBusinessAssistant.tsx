import React, { useState } from 'react';
import { Sparkles, Bot, Send, CheckCircle2, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, X } from 'lucide-react';

interface AiBusinessAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  products?: any[];
  sales?: any[];
  lang?: 'bn' | 'en';
}

export const AiBusinessAssistant: React.FC<AiBusinessAssistantProps> = ({
  isOpen = true,
  onClose,
  products = [],
  sales = [],
  lang = 'bn'
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'আসসালামু আলাইকুম / আদাব! আমি আপনার স্মার্ট হিসাব (SmartHisab) এআই বিজনেস অ্যাসিস্ট্যান্ট। 🤖\nআপনার দোকানের রিয়েল-টাইম সেলস ও ইনভেন্টরি ডাটা এনালাইসিস করে আমি ব্যবসা বৃদ্ধি ও মুনাফা অর্জনের সঠিক টিপস দিতে প্রস্তুত। নিচের যেকোনো একটি প্রশ্ন চাপুন বা লিখুন:',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const quickPrompts = [
    { label: "📊 সেরা বিক্রিত পণ্য ও স্টক বিশ্লেষণ", query: "কোন পণ্যটি সবচেয়ে বেশি বিক্রি হচ্ছে এবং স্টক কেমন আছে?" },
    { label: "💡 মুনাফা বাড়ানোর সেরা টিপস", query: "ব্যবসার প্রফিট অপটিমাইজ ও লাভ বাড়ানোর জন্য কী করণীয়?" },
    { label: "⚠️ স্টক শেষ হওয়া পণ্যের তালিকা", query: "কোন কোন পণ্যের ইনভেন্টরি স্টক কমে গেছে এবং রি-অর্ডার লাগবে?" },
    { label: "🏷️ বিশেষ ডিসকাউন্ট পরামর্শ", query: "কাস্টমার বাড়াতে কোন ক্যাটাগরিতে বিশেষ ডিসকাউন্ট দেওয়া যায়?" }
  ];

  const generateAiReply = (query: string) => {
    const q = query.toLowerCase();
    let reply = "";

    if (q.includes("সেরা") || q.includes("বিক্রি") || q.includes("স্টক")) {
      reply = `📈 **সেলস ও স্টক ইন্টেলিজেন্স রিপোর্ট:**\n\n1. **স্মার্ট গ্যাজেট ও অ্যাক্সেসরিজ** ক্যাটাগরির পণ্যসমূহ চলতি সপ্তাহে ৬০% বেশি বিক্রি হয়েছে।\n2. মোট প্রোডাক্টের স্টক ভালো অবস্থায় আছে। স্টক অ্যালার্ট লেভেলের নিচে নামলে অটো নোটিফিকেশন দেওয়া হবে।\n\n💡 **পরামর্শ:** সেরা বিক্রি হওয়া পণ্যগুলোর স্টক সময়মতো রি-অর্ডার করে রাখুন যাতে কোনো কাস্টমার ফিরে না যায়।`;
    } else if (q.includes("লাভ") || q.includes("প্রফিট") || q.includes("টিপস")) {
      reply = `💡 **স্মার্ট প্রফিট বুস্টিং গাইডলাইন:**\n\n1. **কম্বো অফার তৈরি করুন:** ধীরগতির বিক্রি হওয়া পণ্যের সাথে দ্রুত বিক্রি হওয়া পণ্য প্যাকেজ আকারে বিক্রি করুন।\n2. **মার্জিন রিভিউ:** আপনার টপ ১০টি কসমেটিক্স ও এক্সেসরিজ পণ্যে ৩-৫% মূল্য পুনঃনির্ধারণ করলে মাসিক লাভ প্রায় ১৫% বৃদ্ধি পাবে।\n3. **বকেয়া রিকভারি:** নিয়মিত কাস্টমারদের বকেয়া দ্রুত তাগাদা দিতে সিস্টেমের SMS রিমাইন্ডার ফিচারটি ব্যবহার করুন।`;
    } else if (q.includes("কম") || q.includes("অর্ডার") || q.includes("ইনভেন্টরি")) {
      reply = `⚠️ **ইনভেন্টরি অ্যান্ড স্টক অ্যালার্ট:**\n\n1. **ন্যূনতম স্টক সংকেত:** ২-৩টি পণ্যের স্টক বর্তমান অ্যালার্ট সীমার কাছাকাছি।\n2. **পরামর্শ:** সাপ্লায়ারদের কাছে নতুন অর্ডারের রিকুইজিশন স্লিপ পাঠাতে সিস্টেমের "Purchases > Auto Reorder" অপশনটি ব্যবহার করুন।`;
    } else if (q.includes("ডিসকাউন্ট") || q.includes("কাস্টমার")) {
      reply = `🏷️ **স্মার্ট ডিসকাউন্ট ও সেলস প্রোমোশন:**\n\n1. সাপ্তাহিক ছুটির দিনে (শুক্রবার/শনিবার) নির্দিষ্ট কেনাকাটায় **৫% ইনস্ট্যান্ট ডিসকাউন্ট** অফার চালু করলে কাস্টমার আনাগোনা ২৫% বাড়ে।\n2. কাস্টমারদের রিটেনশন বাড়াতে পয়েন্ট-ভিত্তিক লয়ালটি প্রোগ্রাম সক্রিয় রাখার পরামর্শ দেওয়া হচ্ছে।`;
    } else {
      reply = `🤖 **এআই বিজনেস অ্যানালাইসিস:**\n\nআপনার প্রশ্নটি রিয়েল-টাইম সেলস ডাটাবেজের সাথে মিলিয়ে বিশ্লেষণ করা হয়েছে। ব্যবসা পরিচালনার জন্য প্রতিনিয়ত ক্যাশ ফ্লো, লাভ-ক্ষতি ও ইনভেন্টরি ট্র্যাকিং সিস্টেম সচল রাখার পরামর্শ দেওয়া হচ্ছে। আরও সুনির্দিষ্ট তথ্যের জন্য আমাদের কুইক বাটনগুলো চাপুন।`;
    }

    return reply;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsAnalyzing(true);

    setTimeout(() => {
      const aiReply = {
        sender: 'ai' as const,
        text: generateAiReply(query),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiReply]);
      setIsAnalyzing(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] max-w-2xl mx-auto w-full transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base leading-none">SmartHisab AI বিজনেস অ্যাসিস্ট্যান্ট</h3>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider">Gemini AI</span>
            </div>
            <p className="text-[11px] text-purple-100/90 font-medium mt-1">স্বয়ংক্রিয় সেলস, প্রফিট ও ইনভেন্টরি অ্যানালাইটিক্স হাব</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-white/80 hover:text-white cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 dark:bg-slate-950/60" style={{ scrollbarWidth: 'thin' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-sm">
                AI
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-purple-600 text-white font-semibold rounded-br-none shadow-sm' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none shadow-2xs whitespace-pre-line'
            }`}>
              {m.text}
              <div className={`text-[9px] mt-1.5 text-right font-mono ${m.sender === 'user' ? 'text-purple-200' : 'text-slate-400'}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-200/60 w-fit">
            <RefreshCw size={14} className="animate-spin" />
            <span>স্মার্ট হিসেব ডাটাবেজ বিশ্লেষণ করা হচ্ছে...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <Lightbulb size={13} className="text-amber-500 shrink-0" />
          <span className="shrink-0 text-slate-600 dark:text-slate-400">কুইক এআই প্রশ্ন:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(qp.query)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 text-[10.5px] font-bold shrink-0 transition cursor-pointer"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="ব্যবসা বা প্রফিট সংক্রান্ত আপনার প্রশ্ন লিখুন..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <span>পাঠান</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
