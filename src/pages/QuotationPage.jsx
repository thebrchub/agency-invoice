import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, Printer, ImageIcon, Briefcase, Save, UserPlus, X, Users,
  ChevronLeft, ChevronDown, Moon, Sun, Signature, Scan, CheckCircle,
  Download, MessageSquare, AlertCircle, Calendar, Target, ShieldCheck,
  Award, Clock, ChevronRight, Palette, Edit3, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* --- CONSTANTS --- */
const STORAGE_KEY = 'quotation_builder_v11_custom_color';
const CLIENTS_KEY = 'quotation_clients_v9';
const THEME_PREF_KEY = 'quotation_theme_pref_v9';

const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
};

const LEGAL_SNIPPETS = {
  ownership: "Ownership: Upon full payment, all final design assets and source code shall be the exclusive property of the Client. Third-party libraries remain under their respective licenses.",
  warranty: "Warranty: We provide a 30-day bug-fix support period commencing from the date of final delivery. Ongoing maintenance is available via separate agreement.",
  payment: "Payment Terms: 50% advance to commence work, 50% prior to final handover.",
  validity: "Validity: This quotation is valid for 15 days from the date of issue."
};

const DEFAULT_DATA = {
  id: 'new',
  quotationNumber: 'QT-2024-001',
  date: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  currencyCode: 'INR',
  companyName: 'Acme Solutions',
  companyAddress: '',
  companyEmail: '',
  companyPhone: '',
  clientName: '',
  clientAddress: '',
  brandColor: '#4f46e5',
  projectTitle: '',
  projectDescription: '',
  projectGoals: '',
  companyHighlights: '',
  timelineTitle: 'Estimated Timeline',
  timeline: [{ id: 1, phase: 'Phase 1: Planning & Design', duration: '1 Week' }],
  isGstEnabled: true,
  isIndianClient: true,
  items: [{ id: 1, description: 'Consultation Fee', quantity: 1, price: 5000 }],
  discountAmount: 0,
  gstRate: 18,
  paymentMethod: 'Bank',
  bankName: '',
  accountNo: '',
  ifscCode: '',
  upiId: '',
  showSignatory: true,
  signatoryName: '',
  notes: '',
  logo: null,
  signature: null,
  qrCode: null,
  annexure: { show: false, title: 'Scope of Work', content: '' }
};

/* --- REUSABLE COMPONENTS --- */

const RichTextarea = ({ value, onChange, placeholder, rows = 3, className }) => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = value || '';
      const newVal = val.substring(0, start) + "**" + val.substring(start, end) + "**" + val.substring(end);
      onChange({ target: { value: newVal } });
      setTimeout(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = end + 2;
      }, 0);
    }
  };

  return (
    <textarea
      className={className}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
    />
  );
};

const RichTextRenderer = ({ text, className }) => {
  if (!text) return null;
  return (
    <div className={`break-words whitespace-pre-wrap ${className}`}>
      {text.split('\n').map((line, i) => (
        <p key={i} className="min-h-[1em] mb-1 leading-relaxed">
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      ))}
    </div>
  );
};

const NewClientModal = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Add New Client</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-700" /></button>
        </div>
        <input autoFocus className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900" placeholder="Client Name" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => { if (name.trim()) onSave(name); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Client</button>
        </div>
      </div>
    </div>
  );
};

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 no-print">
      {isOpen ? (
        <div className="bg-white p-4 rounded-xl shadow-2xl border w-72 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-xs uppercase text-slate-500">Feedback</h4>
            <button onClick={() => setIsOpen(false)}><X size={14} /></button>
          </div>
          <p className="text-xs text-slate-600 mb-3">Found a bug or have a suggestion?</p>
          <textarea className="w-full border rounded p-2 text-xs mb-2" rows={3} placeholder="Tell us..."></textarea>
          <button onClick={() => setIsOpen(false)} className="w-full bg-slate-900 text-white py-1.5 rounded text-xs font-bold">Send</button>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-slate-900 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform">
          <MessageSquare size={20} />
        </button>
      )}
    </div>
  );
};

/* --- MAIN QUOTATION COMPONENT --- */

