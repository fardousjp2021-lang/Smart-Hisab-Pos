// @ts-nocheck
import React, { useState, useMemo, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Search, Plus, Calendar, Phone, Package, DollarSign,
  CheckCircle, Clock, XCircle, RotateCcw, Trash2, Edit3, Eye,
  AlertTriangle, FileText, Printer, Bell, MessageSquare, Mail,
  History, Send, Settings, Upload, RotateCw,
  Download, FolderPlus, Copy as CopyIcon, QrCode as QrCodeIcon
} from 'lucide-react';

interface AdvancePayment {
  date: string;
  amount: number;
  note?: string;
  collectedBy?: string;
}

interface AuditLog {
  ts: string;
  action: string;
  by?: string;
  detail?: string;
}

interface AdvanceBooking {
  id: string;
  customerName: string;
  phone: string;
  productModel: string;
  agreedPrice: number;
  advancePaid: number;
  bookingDate: string;
  deliveryDate: string;
  status: 'Pending' | 'Delivered' | 'Refunded' | 'Cancelled';
  notes?: string;
  history?: AdvancePayment[];
  logs?: AuditLog[];
  refundAmount?: number;
  deliveredAt?: string;
  cancelledAt?: string;
  stockReserved?: boolean;
  lastReminderAt?: string;
}

interface Props {
  advanceBookings: AdvanceBooking[];
  setAdvanceBookings: (fn: any) => void;
  lang: 'bn' | 'en';
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  customers?: any[];
  products?: any[];
  setProducts?: (fn: any) => void;
}

const t = (lang: 'bn' | 'en', bn: string, en: string) => (lang === 'bn' ? bn : en);
const money = (n: number) => `৳${(Number(n) || 0).toLocaleString('en-IN')}`;
const nowIso = () => new Date().toISOString();
const fmtTs = (iso?: string) => {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};

const emptyForm: Partial<AdvanceBooking> = {
  customerName: '', phone: '', productModel: '',
  agreedPrice: 0, advancePaid: 0,
  bookingDate: new Date().toISOString().slice(0, 10),
  deliveryDate: '', status: 'Pending', notes: '',
};

