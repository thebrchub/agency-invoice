import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Printer,
  Image as ImageIcon,
  Building2,
  Save,
  FilePlus,
  UserPlus,
  Scan,
  Signature,
  X,
  Users,
  ChevronLeft,
  ChevronDown,
  Moon,
  Sun,
  Edit3,
  Eye,
  GripVertical
} from 'lucide-react';

/* -----------------------------
   CONSTANTS
------------------------------ */
const BUILDER_THEME_KEY = 'invoice-builder-theme';

const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
};

/* -----------------------------
   RICH TEXT COMPONENTS
------------------------------ */
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

/* -----------------------------
   NEW CLIENT MODAL
------------------------------ */
const NewClientModal = ({ onClose, onSave }) => {
  const [clientName, setClientName] = useState('');

  const handleSave = () => {
    if (!clientName.trim()) return;
    onSave(clientName.trim());
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-indigo-500">
              Client
            </p>
            <h3 className="text-xl font-bold text-slate-900">Add new client</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Give this client a clear name. You’ll be able to load their past invoices in one click.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client name
          </label>
          <input
            type="text"
            placeholder="e.g. Ramesh Traders Inc."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
            }}
            className="w-full p-3 border border-gray-300 rounded-lg text-base text-slate-900 focus:border-indigo-500 focus:ring-indigo-500"
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
            disabled={!clientName.trim()}
          >
            <Save size={16} className="inline mr-1" /> Save client
          </button>
        </div>
      </div>
    </div>
  );
};

