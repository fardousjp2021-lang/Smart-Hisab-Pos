import os
import shutil
import zipfile

base_dir = r"D:\SOFT\AI\course\SMART HISAB\SMART HISAB"
target_folder = os.path.join(base_dir, "SmartHisab_Facebook_Ad_Package")

if not os.path.exists(target_folder):
    os.makedirs(target_folder, exist_ok=True)

img1_src = r"C:\Users\FARDOUS\.gemini\antigravity\brain\17b59070-2666-43ac-8016-eedcd38f5b01\smarthsab_pos_fb_ad1_1787213936293.jpg"
img2_src = r"C:\Users\FARDOUS\.gemini\antigravity\brain\17b59070-2666-43ac-8016-eedcd38f5b01\smarthsab_pos_fb_ad2_1787214015775.jpg"

shutil.copy(img1_src, os.path.join(target_folder, "SmartHisab_FB_Ad_Banner_1.jpg"))
shutil.copy(img2_src, os.path.join(target_folder, "SmartHisab_FB_Ad_Banner_2.jpg"))

caption_text = """🔥 আর নয় খাতা-কলমের জটিল হিসেব! এবার আপনার ব্যবসাকে করুন ১০০% ডিজিটাল ও আধুনিক! 🚀

আপনার দোকান বা ব্যবসার দৈনিক বিক্রি, স্টক এবং কাস্টমারের বকেয়া হিসেব রাখতে চিন্তিত? 
নিয়ে এলো SmartHisab POS — ক্লাউড ভিত্তিক আধুনিক বিজনেস ম্যানেজমেন্ট ও পস সফটওয়্যার! 🏬💻

✨ সফটওয়্যারের সেরা বৈশিষ্ট্যসমূহ (Key Features):
✅ দ্রুত ও সহজ POS মেমো প্রিন্টিং (থার্মাল ও A4 পেপার সাপোর্ট) 🧾
✅ ক্যামেরা ও বারকোড স্ক্যানার দিয়ে আইটেম বিক্রির সুবিধা 📲
✅ পণ্য কমলে অটো লো-স্টোক রেড অ্যালার্ট (Low Stock Alert) ⚠️
✅ কাস্টমার ও সাপ্লায়ারের বকেয়া/খাতার নিখুঁত হিসেব 👥
✅ দিন/মাসিক লাভ-ক্ষতি ও অটোমেটিক গ্রাফিকাল রিপোর্ট 📊
✅ কিস্তি (Installment) ও অ্যাডভান্স বুকিং ম্যানেজমেন্ট 💳
✅ অফলাইন সাপোর্ট — ইন্টারনেট ছাড়াই কেনাবেচা সচল থাকবে ⚡
✅ সম্পূর্ণ বাংলায় ব্যবহারের সহজ ইউজার ইন্টারফেস 🌐

🎁 বিশেষ সুবিধা:
মোবাইল, ল্যাপটপ বা কম্পিউটার — যেকোনো ডিভাইসেই স্মুথলি চলবে! 
কোনো ইন্সটলেশনের ঝামেলা নেই, ব্রাউজারেই সরাসরি ব্যবহার করুন।

👉 আজই ফ্রিতে চেষ্টা করে দেখুন: https://smarthisab-pos.vercel.app

📞 হটলাইন / ইমেইল সাপোর্ট:
📲 কল বা হোয়াটসঅ্যাপ: 01747-046052 (Fardous Al-Amin)
✉️ ইমেইল: info.fardousit@gmail.com
⏰ হেল্পডেস্ক সময়: সকাল ১০টা - রাত ৯টা (প্রতিদিন)

#SmartHisabPOS #POS_Software #BusinessERP #ShopManagement #SmartPos #FardousIT
"""

with open(os.path.join(target_folder, "Facebook_Ad_Caption.txt"), "w", encoding="utf-8") as f:
    f.write(caption_text)

zip_file_path = os.path.join(base_dir, "SmartHisab_Facebook_Ad_Package.zip")
with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(target_folder):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, arcname=file)

print("ZIP created successfully at:", zip_file_path)