export default function AdvanceBookingPanel({
  advanceBookings, setAdvanceBookings, lang, showToast,
  customers = [], products = [], setProducts,
}: Props) {
  const [search, setSearch] = useState('');
  const [debSearch, setDebSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Delivered' | 'Refunded' | 'Cancelled'>('all');
  const [sortKey, setSortKey] = useState<'bookingDate' | 'deliveryDate' | 'agreedPrice'>('bookingDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdvanceBooking | null>(null);
  const [form, setForm] = useState<Partial<AdvanceBooking>>(emptyForm);
  const [formError, setFormError] = useState('');

  const [viewing, setViewing] = useState<AdvanceBooking | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payNote, setPayNote] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdvanceBooking | null>(null);
  const [refundTarget, setRefundTarget] = useState<AdvanceBooking | null>(null);
  const [refundAmount, setRefundAmount] = useState<number | ''>('');
  const [printBooking, setPrintBooking] = useState<AdvanceBooking | null>(null);
  const [logsBooking, setLogsBooking] = useState<AdvanceBooking | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [expiryDays, setExpiryDays] = useState(3); // grace period after delivery date to consider "expired"
  const printRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [overflow, setOverflow] = useState<{ over: boolean; contentH: number; pageH: number; diff: number } | null>(null);

  // ============ Slip Template Settings ============
  const defaultSettings = {
    logoUrl: '',
    shopName: 'Glorious IT — POS',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    footerNote: t(lang, 'ধন্যবাদ! Glorious IT POS System', 'Thank you! Glorious IT POS System'),
    termsNote: '',
    accentColor: '#6366f1',
    showLogo: true,
    showTagline: false,
    showAddress: true,
    showContact: true,
    showBookingDate: true,
    showDeliveryDate: true,
    showCustomerBox: true,
    showProductBox: true,
    showAmountTable: true,
    showPaymentHistory: true,
    showNotes: true,
    showSignatures: true,
    showTerms: false,
    showFooter: true,
    // Paper / margins
    paperSize: 'A4' as 'A4' | 'Letter' | 'A5' | '80mm',
    orientation: 'portrait' as 'portrait' | 'landscape',
    marginTop: 12,
    marginRight: 12,
    marginBottom: 12,
    marginLeft: 12,
    // QR
    showQR: true,
    qrMode: 'id' as 'id' | 'url' | 'details',
    qrUrlBase: '',
    qrSize: 96,
    qrEcLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
    // Preview
    showPageGuide: true,
  };
  const LEGACY_KEY = 'adv_slip_settings_v1';
  const PROFILES_KEY = 'adv_slip_profiles_v1';

  type Profile = { id: string; name: string; settings: any };
  const makeId = () => 'p_' + Math.random().toString(36).slice(2, 9);

  const initialProfiles = (): { activeId: string; profiles: Profile[] } => {
    try {
      const raw = typeof window !== 'undefined' && window.localStorage.getItem(PROFILES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.profiles?.length) return parsed;
      }
      const legacyRaw = typeof window !== 'undefined' && window.localStorage.getItem(LEGACY_KEY);
      const legacy = legacyRaw ? { ...defaultSettings, ...JSON.parse(legacyRaw) } : defaultSettings;
      const id = makeId();
      return { activeId: id, profiles: [{ id, name: t(lang, 'ডিফল্ট', 'Default'), settings: legacy }] };
    } catch {
      const id = makeId();
      return { activeId: id, profiles: [{ id, name: 'Default', settings: defaultSettings }] };
    }
  };

  const [profileStore, setProfileStore] = useState(initialProfiles);
  const activeProfile = profileStore.profiles.find(p => p.id === profileStore.activeId) || profileStore.profiles[0];
  const slipSettings = { ...defaultSettings, ...(activeProfile?.settings || {}) };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profileStore)); } catch { /* ignore */ }
  }, [profileStore]);

  function updateSetting(key: string, value: any) {
    setProfileStore(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === prev.activeId ? { ...p, settings: { ...defaultSettings, ...p.settings, [key]: value } } : p),
    }));
  }
  function resetSettings() {
    setProfileStore(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === prev.activeId ? { ...p, settings: { ...defaultSettings } } : p),
    }));
    showToast(t(lang, 'টেমপ্লেট রিসেট হয়েছে', 'Template reset'), 'info');
  }
  function handleLogoUpload(file: File) {
    if (!file) return;
    if (file.size > 500 * 1024) { showToast(t(lang, 'লোগো ৫০০KB এর নিচে হতে হবে', 'Logo must be under 500KB'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => updateSetting('logoUrl', reader.result);
    reader.readAsDataURL(file);
  }

  // Profile CRUD
  function selectProfile(id: string) { setProfileStore(prev => ({ ...prev, activeId: id })); }
  function addProfile() {
    const name = window.prompt(t(lang, 'নতুন প্রোফাইলের নাম', 'New profile name'), t(lang, 'নতুন টেমপ্লেট', 'New template'));
    if (!name?.trim()) return;
    const id = makeId();
    setProfileStore(prev => ({ activeId: id, profiles: [...prev.profiles, { id, name: name.trim(), settings: { ...defaultSettings } }] }));
    showToast(t(lang, 'প্রোফাইল যোগ হয়েছে', 'Profile added'), 'success');
  }
  function duplicateProfile() {
    if (!activeProfile) return;
    const id = makeId();
    setProfileStore(prev => ({
      activeId: id,
      profiles: [...prev.profiles, { id, name: activeProfile.name + ' (copy)', settings: { ...activeProfile.settings } }],
    }));
    showToast(t(lang, 'প্রোফাইল ডুপ্লিকেট হয়েছে', 'Profile duplicated'), 'success');
  }
  function renameProfile() {
    if (!activeProfile) return;
    const name = window.prompt(t(lang, 'প্রোফাইলের নাম', 'Profile name'), activeProfile.name);
    if (!name?.trim()) return;
    setProfileStore(prev => ({ ...prev, profiles: prev.profiles.map(p => p.id === prev.activeId ? { ...p, name: name.trim() } : p) }));
  }
  function deleteProfile() {
    if (profileStore.profiles.length <= 1) { showToast(t(lang, 'অন্তত একটি প্রোফাইল রাখতে হবে', 'At least one profile required'), 'error'); return; }
    if (!window.confirm(t(lang, 'এই প্রোফাইল মুছবেন?', 'Delete this profile?'))) return;
    setProfileStore(prev => {
      const remaining = prev.profiles.filter(p => p.id !== prev.activeId);
      return { activeId: remaining[0].id, profiles: remaining };
    });
    showToast(t(lang, 'প্রোফাইল মোছা হয়েছে', 'Profile deleted'), 'success');
  }
  function exportProfiles() {
    const blob = new Blob([JSON.stringify(profileStore, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `slip-templates-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t(lang, 'এক্সপোর্ট সম্পন্ন', 'Export complete'), 'success');
  }
  // Schema validation for imported profile settings
  const SETTINGS_SCHEMA: Record<string, string> = {
    shopName: 'string', tagline: 'string', address: 'string', phone: 'string',
    email: 'string', website: 'string', footerNote: 'string', termsNote: 'string',
    accentColor: 'string', logoUrl: 'string',
    paperSize: 'string', orientation: 'string',
    marginTop: 'number', marginRight: 'number', marginBottom: 'number', marginLeft: 'number',
    qrMode: 'string', qrUrlBase: 'string', qrSize: 'number', qrEcLevel: 'string',
    showQR: 'boolean', showLogo: 'boolean', showTagline: 'boolean',
    showAddress: 'boolean', showContact: 'boolean', showBookingDate: 'boolean',
    showDeliveryDate: 'boolean', showCustomerBox: 'boolean', showProductBox: 'boolean',
    showAmountTable: 'boolean', showPaymentHistory: 'boolean', showNotes: 'boolean',
    showSignatures: 'boolean', showTerms: 'boolean', showFooter: 'boolean',
    showPageGuide: 'boolean',
  };
  function validateSettings(s: any): { ok: boolean; errors: string[]; sanitized: any } {
    const errors: string[] = [];
    if (!s || typeof s !== 'object') return { ok: false, errors: ['Not an object'], sanitized: {} };
    const sanitized: any = {};
    for (const [k, v] of Object.entries(s)) {
      const expected = SETTINGS_SCHEMA[k];
      if (!expected) continue; // ignore unknown keys
      if (typeof v !== expected) { errors.push(`${k}: expected ${expected}`); continue; }
      sanitized[k] = v;
    }
    if (sanitized.paperSize && !['A4', 'Letter', 'A5', '80mm'].includes(sanitized.paperSize)) {
      errors.push('paperSize invalid'); delete sanitized.paperSize;
    }
    if (sanitized.qrEcLevel && !['L', 'M', 'Q', 'H'].includes(sanitized.qrEcLevel)) {
      errors.push('qrEcLevel invalid'); delete sanitized.qrEcLevel;
    }
    return { ok: errors.length === 0, errors, sanitized };
  }

  const [importPreview, setImportPreview] = useState<{ profiles: Profile[]; errors: string[] } | null>(null);
  function importProfiles(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: any;
      try { parsed = JSON.parse(String(reader.result)); }
      catch { showToast(t(lang, 'অবৈধ JSON ফাইল', 'Invalid JSON file'), 'error'); return; }
      const raw: any[] = Array.isArray(parsed?.profiles) && parsed.profiles.length
        ? parsed.profiles
        : (parsed && typeof parsed === 'object' ? [{ name: 'Imported', settings: parsed }] : []);
      if (!raw.length) { showToast(t(lang, 'কোনো প্রোফাইল পাওয়া যায়নি', 'No profiles found in file'), 'error'); return; }
      const allErrors: string[] = [];
      const validated: Profile[] = [];
      raw.forEach((p, idx) => {
        const name = (p?.name || `Imported ${idx + 1}`) + '';
        const src = p?.settings ?? p;
        const { errors, sanitized } = validateSettings(src);
        if (errors.length) allErrors.push(`"${name}": ${errors.join(', ')}`);
        validated.push({ id: makeId(), name, settings: { ...defaultSettings, ...sanitized } });
      });
      setImportPreview({ profiles: validated, errors: allErrors });
    };
    reader.readAsText(file);
  }
  function applyImport(mode: 'merge' | 'overwrite') {
    if (!importPreview) return;
    const { profiles: incoming } = importPreview;
    if (mode === 'overwrite') {
      setProfileStore({ activeId: incoming[0].id, profiles: incoming });
      showToast(t(lang, 'ওভাররাইট সম্পন্ন', 'Overwrite complete'), 'success');
    } else {
      // Merge: replace by name-match, append new
      setProfileStore(prev => {
        const byName = new Map(prev.profiles.map(p => [p.name.toLowerCase(), p]));
        const merged = [...prev.profiles];
        let replaced = 0, added = 0;
        for (const inc of incoming) {
          const key = inc.name.toLowerCase();
          if (byName.has(key)) {
            const existing = byName.get(key)!;
            const i = merged.findIndex(p => p.id === existing.id);
            merged[i] = { ...existing, settings: inc.settings };
            replaced++;
          } else {
            merged.push(inc); added++;
          }
        }
        showToast(t(lang, `মার্জ: ${added} যোগ, ${replaced} আপডেট`, `Merged: ${added} added, ${replaced} updated`), 'success');
        return { activeId: incoming[0].id, profiles: merged };
      });
    }
    setImportPreview(null);
  }

  // ============ QR Code ============
  const [qrDataUrl, setQrDataUrl] = useState('');
  const qrPayload = useMemo(() => {
    if (!printBooking) return '';
    if (slipSettings.qrMode === 'url') {
      const base = (slipSettings.qrUrlBase || '').replace(/\/+$/, '');
      return base ? `${base}/${printBooking.id}` : printBooking.id;
    }
    if (slipSettings.qrMode === 'details') {
      return JSON.stringify({
        id: printBooking.id,
        customer: printBooking.customerName,
        phone: printBooking.phone,
        product: printBooking.productModel,
        price: printBooking.agreedPrice,
        advance: printBooking.advancePaid,
        due: (printBooking.agreedPrice || 0) - (printBooking.advancePaid || 0),
        delivery: printBooking.deliveryDate,
      });
    }
    return printBooking.id;
  }, [printBooking, slipSettings.qrMode, slipSettings.qrUrlBase]);

  useEffect(() => {
    if (!printBooking || !slipSettings.showQR || !qrPayload) { setQrDataUrl(''); return; }
    QRCode.toDataURL(qrPayload, { margin: 1, width: 256, errorCorrectionLevel: (slipSettings.qrEcLevel || 'M') as any })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [printBooking, slipSettings.showQR, qrPayload, slipSettings.qrEcLevel]);

  // ============ QR Download ============
  function downloadQRPng() {
    if (!qrDataUrl || !printBooking) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${printBooking.id}.png`;
    a.click();
  }
  async function downloadQRSvg() {
    if (!qrPayload || !printBooking) return;
    try {
      const svg = await QRCode.toString(qrPayload, { type: 'svg', margin: 1, errorCorrectionLevel: (slipSettings.qrEcLevel || 'M') as any });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `qr-${printBooking.id}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast(t(lang, 'SVG তৈরি ব্যর্থ', 'SVG generation failed'), 'error');
    }
  }

  // ============ Overflow detection ============
  useEffect(() => {
    if (!printBooking) { setOverflow(null); return; }
    let raf = 0;
    const measure = () => {
      const el = printRef.current;
      if (!el) return;
      const MM_TO_PX = 96 / 25.4;
      // paperH/paperW resolved later in render; recompute here from settings
      const dims: Record<string, [number, number]> = { A4:[210,297], Letter:[216,279], A5:[148,210], '80mm':[80,200] };
      const d = dims[slipSettings.paperSize] || dims.A4;
      const isLand = slipSettings.orientation === 'landscape' && slipSettings.paperSize !== '80mm';
      const pageHmm = isLand ? d[0] : d[1];
      const pageH = pageHmm * MM_TO_PX;
      const contentH = el.scrollHeight;
      const diff = contentH - pageH;
      setOverflow({ over: diff > 2, contentH: Math.round(contentH), pageH: Math.round(pageH), diff: Math.round(diff) });
    };
    raf = window.requestAnimationFrame(() => window.requestAnimationFrame(measure));
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && printRef.current) ro.observe(printRef.current);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); };
  }, [printBooking, slipSettings, qrDataUrl, zoom]);

  useEffect(() => {
    const id = setTimeout(() => setDebSearch(search.trim().toLowerCase()), 200);
    return () => clearTimeout(id);
  }, [search]);

  const today = new Date().toISOString().slice(0, 10);
  const expiryCutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - expiryDays);
    return d.toISOString().slice(0, 10);
  }, [expiryDays]);

  const stats = useMemo(() => {
    const total = advanceBookings.length;
    const pending = advanceBookings.filter(b => b.status === 'Pending').length;
    const delivered = advanceBookings.filter(b => b.status === 'Delivered').length;
    const refunded = advanceBookings.filter(b => b.status === 'Refunded').length;
    const cancelled = advanceBookings.filter(b => b.status === 'Cancelled').length;
    const advanceHeld = advanceBookings.filter(b => b.status === 'Pending')
      .reduce((s, b) => s + (Number(b.advancePaid) || 0), 0);
    const overdue = advanceBookings.filter(b => b.status === 'Pending' && b.deliveryDate && b.deliveryDate < today).length;
    const expired = advanceBookings.filter(b => b.status === 'Pending' && b.deliveryDate && b.deliveryDate < expiryCutoff).length;
    return { total, pending, delivered, refunded, cancelled, advanceHeld, overdue, expired };
  }, [advanceBookings, today, expiryCutoff]);

  const overdueList = useMemo(
    () => advanceBookings.filter(b => b.status === 'Pending' && b.deliveryDate && b.deliveryDate < today),
    [advanceBookings, today]
  );

  const filtered = useMemo(() => {
    let list = advanceBookings.slice();
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter);
    if (debSearch) {
      list = list.filter(b =>
        (b.customerName || '').toLowerCase().includes(debSearch) ||
        (b.phone || '').toLowerCase().includes(debSearch) ||
        (b.productModel || '').toLowerCase().includes(debSearch) ||
        (b.id || '').toLowerCase().includes(debSearch)
      );
    }
    list.sort((a, b) => {
      const va: any = a[sortKey]; const vb: any = b[sortKey];
      if (va === vb) return 0;
      const cmp = va > vb ? 1 : -1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [advanceBookings, statusFilter, debSearch, sortKey, sortDir]);

  // ============ Stock helpers ============
  function adjustStock(productModel: string, delta: number, reason: string) {
    if (!setProducts || !productModel || !delta) return false;
    let matched = false;
    setProducts((prev: any[]) => prev.map(p => {
      const pname = (p.name || p.sku || '').toString().toLowerCase().trim();
      if (!matched && pname && pname === productModel.toLowerCase().trim()) {
        matched = true;
        const newStock = Math.max(0, (Number(p.stock) || 0) + delta);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    if (matched) {
      showToast(
        t(lang, `স্টক ${delta > 0 ? '+' : ''}${delta} — ${reason}`, `Stock ${delta > 0 ? '+' : ''}${delta} — ${reason}`),
        'info'
      );
    }
    return matched;
  }

  function pushLog(id: string, action: string, detail = '') {
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(b =>
      b.id === id ? { ...b, logs: [...(b.logs || []), { ts: nowIso(), action, detail }] } : b
    ));
  }

  // ============ Form ============
  function resetForm() { setForm(emptyForm); setEditing(null); setFormError(''); }
  function openCreate() { resetForm(); setModalOpen(true); }
  function openEdit(b: AdvanceBooking) { setEditing(b); setForm({ ...b }); setFormError(''); setModalOpen(true); }

  function validate(f: Partial<AdvanceBooking>) {
    if (!f.customerName?.trim()) return t(lang, 'গ্রাহকের নাম লিখুন', 'Customer name required');
    if (!f.phone?.trim() || !/^[\d\-+\s]{7,20}$/.test(f.phone)) return t(lang, 'বৈধ ফোন নম্বর দিন', 'Valid phone required');
    if (!f.productModel?.trim()) return t(lang, 'পণ্যের মডেল লিখুন', 'Product model required');
    const price = Number(f.agreedPrice) || 0;
    const adv = Number(f.advancePaid) || 0;
    if (price <= 0) return t(lang, 'বিক্রয়মূল্য শূন্যের বেশি হতে হবে', 'Price must be > 0');
    if (adv < 0) return t(lang, 'অগ্রিম ঋণাত্মক হতে পারে না', 'Advance cannot be negative');
    if (adv > price) return t(lang, 'অগ্রিম মোট মূল্যের বেশি হতে পারে না', 'Advance cannot exceed price');
    if (!f.bookingDate) return t(lang, 'বুকিং তারিখ দিন', 'Booking date required');
    if (!f.deliveryDate) return t(lang, 'ডেলিভারি তারিখ দিন', 'Delivery date required');
    if (f.deliveryDate < f.bookingDate) return t(lang, 'ডেলিভারি তারিখ বুকিং তারিখের পরে হতে হবে', 'Delivery must be after booking');
    return '';
  }

  function handleSave() {
    const err = validate(form);
    if (err) { setFormError(err); return; }

    if (editing) {
      const changes: string[] = [];
      Object.keys(form).forEach(k => {
        if ((editing as any)[k] !== (form as any)[k] && k !== 'logs' && k !== 'history') {
          changes.push(`${k}: ${(editing as any)[k] ?? '—'} → ${(form as any)[k] ?? '—'}`);
        }
      });
      setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(b => b.id === editing.id ? {
        ...b, ...form,
        logs: [...(b.logs || []), { ts: nowIso(), action: t(lang, 'এডিট', 'Edit'), detail: changes.join(' | ') || '—' }],
      } as AdvanceBooking : b));
      showToast(t(lang, 'বুকিং আপডেট হয়েছে', 'Booking updated'), 'success');
    } else {
      const maxN = advanceBookings.reduce((m, b) => {
        const n = parseInt((b.id || '').replace(/\D/g, ''), 10);
        return isNaN(n) ? m : Math.max(m, n);
      }, 900);
      const id = `ADV-${maxN + 1}`;
      const reserved = adjustStock(form.productModel!, -1, t(lang, 'বুকিং রিজার্ভ', 'Booking reserved'));
      const newBooking: AdvanceBooking = {
        id, ...(emptyForm as any), ...form,
        stockReserved: reserved,
        history: form.advancePaid && Number(form.advancePaid) > 0
          ? [{ date: form.bookingDate!, amount: Number(form.advancePaid), note: t(lang, 'বুকিং অগ্রিম', 'Initial advance') }]
          : [],
        logs: [{ ts: nowIso(), action: t(lang, 'তৈরি', 'Create'), detail: `${form.customerName} • ${form.productModel} • ${money(Number(form.agreedPrice))}` }],
      } as AdvanceBooking;
      setAdvanceBookings((prev: AdvanceBooking[]) => [newBooking, ...prev]);
      showToast(t(lang, 'নতুন বুকিং যোগ হয়েছে', 'Booking created'), 'success');
    }
    setModalOpen(false); resetForm();
  }

  function openPay(b: AdvanceBooking) { setViewing(b); setPayAmount(''); setPayNote(''); setPayOpen(true); }

  function handleAddPayment() {
    if (!viewing) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) { showToast(t(lang, 'বৈধ পরিমাণ দিন', 'Enter valid amount'), 'error'); return; }
    const remaining = (viewing.agreedPrice || 0) - (viewing.advancePaid || 0);
    if (amt > remaining) { showToast(t(lang, 'বকেয়ার চেয়ে বেশি হতে পারে না', 'Cannot exceed remaining'), 'error'); return; }
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(b => {
      if (b.id !== viewing.id) return b;
      const history = [...(b.history || []), { date: new Date().toISOString().slice(0, 10), amount: amt, note: payNote }];
      const logs = [...(b.logs || []), { ts: nowIso(), action: t(lang, 'পেমেন্ট', 'Payment'), detail: `${money(amt)} ${payNote ? '• ' + payNote : ''}` }];
      return { ...b, advancePaid: (b.advancePaid || 0) + amt, history, logs };
    }));
    showToast(t(lang, 'পেমেন্ট যোগ হয়েছে', 'Payment added'), 'success');
    setPayOpen(false);
    setViewing(prev => prev ? { ...prev, advancePaid: (prev.advancePaid || 0) + amt } : prev);
  }

  function markDelivered(b: AdvanceBooking) {
    if (b.status !== 'Pending') return;
    // Stock was already reserved at create; if not reserved, deduct now.
    if (!b.stockReserved) adjustStock(b.productModel, -1, t(lang, 'ডেলিভারি', 'Delivery'));
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(x => x.id === b.id ? {
      ...x, status: 'Delivered', deliveredAt: nowIso(), stockReserved: true,
      logs: [...(x.logs || []), { ts: nowIso(), action: t(lang, 'ডেলিভার্ড', 'Delivered'), detail: '' }],
    } : x));
    showToast(t(lang, 'ডেলিভারি সম্পন্ন', 'Marked delivered'), 'success');
  }

  function cancelBooking(b: AdvanceBooking) {
    if (b.status !== 'Pending') return;
    if (b.stockReserved) adjustStock(b.productModel, +1, t(lang, 'বাতিল — স্টক ফেরত', 'Cancel — stock returned'));
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(x => x.id === b.id ? {
      ...x, status: 'Cancelled', cancelledAt: nowIso(), stockReserved: false,
      logs: [...(x.logs || []), { ts: nowIso(), action: t(lang, 'বাতিল', 'Cancel'), detail: '' }],
    } : x));
    showToast(t(lang, 'বুকিং বাতিল হয়েছে', 'Booking cancelled'), 'info');
  }

  function openRefund(b: AdvanceBooking) { setRefundTarget(b); setRefundAmount(b.advancePaid || 0); }
  function handleRefund() {
    if (!refundTarget) return;
    const amt = Number(refundAmount) || 0;
    if (amt <= 0 || amt > (refundTarget.advancePaid || 0)) {
      showToast(t(lang, 'বৈধ রিফান্ড পরিমাণ দিন', 'Enter valid refund'), 'error'); return;
    }
    if (refundTarget.stockReserved) adjustStock(refundTarget.productModel, +1, t(lang, 'রিফান্ড — স্টক ফেরত', 'Refund — stock returned'));
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(x => x.id === refundTarget.id ? {
      ...x, status: 'Refunded', refundAmount: amt, stockReserved: false,
      logs: [...(x.logs || []), { ts: nowIso(), action: t(lang, 'রিফান্ড', 'Refund'), detail: money(amt) }],
    } : x));
    showToast(t(lang, 'রিফান্ড সম্পন্ন', 'Refund processed'), 'success');
    setRefundTarget(null); setRefundAmount('');
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.stockReserved) adjustStock(deleteTarget.productModel, +1, t(lang, 'ডিলিট — স্টক ফেরত', 'Delete — stock returned'));
    setAdvanceBookings((prev: AdvanceBooking[]) => prev.filter(b => b.id !== deleteTarget.id));
    showToast(t(lang, 'বুকিং মুছে ফেলা হয়েছে', 'Booking deleted'), 'success');
    setDeleteTarget(null);
    if (viewing?.id === deleteTarget.id) setViewing(null);
  }

  // ============ Print ============
  function doPrint() {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) { showToast(t(lang, 'পপ-আপ ব্লকড', 'Popup blocked'), 'error'); return; }
    const paperMap: Record<string, string> = { A4: 'A4', Letter: 'letter', A5: 'A5', '80mm': '80mm auto' };
    const size = paperMap[slipSettings.paperSize] || 'A4';
    const mT = Number(slipSettings.marginTop) || 0;
    const mR = Number(slipSettings.marginRight) || 0;
    const mB = Number(slipSettings.marginBottom) || 0;
    const mL = Number(slipSettings.marginLeft) || 0;
    const orient = slipSettings.orientation === 'landscape' ? ' landscape' : '';
    const isThermal = slipSettings.paperSize === '80mm';
    w.document.write(`
      <html><head><title>Booking ${printBooking?.id}</title>
      <style>
        @page { size: ${size}${orient}; margin: ${mT}mm ${mR}mm ${mB}mm ${mL}mm; }
        body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#0f172a;padding:0;margin:0;${isThermal ? 'width:72mm;font-size:12px;' : ''}}
        h1,h2,h3{margin:0 0 4px}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{padding:8px;border-bottom:1px solid #e2e8f0;text-align:left;font-size:13px}
        .row{display:flex;justify-content:space-between;margin:6px 0;font-size:14px}
        .muted{color:#64748b;font-size:12px}
        .box{border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-top:12px}
        .total{font-weight:700;font-size:16px;color:#0f172a}
        .brand{border-bottom:2px solid ${slipSettings.accentColor};padding-bottom:8px;margin-bottom:12px}
        img{max-width:100%}
      </style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script></body></html>
    `);
    w.document.close();
  }

  // ============ Reminders ============
  function sendReminder(b: AdvanceBooking, channel: 'sms' | 'wa' | 'email' | 'toast') {
    const due = (b.agreedPrice || 0) - (b.advancePaid || 0);
    const msg = t(lang,
      `প্রিয় ${b.customerName}, আপনার বুকিং (${b.id}) — ${b.productModel} এর ডেলিভারি তারিখ ${b.deliveryDate} ছিল। বকেয়া ৳${due}. অনুগ্রহ করে দোকানে যোগাযোগ করুন।`,
      `Dear ${b.customerName}, your booking (${b.id}) for ${b.productModel} was due on ${b.deliveryDate}. Remaining ৳${due}. Please contact the shop.`
    );
    const phone = (b.phone || '').replace(/\D/g, '');
    if (channel === 'sms' && phone) window.open(`sms:${phone}?body=${encodeURIComponent(msg)}`, '_blank');
    else if (channel === 'wa' && phone) window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    else if (channel === 'email') window.open(`mailto:?subject=${encodeURIComponent('Booking Reminder ' + b.id)}&body=${encodeURIComponent(msg)}`, '_blank');
    else showToast(msg, 'info');

    setAdvanceBookings((prev: AdvanceBooking[]) => prev.map(x => x.id === b.id ? {
      ...x, lastReminderAt: nowIso(),
      logs: [...(x.logs || []), { ts: nowIso(), action: t(lang, 'রিমাইন্ডার', 'Reminder'), detail: channel.toUpperCase() }],
    } : x));
    showToast(t(lang, 'রিমাইন্ডার পাঠানো হয়েছে', 'Reminder sent'), 'success');
  }

  function sendAllOverdue(channel: 'sms' | 'wa' | 'email' | 'toast') {
    overdueList.forEach(b => sendReminder(b, channel));
  }

  const paperDims: Record<string, [number, number]> = {
    A4: [210, 297], Letter: [216, 279], A5: [148, 210], '80mm': [80, 200],
  };
  const _pd = paperDims[slipSettings.paperSize] || paperDims.A4;
  const isLandscape = slipSettings.orientation === 'landscape' && slipSettings.paperSize !== '80mm';
  const paperW = isLandscape ? _pd[1] : _pd[0];
  const paperH = isLandscape ? _pd[0] : _pd[1];

  const statusStyles: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700 border-amber-300',
    Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    Refunded: 'bg-rose-100 text-rose-700 border-rose-300',
    Cancelled: 'bg-slate-200 text-slate-600 border-slate-300',
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            {t(lang, 'অগ্রিম বুকিং প্যানেল', 'Advance Booking Panel')}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {t(lang, 'প্রি-অর্ডার, অগ্রিম, স্টক ও রিমাইন্ডার — সব একসাথে', 'Pre-orders, advances, stock & reminders — all-in-one')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stats.overdue > 0 && (
            <button onClick={() => setReminderOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-sm font-medium hover:bg-amber-200">
              <Bell className="w-4 h-4" /> {stats.overdue} {t(lang, 'ওভারডিউ', 'overdue')}
            </button>
          )}
          <button onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
            <Settings className="w-4 h-4" /> {t(lang, 'স্লিপ কাস্টমাইজ', 'Slip Customize')}
          </button>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4" /> {t(lang, 'নতুন বুকিং', 'New Booking')}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard color="indigo" icon={FileText} label={t(lang, 'মোট বুকিং', 'Total')} value={stats.total} />
        <KpiCard color="amber" icon={Clock} label={t(lang, 'পেন্ডিং', 'Pending')} value={stats.pending}
          sub={stats.overdue ? `${stats.overdue} ${t(lang, 'ওভারডিউ', 'overdue')} • ${stats.expired} ${t(lang, 'এক্সপায়ার্ড', 'expired')}` : ''} />
        <KpiCard color="emerald" icon={CheckCircle} label={t(lang, 'ডেলিভার্ড', 'Delivered')} value={stats.delivered} />
        <KpiCard color="rose" icon={DollarSign} label={t(lang, 'হাতে অগ্রিম', 'Advance Held')} value={money(stats.advanceHeld)} />
      </div>

      {/* Overdue Banner */}
      {stats.overdue > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <div>
              <div className="font-semibold text-amber-900">
                {stats.overdue} {t(lang, 'বুকিং ওভারডিউ', 'bookings overdue')}
                {stats.expired > 0 && ` • ${stats.expired} ${t(lang, 'এক্সপায়ার্ড', 'expired')} (${expiryDays}+${t(lang, ' দিন', ' days')})`}
              </div>
              <div className="text-xs text-amber-700">{t(lang, 'গ্রাহককে রিমাইন্ডার পাঠান', 'Send reminders to customers')}</div>
            </div>
          </div>
          <button onClick={() => setReminderOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700">
            {t(lang, 'রিমাইন্ডার সেন্টার', 'Reminder Center')}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t(lang, 'গ্রাহক / ফোন / পণ্য / আইডি…', 'Search…')}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="all">{t(lang, 'সব স্ট্যাটাস', 'All statuses')}</option>
          <option value="Pending">{t(lang, 'পেন্ডিং', 'Pending')}</option>
          <option value="Delivered">{t(lang, 'ডেলিভার্ড', 'Delivered')}</option>
          <option value="Refunded">{t(lang, 'রিফান্ডেড', 'Refunded')}</option>
          <option value="Cancelled">{t(lang, 'বাতিল', 'Cancelled')}</option>
        </select>
        <select value={sortKey} onChange={e => setSortKey(e.target.value as any)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="bookingDate">{t(lang, 'বুকিং তারিখ', 'Booking date')}</option>
          <option value="deliveryDate">{t(lang, 'ডেলিভারি তারিখ', 'Delivery date')}</option>
          <option value="agreedPrice">{t(lang, 'মূল্য', 'Price')}</option>
        </select>
        <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">{t(lang, 'গ্রাহক', 'Customer')}</th>
                <th className="text-left px-4 py-3">{t(lang, 'পণ্য', 'Product')}</th>
                <th className="text-right px-4 py-3">{t(lang, 'মূল্য', 'Price')}</th>
                <th className="text-right px-4 py-3">{t(lang, 'অগ্রিম', 'Advance')}</th>
                <th className="text-right px-4 py-3">{t(lang, 'বকেয়া', 'Due')}</th>
                <th className="text-left px-4 py-3">{t(lang, 'ডেলিভারি', 'Delivery')}</th>
                <th className="text-center px-4 py-3">{t(lang, 'স্ট্যাটাস', 'Status')}</th>
                <th className="text-right px-4 py-3">{t(lang, 'অ্যাকশন', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="text-center py-10 text-slate-400">
                  {t(lang, 'কোনো বুকিং পাওয়া যায়নি', 'No bookings found')}
                </td></tr>
              )}
              {filtered.map(b => {
                const due = (b.agreedPrice || 0) - (b.advancePaid || 0);
                const overdue = b.status === 'Pending' && b.deliveryDate && b.deliveryDate < today;
                const expired = b.status === 'Pending' && b.deliveryDate && b.deliveryDate < expiryCutoff;
                return (
                  <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{b.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{b.customerName}</div>
                      <div className="text-xs text-slate-500">{b.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={b.productModel}>{b.productModel}</td>
                    <td className="px-4 py-3 text-right font-medium">{money(b.agreedPrice)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">{money(b.advancePaid)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${due > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{money(due)}</td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${overdue ? 'text-rose-600 font-medium' : 'text-slate-700'}`}>{b.deliveryDate || '—'}</div>
                      {expired ? (
                        <div className="text-[10px] text-rose-600 flex items-center gap-1 font-semibold"><AlertTriangle className="w-3 h-3" />{t(lang, 'এক্সপায়ার্ড', 'Expired')}</div>
                      ) : overdue ? (
                        <div className="text-[10px] text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{t(lang, 'ওভারডিউ', 'Overdue')}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${statusStyles[b.status] || ''}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title={t(lang, 'বিস্তারিত', 'View')} onClick={() => setViewing(b)} color="slate"><Eye className="w-4 h-4" /></IconBtn>
                        <IconBtn title={t(lang, 'প্রিন্ট/PDF', 'Print/PDF')} onClick={() => setPrintBooking(b)} color="indigo"><Printer className="w-4 h-4" /></IconBtn>
                        <IconBtn title={t(lang, 'হিস্ট্রি', 'History')} onClick={() => setLogsBooking(b)} color="blue"><History className="w-4 h-4" /></IconBtn>
                        {b.status === 'Pending' && (
                          <>
                            <IconBtn title={t(lang, 'পেমেন্ট', 'Payment')} onClick={() => openPay(b)} color="emerald"><DollarSign className="w-4 h-4" /></IconBtn>
                            <IconBtn title={t(lang, 'ডেলিভার্ড', 'Delivered')} onClick={() => markDelivered(b)} color="indigo"><CheckCircle className="w-4 h-4" /></IconBtn>
                            <IconBtn title={t(lang, 'রিফান্ড', 'Refund')} onClick={() => openRefund(b)} color="amber"><RotateCcw className="w-4 h-4" /></IconBtn>
                            <IconBtn title={t(lang, 'বাতিল', 'Cancel')} onClick={() => cancelBooking(b)} color="slate"><XCircle className="w-4 h-4" /></IconBtn>
                          </>
                        )}
                        <IconBtn title={t(lang, 'এডিট', 'Edit')} onClick={() => openEdit(b)} color="blue"><Edit3 className="w-4 h-4" /></IconBtn>
                        <IconBtn title={t(lang, 'ডিলিট', 'Delete')} onClick={() => setDeleteTarget(b)} color="rose"><Trash2 className="w-4 h-4" /></IconBtn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <Modal onClose={() => { setModalOpen(false); resetForm(); }}>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">
              {editing ? t(lang, 'বুকিং এডিট', 'Edit Booking') : t(lang, 'নতুন বুকিং', 'New Booking')}
            </h3>
            <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><XCircle className="w-5 h-5" /></button>
          </div>
          <div className="p-5 space-y-4">
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />{formError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label={t(lang, 'গ্রাহকের নাম *', 'Customer name *')}>
                <input list="adv-customer-names" value={form.customerName || ''} onChange={e => setForm({ ...form, customerName: e.target.value })} className={inputCls} />
                <datalist id="adv-customer-names">{customers.map((c: any) => <option key={c.id} value={c.name} />)}</datalist>
              </Field>
              <Field label={t(lang, 'ফোন *', 'Phone *')}>
                <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputCls} />
              </Field>
              <Field label={t(lang, 'পণ্যের মডেল *', 'Product model *')} className="sm:col-span-2">
                <input list="adv-product-list" value={form.productModel || ''} onChange={e => setForm({ ...form, productModel: e.target.value })} className={inputCls} />
                <datalist id="adv-product-list">{products.map((p: any) => <option key={p.id} value={p.name || p.sku} />)}</datalist>
              </Field>
              <Field label={t(lang, 'বিক্রয়মূল্য *', 'Agreed price *')}>
                <input type="number" value={form.agreedPrice ?? ''} onChange={e => setForm({ ...form, agreedPrice: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label={t(lang, 'অগ্রিম পরিমাণ', 'Advance amount')}>
                <input type="number" value={form.advancePaid ?? ''} onChange={e => setForm({ ...form, advancePaid: Number(e.target.value) })} className={inputCls} />
              </Field>
              <Field label={t(lang, 'বুকিং তারিখ *', 'Booking date *')}>
                <input type="date" value={form.bookingDate || ''} onChange={e => setForm({ ...form, bookingDate: e.target.value })} className={inputCls} />
              </Field>
              <Field label={t(lang, 'ডেলিভারি তারিখ *', 'Delivery date *')}>
                <input type="date" value={form.deliveryDate || ''} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} className={inputCls} />
              </Field>
              <Field label={t(lang, 'নোট', 'Notes')} className="sm:col-span-2">
                <textarea rows={2} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between">
              <span>{t(lang, 'বকেয়া থাকবে', 'Remaining')}: <b className="text-slate-700">{money((Number(form.agreedPrice) || 0) - (Number(form.advancePaid) || 0))}</b></span>
              {!editing && <span className="text-indigo-600">{t(lang, 'নতুন বুকিং তৈরিতে স্টক থেকে ১ ইউনিট রিজার্ভ হবে', 'Creating will reserve 1 unit from stock')}</span>}
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
            <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বাতিল', 'Cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{t(lang, 'সেভ করুন', 'Save')}</button>
          </div>
        </Modal>
      )}

      {/* View / Details */}
      {viewing && !payOpen && (
        <Modal onClose={() => setViewing(null)} wide>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{viewing.customerName}</h3>
              <div className="text-xs text-slate-500 font-mono">{viewing.id}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPrintBooking(viewing)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" title={t(lang, 'প্রিন্ট', 'Print')}><Printer className="w-4 h-4 text-indigo-600" /></button>
              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${statusStyles[viewing.status] || ''}`}>{viewing.status}</span>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <InfoRow icon={Phone} label={t(lang, 'ফোন', 'Phone')} value={viewing.phone} />
            <InfoRow icon={Package} label={t(lang, 'পণ্য', 'Product')} value={viewing.productModel} />
            <InfoRow icon={Calendar} label={t(lang, 'বুকিং তারিখ', 'Booking date')} value={viewing.bookingDate} />
            <InfoRow icon={Calendar} label={t(lang, 'ডেলিভারি তারিখ', 'Delivery date')} value={viewing.deliveryDate} />
            <InfoRow icon={DollarSign} label={t(lang, 'সম্মত মূল্য', 'Agreed price')} value={money(viewing.agreedPrice)} />
            <InfoRow icon={DollarSign} label={t(lang, 'অগ্রিম পরিশোধিত', 'Advance paid')} value={money(viewing.advancePaid)} />
            <InfoRow icon={DollarSign} label={t(lang, 'বকেয়া', 'Remaining')} value={money((viewing.agreedPrice || 0) - (viewing.advancePaid || 0))} />
            {viewing.refundAmount ? <InfoRow icon={RotateCcw} label={t(lang, 'রিফান্ড', 'Refunded')} value={money(viewing.refundAmount)} /> : null}
            {viewing.notes && (
              <div className="md:col-span-2 bg-slate-50 rounded-lg p-3 text-slate-600 text-sm">
                <div className="text-xs font-medium text-slate-500 mb-1">{t(lang, 'নোট', 'Notes')}</div>{viewing.notes}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end bg-slate-50">
            <button onClick={() => setLogsBooking(viewing)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-white inline-flex items-center gap-1"><History className="w-4 h-4" />{t(lang, 'হিস্ট্রি', 'History')}</button>
            {viewing.status === 'Pending' && (
              <>
                <button onClick={() => openPay(viewing)} className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">{t(lang, 'পেমেন্ট যোগ', 'Add payment')}</button>
                <button onClick={() => markDelivered(viewing)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">{t(lang, 'ডেলিভার্ড করুন', 'Mark delivered')}</button>
                <button onClick={() => openRefund(viewing)} className="px-3 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600">{t(lang, 'রিফান্ড', 'Refund')}</button>
                <button onClick={() => cancelBooking(viewing)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-white">{t(lang, 'বাতিল', 'Cancel booking')}</button>
              </>
            )}
            <button onClick={() => setViewing(null)} className="px-3 py-2 rounded-lg border border-slate-300 text-sm hover:bg-white">{t(lang, 'বন্ধ করুন', 'Close')}</button>
          </div>
        </Modal>
      )}

      {/* Payment Modal */}
      {payOpen && viewing && (
        <Modal onClose={() => setPayOpen(false)}>
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">{t(lang, 'অগ্রিম পেমেন্ট যোগ', 'Add Advance Payment')}</h3>
            <div className="text-xs text-slate-500 mt-1">{viewing.customerName} • {viewing.id}</div>
          </div>
          <div className="p-5 space-y-3">
            <div className="text-sm text-slate-600">{t(lang, 'বকেয়া', 'Remaining')}: <span className="font-semibold text-rose-600">{money((viewing.agreedPrice || 0) - (viewing.advancePaid || 0))}</span></div>
            <Field label={t(lang, 'পরিমাণ', 'Amount')}>
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls} />
            </Field>
            <Field label={t(lang, 'নোট', 'Note')}>
              <input value={payNote} onChange={e => setPayNote(e.target.value)} className={inputCls} />
            </Field>
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
            <button onClick={() => setPayOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বাতিল', 'Cancel')}</button>
            <button onClick={handleAddPayment} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">{t(lang, 'যোগ করুন', 'Add')}</button>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      {refundTarget && (
        <Modal onClose={() => setRefundTarget(null)}>
          <div className="p-5 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">{t(lang, 'রিফান্ড প্রসেস', 'Process Refund')}</h3>
            <div className="text-xs text-slate-500 mt-1">{refundTarget.customerName} • {refundTarget.id}</div>
          </div>
          <div className="p-5 space-y-3">
            <div className="text-sm text-slate-600">{t(lang, 'অগ্রিম পরিশোধিত', 'Advance paid')}: <span className="font-semibold">{money(refundTarget.advancePaid)}</span></div>
            <Field label={t(lang, 'রিফান্ড পরিমাণ', 'Refund amount')}>
              <input type="number" value={refundAmount} onChange={e => setRefundAmount(e.target.value === '' ? '' : Number(e.target.value))} className={inputCls} />
            </Field>
            <div className="text-xs text-indigo-600">{t(lang, 'রিফান্ড সম্পন্ন হলে ১ ইউনিট স্টকে ফেরত যাবে', 'Refunding will return 1 unit to stock')}</div>
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
            <button onClick={() => setRefundTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বাতিল', 'Cancel')}</button>
            <button onClick={handleRefund} className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600">{t(lang, 'রিফান্ড করুন', 'Refund')}</button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center"><Trash2 className="w-5 h-5 text-rose-600" /></div>
              <div>
                <div className="font-semibold text-slate-800">{t(lang, 'নিশ্চিতভাবে মুছে ফেলবেন?', 'Delete this booking?')}</div>
                <div className="text-sm text-slate-500">{deleteTarget.customerName} — {deleteTarget.productModel}</div>
                {deleteTarget.stockReserved && (
                  <div className="text-xs text-amber-600 mt-1">{t(lang, 'ডিলিটে ১ ইউনিট স্টকে ফেরত যাবে', 'Deleting will return 1 unit to stock')}</div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
            <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বাতিল', 'Cancel')}</button>
            <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">{t(lang, 'মুছে ফেলুন', 'Delete')}</button>
          </div>
        </Modal>
      )}

      {/* Print Preview Modal */}
      {printBooking && (
        <Modal onClose={() => setPrintBooking(null)} wide>
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Printer className="w-5 h-5" style={{ color: slipSettings.accentColor }} />{t(lang, 'বুকিং স্লিপ প্রিভিউ', 'Booking Slip Preview')}</h3>
            <div className="flex gap-2">
              <button onClick={() => setSettingsOpen(true)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-2"><Settings className="w-4 h-4" />{t(lang, 'কাস্টমাইজ', 'Customize')}</button>
              <button onClick={doPrint} className="px-4 py-2 rounded-lg text-white text-sm inline-flex items-center gap-2" style={{ background: slipSettings.accentColor }}><Printer className="w-4 h-4" />{t(lang, 'প্রিন্ট / PDF', 'Print / PDF')}</button>
              <button onClick={() => setPrintBooking(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বন্ধ', 'Close')}</button>
            </div>
          </div>
          <div className="p-5 bg-slate-100 max-h-[70vh] overflow-auto">
            <div className="max-w-4xl mx-auto space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <div>
                  <b>{slipSettings.paperSize}</b> {slipSettings.orientation === 'landscape' && slipSettings.paperSize !== '80mm' ? '↔' : '↕'} • {paperW}×{paperH}mm • {t(lang, 'মার্জিন', 'Margins')}: {slipSettings.marginTop}/{slipSettings.marginRight}/{slipSettings.marginBottom}/{slipSettings.marginLeft}mm
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1">
                    <span>{t(lang, 'জুম', 'Zoom')}:</span>
                    <select value={zoom} onChange={e => setZoom(Number(e.target.value))} className="px-2 py-1 border border-slate-200 rounded bg-white">
                      <option value={0.5}>50%</option>
                      <option value={0.75}>75%</option>
                      <option value={1}>100%</option>
                      <option value={1.25}>125%</option>
                      <option value={1.5}>150%</option>
                      <option value={2}>200%</option>
                    </select>
                    <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))} className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50" title="-25%">−</button>
                    <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))} className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50" title="+25%">+</button>
                    <button onClick={() => setZoom(1)} className="px-1.5 py-0.5 border border-slate-200 rounded hover:bg-slate-50" title={t(lang, 'রিসেট', 'Reset')}>1×</button>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={!!slipSettings.showPageGuide} onChange={e => updateSetting('showPageGuide', e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" />
                    {t(lang, 'পেজ গাইড', 'Page guide')}
                  </label>
                </div>
              </div>
              {overflow?.over && (
                <div className="bg-rose-50 border border-rose-300 text-rose-700 text-xs px-3 py-2 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{t(lang, 'কন্টেন্ট প্রিন্ট এরিয়া অতিক্রম করছে!', 'Content overflows printable area!')}</div>
                    <div className="mt-0.5">
                      {t(lang, 'কন্টেন্ট উচ্চতা', 'Content height')}: <b>{overflow.contentH}px</b> • {t(lang, 'পেজ উচ্চতা', 'Page height')}: <b>{overflow.pageH}px</b> • {t(lang, 'অতিরিক্ত', 'Overflow')}: <b>+{overflow.diff}px</b>
                    </div>
                    <div className="mt-1 text-rose-600">
                      {t(lang, 'প্রিন্টের আগে মার্জিন কমান, ফিল্ড হাইড করুন, অথবা বড় পেপার সাইজ বেছে নিন।', 'Reduce margins, hide fields, or pick a larger paper size before printing.')}
                    </div>
                  </div>
                </div>
              )}
              {overflow && !overflow.over && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t(lang, 'প্রিন্ট এরিয়ায় ফিট করছে', 'Fits within printable area')} ({overflow.contentH}/{overflow.pageH}px)
                </div>
              )}
              <div className="flex justify-center" style={{ minHeight: `${paperH * zoom}mm` }}>
                <div style={{
                  width: `${paperW}mm`, minHeight: `${paperH}mm`, position: 'relative',
                  background: 'white', boxShadow: '0 4px 20px rgba(15,23,42,0.15)',
                  outline: slipSettings.showPageGuide ? `1px solid ${slipSettings.accentColor}` : '1px solid #e2e8f0',
                  transform: `scale(${zoom})`, transformOrigin: 'top center',
                }}>
                  {slipSettings.showPageGuide && (
                    <>
                      {/* Margin box */}
                      <div style={{
                        position: 'absolute',
                        top: `${slipSettings.marginTop}mm`, right: `${slipSettings.marginRight}mm`,
                        bottom: `${slipSettings.marginBottom}mm`, left: `${slipSettings.marginLeft}mm`,
                        border: `1px dashed ${slipSettings.accentColor}`, opacity: 0.5, pointerEvents: 'none', zIndex: 2,
                      }} />
                      {/* Corner ruler labels */}
                      <div style={{ position: 'absolute', top: 2, left: 4, fontSize: 8, color: slipSettings.accentColor, fontFamily: 'monospace', pointerEvents: 'none', zIndex: 3 }}>0,0</div>
                      <div style={{ position: 'absolute', bottom: 2, right: 4, fontSize: 8, color: slipSettings.accentColor, fontFamily: 'monospace', pointerEvents: 'none', zIndex: 3 }}>{paperW}×{paperH}mm</div>
                      <div style={{ position: 'absolute', top: `${slipSettings.marginTop}mm`, left: `${slipSettings.marginLeft}mm`, transform: 'translate(-100%, -100%)', fontSize: 8, color: slipSettings.accentColor, fontFamily: 'monospace', padding: '0 2px', pointerEvents: 'none', zIndex: 3 }}>↘ safe</div>
                    </>
                  )}
                  <div ref={printRef} className="text-slate-800" style={{
                    padding: `${slipSettings.marginTop}mm ${slipSettings.marginRight}mm ${slipSettings.marginBottom}mm ${slipSettings.marginLeft}mm`,
                    fontSize: slipSettings.paperSize === '80mm' ? 11 : 13,
                    boxSizing: 'border-box', position: 'relative', zIndex: 1,
                  }}>
                    <div className="brand" style={{ borderBottom: `2px solid ${slipSettings.accentColor}`, paddingBottom: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      {slipSettings.showLogo && slipSettings.logoUrl && (
                        <img src={slipSettings.logoUrl} alt="logo" style={{ height: 56, width: 56, objectFit: 'contain', borderRadius: 6 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{slipSettings.shopName}</h1>
                        {slipSettings.showTagline && slipSettings.tagline && (
                          <div style={{ fontSize: 12, color: '#475569' }}>{slipSettings.tagline}</div>
                        )}
                        <div className="muted" style={{ color: '#64748b', fontSize: 12 }}>{t(lang, 'অগ্রিম বুকিং স্লিপ', 'Advance Booking Slip')}</div>
                      </div>
                    </div>
                    {(slipSettings.showAddress || slipSettings.showContact) && (slipSettings.address || slipSettings.phone || slipSettings.email || slipSettings.website) && (
                      <div style={{ fontSize: 11, color: '#475569', marginBottom: 10, lineHeight: 1.5 }}>
                        {slipSettings.showAddress && slipSettings.address && <div>{slipSettings.address}</div>}
                        {slipSettings.showContact && (
                          <div>
                            {slipSettings.phone && <span>📞 {slipSettings.phone}</span>}
                            {slipSettings.email && <span style={{ marginLeft: 10 }}>✉ {slipSettings.email}</span>}
                            {slipSettings.website && <span style={{ marginLeft: 10 }}>🌐 {slipSettings.website}</span>}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="row"><span>{t(lang, 'বুকিং আইডি', 'Booking ID')}:</span><b>{printBooking.id}</b></div>
                    {slipSettings.showBookingDate && <div className="row"><span>{t(lang, 'তারিখ', 'Date')}:</span><b>{printBooking.bookingDate}</b></div>}
                    {slipSettings.showDeliveryDate && <div className="row"><span>{t(lang, 'ডেলিভারি তারিখ', 'Delivery Date')}:</span><b>{printBooking.deliveryDate}</b></div>}
                    {slipSettings.showCustomerBox && (
                      <div className="box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t(lang, 'গ্রাহকের তথ্য', 'Customer Info')}</div>
                        <div className="row"><span>{t(lang, 'নাম', 'Name')}:</span><b>{printBooking.customerName}</b></div>
                        <div className="row"><span>{t(lang, 'ফোন', 'Phone')}:</span><b>{printBooking.phone}</b></div>
                      </div>
                    )}
                    {slipSettings.showProductBox && (
                      <div className="box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t(lang, 'পণ্য', 'Product')}</div>
                        <div>{printBooking.productModel}</div>
                      </div>
                    )}
                    {slipSettings.showAmountTable && (
                      <table>
                        <thead><tr><th>{t(lang, 'বিবরণ', 'Description')}</th><th style={{ textAlign: 'right' }}>{t(lang, 'পরিমাণ', 'Amount')}</th></tr></thead>
                        <tbody>
                          <tr><td>{t(lang, 'সম্মত মূল্য', 'Agreed Price')}</td><td style={{ textAlign: 'right' }}>{money(printBooking.agreedPrice)}</td></tr>
                          <tr><td>{t(lang, 'অগ্রিম পরিশোধিত', 'Advance Paid')}</td><td style={{ textAlign: 'right', color: '#059669' }}>-{money(printBooking.advancePaid)}</td></tr>
                          <tr><td className="total">{t(lang, 'বকেয়া', 'Balance Due')}</td><td className="total" style={{ textAlign: 'right', color: '#dc2626' }}>{money((printBooking.agreedPrice || 0) - (printBooking.advancePaid || 0))}</td></tr>
                        </tbody>
                      </table>
                    )}
                    {slipSettings.showPaymentHistory && printBooking.history && printBooking.history.length > 0 && (
                      <div className="box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t(lang, 'পেমেন্ট হিস্ট্রি', 'Payment History')}</div>
                        <table>
                          <thead><tr><th>{t(lang, 'তারিখ', 'Date')}</th><th>{t(lang, 'নোট', 'Note')}</th><th style={{ textAlign: 'right' }}>{t(lang, 'পরিমাণ', 'Amount')}</th></tr></thead>
                          <tbody>
                            {printBooking.history.map((h, i) => (
                              <tr key={i}><td>{h.date}</td><td>{h.note || '—'}</td><td style={{ textAlign: 'right' }}>{money(h.amount)}</td></tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {slipSettings.showNotes && printBooking.notes && (
                      <div className="box">
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>{t(lang, 'নোট', 'Notes')}</div>
                        <div>{printBooking.notes}</div>
                      </div>
                    )}
                    {slipSettings.showTerms && slipSettings.termsNote && (
                      <div className="box" style={{ background: '#fefce8', borderColor: '#fde68a' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 12 }}>{t(lang, 'শর্তাবলী', 'Terms & Conditions')}</div>
                        <div style={{ fontSize: 11, color: '#78350f', whiteSpace: 'pre-wrap' }}>{slipSettings.termsNote}</div>
                      </div>
                    )}
                    {slipSettings.showQR && qrDataUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, padding: 10, border: '1px dashed #cbd5e1', borderRadius: 8 }}>
                        <img src={qrDataUrl} alt="QR" style={{ width: slipSettings.qrSize, height: slipSettings.qrSize }} />
                        <div style={{ fontSize: 11, color: '#475569' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{t(lang, 'স্ক্যান করে যাচাই করুন', 'Scan to verify')}</div>
                          <div style={{ fontFamily: 'monospace' }}>{printBooking.id}</div>
                          {slipSettings.qrMode === 'url' && slipSettings.qrUrlBase && (
                            <div style={{ marginTop: 2, wordBreak: 'break-all' }}>{slipSettings.qrUrlBase.replace(/\/+$/, '')}/{printBooking.id}</div>
                          )}
                        </div>
                      </div>
                    )}
                    {slipSettings.showSignatures && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, fontSize: 12, color: '#64748b' }}>
                        <div>__________________<br />{t(lang, 'গ্রাহকের স্বাক্ষর', 'Customer Signature')}</div>
                        <div>__________________<br />{t(lang, 'ব্যবস্থাপক স্বাক্ষর', 'Manager Signature')}</div>
                      </div>
                    )}
                    {slipSettings.showFooter && slipSettings.footerNote && (
                      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                        {slipSettings.footerNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {slipSettings.showQR && qrPayload && (
                <div className="bg-white border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <QrCodeIcon className="w-4 h-4 text-indigo-600" />
                      {t(lang, 'QR পেলোড যাচাই করুন', 'Verify QR payload')}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{t(lang, 'মোড', 'Mode')}: {slipSettings.qrMode}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">EC: {slipSettings.qrEcLevel || 'M'}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">{qrPayload.length} chars</span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(qrPayload)
                            .then(() => showToast(t(lang, 'কপি হয়েছে', 'Copied'), 'success'))
                            .catch(() => showToast(t(lang, 'কপি ব্যর্থ', 'Copy failed'), 'error'));
                        }}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                      ><CopyIcon className="w-3 h-3" />{t(lang, 'কপি', 'Copy')}</button>
                      <button
                        onClick={downloadQRPng}
                        disabled={!qrDataUrl}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 disabled:opacity-50"
                        title={t(lang, 'QR PNG ডাউনলোড', 'Download QR as PNG')}
                      ><Download className="w-3 h-3" />PNG</button>
                      <button
                        onClick={downloadQRSvg}
                        disabled={!qrPayload}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 disabled:opacity-50"
                        title={t(lang, 'QR SVG ডাউনলোড', 'Download QR as SVG')}
                      ><Download className="w-3 h-3" />SVG</button>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono bg-slate-50 border border-slate-200 rounded p-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-slate-700">{qrPayload}</pre>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Slip Template Settings */}
      {settingsOpen && (
        <Modal onClose={() => setSettingsOpen(false)} wide>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-600" />{t(lang, 'স্লিপ টেমপ্লেট কাস্টমাইজ', 'Slip Template Customize')}</h3>
            <div className="flex gap-2">
              <button onClick={resetSettings} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-white inline-flex items-center gap-1"><RotateCw className="w-4 h-4" />{t(lang, 'রিসেট', 'Reset')}</button>
              <button onClick={() => setSettingsOpen(false)} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">{t(lang, 'সম্পন্ন', 'Done')}</button>
            </div>
          </div>
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Profiles */}
            <section>
              <SectionTitle>{t(lang, 'টেমপ্লেট প্রোফাইল', 'Template Profiles')}</SectionTitle>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={profileStore.activeId}
                  onChange={e => selectProfile(e.target.value)}
                  className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                >
                  {profileStore.profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button onClick={addProfile} title={t(lang, 'নতুন প্রোফাইল', 'New profile')} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-1"><FolderPlus className="w-4 h-4" />{t(lang, 'নতুন', 'New')}</button>
                <button onClick={duplicateProfile} title={t(lang, 'ডুপ্লিকেট', 'Duplicate')} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-1"><CopyIcon className="w-4 h-4" />{t(lang, 'কপি', 'Copy')}</button>
                <button onClick={renameProfile} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-1"><Edit3 className="w-4 h-4" />{t(lang, 'নাম', 'Rename')}</button>
                <button onClick={deleteProfile} className="px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm hover:bg-rose-50 inline-flex items-center gap-1"><Trash2 className="w-4 h-4" />{t(lang, 'মুছুন', 'Delete')}</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={exportProfiles} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-1"><Download className="w-4 h-4" />{t(lang, 'এক্সপোর্ট (JSON)', 'Export (JSON)')}</button>
                <button onClick={() => importFileRef.current?.click()} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-white inline-flex items-center gap-1"><Upload className="w-4 h-4" />{t(lang, 'ইমপোর্ট', 'Import')}</button>
                <input ref={importFileRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importProfiles(f); e.target.value = ''; }} />
              </div>
            </section>

            {/* Logo */}
            <section>
              <SectionTitle>{t(lang, 'লোগো ও ব্র্যান্ড', 'Logo & Brand')}</SectionTitle>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                  {slipSettings.logoUrl
                    ? <img src={slipSettings.logoUrl} alt="logo" className="w-full h-full object-contain" />
                    : <Package className="w-8 h-8 text-slate-300" />}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {t(lang, 'লোগো আপলোড (PNG/JPG, <500KB)', 'Upload logo (PNG/JPG, <500KB)')}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                  </label>
                  {slipSettings.logoUrl && (
                    <button onClick={() => updateSetting('logoUrl', '')} className="ml-2 text-xs text-rose-600 hover:underline">{t(lang, 'লোগো সরান', 'Remove logo')}</button>
                  )}
                  <ToggleRow label={t(lang, 'লোগো দেখাও', 'Show logo')} checked={slipSettings.showLogo} onChange={v => updateSetting('showLogo', v)} />
                </div>
              </div>
            </section>

            {/* Shop info */}
            <section>
              <SectionTitle>{t(lang, 'দোকানের তথ্য', 'Shop Info')}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={t(lang, 'দোকানের নাম', 'Shop name')}>
                  <input value={slipSettings.shopName} onChange={e => updateSetting('shopName', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ট্যাগলাইন', 'Tagline')}>
                  <input value={slipSettings.tagline} onChange={e => updateSetting('tagline', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ঠিকানা', 'Address')} className="sm:col-span-2">
                  <textarea rows={2} value={slipSettings.address} onChange={e => updateSetting('address', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ফোন', 'Phone')}>
                  <input value={slipSettings.phone} onChange={e => updateSetting('phone', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ইমেইল', 'Email')}>
                  <input value={slipSettings.email} onChange={e => updateSetting('email', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ওয়েবসাইট', 'Website')}>
                  <input value={slipSettings.website} onChange={e => updateSetting('website', e.target.value)} className={inputCls} />
                </Field>
                <Field label={t(lang, 'অ্যাকসেন্ট কালার', 'Accent color')}>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={slipSettings.accentColor} onChange={e => updateSetting('accentColor', e.target.value)} className="h-9 w-16 border border-slate-200 rounded cursor-pointer" />
                    <input value={slipSettings.accentColor} onChange={e => updateSetting('accentColor', e.target.value)} className={inputCls} />
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                <ToggleRow label={t(lang, 'ট্যাগলাইন', 'Tagline')} checked={slipSettings.showTagline} onChange={v => updateSetting('showTagline', v)} />
                <ToggleRow label={t(lang, 'ঠিকানা', 'Address')} checked={slipSettings.showAddress} onChange={v => updateSetting('showAddress', v)} />
                <ToggleRow label={t(lang, 'যোগাযোগ', 'Contact')} checked={slipSettings.showContact} onChange={v => updateSetting('showContact', v)} />
              </div>
            </section>

            {/* Show/hide fields */}
            <section>
              <SectionTitle>{t(lang, 'ফিল্ড শো / হাইড', 'Show / Hide Fields')}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <ToggleRow label={t(lang, 'বুকিং তারিখ', 'Booking date')} checked={slipSettings.showBookingDate} onChange={v => updateSetting('showBookingDate', v)} />
                <ToggleRow label={t(lang, 'ডেলিভারি তারিখ', 'Delivery date')} checked={slipSettings.showDeliveryDate} onChange={v => updateSetting('showDeliveryDate', v)} />
                <ToggleRow label={t(lang, 'গ্রাহক বক্স', 'Customer box')} checked={slipSettings.showCustomerBox} onChange={v => updateSetting('showCustomerBox', v)} />
                <ToggleRow label={t(lang, 'পণ্য বক্স', 'Product box')} checked={slipSettings.showProductBox} onChange={v => updateSetting('showProductBox', v)} />
                <ToggleRow label={t(lang, 'মূল্য টেবিল', 'Amount table')} checked={slipSettings.showAmountTable} onChange={v => updateSetting('showAmountTable', v)} />
                <ToggleRow label={t(lang, 'পেমেন্ট হিস্ট্রি', 'Payment history')} checked={slipSettings.showPaymentHistory} onChange={v => updateSetting('showPaymentHistory', v)} />
                <ToggleRow label={t(lang, 'নোট', 'Notes')} checked={slipSettings.showNotes} onChange={v => updateSetting('showNotes', v)} />
                <ToggleRow label={t(lang, 'স্বাক্ষর', 'Signatures')} checked={slipSettings.showSignatures} onChange={v => updateSetting('showSignatures', v)} />
                <ToggleRow label={t(lang, 'শর্তাবলী', 'Terms')} checked={slipSettings.showTerms} onChange={v => updateSetting('showTerms', v)} />
                <ToggleRow label={t(lang, 'ফুটার নোট', 'Footer note')} checked={slipSettings.showFooter} onChange={v => updateSetting('showFooter', v)} />
              </div>
            </section>

            {/* Paper & Margins */}
            <section>
              <SectionTitle>{t(lang, 'পেপার সাইজ ও মার্জিন', 'Paper Size & Margins')}</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Field label={t(lang, 'পেপার সাইজ', 'Paper size')}>
                  <select value={slipSettings.paperSize} onChange={e => updateSetting('paperSize', e.target.value)} className={inputCls}>
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="A5">A5</option>
                    <option value="80mm">80mm (Thermal)</option>
                  </select>
                </Field>
                <Field label={t(lang, 'ওরিয়েন্টেশন', 'Orientation')}>
                  <select value={slipSettings.orientation} onChange={e => updateSetting('orientation', e.target.value)} className={inputCls}>
                    <option value="portrait">{t(lang, 'পোর্ট্রেট', 'Portrait')}</option>
                    <option value="landscape">{t(lang, 'ল্যান্ডস্কেপ', 'Landscape')}</option>
                  </select>
                </Field>
                <div />
                <Field label={t(lang, 'উপরের মার্জিন (mm)', 'Top margin (mm)')}>
                  <input type="number" min={0} max={50} value={slipSettings.marginTop} onChange={e => updateSetting('marginTop', Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ডান মার্জিন (mm)', 'Right margin (mm)')}>
                  <input type="number" min={0} max={50} value={slipSettings.marginRight} onChange={e => updateSetting('marginRight', Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label={t(lang, 'নিচের মার্জিন (mm)', 'Bottom margin (mm)')}>
                  <input type="number" min={0} max={50} value={slipSettings.marginBottom} onChange={e => updateSetting('marginBottom', Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label={t(lang, 'বাম মার্জিন (mm)', 'Left margin (mm)')}>
                  <input type="number" min={0} max={50} value={slipSettings.marginLeft} onChange={e => updateSetting('marginLeft', Number(e.target.value))} className={inputCls} />
                </Field>
              </div>
            </section>

            {/* QR Code */}
            <section>
              <SectionTitle>{t(lang, 'QR কোড', 'QR Code')}</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ToggleRow label={t(lang, 'QR দেখাও', 'Show QR')} checked={slipSettings.showQR} onChange={v => updateSetting('showQR', v)} />
                <Field label={t(lang, 'QR কনটেন্ট', 'QR content')}>
                  <select value={slipSettings.qrMode} onChange={e => updateSetting('qrMode', e.target.value)} className={inputCls}>
                    <option value="id">{t(lang, 'শুধু বুকিং আইডি', 'Booking ID only')}</option>
                    <option value="url">{t(lang, 'ট্র্যাকিং লিঙ্ক', 'Tracking link')}</option>
                    <option value="details">{t(lang, 'সম্পূর্ণ ডিটেইলস (JSON)', 'Full details (JSON)')}</option>
                  </select>
                </Field>
                <Field label={t(lang, 'QR সাইজ (px)', 'QR size (px)')}>
                  <input type="number" min={48} max={200} value={slipSettings.qrSize} onChange={e => updateSetting('qrSize', Number(e.target.value))} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ত্রুটি সংশোধন স্তর', 'Error correction level')}>
                  <select value={slipSettings.qrEcLevel || 'M'} onChange={e => updateSetting('qrEcLevel', e.target.value)} className={inputCls}>
                    <option value="L">L — {t(lang, 'নিম্ন (~7%)', 'Low (~7%)')}</option>
                    <option value="M">M — {t(lang, 'মাঝারি (~15%)', 'Medium (~15%)')}</option>
                    <option value="Q">Q — {t(lang, 'কোয়ার্টাইল (~25%)', 'Quartile (~25%)')}</option>
                    <option value="H">H — {t(lang, 'উচ্চ (~30%) — ছোট প্রিন্টে ভালো', 'High (~30%) — best for small prints')}</option>
                  </select>
                </Field>
                {slipSettings.qrMode === 'url' && (
                  <Field label={t(lang, 'URL বেস (যেমন https://myshop.com/b)', 'URL base (e.g. https://myshop.com/b)')} className="sm:col-span-3">
                    <input value={slipSettings.qrUrlBase} onChange={e => updateSetting('qrUrlBase', e.target.value)} placeholder="https://…" className={inputCls} />
                  </Field>
                )}
              </div>
            </section>

            {/* Terms & Footer */}
            <section>
              <SectionTitle>{t(lang, 'শর্তাবলী ও ফুটার নোট', 'Terms & Footer Note')}</SectionTitle>
              <div className="space-y-3">
                <Field label={t(lang, 'শর্তাবলী (Terms)', 'Terms & conditions')}>
                  <textarea rows={3} value={slipSettings.termsNote} onChange={e => updateSetting('termsNote', e.target.value)} placeholder={t(lang, 'যেমন: অগ্রিম অ-ফেরতযোগ্য, ৭ দিনের মধ্যে ডেলিভারি নিতে হবে…', 'e.g. Advance non-refundable, delivery within 7 days…')} className={inputCls} />
                </Field>
                <Field label={t(lang, 'ফুটার নোট', 'Footer note')}>
                  <textarea rows={2} value={slipSettings.footerNote} onChange={e => updateSetting('footerNote', e.target.value)} className={inputCls} />
                </Field>
              </div>
            </section>
          </div>
        </Modal>
      )}

      {/* Import Preview / Merge or Overwrite */}
      {importPreview && (
        <Modal onClose={() => setImportPreview(null)} wide>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              {t(lang, 'ইমপোর্ট প্রিভিউ', 'Import Preview')}
            </h3>
            <div className="text-xs text-slate-500">
              {importPreview.profiles.length} {t(lang, 'প্রোফাইল', 'profiles')} • {importPreview.errors.length === 0
                ? <span className="text-emerald-600 font-medium">{t(lang, 'ভ্যালিড', 'Valid')}</span>
                : <span className="text-amber-600 font-medium">{importPreview.errors.length} {t(lang, 'সতর্কতা', 'warnings')}</span>}
            </div>
          </div>
          <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
            {importPreview.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {t(lang, 'স্কিমা সতর্কতা (অজানা/অবৈধ ফিল্ড উপেক্ষা করা হবে)', 'Schema warnings (unknown/invalid fields will be ignored)')}
                </div>
                <ul className="text-xs text-amber-700 list-disc pl-5 space-y-0.5">
                  {importPreview.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                  {importPreview.errors.length > 10 && <li>… +{importPreview.errors.length - 10}</li>}
                </ul>
              </div>
            )}
            <div className="border border-slate-200 rounded-lg divide-y">
              {importPreview.profiles.map((p, i) => {
                const dup = profileStore.profiles.find(x => x.name.toLowerCase() === p.name.toLowerCase());
                return (
                  <div key={i} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium text-slate-800">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.settings.paperSize} • {t(lang, 'শপ', 'Shop')}: {p.settings.shopName || '—'}
                      </div>
                    </div>
                    {dup ? (
                      <span className="text-xs px-2 py-1 rounded bg-amber-100 text-amber-700 border border-amber-200">{t(lang, 'একই নাম আছে', 'Name exists')}</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">{t(lang, 'নতুন', 'New')}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
              <div><b>{t(lang, 'মার্জ', 'Merge')}:</b> {t(lang, 'একই নামের প্রোফাইলের সেটিংস প্রতিস্থাপন হবে, নতুনগুলো যোগ হবে।', 'Profiles with matching names will have their settings replaced; new ones will be appended.')}</div>
              <div><b>{t(lang, 'ওভাররাইট', 'Overwrite')}:</b> <span className="text-rose-600">{t(lang, 'বর্তমান সব প্রোফাইল মুছে যাবে', 'All current profiles will be removed')}</span> {t(lang, 'এবং শুধু ইমপোর্ট হওয়াগুলো থাকবে।', 'and only the imported ones will remain.')}</div>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
            <button onClick={() => setImportPreview(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বাতিল', 'Cancel')}</button>
            <button onClick={() => applyImport('merge')} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">{t(lang, 'মার্জ করুন', 'Merge')}</button>
            <button onClick={() => { if (window.confirm(t(lang, 'সব বর্তমান প্রোফাইল মুছে ওভাররাইট করবেন?', 'Delete all current profiles and overwrite?'))) applyImport('overwrite'); }} className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">{t(lang, 'ওভাররাইট', 'Overwrite')}</button>
          </div>
        </Modal>
      )}


      {/* Reminder Center */}
      {reminderOpen && (
        <Modal onClose={() => setReminderOpen(false)} wide>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-600" />{t(lang, 'রিমাইন্ডার সেন্টার', 'Reminder Center')}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {t(lang, 'এক্সপায়ার্ড গ্রেস', 'Expired grace')}:
              <input type="number" min={1} max={30} value={expiryDays} onChange={e => setExpiryDays(Math.max(1, Number(e.target.value) || 1))} className="w-16 px-2 py-1 border border-slate-200 rounded text-sm" />
              {t(lang, 'দিন', 'days')}
            </div>
          </div>
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-2 bg-slate-50">
            <span className="text-sm text-slate-600 mr-2 self-center">{t(lang, 'সবাইকে পাঠান:', 'Send all:')}</span>
            <button onClick={() => sendAllOverdue('sms')} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />SMS</button>
            <button onClick={() => sendAllOverdue('wa')} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 inline-flex items-center gap-1"><Send className="w-3 h-3" />WhatsApp</button>
            <button onClick={() => sendAllOverdue('email')} className="px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs hover:bg-slate-800 inline-flex items-center gap-1"><Mail className="w-3 h-3" />Email</button>
            <button onClick={() => sendAllOverdue('toast')} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs hover:bg-amber-600 inline-flex items-center gap-1"><Bell className="w-3 h-3" />{t(lang, 'ইন-অ্যাপ', 'In-app')}</button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {overdueList.length === 0 ? (
              <div className="text-center py-10 text-slate-400">{t(lang, 'কোনো ওভারডিউ বুকিং নেই', 'No overdue bookings')}</div>
            ) : (
              <div className="space-y-2">
                {overdueList.map(b => {
                  const isExpired = b.deliveryDate && b.deliveryDate < expiryCutoff;
                  return (
                    <div key={b.id} className={`border rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 ${isExpired ? 'border-rose-300 bg-rose-50' : 'border-amber-300 bg-amber-50'}`}>
                      <div className="flex-1 min-w-[200px]">
                        <div className="font-medium text-slate-800">{b.customerName} <span className="text-xs text-slate-500 font-mono">({b.id})</span></div>
                        <div className="text-xs text-slate-600">{b.productModel}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {t(lang, 'ডেলিভারি', 'Delivery')}: <b>{b.deliveryDate}</b> • {t(lang, 'বকেয়া', 'Due')}: <b className="text-rose-600">{money((b.agreedPrice || 0) - (b.advancePaid || 0))}</b>
                          {b.lastReminderAt && <span className="ml-2 text-slate-400">• {t(lang, 'শেষ রিমাইন্ডার', 'Last')}: {fmtTs(b.lastReminderAt)}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <IconBtn title="SMS" color="blue" onClick={() => sendReminder(b, 'sms')}><MessageSquare className="w-4 h-4" /></IconBtn>
                        <IconBtn title="WhatsApp" color="emerald" onClick={() => sendReminder(b, 'wa')}><Send className="w-4 h-4" /></IconBtn>
                        <IconBtn title="Email" color="slate" onClick={() => sendReminder(b, 'email')}><Mail className="w-4 h-4" /></IconBtn>
                        <IconBtn title={t(lang, 'ইন-অ্যাপ', 'In-app')} color="amber" onClick={() => sendReminder(b, 'toast')}><Bell className="w-4 h-4" /></IconBtn>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
            <button onClick={() => setReminderOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বন্ধ', 'Close')}</button>
          </div>
        </Modal>
      )}

      {/* Audit Log / History Modal */}
      {logsBooking && (
        <Modal onClose={() => setLogsBooking(null)} wide>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-blue-600" />{t(lang, 'অডিট লগ / চেঞ্জ হিস্ট্রি', 'Audit Log / Change History')}</h3>
              <div className="text-xs text-slate-500 mt-1">{logsBooking.customerName} • {logsBooking.id}</div>
            </div>
          </div>
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {(logsBooking.logs || []).length === 0 ? (
              <div className="text-center py-10 text-slate-400">{t(lang, 'কোনো লগ নেই', 'No logs yet')}</div>
            ) : (
              <ol className="relative border-l-2 border-indigo-200 ml-3 space-y-4">
                {(logsBooking.logs || []).slice().reverse().map((l, i) => (
                  <li key={i} className="ml-4">
                    <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-800 text-sm">{l.action}</div>
                        <div className="text-xs text-slate-500">{fmtTs(l.ts)}</div>
                      </div>
                      {l.detail && <div className="text-xs text-slate-600 mt-1 break-words">{l.detail}</div>}
                      {l.by && <div className="text-[10px] text-slate-400 mt-1">by {l.by}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
            <button onClick={() => setLogsBooking(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white">{t(lang, 'বন্ধ', 'Close')}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200';

function SectionTitle({ children }: any) {
  return <div className="text-sm font-semibold text-slate-700 mb-2 pb-1 border-b border-slate-100">{children}</div>;
}

function ToggleRow({ label, checked, onChange }: any) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer px-2 py-1.5 rounded hover:bg-slate-50">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
      {label}
    </label>
  );
}

function Field({ label, children, className = '' }: any) {
  return (
    <label className={`block ${className}`}>
      <div className="text-xs font-medium text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

function IconBtn({ children, color = 'slate', onClick, title }: any) {
  const colors: Record<string, string> = {
    slate: 'text-slate-500 hover:bg-slate-100',
    emerald: 'text-emerald-600 hover:bg-emerald-50',
    indigo: 'text-indigo-600 hover:bg-indigo-50',
    amber: 'text-amber-600 hover:bg-amber-50',
    rose: 'text-rose-600 hover:bg-rose-50',
    blue: 'text-blue-600 hover:bg-blue-50',
  };
  return <button onClick={onClick} title={title} className={`p-1.5 rounded-md ${colors[color]}`}>{children}</button>;
}

function KpiCard({ icon: Icon, label, value, sub, color = 'indigo' }: any) {
  const colors: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    amber: 'from-amber-500 to-amber-600',
    emerald: 'from-emerald-500 to-emerald-600',
    rose: 'from-rose-500 to-rose-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-lg font-bold text-slate-800">{value}</div>
          {sub ? <div className="text-[10px] text-rose-500 font-medium">{sub}</div> : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
      </div>
    </div>
  );
}

function Modal({ children, onClose, wide }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