const QuotationGenerator = () => {
  // Mobile Responsiveness State
  const [activeMobileTab, setActiveMobileTab] = useState('edit'); // 'edit' or 'preview'
  const navigate = useNavigate();

  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : {};
      let initialColor = DEFAULT_DATA.brandColor;
      if (parsed.selectedTheme && !parsed.brandColor) {
        if (parsed.selectedTheme === 'minimal') initialColor = '#1e293b';
        else if (parsed.selectedTheme === 'emerald') initialColor = '#047857';
        else if (parsed.selectedTheme === 'rose') initialColor = '#be123c';
        else initialColor = '#4338ca';
      }
      return {
        ...DEFAULT_DATA,
        ...parsed,
        brandColor: parsed.brandColor || initialColor,
        annexure: { ...DEFAULT_DATA.annexure, ...(parsed.annexure || {}) },
        timeline: parsed.timeline || DEFAULT_DATA.timeline,
        timelineTitle: parsed.timelineTitle || DEFAULT_DATA.timelineTitle
      };
    } catch { return DEFAULT_DATA; }
  });

  const [savedClients, setSavedClients] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]'); } catch { return []; }
  });

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem(THEME_PREF_KEY) === 'dark'; } catch { return false; }
  });

  const [openSections, setOpenSections] = useState({
    branding: false, details: false, strategy: true, items: true, payment: false, annexure: false
  });
  const [showClientModal, setShowClientModal] = useState(false);
  const [saveMsg, setSaveMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setErrorMsg(null);
    } catch (e) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        setErrorMsg("Storage Limit Reached! Use smaller images.");
      }
    }
  }, [data]);

  useEffect(() => { localStorage.setItem(CLIENTS_KEY, JSON.stringify(savedClients)); }, [savedClients]);
  useEffect(() => { localStorage.setItem(THEME_PREF_KEY, isDark ? 'dark' : 'light'); }, [isDark]);

  const updateField = (field, value) => setData(p => ({ ...p, [field]: value }));
  const toggleSection = (key) => setOpenSections(p => ({ ...p, [key]: !p[key] }));

  const handleImage = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("Image too large. Max size 2MB."); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.src = ev.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_SIZE = 500;
          let width = img.width; let height = img.height;
          if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } }
          else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
          canvas.width = width; canvas.height = height;
          ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);
          updateField(field, canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => setData(p => ({ ...p, items: [...p.items, { id: Date.now(), description: '', quantity: 1, price: 0 }] }));
  const removeItem = (id) => setData(p => ({ ...p, items: p.items.filter(i => i.id !== id) }));
  const updateItem = (id, field, value) => {
    setData(p => ({ ...p, items: p.items.map(i => i.id === id ? { ...i, [field]: field === 'description' ? value : Number(value) } : i) }));
  };

  const addTimelineItem = () => setData(p => ({ ...p, timeline: [...(p.timeline || []), { id: Date.now(), phase: '', duration: '' }] }));
  const removeTimelineItem = (id) => setData(p => ({ ...p, timeline: p.timeline.filter(t => t.id !== id) }));
  const updateTimelineItem = (id, field, value) => {
    setData(p => ({ ...p, timeline: p.timeline.map(t => t.id === id ? { ...t, [field]: value } : t) }));
  };

  const addClient = (name) => {
    setSavedClients(p => [...p, { id: Date.now(), name, address: '' }]);
    updateField('clientName', name);
    setShowClientModal(false);
  };

  const loadClient = (clientId) => {
    const client = savedClients.find(c => c.id == clientId);
    if (client) setData(p => ({ ...p, clientName: client.name, clientAddress: client.address || '' }));
  };

  const handleSave = () => {
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2000);
  };

  const insertLegalSnippet = (snippetKey) => {
    const snippet = LEGAL_SNIPPETS[snippetKey];
    setData(prev => ({
      ...prev,
      notes: prev.notes ? prev.notes + '\n\n' + snippet : snippet
    }));
  };

  const handleBack = () => {
      // Check if we can use React Router, otherwise fallback
      if (navigate) {
          navigate('/');
      } else {
          window.location.href = '/';
      }
  };

  const currencySymbol = CURRENCIES[data.currencyCode]?.symbol || '₹';
  const subtotal = data.items.reduce((s, i) => s + (i.quantity * i.price), 0);
  const totalAfterDiscount = subtotal - data.discountAmount;
  const taxAmount = data.isGstEnabled ? (totalAfterDiscount * data.gstRate) / 100 : 0;
  const total = totalAfterDiscount + taxAmount;
  const fmt = (n) => `${currencySymbol} ${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const inputClass = `w-full p-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-800'}`;
  const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  const sectionClass = `p-5 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`;
  const headerTextColor = '#ffffff';

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500/30 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

      {/* MOBILE TAB NAVIGATION (VISIBLE ONLY ON MOBILE) */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-[60] flex items-center justify-around py-2 px-2 no-print ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
        <button
          onClick={() => setActiveMobileTab('edit')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full ${activeMobileTab === 'edit' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}
        >
          <Edit3 size={18} />
          <span className="text-[10px] font-bold uppercase">Editor</span>
        </button>
        <button
          onClick={() => setActiveMobileTab('preview')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg w-full ${activeMobileTab === 'preview' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}
        >
          <Eye size={18} />
          <span className="text-[10px] font-bold uppercase">Preview</span>
        </button>
      </div>

      {/* FIXED SIDEBAR (EDITOR) */}
      <div className={`
        fixed top-0 left-0 h-screen flex flex-col border-r z-40 bg-inherit transition-transform duration-300 no-print
        ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}
        w-full md:w-[480px]
        ${activeMobileTab === 'edit' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="px-6 py-4 border-b flex justify-between items-center shrink-0 z-10 bg-inherit">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className={`flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <ChevronLeft size={16} className="text-indigo-500" />
              <span className="text-xs font-bold">Back</span>
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Builder</p>
              <h2 className="text-lg font-bold flex items-center gap-2"> Quotation</h2>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {saveMsg && <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-pulse"><CheckCircle size={12} /> Saved</span>}
            <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full border ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 text-xs font-bold flex items-center gap-2 shrink-0">
            <AlertCircle size={14} /> {errorMsg}
          </div>
        )}

        {/* SCROLLABLE FORM */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin pb-24 md:pb-6">

          {/* CLIENTS */}
          <div className={`p-4 rounded-xl border border-dashed ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2"><Users size={14} /> Client Management</h3>
            <div className="flex gap-2">
              <select onChange={(e) => loadClient(e.target.value)} className={inputClass}>
                <option value="">-- Load Saved Client --</option>
                {savedClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <button onClick={() => setShowClientModal(true)} className="bg-indigo-600 text-white px-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0"><UserPlus size={14} /> New</button>
            </div>
          </div>

          {/* 1. IDENTITY */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('branding')} className="w-full flex justify-between items-center"><div className="text-left"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">1. Identity</p><h4 className="font-semibold text-sm">Branding & Company</h4></div><ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.branding ? 'rotate-180' : ''}`} /></button>
            {openSections.branding && (
              <div className="mt-5 space-y-5 animate-fade-in-down">
                <div className="flex gap-4">
                  <div className={`relative w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 group transition-colors hover:border-indigo-500 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}>
                    {data.logo ? <img src={data.logo} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImage(e, 'logo')} />
                    {data.logo && <button onClick={(e) => { e.stopPropagation(); updateField('logo', null); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><X size={10} /></button>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className={labelClass}>Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={data.brandColor}
                        onChange={(e) => updateField('brandColor', e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                      />
                      <div className="text-xs text-slate-500">
                        <p>Pick any solid color.</p>
                        <p className="font-mono mt-0.5">{data.brandColor}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <input className={inputClass} placeholder="Your Company Name" value={data.companyName} onChange={e => updateField('companyName', e.target.value)} />
                  <textarea className={inputClass} rows={2} placeholder="Address, Email, Phone..." value={data.companyAddress} onChange={e => updateField('companyAddress', e.target.value)} />
                </div>
                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={data.isIndianClient} onChange={e => updateField('isIndianClient', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm">Client is in India (Use INR)</span>
                  </div>
                  {!data.isIndianClient && (
                    <div className="mt-2"><label className={labelClass}>Currency</label><select className={inputClass} value={data.currencyCode} onChange={e => updateField('currencyCode', e.target.value)}>{Object.values(CURRENCIES).map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}</select></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. BASICS */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('details')} className="w-full flex justify-between items-center"><div className="text-left"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">2. Basics</p><h4 className="font-semibold text-sm">Client & Dates</h4></div><ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.details ? 'rotate-180' : ''}`} /></button>
            {openSections.details && (
              <div className="mt-5 space-y-4 animate-fade-in-down">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>Quote No.</label><input className={inputClass} value={data.quotationNumber} onChange={e => updateField('quotationNumber', e.target.value)} /></div>
                  <div><label className={labelClass}>Valid Until</label><input type="date" className={inputClass} value={data.validUntil} onChange={e => updateField('validUntil', e.target.value)} /></div>
                </div>
                <div><label className={labelClass}>Client Name</label><input className={inputClass} placeholder="Client Name" value={data.clientName} onChange={e => updateField('clientName', e.target.value)} /></div>
                <div><label className={labelClass}>Client Address</label><textarea className={inputClass} rows={2} placeholder="Address..." value={data.clientAddress} onChange={e => updateField('clientAddress', e.target.value)} /></div>
              </div>
            )}
          </div>

          {/* 3. STRATEGY & SCHEDULE */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('strategy')} className="w-full flex justify-between items-center">
              <div className="text-left">
                <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">3. Strategy (New)</p>
                <h4 className="font-semibold text-sm">Goals & Timeline</h4>
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.strategy ? 'rotate-180' : ''}`} />
            </button>
            {openSections.strategy && (
              <div className="mt-5 space-y-5 animate-fade-in-down">
                {/* Project Title & Desc */}
                <div><label className={labelClass}>Project Title</label><input className={inputClass} placeholder="e.g. Website Redesign" value={data.projectTitle} onChange={e => updateField('projectTitle', e.target.value)} /></div>
                <div><label className={labelClass}>Project Summary</label><RichTextarea className={inputClass} rows={2} placeholder="Brief summary..." value={data.projectDescription} onChange={e => updateField('projectDescription', e.target.value)} /></div>

                <hr className={`border-dashed ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />

                {/* Business Outcome */}
                <div>
                  <label className={labelClass}><Target size={12} className="inline mr-1" /> Business Objectives / ROI</label>
                  <textarea className={inputClass} rows={2} placeholder="e.g. Increase lead generation by 30%, Improve brand credibility..." value={data.projectGoals} onChange={e => updateField('projectGoals', e.target.value)} />
                  <p className="text-[10px] text-slate-400 mt-1">Sell the outcome, not just the service.</p>
                </div>

                {/* Why Us */}
                <div>
                  <label className={labelClass}><Award size={12} className="inline mr-1" /> Why Choose Us?</label>
                  <textarea className={inputClass} rows={2} placeholder="e.g. Industry specialized, 24/7 support, proprietary tech..." value={data.companyHighlights} onChange={e => updateField('companyHighlights', e.target.value)} />
                </div>

                {/* Timeline */}
                <div>
                  <label className={labelClass}><Clock size={12} className="inline mr-1" /> Project Timeline</label>

                  {/* Timeline Heading Input */}
                  <div className="mb-3">
                    <span className="text-[10px] text-slate-400 uppercase font-bold mb-1 block">Timeline Heading</span>
                    <input className={inputClass} value={data.timelineTitle} onChange={e => updateField('timelineTitle', e.target.value)} placeholder="e.g. Estimated Timeline" />
                  </div>

                  <div className="space-y-3">
                    {data.timeline?.map((item) => (
                      <div key={item.id} className="flex flex-col gap-1 p-2 rounded border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <label className="text-[10px] text-slate-400">Phase</label>
                          <button onClick={() => removeTimelineItem(item.id)} className="text-red-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                        <input className={`${inputClass} mb-1`} placeholder="e.g. Design" value={item.phase} onChange={e => updateTimelineItem(item.id, 'phase', e.target.value)} />
                        <label className="text-[10px] text-slate-400">Duration</label>
                        <input className={`${inputClass}`} placeholder="e.g. 1 Week" value={item.duration} onChange={e => updateTimelineItem(item.id, 'duration', e.target.value)} />
                      </div>
                    ))}
                    <button onClick={addTimelineItem} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1 mt-2">+ Add Phase</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. FINANCIALS */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('items')} className="w-full flex justify-between items-center"><div className="text-left"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">4. Financials</p><h4 className="font-semibold text-sm">Itemization</h4></div><ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.items ? 'rotate-180' : ''}`} /></button>
            {openSections.items && (
              <div className="mt-5 space-y-4 animate-fade-in-down">
                {data.items.map((item) => (
                  <div key={item.id} className={`relative p-3 rounded-lg border group transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <button onClick={() => removeItem(item.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><Trash2 size={12} /></button>
                    <input className="w-full bg-transparent border-b border-transparent focus:border-indigo-300 outline-none font-medium mb-2 pb-1 placeholder:text-slate-400" placeholder="Item Description" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                    <div className="flex gap-3">
                      <div className="w-24"><label className="text-[9px] uppercase font-bold text-slate-400">Qty</label><input type="number" className={inputClass} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value)} /></div>
                      <div className="flex-1"><label className="text-[9px] uppercase font-bold text-slate-400">Rate</label><input type="number" className={inputClass} value={item.price} onChange={e => updateItem(item.id, 'price', e.target.value)} /></div>
                      <div className="w-24 text-right pt-5 text-sm font-bold opacity-70">{currencySymbol} {(item.quantity * item.price).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                <button onClick={addItem} className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">+ Add Line Item</button>
                <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm font-medium">Discount Amount</span><input type="number" className={`w-24 text-right p-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`} value={data.discountAmount} onChange={e => updateField('discountAmount', Number(e.target.value))} /></div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2"><input type="checkbox" checked={data.isGstEnabled} onChange={e => updateField('isGstEnabled', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span className="text-sm font-medium">Enable Tax %</span></div>
                    {data.isGstEnabled && <input type="number" className={`w-20 text-right p-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`} value={data.gstRate} onChange={e => updateField('gstRate', Number(e.target.value))} />}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. LEGAL */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('payment')} className="w-full flex justify-between items-center"><div className="text-left"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">5. Legal</p><h4 className="font-semibold text-sm">Terms & Banking</h4></div><ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.payment ? 'rotate-180' : ''}`} /></button>
            {openSections.payment && (
              <div className="mt-5 space-y-4 animate-fade-in-down">
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select className={inputClass} value={data.paymentMethod} onChange={e => updateField('paymentMethod', e.target.value)}>
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Both">Both</option>
                    <option value="None">None (Hide)</option>
                  </select>
                </div>
                {(data.paymentMethod === 'Bank' || data.paymentMethod === 'Both') && (
                  <div className="grid grid-cols-2 gap-3">
                    <input className={inputClass} placeholder="Bank Name" value={data.bankName} onChange={e => updateField('bankName', e.target.value)} />
                    <input className={inputClass} placeholder="Account No" value={data.accountNo} onChange={e => updateField('accountNo', e.target.value)} />
                    <input className={`col-span-2 ${inputClass}`} placeholder="IFSC / SWIFT" value={data.ifscCode} onChange={e => updateField('ifscCode', e.target.value)} />
                  </div>
                )}
                {(data.paymentMethod === 'UPI' || data.paymentMethod === 'Both') && (
                  <input className={inputClass} placeholder="UPI ID (e.g. user@okaxis)" value={data.upiId} onChange={e => updateField('upiId', e.target.value)} />
                )}
                <div className="pt-2">
                  <label className={labelClass}>Notes & Terms</label>
                  <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
                    <button onClick={() => insertLegalSnippet('ownership')} className="whitespace-nowrap px-2 py-1 text-[10px] bg-indigo-50 text-indigo-700 rounded border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"><ShieldCheck size={10} /> IP Rights</button>
                    <button onClick={() => insertLegalSnippet('warranty')} className="whitespace-nowrap px-2 py-1 text-[10px] bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"><CheckCircle size={10} /> Warranty</button>
                    <button onClick={() => insertLegalSnippet('payment')} className="whitespace-nowrap px-2 py-1 text-[10px] bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1"><Briefcase size={10} /> Payment Terms</button>
                  </div>
                  <RichTextarea className={inputClass} rows={5} value={data.notes} onChange={e => updateField('notes', e.target.value)} />
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3"><input type="checkbox" checked={data.showSignatory} onChange={e => updateField('showSignatory', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><span className="text-xs font-bold uppercase text-slate-500">Show Signatory Block</span></div>
                  {data.showSignatory && (
                    <div className="space-y-3">
                      <input className={inputClass} placeholder="Authorized Signatory Name" value={data.signatoryName} onChange={e => updateField('signatoryName', e.target.value)} />
                      <div className="flex gap-4">
                        <div className={`relative w-32 h-16 border rounded flex items-center justify-center overflow-hidden group ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                          {data.signature ? <img src={data.signature} className="w-full h-full object-contain" /> : <span className="text-[10px] text-slate-400 flex items-center gap-1"><Signature size={12} /> Upload Sign</span>}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImage(e, 'signature')} />
                        </div>
                        {(data.paymentMethod === 'UPI' || data.paymentMethod === 'Both') && (
                          <div className={`relative w-16 h-16 border rounded flex items-center justify-center overflow-hidden group ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                            {data.qrCode ? <img src={data.qrCode} className="w-full h-full object-cover" /> : <span className="text-[10px] text-slate-400 flex flex-col items-center"><Scan size={12} /> QR</span>}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handleImage(e, 'qrCode')} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 6. ANNEXURE */}
          <div className={sectionClass}>
            <button onClick={() => toggleSection('annexure')} className="w-full flex justify-between items-center"><div className="text-left"><p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">6. Annexure (Page 2)</p><h4 className="font-semibold text-sm">Scope & Details</h4></div><ChevronDown size={16} className={`text-slate-400 transition-transform ${openSections.annexure ? 'rotate-180' : ''}`} /></button>
            {openSections.annexure && (
              <div className="mt-5 space-y-4 animate-fade-in-down">
                <div className="flex items-center gap-2 mb-3"><input type="checkbox" checked={data.annexure?.show} onChange={e => setData(p => ({ ...p, annexure: { ...p.annexure, show: e.target.checked } }))} className="w-4 h-4 text-indigo-600 rounded" /><span className="text-sm font-medium">Enable Annexure Page</span></div>
                {data.annexure?.show && (
                  <>
                    <div><label className={labelClass}>Page Title</label><input className={inputClass} value={data.annexure?.title} onChange={e => setData(p => ({ ...p, annexure: { ...p.annexure, title: e.target.value } }))} /></div>
                    <div>
                      <label className={labelClass}>Content / Scope of Work</label>
                      <RichTextarea
                        className={inputClass}
                        rows={10}
                        placeholder="Paste detailed scope... Use Ctrl+B for bold."
                        value={data.annexure?.content}
                        onChange={e => setData(p => ({ ...p, annexure: { ...p.annexure, content: e.target.value } }))}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Tip: Select text and press Ctrl+B to make it bold.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="h-20"><p className="text-center text-[10px] text-slate-400 mt-8">Your data is stored locally in your browser.</p></div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className={`p-4 border-t shrink-0 flex gap-3 pb-24 md:pb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button onClick={handleSave} className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}><Save size={18} /> Save Data</button>
          <button onClick={() => window.print()} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"><Printer size={18} /> Print / PDF</button>
        </div>
      </div>

      {/* RIGHT PANEL (PREVIEW) */}
      <div className={`
        flex-1 bg-gray-100 overflow-y-auto p-4 md:p-10 print-container 
        md:ml-[480px]
        ${activeMobileTab === 'preview' ? 'block' : 'hidden md:block'}
      `}>
        <div className="no-print mb-6 flex justify-end">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-black transition-transform hover:-translate-y-1"><Download size={14} /> Download PDF</button>
        </div>

        {/* ✅ FIXED GLOBAL FOOTER ✅ */}
        <div className="hidden print:block fixed bottom-0 left-0 w-full text-center pb-4 bg-white z-50">
          <p className="text-[10px] text-slate-400 font-medium">Generated by IndieByll</p>
        </div>

        {/* A4 DOCUMENT PAGE - SCALED ON MOBILE */}
        <div className="flex justify-center pb-24 md:pb-0">
          <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-100 origin-top transition-transform duration-200">
            <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 shadow-2xl relative text-slate-900 print:shadow-none print:w-full print:max-w-none flex flex-col page-break-inside-avoid">
              {/* Header */}
              <div className="flex justify-between items-start mb-10">
                <div className="w-[55%]">
                  {data.logo ? <img src={data.logo} className="h-20 object-contain mb-6" alt="Logo" /> : <div className="h-20 w-20 bg-slate-50 rounded-lg mb-6 flex items-center justify-center text-slate-300"><ImageIcon size={32} /></div>}
                  <h1 style={{ color: data.brandColor }} className="text-5xl font-black mb-2 tracking-tight">QUOTATION</h1>
                  <div className="text-sm font-medium text-slate-500 space-y-1">
                    <p>Quote #: <span className="text-slate-900 font-bold">{data.quotationNumber}</span></p>
                    <p>Issued: <span className="text-slate-900">{data.date}</span></p>
                    <p>Valid Until: <span className="text-rose-600 font-semibold">{data.validUntil}</span></p>
                  </div>
                </div>
                <div className="w-[40%] text-right">
                  <h2 style={{ color: data.brandColor }} className="text-xl font-bold">{data.companyName || 'Your Company'}</h2>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed whitespace-pre-line max-w-full break-words">{data.companyAddress || 'Your Address'}</p>
                </div>
              </div>

              <div className="flex justify-between mb-8 pb-8 border-b border-slate-100">
                <div className="w-[48%]">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Prepared For</h3>
                  <p className="text-lg font-bold text-slate-900 break-words">{data.clientName || 'Client Name'}</p>
                  <p className="text-sm text-slate-500 mt-1 whitespace-pre-line break-words">{data.clientAddress || 'Client Address'}</p>
                </div>
                {data.paymentMethod !== 'None' && (
                  <div className="w-[48%] pl-8 border-l border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Payment Info</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      {(data.paymentMethod === 'Bank' || data.paymentMethod === 'Both') && (
                        <><p><span className="font-semibold text-slate-900 w-20 inline-block">Bank:</span> {data.bankName || '-'}</p><p><span className="font-semibold text-slate-900 w-20 inline-block">Account:</span> {data.accountNo || '-'}</p><p><span className="font-semibold text-slate-900 w-20 inline-block">IFSC:</span> {data.ifscCode || '-'}</p></>
                      )}
                      {(data.paymentMethod === 'UPI' || data.paymentMethod === 'Both') && <p className="pt-1"><span className="font-semibold text-slate-900 w-20 inline-block">UPI ID:</span> {data.upiId || '-'}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* NEW: STRATEGIC SECTION (Objectives & Why Us) */}
              {(data.projectGoals || data.companyHighlights) && (
                <div className="mb-8 grid grid-cols-2 gap-8 page-break-inside-avoid">
                  {data.projectGoals && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 style={{ color: data.brandColor }} className="text-xs font-bold uppercase mb-2 flex items-center gap-1"><Target size={12} /> Project Goals</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{data.projectGoals}</p>
                    </div>
                  )}
                  {data.companyHighlights && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h3 style={{ color: data.brandColor }} className="text-xs font-bold uppercase mb-2 flex items-center gap-1"><Award size={12} /> Why Choose Us</h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">{data.companyHighlights}</p>
                    </div>
                  )}
                </div>
              )}

              {(data.projectTitle || data.projectDescription) && (
                <div className="mb-6 page-break-inside-avoid">
                  {data.projectTitle && <h3 className="text-sm font-bold text-slate-800 mb-1">{data.projectTitle}</h3>}
                  {data.projectDescription && <RichTextRenderer text={data.projectDescription} className="text-sm text-slate-600 leading-relaxed" />}
                </div>
              )}

              {/* NEW: TIMELINE */}
              {data.timeline && data.timeline.length > 0 && data.timeline[0].phase && (
                <div className="mb-8 page-break-inside-avoid">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{data.timelineTitle}</h3>
                  <div className="flex flex-wrap gap-4">
                    {data.timeline.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm">
                        <div className="bg-slate-100 text-slate-500 font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs">{idx + 1}</div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none">{item.phase}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <table className="w-full mb-8">
                <thead>
                  <tr style={{ backgroundColor: data.brandColor, color: headerTextColor }}>
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase rounded-l-lg">Description</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase">Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-bold uppercase rounded-r-lg">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 page-break-inside-avoid">
                      <td className="py-4 px-4 font-medium text-slate-700 break-words max-w-[50%]">{item.description}</td>
                      <td className="py-4 px-4 text-right text-slate-500">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-slate-500">{item.price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900">{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-16 page-break-inside-avoid">
                <div className="w-72 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
                  {data.discountAmount > 0 && (<div className="flex justify-between text-sm text-emerald-600"><span>Discount</span><span>- {fmt(data.discountAmount)}</span></div>)}
                  {data.isGstEnabled && (<div className="flex justify-between text-sm text-slate-600"><span>Tax ({data.gstRate}%)</span><span>{fmt(taxAmount)}</span></div>)}
                  <div style={{ borderColor: data.brandColor, color: data.brandColor }} className="flex justify-between text-xl font-bold pt-4 border-t-2"><span>Total</span><span>{fmt(total)}</span></div>
                </div>
              </div>

              <div className="mt-auto page-break-inside-avoid">
                {/* TERMS & CONDITIONS BLOCK WITH MARGIN */}
                {data.notes && (
                  <div className="mt-12 mb-12 p-5 bg-slate-50 rounded-xl border border-slate-100 page-break-inside-avoid">
                    <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Terms & Conditions</h4>
                    <RichTextRenderer text={data.notes} className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap" />
                  </div>
                )}

                {/* SIGNATURE BLOCK */}
                <div className="flex justify-between items-end pt-6 pb-8 border-b border-slate-100 mb-6 page-break-inside-avoid">
                  <div className="text-left"><div className="h-16 w-48 border-b-2 border-slate-200 mb-2"></div><p className="text-sm font-bold text-slate-800">Client Acceptance</p><p className="text-[10px] text-slate-400 uppercase tracking-wide">Sign & Date Above</p></div>
                  {data.showSignatory && (
                    <div className="text-right">
                      {data.signature ? <img src={data.signature} className="h-35 object-contain ml-auto mb-0" alt="Sign" /> : <div className="h-16 w-32 ml-auto"></div>}
                      <p style={{ color: data.brandColor }} className="font-bold text-sm">{data.signatoryName}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Authorized Signatory</p>
                    </div>
                  )}
                </div>
              </div>

              {/* QR CODE */}
              {data.qrCode && data.paymentMethod !== 'None' && data.paymentMethod !== 'Bank' && (
                <div className="absolute bottom-24 right-[45%] text-center"><img src={data.qrCode} className="w-20 h-20 object-cover mx-auto border p-1" alt="QR" /><span className="text-[9px] font-bold uppercase text-slate-400 mt-1 block">Scan to Pay</span></div>
              )}
            </div>
          </div>

          {/* ANNEXURE PAGE (Page 2) */}
          {data.annexure?.show && (
            <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-100 origin-top transition-transform duration-200 mt-10 md:mt-0">
              <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 shadow-2xl relative text-slate-900 mt-10 page-break print:mt-0 print:min-h-0 print:h-auto">
                <div className="flex justify-between items-end border-b pb-4 mb-8"><h2 style={{ color: data.brandColor }} className="text-3xl font-bold">{data.annexure.title}</h2><span className="text-sm text-slate-500">Ref: {data.quotationNumber}</span></div>
                <RichTextRenderer text={data.annexure.content} className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed" />
              </div>
            </div>
          )}
        </div>
      </div>

      {showClientModal && <NewClientModal onClose={() => setShowClientModal(false)} onSave={addClient} />}
      <FeedbackWidget />

      <style jsx global>{`
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fade-in-down 0.2s ease-out; }
        .animate-fade-in-up { animation: fade-in-down 0.2s ease-out reverse; }
        .animate-fade-in { animation: fade-in-down 0.15s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
          html, body { background: white; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-container { margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          .shadow-2xl { shadow: none !important; box-shadow: none !important; }
          .page-break { page-break-before: always; }
          .page-break-inside-avoid { break-inside: avoid; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
};

export default QuotationGenerator;