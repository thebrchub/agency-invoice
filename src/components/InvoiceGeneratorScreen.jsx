import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Printer,
  FileText,
  Image as ImageIcon,
  Globe,
  Palette,
  Building2,
  Save,
  FilePlus,
  UserPlus,
  Scan,
  Signature,
  Banknote,
  X,
  Users,
  ChevronLeft,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { CURRENCIES, THEMES } from '../utils/constants';

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
      className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4"
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
            className="w-full p-3 border border-gray-300 rounded-lg text-base focus:border-indigo-500 focus:ring-indigo-500"
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
  const [isDark, setIsDark] = useState(false);

  // Safe currency symbol
  const effectiveCurrencySymbol =
    currencySymbol || (appState.isIndianClient ? '₹' : '$');

  // Accordion state
  const [openSections, setOpenSections] = useState({
    branding: false,
    details: false,
    items: false,
    payment: false,
    annexure: false,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /*  HANDLERS  */
  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
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
      [key]: null,
      [liveKey]: null,
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

  // quantity-based pricing rules
  const addPricingRule = () =>
    setAppState((prev) => ({
      ...prev,
      pricingRules: [
        ...(prev.pricingRules || []),
        { id: Date.now(), min: 1, max: 10, rate: 0 },
      ],
    }));

  const updatePricingRule = (id, field, value) =>
    setAppState((prev) => ({
      ...prev,
      pricingRules: (prev.pricingRules || []).map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));

  const removePricingRule = (id) =>
    setAppState((prev) => ({
      ...prev,
      pricingRules: (prev.pricingRules || []).filter((r) => r.id !== id),
    }));

  const updateItem = (id, field, value) => {
    setAppState((prev) => {
      const useRules =
        prev.usePricingRules && Array.isArray(prev.pricingRules);
      const items = prev.items.map((item) => {
        if (item.id !== id) return item;

        if (field === 'quantity') {
          const quantity = Number(value) || 0;
          let nextPrice = item.price;

          if (useRules && quantity > 0) {
            const match = prev.pricingRules.find((rule) => {
              const min = Number(rule.min) || 0;
              const max = Number(rule.max) || 0;
              return quantity >= min && quantity <= max;
            });
            if (match) {
              nextPrice = Number(match.rate) || 0;
            }
          }

          return {
            ...item,
            quantity,
            ...(useRules ? { price: nextPrice } : {}),
          };
        }

        if (field === 'price') {
          return { ...item, price: Number(value) || 0 };
        }

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

  const updatePost = (id, field, value) => {
    setAppState((prev) => ({
      ...prev,
      postDetails: prev.postDetails.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

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

  /*  CALCULATIONS  */
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

  /*  UI  */
  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row font-inter ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}
    >
      {/* LEFT PANEL – EDITOR (no-print) */}
      <div
        className={`w-full md:w-[440px] h-auto md:h-screen no-print shadow-xl z-20 flex flex-col md:fixed md:top-0 md:left-0 border-r ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('home')}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-gray-50"
            >
              <ChevronLeft size={14} className="mr-1 text-indigo-600" />
              Home
            </button>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-400">
                Builder
              </p>
              <h2 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Invoice editor
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark((d) => !d)}
              className="p-1.5 rounded-full border border-slate-600/70 text-slate-300 hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {appState.showSaveMessage && (
              <div className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full shadow-md">
                <Save size={14} className="mr-1" /> Saved
              </div>
            )}
          </div>
        </div>

        {/* Editor Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 0. Client Management */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-semibold text-xs text-slate-600 uppercase flex items-center gap-1">
              <Users size={14} /> Client management
            </h3>
            <div className="flex gap-2">
              <select
                value={currentClientId || ''}
                onChange={(e) => loadClientData(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="" disabled>
                  -- Select client --
                </option>
                {clientsList.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <button
                onClick={openClientModal}
                className="bg-emerald-600 text-white px-3 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <UserPlus size={14} />
                New
              </button>
            </div>

            {currentClientId && (
              <div className="flex gap-2">
                <button
                  onClick={startNewInvoice}
                  className="flex-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
                >
                  <FilePlus size={14} /> New invoice
                </button>
                <button
                  onClick={saveCurrentInvoice}
                  className="bg-amber-500 text-white px-3 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 text-xs font-semibold"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            )}

            {currentClientId &&
              clients[currentClientId] &&
              clients[currentClientId].invoices &&
              clients[currentClientId].invoices.length > 0 && (
                <div className="border-t pt-3 mt-3">
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
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
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
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
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => toggleSection('branding')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  1. Branding & localization
                </p>
                <p className="text-[11px] text-slate-500">
                  Logo, theme & company basics
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.branding ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.branding && (
              <div className="section-open mt-4 space-y-4">
                {/* Theme selector */}
                <div
                  className={`p-3 rounded-lg border ${
                    theme?.borderLight || 'border-gray-200'
                  } ${theme?.bgAccent || ''}`}
                >
                  <h4 className="text-[11px] font-semibold text-gray-600 mb-2 flex items-center gap-1 uppercase tracking-wide">
                    <Palette size={14} /> Invoice theme
                  </h4>
                  <select
                    value={appState.selectedTheme}
                    onChange={(e) =>
                      setAppState((prev) => ({
                        ...prev,
                        selectedTheme: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(THEMES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo + company details */}
                <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                  <div className="relative w-16 h-16 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer flex-shrink-0">
                    {logo ? (
                      <img
                        src={logo}
                        alt="Agency Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={20} className="text-gray-400" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'logoBase64')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload logo"
                    />

                    {logo && (
                      <button
                        onClick={() => handleImageRemove('logoBase64')}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-tr-lg p-0.5 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="Company name"
                      value={invoiceData.companyName}
                      onChange={(e) =>
                        setInvoiceField('companyName', e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-sm font-medium"
                    />
                    <textarea
                      placeholder="Company address"
                      rows="2"
                      value={invoiceData.companyAddress}
                      onChange={(e) =>
                        setInvoiceField('companyAddress', e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={invoiceData.companyEmail}
                      onChange={(e) =>
                        setInvoiceField('companyEmail', e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={invoiceData.companyPhone}
                      onChange={(e) =>
                        setInvoiceField('companyPhone', e.target.value)
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-xs"
                    />
                  </div>
                </div>

                {/* Tax + recurring */}
                <div className="flex gap-4 border-t pt-4">
                  <div className="flex flex-col bg-slate-50 p-3 rounded border border-gray-300 shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Add tax?</span>
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
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                      Tax rate (%)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 18"
                      value={invoiceData.gstRate}
                      onChange={(e) =>
                        setInvoiceField('gstRate', Number(e.target.value))
                      }
                      className="w-full p-1.5 border border-gray-300 rounded text-sm focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-gray-300 shadow-sm flex-1 self-start">
                    <span className="text-sm font-medium">Recurring?</span>
                    <input
                      type="checkbox"
                      checked={invoiceData.isRecurring}
                      onChange={(e) =>
                        setInvoiceField('isRecurring', e.target.checked)
                      }
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Service title */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Service title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Graphic designing, SaaS product"
                    value={invoiceData.serviceType}
                    onChange={(e) =>
                      setInvoiceField('serviceType', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Client region / currency */}
                <div className="pt-2 border-t border-gray-200">
                  <h4 className="text-[11px] font-semibold text-gray-600 mb-2 flex items-center gap-1 uppercase tracking-wide">
                    <Globe size={14} /> Client region
                  </h4>

                  <label className="flex items-center gap-2 mb-2 text-sm text-gray-700">
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
                    Client is in India (use INR)
                  </label>

                  {!appState.isIndianClient && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
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
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
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

          {/* 2. Invoice & Client details */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => toggleSection('details')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  2. Invoice & client details
                </p>
                <p className="text-[11px] text-slate-500">
                  Invoice number, client info, dates
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.details ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.details && (
              <div className="section-open mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Invoice number (e.g. INV-001)"
                  value={invoiceData.invoiceNumber}
                  onChange={(e) =>
                    setInvoiceField('invoiceNumber', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Client name"
                  value={invoiceData.clientName}
                  onChange={(e) =>
                    setInvoiceField('clientName', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <textarea
                  placeholder="Client address"
                  rows="2"
                  value={invoiceData.clientAddress}
                  onChange={(e) =>
                    setInvoiceField('clientAddress', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Issue date
                    </label>
                    <input
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) =>
                        setInvoiceField('date', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Payment due
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) =>
                        setInvoiceField('dueDate', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Itemization & summary */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => toggleSection('items')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  3. Itemization & summary
                </p>
                <p className="text-[11px] text-slate-500">
                  Line items & balance adjustments
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.items ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.items && (
              <div className="section-open mt-4 space-y-4">
                <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-2">
                  Invoice items
                </h4>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-gray-200 rounded-md shadow-sm relative"
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 text-red-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <input
                      className="w-full mb-2 pr-6 text-sm font-medium border-b border-gray-200 focus:border-indigo-300 outline-none pb-1 bg-transparent"
                      placeholder="Service description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, 'description', e.target.value)
                      }
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="w-16 p-1 bg-white border border-gray-300 rounded text-xs"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                      />
                      <input
                        type="number"
                        className="flex-1 p-1 bg-white border border-gray-300 rounded text-xs"
                        placeholder="Price"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'price',
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addItem}
                  className="text-xs flex items-center gap-1 text-indigo-700 font-medium hover:underline"
                >
                  <Plus size={14} /> Add bill item
                </button>

                {/* Pricing rules card */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-2">
                    Rate per post rules
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Example: 1–19 posts = ₹79, 20–27 posts = ₹69. When enabled,
                    quantity will auto-pick the correct rate.
                  </p>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={appState.usePricingRules || false}
                      onChange={(e) =>
                        setAppState((prev) => ({
                          ...prev,
                          usePricingRules: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    Use quantity-based rate rules
                  </label>

                  {appState.usePricingRules && (
                    <div className="space-y-2">
                      {pricingRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="text-gray-600 w-8">From</span>
                          <input
                            type="number"
                            className="w-16 p-1 border border-gray-300 rounded"
                            value={rule.min}
                            onChange={(e) =>
                              updatePricingRule(
                                rule.id,
                                'min',
                                Number(e.target.value)
                              )
                            }
                          />
                          <span className="text-gray-600 w-6 text-center">
                            to
                          </span>
                          <input
                            type="number"
                            className="w-16 p-1 border border-gray-300 rounded"
                            value={rule.max}
                            onChange={(e) =>
                              updatePricingRule(
                                rule.id,
                                'max',
                                Number(e.target.value)
                              )
                            }
                          />
                          <span className="text-gray-600 ml-1">=</span>
                          <span className="text-gray-700 ml-1">
                            {effectiveCurrencySymbol}
                          </span>
                          <input
                            type="number"
                            className="w-20 p-1 border border-gray-300 rounded"
                            value={rule.rate}
                            onChange={(e) =>
                              updatePricingRule(
                                rule.id,
                                'rate',
                                Number(e.target.value)
                              )
                            }
                          />
                          <button
                            onClick={() => removePricingRule(rule.id)}
                            className="text-red-400 hover:text-red-600 ml-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addPricingRule}
                        className="text-[11px] flex items-center gap-1 text-indigo-700 font-medium hover:underline"
                      >
                        <Plus size={12} /> Add rule
                      </button>
                    </div>
                  )}
                </div>

                {/* Balance adjustments */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-2">
                    Balance adjustments
                  </h4>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">
                      Discount applied ({effectiveCurrencySymbol})
                    </label>
                    <input
                      type="number"
                      value={invoiceData.discountAmount}
                      onChange={(e) =>
                        setInvoiceField(
                          'discountAmount',
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 border border-blue-300 rounded text-sm mt-1 bg-blue-50 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">
                      Previous balance due ({effectiveCurrencySymbol})
                    </label>
                    <input
                      type="number"
                      value={invoiceData.previousDue}
                      onChange={(e) =>
                        setInvoiceField('previousDue', Number(e.target.value))
                      }
                      className="w-full p-2 border border-red-300 rounded text-sm mt-1 bg-red-50 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600">
                      Advance received ({effectiveCurrencySymbol})
                    </label>
                    <input
                      type="number"
                      value={invoiceData.advancePaid}
                      onChange={(e) =>
                        setInvoiceField(
                          'advancePaid',
                          Number(e.target.value)
                        )
                      }
                      className="w-full p-2 border border-green-300 rounded text-sm mt-1 bg-green-50 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Payment & finalisation */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => toggleSection('payment')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  4. Payment & finalisation
                </p>
                <p className="text-[11px] text-slate-500">
                  Bank / UPI details, signatures & notes
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.payment ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.payment && (
              <div className="section-open mt-4 space-y-4">
                <h3 className="font-semibold text-xs text-slate-600 uppercase flex items-center gap-2">
                  <Banknote size={16} /> Payment & finalisation
                </h3>

                <div className="bg-slate-50 p-3 rounded border border-gray-300 shadow-sm">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-2">
                    Payment method display
                  </h4>
                  <select
                    value={invoiceData.paymentMethod}
                    onChange={(e) =>
                      setInvoiceField('paymentMethod', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500"
                  >
                    <option value="Bank">Bank details only</option>
                    <option value="UPI">UPI ID only</option>
                    <option value="Both">Show both</option>
                  </select>
                </div>

                {(invoiceData.paymentMethod === 'Bank' ||
                  invoiceData.paymentMethod === 'Both') && (
                  <>
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-3">
                      Bank details
                    </h4>
                    <input
                      type="text"
                      placeholder="Bank name"
                      value={invoiceData.bankName}
                      onChange={(e) =>
                        setInvoiceField('bankName', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Account number"
                      value={invoiceData.accountNo}
                      onChange={(e) =>
                        setInvoiceField('accountNo', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="IFSC code"
                      value={invoiceData.ifscCode}
                      onChange={(e) =>
                        setInvoiceField('ifscCode', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                    />
                  </>
                )}

                {(invoiceData.paymentMethod === 'UPI' ||
                  invoiceData.paymentMethod === 'Both') && (
                  <>
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-3">
                      UPI details
                    </h4>
                    <input
                      type="text"
                      placeholder="UPI ID (e.g. xyz@upi)"
                      value={invoiceData.upiId}
                      onChange={(e) =>
                        setInvoiceField('upiId', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                    />
                  </>
                )}

                <h4 className="text-[11px] font-bold text-gray-500 uppercase mt-4">
                  Authorised signatory name
                </h4>
                <input
                  type="text"
                  placeholder="e.g. John Doe / Company LLP"
                  value={invoiceData.signatoryName}
                  onChange={(e) =>
                    setInvoiceField('signatoryName', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                />

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded border border-gray-300 shadow-sm">
                  <span className="text-sm font-medium">
                    Include signatory block?
                  </span>
                  <input
                    type="checkbox"
                    checked={invoiceData.includeSignatoryBlock}
                    onChange={(e) =>
                      setInvoiceField(
                        'includeSignatoryBlock',
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </div>

                <h4 className="text-[11px] font-bold text-gray-500 uppercase pt-4 border-t border-gray-200">
                  Images (QR code / signature)
                </h4>

                {/* QR */}
                <div
                  className={`p-3 rounded-lg border ${
                    qrCode ? 'border-emerald-400' : 'border-gray-300'
                  } bg-white flex items-center gap-3 shadow-sm`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border border-dashed border-gray-400 rounded flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer">
                    {qrCode ? (
                      <img
                        src={qrCode}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Scan size={18} className="text-gray-400" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'qrBase64')}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload QR code"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Upload payment QR</p>
                    <p className="text-xs text-gray-500">
                      {qrCode
                        ? 'Uploaded: click to replace'
                        : 'Click box to upload image'}
                    </p>
                  </div>
                  {qrCode && (
                    <button
                      onClick={() => handleImageRemove('qrBase64')}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Signature */}
                <div
                  className={`p-3 rounded-lg border ${
                    signature ? 'border-emerald-400' : 'border-gray-300'
                  } bg-white flex items-center gap-3 shadow-sm`}
                >
                  <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border border-dashed border-gray-400 rounded flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer">
                    {signature ? (
                      <img
                        src={signature}
                        alt="Signature/Stamp"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Signature size={18} className="text-gray-400" />
                    )}
                    <input
                      type="file"
                      onChange={(e) =>
                        handleImageUpload(e, 'signatureBase64')
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      title="Upload signature/stamp"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Upload signature / stamp
                    </p>
                    <p className="text-xs text-gray-500">
                      {signature
                        ? 'Uploaded: click to replace'
                        : 'Click box to upload image'}
                    </p>
                  </div>
                  {signature && (
                    <button
                      onClick={() => handleImageRemove('signatureBase64')}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <h4 className="text-[11px] font-bold text-gray-500 uppercase pt-4 border-t border-gray-200">
                  Invoice notes
                </h4>
                <textarea
                  placeholder="e.g. Payments are due upon receipt..."
                  rows="3"
                  value={invoiceData.notes}
                  onChange={(e) => setInvoiceField('notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* 5. Annexure */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 transition-all hover:shadow-md">
            <button
              type="button"
              onClick={() => toggleSection('annexure')}
              className="w-full flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                  5. Page 2: work logs / posts
                </p>
                <p className="text-[11px] text-slate-500">
                  Annexure rows shown on second page
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openSections.annexure ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openSections.annexure && (
              <div className="section-open mt-4 space-y-3">
                <p className="text-[11px] text-gray-500">
                  These rows become Annexure A on the second page of the
                  invoice.
                </p>

                {postDetails.map((post) => (
                  <div key={post.id} className="flex gap-2 items-center">
                    <input
                      type="date"
                      className="w-28 p-2 border border-gray-300 rounded text-xs bg-white"
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0 z-10">
          <div className="flex gap-3">
            <button
              onClick={saveCurrentInvoice}
              className="flex-1 bg-slate-800 border border-slate-600 text-slate-100 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save changes
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-600 flex items-center justify-center gap-2 shadow-md"
            >
              <Printer size={16} /> Print / PDF
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL – PREVIEW (printable) */}
      <div className="flex-1 w-full bg-slate-50 overflow-y-auto p-4 md:p-8 md:ml-[440px] print-container">
        {/* Preview header */}
        <div className="mb-4 no-print">
          <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Preview
              </span>
              <span className="text-xs sm:text-sm text-slate-700">
                {invoiceData.invoiceNumber || 'New invoice'} ·{' '}
                {invoiceData.clientName || 'No client selected'}
              </span>
            </div>
          </div>
        </div>

        {/* PAGE 1: MAIN INVOICE */}
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-12 shadow-xl relative text-gray-900 font-inter">
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
                  className={`text-${theme?.accent || 'indigo-600'} mb-4`}
                />
              )}

              <div>
                <h1
                  className={`text-4xl sm:text-5xl font-playfair-display font-bold text-${theme?.primary || 'indigo-700'} mb-2`}
                >
                  INVOICE
                </h1>
                <p className="text-gray-600 text-sm">
                  Invoice #<span className="font-semibold">{invoiceData.invoiceNumber}</span>
                </p>
                <p className="text-gray-600 text-sm">
                  Date: <span className="font-semibold">{invoiceData.date}</span>
                </p>
                {invoiceData.dueDate && (
                  <p className="text-gray-600 text-sm">
                    Due:{' '}
                    <span className="font-semibold text-red-600">
                      {invoiceData.dueDate}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="text-left sm:text-right order-1 sm:order-2 w-full mt-4 sm:mt-0">
              <h2
                className={`text-xl sm:text-2xl font-bold text-${theme?.primary || 'indigo-700'} mb-1`}
              >
                {invoiceData.companyName}
              </h2>
              <p className="text-sm text-gray-700 max-w-full sm:max-w-[250px] sm:ml-auto whitespace-pre-line leading-snug">
                {invoiceData.companyAddress}
                {!appState.isIndianClient && (
                  <span className="font-medium block mt-1">
                    International client
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Email: {invoiceData.companyEmail}
              </p>
              <p className="text-sm text-gray-700">
                Phone: {invoiceData.companyPhone}
              </p>

              <div
                className={`mt-4 inline-block bg-${theme?.light || 'indigo-100'} text-${theme?.primary || 'indigo-700'} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}
              >
                {invoiceData.serviceType}
              </div>
            </div>
          </div>

          {/* Client info grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-16 border-b-2 ${
              theme?.borderLight || 'border-gray-100'
            } pb-8`}
          >
            <div>
              <h3
                className={`text-[11px] font-bold text-${theme?.accent || 'indigo-600'} uppercase tracking-wider mb-2`}
              >
                Billed to
              </h3>
              <p className="text-lg font-semibold text-gray-900">
                {invoiceData.clientName || '---'}
              </p>
              <p className="text-gray-700 whitespace-pre-line text-sm mt-1">
                {invoiceData.clientAddress || '---'}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <h3
                className={`text-[11px] font-bold text-${theme?.accent || 'indigo-600'} uppercase tracking-wider mb-2`}
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
                      Bank name:
                    </span>{' '}
                    {invoiceData.bankName}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">
                      Account no:
                    </span>{' '}
                    {invoiceData.accountNo}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">
                      IFSC code:
                    </span>{' '}
                    {invoiceData.ifscCode}
                  </p>
                </>
              )}
              {(invoiceData.paymentMethod === 'UPI' ||
                invoiceData.paymentMethod === 'Both') && (
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium text-gray-900">UPI ID:</span>{' '}
                  {invoiceData.upiId}
                </p>
              )}
            </div>
          </div>

          {/* Items table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr
                className={`border-b-2 ${
                  theme?.borderStrong || 'border-gray-200'
                } ${theme?.bgAccent || ''}`}
              >
                <th
                  className={`text-left py-3 px-4 font-bold text-${theme?.primary || 'indigo-700'} w-[50%]`}
                >
                  Description
                </th>
                <th
                  className={`text-right py-3 px-4 font-bold text-${theme?.primary || 'indigo-700'}`}
                >
                  Qty
                </th>
                <th
                  className={`text-right py-3 px-4 font-bold text-${theme?.primary || 'indigo-700'}`}
                >
                  Rate
                </th>
                <th
                  className={`text-right py-3 px-4 font-bold text-${theme?.primary || 'indigo-700'}`}
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
                  <td className="py-3 px-4 text-gray-800 font-medium">
                    {item.description || '---'}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    {formatCurrency(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations row */}
          <div className="flex flex-col sm:flex-row justify-between mt-8">
            {/* QR – always show if uploaded */}
            <div className="w-full sm:w-1/2 mb-6 sm:mb-0">
              {qrCode && (
                <div className="mb-4">
                  <h4
                    className={`text-[11px] font-bold text-${theme?.accent || 'indigo-600'} uppercase tracking-wider mb-2`}
                  >
                    Payment QR
                  </h4>
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-32 h-32 object-contain border border-gray-200 p-2"
                  />
                </div>
              )}
            </div>

            {/* Totals card */}
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
                className={`flex justify-between text-xl font-black text-${theme?.accent || 'indigo-600'} pt-4 border-t-2 ${
                  theme?.borderLight || 'border-gray-200'
                }`}
              >
                <span>Balance due</span>
                <span>{formatCurrency(finalDueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mt-12">
              <h4
                className={`text-[11px] font-bold text-${theme?.accent || 'indigo-600'} uppercase tracking-wider mb-2`}
              >
                Notes
              </h4>
              <p className="text-xs text-gray-600 whitespace-pre-line">
                {invoiceData.notes}
              </p>
            </div>
          )}

          {/* Signature */}
          {invoiceData.includeSignatoryBlock && (
            <div className="mt-16 text-right">
              {signature ? (
                <img
                  src={signature}
                  alt="Signature"
                  className="h-20 w-auto object-contain ml-auto mb-1 border-b border-gray-300 pb-1"
                />
              ) : (
                <div className="h-20 border-b border-gray-300 w-48 ml-auto mb-1 flex items-end justify-center text-xs text-gray-400">
                  [Authorised signatory area]
                </div>
              )}
              <p
                className={`text-sm font-semibold text-${theme?.primary || 'indigo-700'}`}
              >
                {invoiceData.signatoryName}
              </p>
              <p className="text-xs text-gray-600">(Authorised signatory)</p>
            </div>
          )}

          {/* Footer page 1 */}
          <div className="mt-8 text-center text-gray-500 text-xs">
            <p className="mb-1">
              Thank you for your business. Please make payments to{' '}
              <span className="font-semibold text-gray-700">
                {invoiceData.companyName}
              </span>
              .
            </p>
            <p>
              For queries, contact us at {invoiceData.companyEmail} or{' '}
              {invoiceData.companyPhone}.
            </p>
          </div>
        </div>

        {/* PAGE 2: ANNEXURE */}
        {postDetails.length > 0 && (
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-12 shadow-xl relative text-gray-900 page-break mt-8 font-inter">
            <div
              className={`border-b-2 ${
                theme?.borderLight || 'border-gray-100'
              } pb-4 mb-8 flex justify-between items-end`}
            >
              <div>
                <h2
                  className={`text-2xl sm:text-3xl font-playfair-display font-bold text-${theme?.primary || 'indigo-700'}`}
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
                <thead className={theme?.bgAccent || ''}>
                  <tr>
                    <th
                      className={`border border-gray-200 p-3 text-left font-bold text-${theme?.primary || 'indigo-700'} w-32`}
                    >
                      Date
                    </th>
                    <th
                      className={`border border-gray-200 p-3 text-left font-bold text-${theme?.primary || 'indigo-700'}`}
                    >
                      Deliverable / post title
                    </th>
                    <th
                      className={`border border-gray-200 p-3 text-center font-bold text-${theme?.primary || 'indigo-700'} w-32`}
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
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[11px] font-bold uppercase">
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800">
              <strong>Note:</strong> This is an itemised breakdown of the
              services rendered for the billing period mentioned in the main
              invoice.
            </div>
          </div>
        )}
      </div>

      {/* NEW CLIENT MODAL */}
      {showClientModal && (
        <NewClientModal onClose={closeClientModal} onSave={addClient} />
      )}

      {/* Animations + print styles */}
      <style jsx global>{`
        .section-open {
          animation: fadeInUp 0.22s ease-out;
        }
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
        @media print {
          html,
          body {
            margin: 0;
            padding: 0;
            height: auto;
            background: #ffffff;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            margin: 0 auto !important;
            padding: 0 !important;
            background: #ffffff !important;
          }
          .print-container > div {
            box-shadow: none !important;
            margin: 0 auto !important;
          }
          @page {
            size: A4;
            margin: 0;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceGeneratorScreen;