/* -----------------------------
   FEEDBACK WIDGET (no-print)
------------------------------ */
const FeedbackWidget = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!rating) return;
    const payload = {
      rating,
      message,
      at: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(
        window.localStorage.getItem('invoicely-feedback') || '[]'
      );
      existing.push(payload);
      window.localStorage.setItem('invoicely-feedback', JSON.stringify(existing));
    } catch {
      // ignore storage errors
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOpen(false);
      setRating(0);
      setMessage('');
    }, 1500);
  };

  return (
    <div className="no-print fixed bottom-20 md:bottom-4 right-4 z-[60]">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs sm:text-sm shadow-lg hover:bg-black flex items-center gap-2"
        >
          <span>Feedback</span>
        </button>
      )}
      {open && (
        <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 feedback-anim">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
              Feedback
            </h4>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-700 rounded-full p-1 hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-2">
            How was your invoice builder experience?
          </p>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`flex-1 py-1 text-xs rounded-lg border ${
                  rating >= n
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Anything we should improve?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg text-xs mb-2 text-slate-900"
          />
          <button
            onClick={handleSubmit}
            disabled={!rating}
            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white disabled:opacity-40"
          >
            {submitted ? 'Thanks ✨' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );
};

/* -----------------------------
   INVOICE GENERATOR SCREEN
------------------------------ */
const InvoiceGeneratorScreen = ({
  appState,
  setAppState,
  currencySymbol,
  theme,
  setInvoiceField,
  addClient,
  openClientModal,
  closeClientModal,
  loadClientData,
  saveCurrentInvoice,
  startNewInvoice,
  setAppPartialState,
  setView,
}) => {
  const navigate = useNavigate();
  // Mobile Responsiveness State
  const [activeMobileTab, setActiveMobileTab] = useState('edit');

  const {
    invoiceData,
    items,
    postDetails,
    logo,
    qrCode,
    signature,
    clients,
    currentClientId,
    showClientModal,
  } = appState;

  const pricingRules = appState.pricingRules || [];

  // Drag and drop state
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedPostIndex, setDraggedPostIndex] = useState(null);

  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem(BUILDER_THEME_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    } catch {
      return false;
    }
  });

  const toggleBuilderTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(BUILDER_THEME_KEY, next ? 'dark' : 'light');
      }
      return next;
    });
  };

  // Accordion state
  const [openSections, setOpenSections] = useState({
    branding: false,
    details: false,
    items: true,
    payment: false,
    annexure: false,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const effectiveCurrencySymbol =
    currencySymbol || (appState.isIndianClient ? '₹' : '$');

  const brandColor = appState.brandColor || '#4f46e5'; 

  /* HANDLERS  */
  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { alert("Image too large. Max size 2MB."); return; }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        const newUrl = URL.createObjectURL(file);

        setAppPartialState({
          [key.replace('Base64', '')]: newUrl,
          [key]: base64Data,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = (key) => {
    const liveKey = key.replace('Base64', '');
    setAppPartialState({
      [key]: null, // remove base64
      [liveKey]: null, // remove preview url
    });
  };

  const addItem = () =>
    setAppState((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), description: '', quantity: 1, price: 0 },
      ],
    }));

  const removeItem = (id) =>
    setAppState((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));

  // --- DRAG AND DROP HANDLERS (ITEMS) ---
  const onDragStartItem = (index) => {
    setDraggedItemIndex(index);
  };

  const onDragOverItem = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    // Reorder logic
    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setAppState(prev => ({ ...prev, items: newItems }));
    setDraggedItemIndex(index);
  };

  const onDragEndItem = () => {
    setDraggedItemIndex(null);
  };

  // --- DRAG AND DROP HANDLERS (POSTS / WORK LOGS) ---
  const onDragStartPost = (index) => {
    setDraggedPostIndex(index);
  };

  const onDragOverPost = (e, index) => {
    e.preventDefault();
    if (draggedPostIndex === null || draggedPostIndex === index) return;

    const newPosts = [...postDetails];
    const draggedPost = newPosts[draggedPostIndex];
    newPosts.splice(draggedPostIndex, 1);
    newPosts.splice(index, 0, draggedPost);

    setAppState(prev => ({ ...prev, postDetails: newPosts }));
    setDraggedPostIndex(index);
  };

  const onDragEndPost = () => {
    setDraggedPostIndex(null);
  };


  const updateItem = (id, field, value) => {
    setAppState((prev) => {
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;
        if (field === 'price') return { ...item, price: Number(value) || 0 };
        return { ...item, [field]: value };
      });
      return { ...prev, items };
    });
  };

  const addPost = () =>
    setAppState((prev) => ({
      ...prev,
      postDetails: [
        ...prev.postDetails,
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          title: '',
          status: 'COMPLETED',
        },
      ],
    }));

  const removePost = (id) =>
    setAppState((prev) => ({
      ...prev,
      postDetails: prev.postDetails.filter((p) => p.id !== id),
    }));

  const updatePost = (id, field, value) =>
    setAppState((prev) => ({
      ...prev,
      postDetails: prev.postDetails.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));

  const clientsList = useMemo(
    () =>
      Object.entries(clients || {}).map(([id, client]) => ({ id, ...client })),
    [clients]
  );

  const formatCurrency = useCallback(
    (amount) => {
      const numAmount = Number(amount) || 0;
      return `${effectiveCurrencySymbol}${numAmount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [effectiveCurrencySymbol]
  );

  /* CALCULATIONS  */
  const subtotal = (items || []).reduce(
    (sum, item) =>
      sum + (Number(item.quantity || 0) * Number(item.price || 0)),
    0
  );
  const totalAfterDiscount =
    subtotal - (Number(invoiceData.discountAmount) || 0);
  const gstRateDecimal = (Number(invoiceData.gstRate) || 0) / 100;
  const gstAmount = appState.isGstEnabled
    ? totalAfterDiscount * gstRateDecimal
    : 0;
  const totalFinalBill = totalAfterDiscount + gstAmount;
  const finalDueAmount =
    totalFinalBill +
    (Number(invoiceData.previousDue) || 0) -
    (Number(invoiceData.advancePaid) || 0);

  /* --- STYLING CONSTANTS --- */
  const inputClass = `w-full p-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${isDark ? 'bg-white border-gray-300 text-slate-900 placeholder-slate-400' : 'bg-white border-gray-200 text-slate-800'}`;
  const labelClass = `block text-[11px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
  const sectionClass = `p-5 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`;

  const handleBack = () => {
      if (navigate) {
          navigate('/');
      } else {
          window.location.href = '/';
      }
  };

  /* UI  */
  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-inter selection:bg-indigo-500/30 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* MOBILE TAB NAVIGATION */}
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

      {/* LEFT PANEL – EDITOR */}
      <div
        className={`
          fixed top-0 left-0 h-screen flex flex-col border-r z-40 bg-inherit transition-transform duration-300 no-print
          ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}
          w-full md:w-[480px]
          ${activeMobileTab === 'edit' ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10 bg-inherit">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className={`flex items-center gap-1 pl-2 pr-3 py-1.5 rounded-lg border transition-all ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <ChevronLeft size={16} className="text-indigo-500" />
              <span className="text-xs font-bold">Back</span>
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Builder
              </p>
              <h2
                className={`text-lg font-bold flex items-center gap-2 ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                Invoice
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleBuilderTheme}
              className={`p-2 rounded-full border ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              } transition-colors`}
              aria-label="Toggle builder theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {appState.showSaveMessage && (
              <div className="flex items-center text-xs font-bold text-emerald-500 animate-pulse">
                <Save size={14} className="mr-1" /> Saved
              </div>
            )}
          </div>
        </div>

        {/* Editor Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin pb-24 md:pb-6">
          {/* 0. Client Management */}
          <div className={`p-4 rounded-xl border border-dashed ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2">
              <Users size={14} /> Client management
            </h3>
            <div className="flex gap-2">
              <select
                value={currentClientId || ''}
                onChange={(e) => loadClientData(e.target.value)}
                className={inputClass}
              >
                <option value="" disabled>
                  -- Load Saved Client --
                </option>
                {clientsList.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <button
                onClick={openClientModal}
                className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 text-xs font-bold shrink-0"
              >
                <UserPlus size={14} />
                New
              </button>
            </div>

            {currentClientId && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={startNewInvoice}
                  className="flex-1 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <FilePlus size={14} /> New Invoice
                </button>
                <button
                  onClick={saveCurrentInvoice}
                  className="bg-amber-500 text-white px-3 py-2 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 text-xs font-bold"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            )}

            {currentClientId &&
              clients[currentClientId] &&
              clients[currentClientId].invoices &&
              clients[currentClientId].invoices.length > 0 && (
                <div className="border-t border-dashed border-gray-300 dark:border-gray-700 pt-3 mt-3">
                  <label className={labelClass}>
                    Load past invoice
                  </label>
                  <select
                    onChange={(e) => {
                      const inv = clients[currentClientId].invoices.find(
                        (i) => i.invoiceId === e.target.value
                      );
                      if (inv) {
                        setAppPartialState({
                          invoiceData: { ...inv.invoiceData },
                          items: inv.items,
                          postDetails: inv.postDetails,
                        });
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">Select history</option>
                    {clients[currentClientId].invoices.map((inv) => (
                      <option key={inv.invoiceId} value={inv.invoiceId}>
                        {inv.invoiceId}{' '}
                        {inv.invoiceData?.date
                          ? `(${new Date(
                              inv.invoiceData.date
                            ).toLocaleDateString()})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
          </div>

          {/* 1. Branding & Localization */}
          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => toggleSection('branding')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  1. Branding
                </p>
                <h4 className="font-semibold text-sm">Logo & Company</h4>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.branding ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.branding && (
              <div className="section-open mt-5 space-y-5 animate-fade-in-down">
                {/* Logo + company details */}
                <div className="flex gap-4">
                  <div className={`relative w-20 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 group transition-colors hover:border-indigo-500 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-50'}`}>
                    {logo ? (
                      <img
                        src={logo}
                        alt="Agency Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-slate-400" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'logoBase64')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload logo"
                    />

                    {logo && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleImageRemove('logoBase64'); }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className={labelClass}>Brand Color</label>
                    <div className="flex items-center gap-3">
                        <input 
                          type="color" 
                          value={brandColor} 
                          onChange={(e) => setAppState(prev => ({ ...prev, brandColor: e.target.value }))} 
                          className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                        />
                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          <p>Pick any solid color.</p>
                          <p className="font-mono mt-0.5">{brandColor}</p>
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Company Name"
                      value={invoiceData.companyName}
                      onChange={(e) =>
                        setInvoiceField('companyName', e.target.value)
                      }
                      className={inputClass}
                    />
                    <textarea
                      placeholder="Company address"
                      rows="2"
                      value={invoiceData.companyAddress}
                      onChange={(e) =>
                        setInvoiceField('companyAddress', e.target.value)
                      }
                      className={inputClass}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input
                      type="email"
                      placeholder="Email (Optional)"
                      value={invoiceData.companyEmail}
                      onChange={(e) =>
                        setInvoiceField('companyEmail', e.target.value)
                      }
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      placeholder="Phone (Optional)"
                      value={invoiceData.companyPhone}
                      onChange={(e) =>
                        setInvoiceField('companyPhone', e.target.value)
                      }
                      className={inputClass}
                    />
                </div>

                {/* Tax + recurring */}
                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase text-slate-500">Enable Tax</span>
                          <input
                            type="checkbox"
                            checked={appState.isGstEnabled}
                            onChange={(e) =>
                              setAppState((prev) => ({
                                ...prev,
                                isGstEnabled: e.target.checked,
                              }))
                            }
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </div>
                        {appState.isGstEnabled && (
                            <input
                              type="number"
                              placeholder="Rate %"
                              value={invoiceData.gstRate}
                              onChange={(e) =>
                                setInvoiceField('gstRate', Number(e.target.value))
                              }
                              className={inputClass}
                            />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold uppercase text-slate-500">Recurring</span>
                          <input
                            type="checkbox"
                            checked={invoiceData.isRecurring}
                            onChange={(e) =>
                              setInvoiceField('isRecurring', e.target.checked)
                            }
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Show "Current Month" label</div>
                      </div>
                  </div>
                </div>

                {/* Service title */}
                <div>
                  <label className={labelClass}>
                    Service / Invoice Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graphic designing, SaaS product"
                    value={invoiceData.serviceType}
                    onChange={(e) =>
                      setInvoiceField('serviceType', e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                {/* Client region / currency */}
                <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={appState.isIndianClient}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setAppState((prev) => ({
                          ...prev,
                          isIndianClient: isChecked,
                          currencyCode: isChecked ? 'INR' : 'USD',
                        }));
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm">Client is in India (Use INR)</span>
                  </div>

                  {!appState.isIndianClient && (
                    <div className="mt-2">
                      <label className={labelClass}>
                        Select currency
                      </label>
                      <select
                        value={appState.currencyCode}
                        onChange={(e) =>
                          setAppState((prev) => ({
                            ...prev,
                            currencyCode: e.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        {Object.entries(CURRENCIES).map(([key, item]) => (
                          <option key={key} value={item.code}>
                            {item.symbol} - {item.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Invoice & Client Details */}
          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  2. Basics
                </p>
                <h4 className="font-semibold text-sm">Client & Dates</h4>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.details ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.details && (
              <div className="section-open mt-5 space-y-4 animate-fade-in-down">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Invoice No.</label>
                        <input
                          type="text"
                          value={invoiceData.invoiceNumber}
                          onChange={(e) =>
                            setInvoiceField('invoiceNumber', e.target.value)
                          }
                          className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Date</label>
                        <input
                          type="date"
                          value={invoiceData.date}
                          onChange={(e) =>
                            setInvoiceField('date', e.target.value)
                          }
                          className={inputClass}
                        />
                    </div>
                </div>
                
                <div>
                    <label className={labelClass}>Client Name</label>
                    <input
                      type="text"
                      placeholder="Client name"
                      value={invoiceData.clientName}
                      onChange={(e) =>
                        setInvoiceField('clientName', e.target.value)
                      }
                      className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Client Address</label>
                    <textarea
                      placeholder="Client address"
                      rows="2"
                      value={invoiceData.clientAddress}
                      onChange={(e) =>
                        setInvoiceField('clientAddress', e.target.value)
                      }
                      className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                      Payment due
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) =>
                        setInvoiceField('dueDate', e.target.value)
                      }
                      className={inputClass}
                    />
                </div>
              </div>
            )}
          </div>

          {/* 3. Itemization & Summary */}
          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => toggleSection('items')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  3. Financials
                </p>
                <h4 className="font-semibold text-sm">Items & Pricing</h4>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.items ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.items && (
              <div className="section-open mt-5 space-y-4 animate-fade-in-down">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => onDragStartItem(index)}
                    onDragOver={(e) => onDragOverItem(e, index)}
                    onDragEnd={onDragEndItem}
                    className={`relative p-3 rounded-lg border group transition-all 
                      ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200 shadow-sm'}
                      ${draggedItemIndex === index ? 'opacity-50 border-indigo-400' : ''}
                    `}
                  >
                    {/* Drag Handle */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-move text-slate-400 hover:text-indigo-500">
                       <GripVertical size={14} />
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-500 rounded-full p-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                    >
                      <Trash2 size={12} />
                    </button>
                    
                    <div className="pl-6">
                        <input
                          className="w-full mb-2 text-sm font-medium border-b border-transparent focus:border-indigo-300 outline-none pb-1 bg-transparent"
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, 'description', e.target.value)
                          }
                        />
                        <div className="flex gap-3 items-center">
                          <div className="w-20">
                              <label className={`text-[9px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Qty</label>
                              <input
                                type="number"
                                className={inputClass}
                                value={item.quantity}
                                min={0}
                                onChange={(e) =>
                                  updateItem(item.id, 'quantity', e.target.value)
                                }
                              />
                          </div>
                          <div className="flex-1">
                              <label className={`text-[9px] uppercase font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rate</label>
                              <input
                                type="number"
                                className={inputClass}
                                value={item.price}
                                onChange={(e) =>
                                  updateItem(item.id, 'price', e.target.value)
                                }
                              />
                          </div>
                          <div className="w-24 text-right pt-5 text-sm font-bold opacity-70">
                            {formatCurrency(
                              (Number(item.quantity) || 0) *
                                (Number(item.price) || 0)
                            )}
                          </div>
                        </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                >
                  <Plus size={14} /> Add bill item
                </button>

                <div className="pt-4 border-t border-dashed border-gray-300 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Discount Amount</span>
                    <input
                      type="number"
                      value={invoiceData.discountAmount}
                      onChange={(e) =>
                        setInvoiceField(
                          'discountAmount',
                          Number(e.target.value)
                        )
                      }
                      className={`w-24 text-right p-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Previous Balance</span>
                    <input
                      type="number"
                      value={invoiceData.previousDue}
                      onChange={(e) =>
                        setInvoiceField('previousDue', Number(e.target.value))
                      }
                      className={`w-24 text-right p-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Advance Paid</span>
                    <input
                      type="number"
                      value={invoiceData.advancePaid}
                      onChange={(e) =>
                        setInvoiceField('advancePaid', Number(e.target.value))
                      }
                      className={`w-24 text-right p-1 rounded border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Payment & Finalization */}
          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => toggleSection('payment')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  4. Payment & Terms
                </p>
                <h4 className="font-semibold text-sm">Bank & Legal</h4>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.payment ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.payment && (
              <div className="section-open mt-5 space-y-4 animate-fade-in-down">
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select
                    value={invoiceData.paymentMethod}
                    onChange={(e) =>
                      setInvoiceField('paymentMethod', e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="Bank">Bank Transfer</option>
                    <option value="UPI">UPI ID</option>
                    <option value="Both">Show both</option>
                  </select>
                </div>

                {(invoiceData.paymentMethod === 'Bank' ||
                  invoiceData.paymentMethod === 'Both') && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Account holder name"
                      value={invoiceData.accountHolderName}
                      onChange={(e) =>
                        setInvoiceField('accountHolderName', e.target.value)
                      }
                      className={`${inputClass} col-span-2`}
                    />

                    <input
                      type="text"
                      placeholder="Bank name"
                      value={invoiceData.bankName}
                      onChange={(e) =>
                        setInvoiceField('bankName', e.target.value)
                      }
                      className={inputClass}
                    />

                    <input
                      type="text"
                      placeholder="Account number"
                      value={invoiceData.accountNo}
                      onChange={(e) =>
                        setInvoiceField('accountNo', e.target.value)
                      }
                      className={inputClass}
                    />

                    <input
                      type="text"
                      placeholder="IFSC code"
                      value={invoiceData.ifscCode}
                      onChange={(e) =>
                        setInvoiceField('ifscCode', e.target.value)
                      }
                      className={`${inputClass} col-span-2`}
                    />
                  </div>
                )}


                {(invoiceData.paymentMethod === 'UPI' ||
                  invoiceData.paymentMethod === 'Both') && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="UPI ID (e.g. xyz@upi)"
                      value={invoiceData.upiId}
                      onChange={(e) =>
                        setInvoiceField('upiId', e.target.value)
                      }
                      className={inputClass}
                    />
                    {/* Only show if not already shown in Bank section to avoid dupe input visually, 
                        though logic shares the same state 'accountHolderName' */}
                    {invoiceData.paymentMethod === 'UPI' && (
                        <input
                          type="text"
                          placeholder="Account holder name"
                          value={invoiceData.accountHolderName}
                          onChange={(e) =>
                            setInvoiceField('accountHolderName', e.target.value)
                          }
                          className={inputClass}
                        />
                    )}
                  </div>
                )}

                <div className="pt-2">
                    <label className={labelClass}>Terms & Notes</label>
                    <RichTextarea
                        placeholder="e.g. Payments are due upon receipt..."
                        rows="3"
                        value={invoiceData.notes}
                        onChange={(e) => setInvoiceField('notes', e.target.value)}
                        className={inputClass}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Select text and press Ctrl+B for bold.</p>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="checkbox"
                            checked={invoiceData.includeSignatoryBlock}
                            onChange={(e) =>
                              setInvoiceField(
                                'includeSignatoryBlock',
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-xs font-bold uppercase text-slate-500">Show Signatory Block</span>
                    </div>
                    {invoiceData.includeSignatoryBlock && (
                        <div className="space-y-3">
                            <input
                              type="text"
                              placeholder="Authorized signatory name"
                              value={invoiceData.signatoryName}
                              onChange={(e) =>
                                setInvoiceField('signatoryName', e.target.value)
                              }
                              className={inputClass}
                            />
                            <div className="flex gap-4">
                                <div className={`relative w-32 h-16 border rounded flex items-center justify-center overflow-hidden group ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                                    {signature ? (
                                      <img
                                        src={signature}
                                        alt="Sign"
                                        className="w-full h-full object-contain"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Signature size={12}/> Sign</span>
                                    )}
                                    <input
                                      type="file"
                                      onChange={(e) =>
                                        handleImageUpload(e, 'signatureBase64')
                                      }
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {signature && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleImageRemove('signatureBase64'); }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                </div>
                                <div className={`relative w-16 h-16 border rounded flex items-center justify-center overflow-hidden group ${isDark ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'}`}>
                                    {qrCode ? (
                                      <img
                                        src={qrCode}
                                        alt="QR"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[10px] text-slate-400 flex flex-col items-center"><Scan size={12}/> QR</span>
                                    )}
                                    <input
                                      type="file"
                                      onChange={(e) => handleImageUpload(e, 'qrCodeBase64')}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    {qrCode && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleImageRemove('qrCodeBase64'); }}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5 hover:bg-red-600"
                                      >
                                        <X size={10} />
                                      </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* 5. Annexure (Page 2) */}
          <div className={sectionClass}>
            <button
              type="button"
              onClick={() => toggleSection('annexure')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  5. Annexure
                </p>
                <h4 className="font-semibold text-sm">Work Logs (Page 2)</h4>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.annexure ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.annexure && (
              <div className="section-open mt-5 space-y-3 animate-fade-in-down">
                {postDetails.map((post, index) => (
                  <div 
                    key={post.id} 
                    draggable
                    onDragStart={() => onDragStartPost(index)}
                    onDragOver={(e) => onDragOverPost(e, index)}
                    onDragEnd={onDragEndPost}
                    className={`flex gap-2 items-center relative pl-6 ${draggedPostIndex === index ? 'opacity-50' : ''}`}
                  >
                    {/* Drag Handle */}
                    <div className="absolute left-0 cursor-move text-slate-400 hover:text-indigo-500">
                       <GripVertical size={14} />
                    </div>

                    <input
                      type="date"
                      className="w-28 p-2 border border-gray-300 rounded text-xs bg-white text-slate-900 [color-scheme:light]"
                      value={post.date}
                      onChange={(e) =>
                        updatePost(post.id, 'date', e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-300 rounded text-xs"
                      placeholder="Post title / task"
                      value={post.title}
                      onChange={(e) =>
                        updatePost(post.id, 'title', e.target.value)
                      }
                    />
                    <button
                      onClick={() => removePost(post.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addPost}
                  className="text-xs flex items-center gap-1 text-indigo-700 font-medium hover:underline"
                >
                  <Plus size={14} /> Add work log row
                </button>
              </div>
            )}
          </div>
          
          <div className="h-20"><p className="text-center text-[10px] text-slate-400 mt-8">Your data is stored locally in your browser.</p></div>
        </div>

        {/* Footer buttons */}
        <div className={`p-4 border-t shrink-0 flex gap-3 pb-24 md:pb-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <button
            onClick={saveCurrentInvoice}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <Save size={18} /> Save
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            <Printer size={18} /> Print / PDF
          </button>
        </div>
      </div>

      {/* RIGHT PANEL – PREVIEW (printable) */}
      <div 
        className={`
          flex-1 w-full bg-gray-100 overflow-y-auto p-4 md:p-8 print-container 
          md:ml-[480px]
          ${activeMobileTab === 'preview' ? 'block' : 'hidden md:block'}
        `}
      >
        {/* Top preview header (no-print) */}
        <div className="no-print mb-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            <span className="font-semibold tracking-[0.18em] uppercase mr-2">
              Preview
            </span>
            {invoiceData.invoiceNumber && (
              <span className="text-slate-700">
                {invoiceData.invoiceNumber}{' '}
                {invoiceData.clientName ? `· ${invoiceData.clientName}` : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-black shadow-md"
          >
            <Printer size={14} />
            Download PDF
          </button>
        </div>

        {/* ✅ FIXED GLOBAL FOOTER FOR INVOICE PDF ✅ */}
        {/* Only show on print media, handled via CSS now */}
        <div className="hidden print:block fixed bottom-0 left-0 w-full text-center pb-4 z-50 text-black">
          <p className="text-[10px] font-medium text-slate-500">Generated by IndieByll</p> 
        </div>

        {/* PAGE 1 - SCALED ON MOBILE */}
        <div className="flex justify-center pb-24 md:pb-0">
          <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-100 origin-top transition-transform duration-200">
            <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-6 shadow-xl relative text-gray-900 font-inter page-break-inside-avoid print:w-full print:max-w-none print:shadow-none print:min-h-0 print:h-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start mb-16">
                <div className="flex flex-col gap-4 order-2 sm:order-1">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Agency Logo"
                      className="h-16 sm:h-20 w-auto object-contain self-start mb-4"
                    />
                  ) : (
                    <Building2
                      size={64}
                      className="text-slate-300 mb-4"
                      style={{ color: brandColor }}
                    />
                  )}

                  <div>
                    <h1
                      className="text-4xl sm:text-5xl font-playfair-display font-bold mb-2"
                      style={{ color: brandColor }}
                    >
                      INVOICE
                    </h1>
                    <p className="text-gray-600 text-sm">
                      Invoice #
                      <span className="font-semibold ml-1">
                        {invoiceData.invoiceNumber}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      Date:
                      <span className="font-semibold ml-1">{invoiceData.date}</span>
                    </p>
                    {invoiceData.dueDate && (
                      <p className="text-gray-600 text-sm">
                        Due:
                        <span className="font-semibold text-red-600 ml-1">
                          {invoiceData.dueDate}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right order-1 sm:order-2 w-full mt-4 sm:mt-0">
                  <h2
                    className="text-xl sm:text-2xl font-bold mb-1"
                    style={{ color: brandColor }}
                  >
                    {invoiceData.companyName}
                  </h2>
                  <p className="text-sm text-gray-700 max-w-full sm:max-w-[250px] sm:ml-auto whitespace-pre-line leading-snug break-words">
                    {invoiceData.companyAddress}
                    {!appState.isIndianClient && (
                      <span className="font-medium block mt-1">
                        International client
                      </span>
                    )}
                  </p>
                  {invoiceData.companyEmail && (
                    <p className="text-sm text-gray-700 mt-2">
                      Email: {invoiceData.companyEmail}
                    </p>
                  )}
                  {invoiceData.companyPhone && (
                    <p className="text-sm text-gray-700">
                      Phone: {invoiceData.companyPhone}
                    </p>
                  )}

                  {invoiceData.serviceType && (
                    <div
                      className="mt-4 inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide bg-slate-100"
                      style={{ color: brandColor }}
                    >
                      {invoiceData.serviceType}
                    </div>
                  )}
                </div>
              </div>

              {/* Client info */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-16 border-b-2 border-gray-100 pb-8"
              >
                <div>
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: brandColor }}
                  >
                    Billed to
                  </h3>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {invoiceData.clientName || '---'}
                  </p>
                  <p className="text-gray-700 whitespace-pre-line text-sm mt-1 break-words">
                    {invoiceData.clientAddress || '---'}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <h3
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: brandColor }}
                  >
                    Payment details
                  </h3>
                  {appState.isGstEnabled && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">GSTIN:</span>{' '}
                      29ABCDE1234F1Z5
                    </p>
                  )}

                  {(invoiceData.paymentMethod === 'Bank' ||
                    invoiceData.paymentMethod === 'Both') && (
                    <>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium text-gray-900">
                          Bank:
                        </span>{' '}
                        {invoiceData.bankName}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          Account Name:
                        </span>{' '}
                        {invoiceData.accountHolderName}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          Account No:
                        </span>{' '}
                        {invoiceData.accountNo}
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          IFSC:
                        </span>{' '}
                        {invoiceData.ifscCode}
                      </p>
                    </>
                  )}
                  {(invoiceData.paymentMethod === 'UPI' ||
                    invoiceData.paymentMethod === 'Both') && (
                    <>
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium text-gray-900">UPI ID:</span>{' '}
                        {invoiceData.upiId}
                      </p>
                      {(invoiceData.paymentMethod === 'UPI' && invoiceData.accountHolderName) && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium text-gray-900">Account Name:</span>{' '}
                            {invoiceData.accountHolderName}
                          </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Items table */}
              <table className="w-full mb-8 text-sm">
                <thead>
                  <tr
                    className="border-b-2 border-gray-200"
                  >
                    <th
                      className="text-left py-3 px-4 font-bold w-[50%]"
                      style={{ color: brandColor }}
                    >
                      Description
                    </th>
                    <th
                      className="text-right py-3 px-4 font-bold"
                      style={{ color: brandColor }}
                    >
                      Qty
                    </th>
                    <th
                      className="text-right py-3 px-4 font-bold"
                      style={{ color: brandColor }}
                    >
                      Rate
                    </th>
                    <th
                      className="text-right py-3 px-4 font-bold"
                      style={{ color: brandColor }}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="py-3 px-4 text-gray-800 font-medium break-words max-w-[50%]">
                        {item.description || '---'}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                        {formatCurrency(
                          (Number(item.quantity) || 0) * (Number(item.price) || 0)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculations */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 page-break-inside-avoid">
                {/* Left: QR code */}
                <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
                  {qrCode &&
                    (invoiceData.paymentMethod === 'UPI' ||
                      invoiceData.paymentMethod === 'Both') && (
                      <div className="mb-4">
                        <h4
                          className="text-xs font-bold uppercase tracking-wider mb-2"
                          style={{ color: brandColor }}
                        >
                          UPI payment
                        </h4>
                        <img
                          src={qrCode}
                          alt="QR Code"
                          className="w-32 h-32 object-contain border border-gray-200 p-2"
                        />
                      </div>
                    )}
                </div>

                {/* Right: totals */}
                <div className="w-full sm:w-80 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200 ml-0 sm:ml-auto">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {invoiceData.discountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Discount applied</span>
                        <span>- {formatCurrency(invoiceData.discountAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-800 border-t border-gray-300 pt-2">
                        <span>Total after discount</span>
                        <span>{formatCurrency(totalAfterDiscount)}</span>
                      </div>
                    </>
                  )}

                  {appState.isGstEnabled && (
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Tax ({invoiceData.gstRate}%)</span>
                      <span>{formatCurrency(gstAmount)}</span>
                    </div>
                  )}

                  {invoiceData.isRecurring && (
                    <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-300">
                      <span>Current month total</span>
                      <span>{formatCurrency(totalFinalBill)}</span>
                    </div>
                  )}

                  {invoiceData.previousDue > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>+ Previous outstanding due</span>
                      <span>{formatCurrency(invoiceData.previousDue)}</span>
                    </div>
                  )}

                  {invoiceData.advancePaid > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Less: advance paid</span>
                      <span>- {formatCurrency(invoiceData.advancePaid)}</span>
                    </div>
                  )}

                  <div
                    className="flex justify-between text-xl font-black pt-4 border-t-2 border-gray-200"
                    style={{ color: brandColor }}
                  >
                    <span>Balance due</span>
                    <span>{formatCurrency(finalDueAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoiceData.notes && (
                <div className="mt-12 page-break-inside-avoid">
                  <h4
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: brandColor }}
                  >
                    Notes
                  </h4>
                  <RichTextRenderer text={invoiceData.notes} className="text-xs text-gray-600"/>
                </div>
              )}

              {/* Signature */}
              {invoiceData.includeSignatoryBlock && (
                <div className="mt-16 text-right page-break-inside-avoid">
                  {signature ? (
                    <img
                      src={signature}
                      alt="Signature"
                      className="h-20 w-auto object-contain ml-auto mb-1 border-b border-gray-300 pb-1"
                    />
                  ) : (
                    <div className="h-20 border-b border-gray-300 w-48 ml-auto mb-1 flex items-end justify-center text-xs text-gray-400">
                      [Authorized signatory area]
                    </div>
                  )}
                  <p
                    className="text-sm font-semibold"
                    style={{ color: brandColor }}
                  >
                    {invoiceData.signatoryName}
                  </p>
                  <p className="text-xs text-gray-600">(Authorized signatory)</p>
                </div>
              )}

              {/* Footer text (In-Preview) */}
              <div className="mt-auto pt-8 border-t border-gray-100 text-center text-gray-500 text-xs page-break-inside-avoid">
                <p className="mb-1">
                  Thank you for your business. Please make payments to{' '}
                  <span className="font-semibold text-gray-700">
                    {invoiceData.companyName}
                  </span>
                  .
                </p>
                
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2 – ANNEXURE - SCALED ON MOBILE */}
        {postDetails.length > 0 && (
          <div className="flex justify-center pb-24 md:pb-0">
            <div className="transform scale-[0.45] sm:scale-[0.6] md:scale-100 origin-top transition-transform duration-200 mt-10 md:mt-0">
              <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-12 shadow-xl relative text-gray-900 page-break mt-8 font-inter print:mt-0 print:w-full print:max-w-none print:shadow-none print:min-h-0 print:h-auto">
                <div
                  className="border-b-2 border-gray-100 pb-4 mb-8 flex justify-between items-end"
                >
                  <div>
                    <h2
                      className="text-2xl sm:text-3xl font-playfair-display font-bold"
                      style={{ color: brandColor }}
                    >
                      ANNEXURE A
                    </h2>
                    <p className="text-sm text-gray-600">
                      Work log / deliverables detail for invoice #
                      {invoiceData.invoiceNumber}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">Date: {invoiceData.date}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] text-sm border-collapse border border-gray-200">
                    <thead>
                      <tr>
                        <th
                          className="border border-gray-200 p-3 text-left font-bold w-32"
                          style={{ color: brandColor }}
                        >
                          Date
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-left font-bold"
                          style={{ color: brandColor }}
                        >
                          Deliverable / post title
                        </th>
                        <th
                          className="border border-gray-200 p-3 text-center font-bold w-32"
                          style={{ color: brandColor }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {postDetails.map((post) => (
                        <tr
                          key={post.id}
                          className="odd:bg-white even:bg-gray-50"
                        >
                          <td className="border border-gray-200 p-3 text-gray-700">
                            {post.date || '-'}
                          </td>
                          <td className="border border-gray-200 p-3 text-gray-900 font-medium">
                            {post.title || '-'}
                          </td>
                          <td className="border border-gray-200 p-3 text-center">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">
                              {post.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800">
                  <strong>Note:</strong> This is an itemized breakdown of the services
                  rendered for the billing period mentioned in the main invoice.
                </div>
                
                {/* Footer on Page 2 as well */}
                <div className="mt-auto pt-8 border-t border-gray-100 text-center text-xs page-break-inside-avoid">
                    
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW CLIENT MODAL */}
      {showClientModal && (
        <NewClientModal onClose={closeClientModal} onSave={addClient} />
      )}

      {/* FEEDBACK */}
      <FeedbackWidget />

      {/* Animations + print styles */}
      <style>{`
        .section-open {
          animation: fadeInUp 0.22s ease-out;
        }
        .feedback-anim {
          animation: fadeInUp 0.2s ease-out;
        }
        .animate-fade-in-down { animation: fadeInUp 0.2s ease-out; }
        .animate-fade-in { animation: fadeInUp 0.15s ease-out; }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1; /* slate-300 */
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; /* slate-400 */
        }
        /* Dark mode scrollbar */
        .bg-slate-900 ::-webkit-scrollbar-thumb,
        .bg-slate-950 ::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
        }
        .bg-slate-900 ::-webkit-scrollbar-thumb:hover,
        .bg-slate-950 ::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }

        @media print {
          /* Force all print backgrounds to be white */
          body, .print-container, .bg-slate-950, .bg-slate-900 {
            background-color: white !important;
            color: black !important;
          }
          
          /* Hide UI elements */
          .no-print, button, input[type="file"], ::-webkit-scrollbar {
            display: none !important;
          }

          /* Ensure main content is visible */
          .print-container {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            position: absolute;
            top: 0;
            left: 0;
          }

          /* Reset Scaling for Print */
          .transform {
            transform: none !important;
          }

          /* Page Setup */
          @page {
            size: A4;
            margin: 0;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .page-break-inside-avoid {
            break-inside: avoid;
          }

          /* Ensure proper text visibility */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            text-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGeneratorScreen;