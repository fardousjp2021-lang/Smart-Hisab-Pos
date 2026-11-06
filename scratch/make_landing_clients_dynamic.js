import fs from 'fs';

let lp = fs.readFileSync('src/pos-app/components/LandingPage.tsx', 'utf8');

const oldHappyClients = `  // Client cards metadata matching shohozsoftware.com screenshot
  const happyClients = [
    {
      id: 1,
      title: "প্রাইম ডেমো মোবাইল মার্ট",
      location: "ডেমো এরিয়া, ঢাকা",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
      category: "মোবাইল শপ",
      description: "রিয়েল-টাইম স্টক আপডেট ও ইনস্ট্যান্ট মেমো প্রিন্টিং স্পীড খুবই চমৎকার।"
    },
    {
      id: 2,
      title: "ডিল্যাক্স ফ্যাশন ডেমো",
      location: "ডেমো জোন, চট্টগ্রাম",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400",
      category: "ক্লথিং ও ফ্যাশন",
      description: "মাল্টি-ক্যাটাগরি ট্র্যাকিং এবং ক্যাশ রেজিস্ট্রার মেইনটেইন করা এখন অনেক সহজ।"
    },
    {
      id: 3,
      title: "স্মার্ট গিফট গ্যালারি ডেমো",
      location: "ডেমো অঞ্চল, সিলেট",
      image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=400",
      category: "গিফট ও কসমেটিক্স",
      description: "বারকোড স্ক্যানার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় প্রফিট ক্যালকুলেটর অসাধারণ।"
    },
    {
      id: 4,
      title: "পপুলার ডেমো ড্রাগ হাউস",
      location: "ডেমো পাড়া, ঢাকা",
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=400",
      category: "ফার্মেসী ও ড্রাগ স্টোর",
      description: "মেডিসিনের মিনিমাম স্টক অ্যালার্ট এবং ব্যাচ ট্র্যাকিং সিস্টেমটি অত্যন্ত কার্যকর।"
    },
    {
      id: 5,
      title: "এলাইট কসমেটিক্স ডেমো",
      location: "ডেমো কলোনি, রাজশাহী",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400",
      category: "কসমেটিক্স ও গ্যাজেটস",
      description: "ফায়ারবেস ক্লাউড ব্যাকআপের কারণে কোনো ডাটা হারানোর ভয় সম্পূর্ণ কেটে গেছে।"
    }
  ];`;

const newHappyClients = `  // Client cards metadata dynamically loaded from localStorage
  const defaultClients = [
    {
      id: 1,
      title: "প্রাইম মোবাইল মার্ট",
      location: "কামাল পাশা মোড়, লক্ষ্মীপুর",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400",
      category: "মোবাইল শপ",
      description: "রিয়েল-টাইম স্টক আপডেট ও ইনস্ট্যান্ট মেমো প্রিন্টিং স্পীড খুবই চমৎকার।"
    },
    {
      id: 2,
      title: "ডিল্যাক্স ফ্যাশন হাউস",
      location: "আজাদ নগর, রামগতি",
      image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400",
      category: "ক্লথিং ও ফ্যাশন",
      description: "মাল্টি-ক্যাটাগরি ট্র্যাকিং এবং ক্যাশ রেজিস্ট্রার মেইনটেইন করা এখন অনেক সহজ।"
    },
    {
      id: 3,
      title: "স্মার্ট গিফট গ্যালারি",
      location: "জৈন্তাপুর, সিলেট",
      image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=400",
      category: "গিফট ও কসমেটিক্স",
      description: "বারকোড স্ক্যানার ইন্টিগ্রেশন এবং স্বয়ংক্রিয় প্রফিট ক্যালকুলেটর অসাধারণ।"
    },
    {
      id: 4,
      title: "পপুলার ড্রাগ হাউস",
      location: "ধানমন্ডি, ঢাকা",
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=400",
      category: "ফার্মেসী ও ড্রাগ স্টোর",
      description: "মেডিসিনের মিনিমাম স্টক অ্যালার্ট এবং ব্যাচ ট্র্যাকিং সিস্টেমটি অত্যন্ত কার্যকর।"
    },
    {
      id: 5,
      title: "এলাইট কসমেটিক্স পয়েন্ট",
      location: "জিইসি মোড়, চট্টগ্রাম",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400",
      category: "কসমেটিক্স ও গ্যাজেটস",
      description: "ফায়ারবেস ক্লাউড ব্যাকআপের কারণে কোনো ডাটা হারানোর ভয় সম্পূর্ণ কেটে গেছে।"
    }
  ];

  const [happyClients, setHappyClients] = useState(() => {
    try {
      const saved = localStorage.getItem('saim_happy_clients');
      return saved ? JSON.parse(saved) : defaultClients;
    } catch (e) {
      return defaultClients;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('saim_happy_clients');
        if (saved) setHappyClients(JSON.parse(saved));
      } catch (e) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);`;

if (lp.includes(oldHappyClients)) {
  lp = lp.replace(oldHappyClients, newHappyClients);
  fs.writeFileSync('src/pos-app/components/LandingPage.tsx', lp, 'utf8');
  console.log('Successfully made LandingPage happyClients dynamic!');
} else {
  console.log('Could not find oldHappyClients in LandingPage.tsx');
}
