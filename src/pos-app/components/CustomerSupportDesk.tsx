import React, { useState } from 'react';
import { 
  Headphones, PhoneCall, MessageCircle, Mail, Clock, 
  Send, ShieldCheck, CheckCircle2, AlertCircle, FileText, 
  Search, HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquare
} from 'lucide-react';

interface Props {
  lang: 'bn' | 'en';
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  userName?: string;
  shopName?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
  message: string;
}

export const CustomerSupportDesk: React.FC<Props> = ({
  lang,
  showToast,
  userName = 'Valued Customer',
  shopName = 'রনি টেলিকম'
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TK-9081',
      subject: 'থার্মাল প্রিন্টার মার্জিন অ্যাডজাস্টমেন্ট সাপোর্ট',
      category: 'ইনভয়েস/প্রিন্টার',
      priority: 'Medium',
      status: 'In Progress',
      date: '04-08-2026',
      message: '৮০মিমি থার্মাল প্রিন্টারে পেপারের ডানপাশের ফন্ট সামান্য কেটে যাচ্ছে।'
    },
    {
      id: 'TK-8910',
      subject: 'বারকোড স্ক্যানার ফার্স্ট অটো-স্ক্যান সাপোর্ট',
      category: 'পিওএস টার্মিনাল',
      priority: 'Low',
      status: 'Resolved',
      date: '01-08-2026',
      message: 'স্ক্যানার দিয়ে স্ক্যান করলে আইটেম অটো কাট-এ যুক্ত হওয়া।'
    }
  ]);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('পিওএস টার্মিনাল');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'Urgent'>('Medium');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      qBn: 'থার্মাল প্রিন্টারে কীভাবে রসিদ পেপার মার্জিন ঠিক করব?',
      qEn: 'How to adjust thermal printer margins?',
      aBn: 'প্রিন্ট মোড সিলেক্ট করার সময় Print Preview থেকে Scale Option-এ "Fit to Printable Area" এবং Margin "None" সিলেক্ট করুন।',
      aEn: 'Select "Fit to Printable Area" and set margins to "None" in the Chrome print preview options.'
    },
    {
      qBn: 'ডাটাবেজ অটো-সিঙ্ক না হলে করণীয় কী?',
      qEn: 'What to do if offline sync stalls?',
      aBn: 'টপবারের সিঙ্ক স্ট্যাটাস ডটটিতে ক্লিক করে "Force Re-sync" বাটনে চাপ দিন। আপনার ইন্টারনেট চালু থাকলে ২ সেকেন্ডে সিঙ্ক হবে।',
      aEn: 'Click the topbar sync indicator and press "Force Re-sync". Once connected, data will upload instantly.'
    },
    {
      qBn: 'নতুন কর্মচারী আইডি তৈরি ও পারমিশন লক করার নিয়ম কী?',
      qEn: 'How to add employee logins & lock permissions?',
      aBn: 'ইউজার তালিকা থেকে "নতুন ইউজার তৈরি করুন" মডালে গিয়ে রোল নির্বাচন করুন (ক্যাশিয়ার/অপারেটর)। ক্যাশিয়ারদের ক্রয় ও একাউন্টিং অটো লক থাকবে।',
      aEn: 'Go to Users List -> Create New User and set role to Cashier/Operator. Financial modules are automatically locked.'
    }
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast(lang === 'bn' ? 'টিকিটের বিষয় লিখুন!' : 'Please enter a ticket subject!', 'error');
      return;
    }
    if (!message.trim()) {
      showToast(lang === 'bn' ? 'সমস্যার বিস্তারিত বিবরণ দিন!' : 'Please describe your issue!', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newTicket: SupportTicket = {
        id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: subject.trim(),
        category,
        priority,
        status: 'Pending',
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        message: message.trim()
      };

      setTickets([newTicket, ...tickets]);
      setSubject('');
      setMessage('');
      setSubmitting(false);
      showToast(
        lang === 'bn' ? 'সাপোর্ট টিকিট সফলভাবে রেজিস্টার হয়েছে! টেকনিক্যাল টিম দ্রুত যোগাযোগ করবে।' : 'Support ticket submitted successfully!',
        'success'
      );
    }, 400);
  };

  return (
    <div className="w-full min-h-full p-4 sm:p-6 space-y-6 text-slate-800 font-sans">
      
      {/* Top Banner Profile Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 p-6 shadow-xl text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner shrink-0">
            <Headphones className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {lang === 'bn' ? 'গ্রাহক সহায়তা ও হেল্পডেস্ক (Support Desk)' : 'Customer Support & Helpdesk'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-slate-950 uppercase shadow-sm">
                24/7 LIVE
              </span>
            </div>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{shopName} — {lang === 'bn' ? 'ডেডিকেটেড টেকনিক্যাল ইঞ্জিনিয়ার সাপোর্ট হাব' : 'Dedicated technical engineering support portal'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <a
            href="tel:01747046052"
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg hover:shadow-amber-400/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{lang === 'bn' ? 'হটলাইন: 01747046052' : 'Hotline: 01747046052'}</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Phone */}
        <a href="tel:01747046052" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4 hover:border-blue-300 transition cursor-pointer">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'হোয়াটসঅ্যাপ ও মোবাইল নম্বর' : 'Helpline & Mobile'}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">01747-046052 <span className="text-xs font-bold text-slate-600">(Fardous Al-Amin)</span></div>
            <div className="text-[10px] text-emerald-600 font-bold">{lang === 'bn' ? 'সকাল ১০টা - রাত ৯টা' : '10:00 AM - 9:00 PM'}</div>
          </div>
        </a>

        {/* Card 2: WhatsApp */}
        <a 
          href="https://wa.me/8801747046052" 
          target="_blank" 
          rel="noreferrer"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4 hover:border-emerald-300 transition cursor-pointer"
        >
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'হোয়াটসঅ্যাপ চ্যাট' : 'WhatsApp Support'}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">01747-046052 <span className="text-xs font-bold text-slate-600">(Fardous Al-Amin)</span></div>
            <div className="text-[10px] text-blue-600 font-bold">ইনস্ট্যান্ট মেসেজ</div>
          </div>
        </a>

        {/* Card 3: Email */}
        <a 
          href="mailto:info.fardousit@gmail.com"
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition cursor-pointer"
        >
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Official Support Email'}
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 truncate max-w-[185px]" title="info.fardousit@gmail.com">
              info.fardousit@gmail.com
            </div>
            <div className="text-[10px] text-indigo-600 font-bold">ইমেইল টিকিট</div>
          </div>
        </a>

        {/* Card 4: Response Time */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'bn' ? 'গড় সমাধান সময়' : 'Avg Resolution Time'}
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">&lt; ১৫ মিনিট</div>
            <div className="text-[10px] text-amber-600 font-bold">দ্রুততম প্রযুক্তি সেবা</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Form + Right Tickets & FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Ticket Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'নতুন সাপোর্ট টিকিট তৈরি করুন (Submit Ticket)' : 'Submit Support Ticket'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'আপনার সমস্যা বা জিজ্ঞাসার বিবরণ লিখে টিকিট ওপেন করুন' : 'Open a formal ticket for technical assistance'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'bn' ? 'সমস্যার বিষয় (Ticket Subject) *' : 'Ticket Subject *'}
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. প্রিন্ট মডিউল প্রশ্ন বা ডিভাইস কানেক্টিভিটি"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'bn' ? 'ক্যাটাগরি (Category)' : 'Issue Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="পিওএস টার্মিনাল">পিওএস টার্মিনাল (POS Hardware/Screen)</option>
                    <option value="ইনভয়েস/প্রিন্টার">ইনভয়েস ও প্রিন্টার (Printer/Invoicing)</option>
                    <option value="ডাটাবেজ/সিঙ্ক">ডাটাবেজ ও সিঙ্ক (Offline Data Sync)</option>
                    <option value="বিলিং & সাবস্ক্রিপশন">বিলিং ও সাবস্ক্রিপশন (Account Billing)</option>
                    <option value="অন্যান্য">অন্যান্য (General Queries)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {lang === 'bn' ? 'জরুরি মাত্রা (Priority)' : 'Priority Level'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Low">{lang === 'bn' ? 'সাধারণ (Low Priority)' : 'Low'}</option>
                    <option value="Medium">{lang === 'bn' ? 'মাঝারি (Medium Priority)' : 'Medium'}</option>
                    <option value="Urgent">{lang === 'bn' ? '🚨 অতি জরুরি (Urgent Priority)' : 'Urgent'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {lang === 'bn' ? 'বিস্তারিত বিবরণী (Detailed Message) *' : 'Detailed Issue Message *'}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="আপনার কী ধরনের সমস্যা হচ্ছে তা বিস্তারিত লিখুন..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-slate-950 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-amber-300" />}
                <span>{lang === 'bn' ? 'টিকিট সাবমিট করুন' : 'Submit Support Ticket'}</span>
              </button>
            </form>
          </div>

          {/* Tickets History Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    {lang === 'bn' ? 'আপনার সাম্প্রতিক সাপোর্ট টিকিটসমূহ' : 'My Support Tickets'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {lang === 'bn' ? 'ইঞ্জিনিয়ারিং টিমের সমাধানের অগ্রগতি ও স্ট্যাটাস' : 'Track live progress of submitted support requests'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {tickets.length} {lang === 'bn' ? 'টি টিকিট' : 'Tickets'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold">
                    <th className="p-3">আইডি (ID)</th>
                    <th className="p-3">বিষয় (Subject)</th>
                    <th className="p-3">ক্যাটাগরি</th>
                    <th className="p-3">তারিখ</th>
                    <th className="p-3 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-blue-600">{t.id}</td>
                      <td className="p-3 font-bold text-slate-900">{t.subject}</td>
                      <td className="p-3 text-slate-600">{t.category}</td>
                      <td className="p-3 text-slate-500">{t.date}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase shadow-xs ${
                          t.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                          t.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): FAQ Accordion */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {lang === 'bn' ? 'প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'bn' ? 'সাধারণ বিষয় সমূহের দ্রুত সমাধান' : 'Quick answers to common queries'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((f, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:bg-slate-100 transition cursor-pointer gap-2"
                    >
                      <span>{lang === 'bn' ? f.qBn : f.qEn}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs font-medium text-slate-600 border-t border-slate-200/60 bg-white leading-relaxed">
                        {lang === 'bn' ? f.aBn : f.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerSupportDesk;

