import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Plus, Trash2, Printer, FileText, Image as ImageIcon, Globe, Palette, Building2, Save, FilePlus, UserPlus, Scan, Signature, Banknote, X } from 'lucide-react';

// --- CONSTANTS & THEME DEFINITIONS ---
const STORAGE_KEY = 'blazingRenderInvoiceApp_v5'; 

const THEMES = {
  SAPPHIRE: { 
    name: 'Sapphire Tech (Blue)', 
    primary: 'indigo-800', 
    light: 'indigo-50', 
    accent: 'indigo-600', 
    bgAccent: 'bg-indigo-50',
    borderStrong: 'border-indigo-700',
    borderLight: 'border-indigo-200'
  },
  FOREST: { 
    name: 'Modern Forest (Green)', 
    primary: 'emerald-800', 
    light: 'emerald-50', 
    accent: 'emerald-600', 
    bgAccent: 'bg-emerald-50',
    borderStrong: 'border-emerald-700',
    borderLight: 'border-emerald-200'
  },
  RUBY: { 
    name: 'Classic Ruby (Red)', 
    primary: 'red-800', 
    light: 'red-50', 
    accent: 'red-600', 
    bgAccent: 'bg-red-50',
    borderStrong: 'border-red-700',
    borderLight: 'border-red-200'
  },
  CARBON: { 
    name: 'Minimal Carbon (Grey)', 
    primary: 'gray-800', 
    light: 'gray-100', 
    accent: 'gray-700', 
    bgAccent: 'bg-gray-100',
    borderStrong: 'border-gray-800',
    borderLight: 'border-gray-300'
  },
};

const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
};
const CURRENCY_MAP = Object.values(CURRENCIES).reduce((acc, curr) => ({ ...acc, [curr.code]: curr.symbol }), {});

const DEFAULT_INVOICE_DATA = {
  invoiceNumber: 'INV-2025-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  companyName: 'Blazing Render Creation Hub LLP',
  companyAddress: 'Toranagallu, Ballari (dist.), Kanataka, India - 583123',
  companyEmail: 'info@blazingrender.com',
  companyPhone: '+91 98765 43210',
  clientName: '',
  clientAddress: '',
  serviceType: 'Graphic Designing', 
  advancePaid: 0,
  previousDue: 0,
  discountAmount: 0,
  bankName: 'Your Bank Ltd.',
  accountNo: 'XXXXXXXX12345',
  ifscCode: 'ABCD0001234',
  upiId: 'youragency@upi',
  paymentMethod: 'Both',
  isRecurring: true, 
  signatoryName: 'Blazing Render Creation Hub LLP', 
  gstRate: 18, 
  notes: 'Payments are due upon receipt. Thank you for choosing Blazing Render Creation Hub LLP for your creative and technical needs!', // NEW EDITABLE NOTES
};

const DEFAULT_ITEMS = [
  { id: 1, description: 'Social Media Creative Design (Monthly Retainer)', quantity: 1, price: 25000 },
];

const DEFAULT_POSTS = [
  { id: 1, date: new Date().toISOString().split('T')[0], title: 'Diwali Sale Announcement', status: 'Completed' },
];

const getNewInvoiceNumber = (clients) => {
  let maxNum = 0;
  Object.values(clients).forEach(client => {
    client.invoices.forEach(inv => {
      const match = inv.invoiceData.invoiceNumber.match(/INV-(\d{4})-(\d+)/);
      if (match) {
        const num = parseInt(match[2], 10);
        if (num > maxNum) maxNum = num;
      }
    });
  });
  const nextNum = maxNum + 1;
  const year = new Date().getFullYear();
  return `INV-${year}-${String(nextNum).padStart(3, '0')}`;
};

// --- INITIAL STATE LOADER ---
const getInitialState = () => {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      
      ['logo', 'qrCode', 'signature'].forEach(key => {
        const base64Key = `${key}Base64`;
        parsedState[key] = parsedState[base64Key] ? `data:image/png;base64,${parsedState[base64Key]}` : null;
      });
      
      if (!parsedState.invoiceData.gstRate) parsedState.invoiceData.gstRate = 18;
      if (!parsedState.invoiceData.paymentMethod) parsedState.invoiceData.paymentMethod = 'Bank'; 
      if (!parsedState.invoiceData.notes) parsedState.invoiceData.notes = DEFAULT_INVOICE_DATA.notes; 

      return parsedState;
    }
  } catch (e) {
    console.error("Could not load state from localStorage", e);
  }

  // Default initial state
  return {
    selectedTheme: 'SAPPHIRE',
    isGstEnabled: false,
    isIndianClient: true,
    currencyCode: 'INR',
    logoBase64: null,
    qrBase64: null,
    signatureBase64: null,
    clients: {},
    currentClientId: null,
    invoiceData: { ...DEFAULT_INVOICE_DATA },
    items: DEFAULT_ITEMS,
    postDetails: DEFAULT_POSTS,
    logo: null,
    qrCode: null, 
    signature: null, 
    showSaveMessage: false,
  };
};


function App() {
  const [appState, setAppState] = useState(getInitialState);
  const [showClientModal, setShowClientModal] = useState(false); // NEW MODAL STATE

  // --- DERIVED VALUES (for convenience) ---
  const theme = THEMES[appState.selectedTheme];
  const currencySymbol = CURRENCY_MAP[appState.currencyCode];

  // Destructure current editor data
  const { invoiceData, items, postDetails, logo, qrCode, signature, clients, currentClientId } = appState;

  // --- LOCAL STORAGE PERSISTENCE (Auto-Save) ---
  useEffect(() => {
    const stateToSave = {
      ...appState,
      logo: null, 
      qrCode: null,
      signature: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

    setAppState(prev => ({ ...prev, showSaveMessage: true }));
    const timer = setTimeout(() => {
      setAppState(prev => ({ ...prev, showSaveMessage: false }));
    }, 1500);

    return () => clearTimeout(timer); 

  }, [invoiceData, items, postDetails, clients, appState.selectedTheme, appState.isGstEnabled, appState.isIndianClient, appState.currencyCode, appState.logoBase64, appState.qrBase64, appState.signatureBase64]);


  // --- HANDLERS ---

  const setInvoiceField = (field, value) => {
    setAppState(prev => ({
      ...prev,
      invoiceData: { ...prev.invoiceData, [field]: value }
    }));
  };

  const formatCurrency = useCallback((amount) => {
    const numAmount = Number(amount) || 0;
    return `${currencySymbol}${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currencySymbol]);

  const handleImageUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result.split(',')[1];
        const newUrl = URL.createObjectURL(file);

        setAppState(prev => ({
          ...prev,
          [key.replace('Base64', '')]: newUrl,
          [key]: base64Data, 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => setAppState(prev => ({ ...prev, items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }] }));
  const removeItem = (id) => setAppState(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  
  const updateItem = (id, field, value) => {
    setAppState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addPost = () => setAppState(prev => ({ ...prev, postDetails: [...prev.postDetails, { id: Date.now(), date: new Date().toISOString().split('T')[0], title: '', status: 'Completed' }] })); // Changed to Completed default
  const removePost = (id) => setAppState(prev => ({ ...prev, postDetails: prev.postDetails.filter(p => p.id !== id) }));
  
  const updatePost = (id, field, value) => {
    setAppState(prev => ({
      ...prev,
      postDetails: prev.postDetails.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  // --- CLIENT MANAGEMENT LOGIC ---
  const clientsList = useMemo(() => Object.entries(clients).map(([id, client]) => ({ id, ...client })), [clients]);

  // NEW: Function called by the modal's internal save button
  const addClient = (clientName) => {
    if (!clientName || !clientName.trim()) {
        alert("Client name cannot be empty.");
        return;
    }

    const newClientId = Date.now().toString();
    setAppState(prev => ({
        ...prev,
        clients: {
            ...prev.clients,
            [newClientId]: { name: clientName.trim(), invoices: [] }
        },
        currentClientId: newClientId,
        // Reset editor state to default for new invoice
        invoiceData: { 
            ...DEFAULT_INVOICE_DATA, 
            invoiceNumber: getNewInvoiceNumber(prev.clients),
            clientName: clientName.trim(),
        },
        items: [{ id: Date.now(), description: 'New Project Description', quantity: 1, price: 0 }],
        postDetails: DEFAULT_POSTS,
    }));
    setShowClientModal(false); // Close the modal
  };

  const openClientModal = () => setShowClientModal(true);
  const closeClientModal = () => setShowClientModal(false);

  const loadClientData = (clientId) => {
    const client = clients[clientId];
    if (!client) return;
    const latestInvoice = client.invoices[client.invoices.length - 1];
    
    setAppState(prev => ({
      ...prev,
      currentClientId: clientId,
      invoiceData: latestInvoice ? { ...latestInvoice.invoiceData } : { ...DEFAULT_INVOICE_DATA, invoiceNumber: getNewInvoiceNumber(prev.clients), clientName: client.name },
      items: latestInvoice ? [...latestInvoice.items] : DEFAULT_ITEMS,
      postDetails: latestInvoice ? [...latestInvoice.postDetails] : DEFAULT_POSTS,
    }));
  };

  const saveCurrentInvoice = () => {
    if (!currentClientId) {
      alert("Please select or create a client first.");
      return;
    }
    const newInvoice = {
      invoiceId: invoiceData.invoiceNumber,
      invoiceData: { ...invoiceData },
      items: [...items],
      postDetails: [...postDetails],
      dateSaved: new Date().toISOString(),
    };

    setAppState(prev => {
      const currentClientInvoices = prev.clients[currentClientId].invoices;
      const existingIndex = currentClientInvoices.findIndex(inv => inv.invoiceId === newInvoice.invoiceId);
      const updatedInvoices = existingIndex !== -1 ? currentClientInvoices.map((inv, index) => index === existingIndex ? newInvoice : inv) : [...currentClientInvoices, newInvoice];
      
      return {
        ...prev,
        clients: {
          ...prev.clients,
          [currentClientId]: { ...prev.clients[currentClientId], invoices: updatedInvoices }
        },
        showSaveMessage: true 
      };
    });
  };

  const startNewInvoice = () => {
    if (!currentClientId) {
      alert("Please select a client before starting a new invoice.");
      return;
    }
    setAppState(prev => ({
      ...prev,
      invoiceData: { ...DEFAULT_INVOICE_DATA, invoiceNumber: getNewInvoiceNumber(prev.clients), clientName: prev.clients[currentClientId].name },
      items: DEFAULT_ITEMS,
      postDetails: DEFAULT_POSTS,
    }));
  };


  // --- CALCULATIONS ---
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalAfterDiscount = subtotal - invoiceData.discountAmount;
  const gstRateDecimal = (Number(invoiceData.gstRate) || 0) / 100;
  const gstAmount = appState.isGstEnabled ? totalAfterDiscount * gstRateDecimal : 0;
  const totalFinalBill = totalAfterDiscount + gstAmount;
  const finalDueAmount = totalFinalBill + invoiceData.previousDue - invoiceData.advancePaid;


  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-inter text-gray-800"> 
      
      {/* 1. LEFT PANEL: FIXED EDITOR (No Print) */}
      <div className="w-full md:w-[450px] bg-white border-r border-gray-200 h-auto md:h-screen no-print shadow-2xl z-20 flex flex-col md:fixed md:top-0 md:left-0">
        
        {/* Editor Header */}
        <div className="p-6 pb-2 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-2xl font-bold text-gray-800">Invoice Editor</h2>
           {appState.showSaveMessage && (
               <div className="flex items-center text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full shadow-md transition-opacity duration-300">
                   <Save size={14} className="mr-1"/> Saved!
               </div>
           )}
        </div>

        {/* Editor Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 0. Client Management (LOGICAL GROUP 1) */}
          <div className="bg-white p-4 rounded-lg border border-gray-300 space-y-3 shadow-inner">
            <h3 className="font-semibold text-sm text-gray-700 uppercase flex items-center gap-1">
                <UserPlus size={14} /> Client Management
            </h3>
            <div className="flex gap-2">
                <select value={currentClientId || ''} onChange={(e) => loadClientData(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-indigo-500">
                    <option value="" disabled>-- Select Client --</option>
                    {clientsList.map(client => (<option key={client.id} value={client.id}>{client.name}</option>))}
                </select>
                {/* BUTTON NOW OPENS MODAL */}
                <button onClick={openClientModal} className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"><UserPlus size={16} /></button>
            </div>
            {currentClientId && (
                <div className="flex gap-2">
                    <button onClick={startNewInvoice} className="flex-1 bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 text-sm"><FilePlus size={16} /> New Invoice</button>
                    <button onClick={saveCurrentInvoice} className="bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center gap-1 text-sm"><Save size={16} /> Save</button>
                </div>
            )}
             {currentClientId && clients[currentClientId].invoices.length > 0 && (
                <div className="border-t pt-2 mt-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Load Past Invoice</label>
                    <select onChange={(e) => {
                            const inv = clients[currentClientId].invoices.find(i => i.invoiceId === e.target.value);
                            if (inv) { setAppState(prev => ({...prev, invoiceData: { ...inv.invoiceData }, items: inv.items, postDetails: inv.postDetails,})); }
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                        <option value="">Select History</option>
                        {clients[currentClientId].invoices.map(inv => (<option key={inv.invoiceId} value={inv.invoiceId}>{inv.invoiceId} ({new Date(inv.invoiceData.date).toLocaleDateString()})</option>))}
                    </select>
                </div>
             )}
          </div>

          {/* 1. Branding & Settings (LOGICAL GROUP 2) */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 shadow-inner"> 
            <h3 className="font-semibold text-sm text-gray-700 uppercase">1. Branding & Localization</h3> 
            
            {/* THEME SELECTOR */}
            <div className={`p-3 rounded-lg border ${theme.borderLight} ${theme.bgAccent}`}>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Palette size={14}/> Invoice Theme</h4>
                <select value={appState.selectedTheme} onChange={(e) => setAppState(prev => ({...prev, selectedTheme: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {Object.entries(THEMES).map(([key, item]) => (<option key={key} value={key}>{item.name}</option>))}
                </select>
            </div>
            {/* END THEME SELECTOR */}


            {/* Logo Upload & Company Details */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
              <div className="relative w-16 h-16 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer flex-shrink-0">
                {logo ? <img src={logo} alt="Agency Logo" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                <input type="file" onChange={(e) => handleImageUpload(e, 'logoBase64')} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Logo" />
              </div>
              <div className="flex-1 space-y-1">
                <input type="text" placeholder="Company Name" value={invoiceData.companyName} onChange={(e) => setInvoiceField('companyName', e.target.value)} className="w-full p-1 border border-gray-300 rounded text-sm font-medium"/>
                <textarea placeholder="Company Address" rows="2" value={invoiceData.companyAddress} onChange={(e) => setInvoiceField('companyAddress', e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs"/>
                <input type="email" placeholder="Email" value={invoiceData.companyEmail} onChange={(e) => setInvoiceField('companyEmail', e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs"/>
                <input type="tel" placeholder="Phone" value={invoiceData.companyPhone} onChange={(e) => setInvoiceField('companyPhone', e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs"/>
              </div>
            </div>

            {/* GST & Recurring Toggle */}
            <div className='flex gap-4 border-t pt-4'>
                <div className="flex flex-col bg-white p-3 rounded border border-gray-300 shadow-sm flex-1">
                  <div className='flex justify-between items-center mb-1'>
                    <span className="text-sm font-medium">Add Tax?</span>
                     <input type="checkbox" checked={appState.isGstEnabled} onChange={(e) => setAppState(prev => ({...prev, isGstEnabled: e.target.checked}))} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"/>
                  </div>
                  {/* GST RATE INPUT */}
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Tax Rate (%)</label>
                   <input type="number" placeholder="e.g. 18" value={invoiceData.gstRate} onChange={(e) => setInvoiceField('gstRate', Number(e.target.value))} className="w-full p-1 border border-gray-300 rounded text-sm focus:border-indigo-500"/>
                </div>
                {/* RECURRING TOGGLE */}
                 <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300 shadow-sm flex-1 self-start mt-0">
                    <span className="text-sm font-medium">Recurring?</span>
                    <input type="checkbox" checked={invoiceData.isRecurring} onChange={(e) => setInvoiceField('isRecurring', e.target.checked)} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"/>
                </div>
            </div>
            
            {/* Service Input (Replaced Dropdown) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Service Title</label>
              <input type="text" placeholder="e.g. Graphic Designing, SaaS Product" value={invoiceData.serviceType} onChange={(e) => setInvoiceField('serviceType', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"/>
            </div>

            {/* Client Country/Currency Selector */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Globe size={14}/> Client Region</h4>
              
              {/* India Checkbox */}
              <label className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                <input type="checkbox" checked={appState.isIndianClient} onChange={(e) => {
                    const isChecked = e.target.checked;
                    setAppState(prev => ({...prev, isIndianClient: isChecked, currencyCode: isChecked ? 'INR' : 'USD'}));
                  }} className="w-4 h-4 text-indigo-600 rounded"/>
                Client is in India (Use INR)
              </label>

              {/* International Currency Dropdown */}
              {!appState.isIndianClient && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Currency</label>
                  <select value={appState.currencyCode} onChange={(e) => setAppState(prev => ({ ...prev, currencyCode: e.target.value}))} className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500">
                    {Object.entries(CURRENCIES).map(([key, item]) => (<option key={key} value={item.code}>{item.symbol} - {item.name}</option>))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 2. Client Details (LOGICAL GROUP 3) */}
          <div className="space-y-4">
             <h3 className="font-semibold text-sm text-gray-600 uppercase flex items-center gap-1">2. Invoice & Client Details</h3>
             <input type="text" placeholder="Invoice Number (e.g. INV-001)" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceField('invoiceNumber', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             <input type="text" placeholder="Client Name" value={invoiceData.clientName} onChange={(e) => setInvoiceField('clientName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             <textarea placeholder="Client Address" rows="2" value={invoiceData.clientAddress} onChange={(e) => setInvoiceField('clientAddress', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             
             <div className='flex gap-4'>
                {/* Due Date */}
                <div className='flex-1'>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Issue Date</label>
                    <input type="date" value={invoiceData.date} onChange={(e) => setInvoiceField('date', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
                <div className='flex-1'>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Due</label>
                    <input type="date" value={invoiceData.dueDate} onChange={(e) => setInvoiceField('dueDate', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"/>
                </div>
             </div>
          </div>


          {/* 3. Itemization & Financials (LOGICAL GROUP 4) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600 uppercase flex items-center gap-1">3. Itemization & Summary</h3>
            
            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">Invoice Items</h4>
            {items.map((item) => (
              <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm relative group">
                <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                <input 
                  className="w-full mb-2 text-sm font-medium border-b border-gray-200 focus:border-indigo-300 outline-none pb-1"
                  placeholder="Service Description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                />
                <div className="flex gap-2">
                   <input type="number" className="w-16 p-1 bg-gray-50 border border-gray-300 rounded text-xs" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                   <input type="number" className="flex-1 p-1 bg-gray-50 border border-gray-300 rounded text-xs" placeholder="Price" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} />
                </div>
              </div>
            ))}
            <button onClick={addItem} className="text-xs flex items-center gap-1 text-indigo-700 font-medium hover:underline"><Plus size={14}/> Add Bill Item</button>

            <div className="pt-4 border-t border-gray-200 space-y-3">
              
              <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">Balance Adjustments</h4>

              {/* Discount Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Discount Applied ({currencySymbol})</label>
                <input type="number" value={invoiceData.discountAmount} onChange={(e) => setInvoiceField('discountAmount', Number(e.target.value))} className="w-full p-2 border border-blue-300 rounded text-sm mt-1 bg-blue-50 focus:border-blue-500 focus:ring-blue-500"/>
              </div>

              {/* Previous Due Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Previous Balance Due ({currencySymbol})</label>
                <input type="number" value={invoiceData.previousDue} onChange={(e) => setInvoiceField('previousDue', Number(e.target.value))} className="w-full p-2 border border-red-300 rounded text-sm mt-1 bg-red-50 focus:border-red-500 focus:ring-red-500"/>
              </div>
              {/* Advance Paid Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Advance Received ({currencySymbol})</label>
                <input type="number" value={invoiceData.advancePaid} onChange={(e) => setInvoiceField('advancePaid', Number(e.target.value))} className="w-full p-2 border border-green-300 rounded text-sm mt-1 bg-green-50 focus:border-green-500 focus:ring-green-500"/>
              </div>
            </div>
          </div>

          {/* 4. Payment & Finalization Details (LOGICAL GROUP 5) */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-sm text-gray-600 uppercase flex items-center gap-2"><Banknote size={16}/> Payment & Finalization</h3>
            
            {/* NEW: Payment Method Selector */}
            <div className='bg-white p-3 rounded border border-gray-300 shadow-sm'>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Method Display</h4>
                <select 
                    value={invoiceData.paymentMethod}
                    onChange={(e) => setInvoiceField('paymentMethod', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500"
                >
                    <option value="Bank">Bank Details Only</option>
                    <option value="UPI">UPI ID Only</option>
                    <option value="Both">Show Both</option>
                </select>
            </div>
            
            {/* Conditional Payment Inputs */}
            {(invoiceData.paymentMethod === 'Bank' || invoiceData.paymentMethod === 'Both') && (
                <>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">Bank Details</h4>
                 <input type="text" placeholder="Bank Name" value={invoiceData.bankName} onChange={(e) => setInvoiceField('bankName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"/>
                 <input type="text" placeholder="Account Number" value={invoiceData.accountNo} onChange={(e) => setInvoiceField('accountNo', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"/>
                 <input type="text" placeholder="IFSC Code" value={invoiceData.ifscCode} onChange={(e) => setInvoiceField('ifscCode', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"/>
                </>
            )}

            {(invoiceData.paymentMethod === 'UPI' || invoiceData.paymentMethod === 'Both') && (
                <>
                 <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">UPI Details</h4>
                 <input type="text" placeholder="UPI ID (e.g. xyz@upi)" value={invoiceData.upiId} onChange={(e) => setInvoiceField('upiId', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"/>
                </>
            )}
             
            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">Authorized Signatory Name</h4>
            <input type="text" placeholder="e.g. John Doe / Company LLP" value={invoiceData.signatoryName} onChange={(e) => setInvoiceField('signatoryName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"/>


            <h4 className="text-xs font-bold text-gray-500 uppercase mt-4">Images (QR Code / Signature)</h4>
            
            {/* QR Code Upload */}
            <div className={`p-3 rounded-lg border ${qrCode ? 'border-green-400' : 'border-gray-300'} bg-white flex items-center gap-3 shadow-sm`}>
                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border border-dashed border-gray-400 rounded flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer">
                    {qrCode ? <img src={qrCode} alt="QR Code" className="w-full h-full object-contain" /> : <Scan size={18} className="text-gray-400" />}
                    <input type="file" onChange={(e) => handleImageUpload(e, 'qrBase64')} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload QR Code" />
                </div>
                <div className='flex-1'>
                    <p className="text-sm font-medium">Upload UPI/Bank QR Code</p>
                    <p className='text-xs text-gray-500'>{qrCode ? 'Uploaded: Click to replace' : 'Click box to upload image'}</p>
                </div>
            </div>
            
            {/* Signature Upload */}
            <div className={`p-3 rounded-lg border ${signature ? 'border-green-400' : 'border-gray-300'} bg-white flex items-center gap-3 shadow-sm`}>
                 <div className="relative w-12 h-12 flex-shrink-0 bg-gray-50 border border-dashed border-gray-400 rounded flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer">
                    {signature ? <img src={signature} alt="Signature/Stamp" className="w-full h-full object-contain" /> : <Signature size={18} className="text-gray-400" />}
                    <input type="file" onChange={(e) => handleImageUpload(e, 'signatureBase64')} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Signature/Stamp" />
                </div>
                <div className='flex-1'>
                    <p className="text-sm font-medium">Upload Signature / Stamp</p>
                    <p className='text-xs text-gray-500'>{signature ? 'Uploaded: Click to replace' : 'Click box to upload image'}</p>
                </div>
            </div>
            
            {/* NEW NOTES INPUT */}
            <h4 className="text-xs font-bold text-gray-500 uppercase pt-4 border-t border-gray-200">Invoice Notes</h4>
            <textarea 
                placeholder="e.g. Payments due upon receipt..." 
                rows="3"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceField('notes', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500"
            />

          </div>
          
          {/* 5. Annexure (Page 2) */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-sm text-gray-600 uppercase flex items-center gap-2"><FileText size={16}/> Page 2: Work Logs / Posts</h3>
            <p className="text-xs text-gray-500">Add detailed post names here. This will automatically appear on the second page.</p>
            
            {postDetails.map((post) => (
              <div key={post.id} className="flex gap-2 items-center">
                <input type="date" className="w-28 p-2 border border-gray-300 rounded text-xs bg-white" value={post.date} onChange={(e) => updatePost(post.id, 'date', e.target.value)} />
                <input type="text" className="flex-1 p-2 border border-gray-300 rounded text-xs" placeholder="Post Title / Task" value={post.title} onChange={(e) => updatePost(post.id, 'title', e.target.value)} />
                <button onClick={() => removePost(post.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={addPost} className="text-xs flex items-center gap-1 text-indigo-700 font-medium hover:underline"><Plus size={14}/> Add Work Log Row</button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
          <button 
            onClick={() => window.print()}
            className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-black flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Printer size={18} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* 2. RIGHT PANEL: SCROLLABLE PREVIEW (Offset by the fixed left panel) */}
      <div className="flex-1 w-full bg-gray-100 overflow-y-auto p-4 md:p-8 print-container md:ml-[450px]">
        
        {/* PAGE 1: MAIN INVOICE */}
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-12 shadow-xl relative text-gray-900 font-inter"> 
          
          {/* Header */}
           <div className="flex flex-col sm:flex-row justify-between items-start mb-16">
            <div className="flex flex-col gap-4 order-2 sm:order-1">
              {logo ? (
                <img src={logo} alt="Agency Logo" className="h-16 sm:h-20 w-auto object-contain self-start mb-4" />
              ) : (
                <Building2 size={64} className={`text-${theme.accent} mb-4`}/> 
              )}
              
              <div>
                <h1 className={`text-4xl sm:text-5xl font-playfair-display font-bold text-${theme.primary} mb-2`}>INVOICE</h1> 
                <p className="text-gray-600 text-sm">Invoice #<span className="font-semibold">{invoiceData.invoiceNumber}</span></p>
                <p className="text-gray-600 text-sm">Date: <span className="font-semibold">{invoiceData.date}</span></p>
                {invoiceData.dueDate && <p className="text-gray-600 text-sm">Due: <span className="font-semibold text-red-600">{invoiceData.dueDate}</span></p>}
              </div>
            </div>
            <div className="text-left sm:text-right order-1 sm:order-2 w-full mt-4 sm:mt-0">
              <h2 className={`text-xl sm:text-2xl font-bold text-${theme.primary} mb-1`}>{invoiceData.companyName}</h2> 
              <p className="text-sm text-gray-700 max-w-full sm:max-w-[250px] sm:ml-auto whitespace-pre-line leading-snug">
                {invoiceData.companyAddress}
                {!appState.isIndianClient && <span className="font-medium block mt-1">International Client</span>} 
              </p>
              <p className="text-sm text-gray-700 mt-2">Email: {invoiceData.companyEmail}</p>
              <p className="text-sm text-gray-700">Phone: {invoiceData.companyPhone}</p>

              <div className={`mt-4 inline-block bg-${theme.light} text-${theme.primary} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}> 
                {invoiceData.serviceType}
              </div>
            </div>
          </div>

          {/* Client Info Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mb-16 border-b-2 ${theme.borderLight} pb-8`}> 
            <div>
              <h3 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>Billed To</h3> 
              <p className="text-lg font-semibold text-gray-900">{invoiceData.clientName || '---'}</p>
              <p className="text-gray-700 whitespace-pre-line text-sm mt-1">{invoiceData.clientAddress || '---'}</p>
            </div>
            <div className="text-left sm:text-right">
              <h3 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>Payment Details</h3> 
              {appState.isGstEnabled && <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">GSTIN:</span> 29ABCDE1234F1Z5</p>}
              
              {/* Conditional Payment Display */}
              {(invoiceData.paymentMethod === 'Bank' || invoiceData.paymentMethod === 'Both') && (
                <>
                  <p className="text-sm text-gray-700 mt-1"><span className="font-medium text-gray-900">Bank Name:</span> {invoiceData.bankName}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Account No:</span> {invoiceData.accountNo}</p>
                  <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">IFSC Code:</span> {invoiceData.ifscCode}</p>
                </>
              )}
              {(invoiceData.paymentMethod === 'UPI' || invoiceData.paymentMethod === 'Both') && (
                <p className="text-sm text-gray-700 mt-1"><span className="font-medium text-gray-900">UPI ID:</span> {invoiceData.upiId}</p>
              )}
            </div>
          </div>

          {/* Main Items Table (omitted for brevity) */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className={`border-b-2 ${theme.borderStrong} ${theme.bgAccent}`}> 
                <th className={`text-left py-3 px-4 font-bold text-${theme.primary} w-[50%]`}>Description</th>
                <th className={`text-right py-3 px-4 font-bold text-${theme.primary}`}>Qty</th>
                <th className={`text-right py-3 px-4 font-bold text-${theme.primary}`}>Rate</th>
                <th className={`text-right py-3 px-4 font-bold text-${theme.primary}`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-4 text-gray-800 font-medium">{item.description || '---'}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">{formatCurrency(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>


          {/* Calculation Section */}
          <div className="flex flex-col sm:flex-row justify-between mt-8">
            
            {/* Left Side: QR Code (Notes moved below totals) */}
            <div className='w-full sm:w-1/2 mb-6 sm:mb-0'>
                {(qrCode && (invoiceData.paymentMethod === 'UPI' || invoiceData.paymentMethod === 'Both')) && ( 
                    <div className='mb-4'>
                        <h4 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>UPI Payment</h4>
                        <img src={qrCode} alt="QR Code" className="w-28 h-28 object-contain border border-gray-200 p-2" />
                    </div>
                )}
            </div>

            {/* Right Side: Totals */}
            <div className="w-full sm:w-80 space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200 ml-0 sm:ml-auto"> 
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {/* Discount Line */}
              {invoiceData.discountAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount Applied</span>
                    <span>- {formatCurrency(invoiceData.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-800 border-t border-gray-300 pt-2">
                     <span>Total After Discount</span>
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

              {/* Conditional "Current Month Total" */}
              {invoiceData.isRecurring && (
                  <div className={`flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-300`}>
                    <span>Current Month Total</span>
                    <span>{formatCurrency(totalFinalBill)}</span>
                  </div>
              )}

              {/* Previous Due Line */}
              {invoiceData.previousDue > 0 && (
                 <div className="flex justify-between text-sm text-red-600">
                   <span>+ Previous Outstanding Due</span>
                   <span>{formatCurrency(invoiceData.previousDue)}</span>
                 </div>
               )}

              {invoiceData.advancePaid > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Less: Advance Paid</span>
                  <span>- {formatCurrency(invoiceData.advancePaid)}</span>
                </div>
              )}

              <div className={`flex justify-between text-xl font-black text-${theme.accent} pt-4 border-t-2 ${theme.borderLight}`}> 
                <span>BALANCE DUE</span>
                <span>{formatCurrency(finalDueAmount)}</span>
              </div>
            </div>
          </div>
          
          {/* NOTES BLOCK */}
          {invoiceData.notes && (
             <div className='mt-12'>
                <h4 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>Notes</h4>
                <p className='text-xs text-gray-600 whitespace-pre-line'>{invoiceData.notes}</p>
            </div>
          )}

          {/* Signature Area (mt-16 ensures space from notes/totals) */}
          <div className='mt-16 text-right'>
              {signature ? ( 
                  <img src={signature} alt="Signature" className="h-16 w-auto object-contain ml-auto mb-1 border-b border-gray-300 pb-1" />
              ) : (
                  <div className='h-16 border-b border-gray-300 w-48 ml-auto mb-1 flex items-end justify-center text-xs text-gray-400'>
                      [Signature / Stamp Area]
                  </div>
              )}
              <p className={`text-sm font-semibold text-${theme.primary}`}>{invoiceData.signatoryName}</p>
              <p className='text-xs text-gray-600'>(Authorized Signatory)</p>
          </div>

          {/* Footer Page 1 (No longer absolute, flows with content) */}
          <div className="mt-8 text-center text-gray-500 text-xs">
            <p className="mb-1">Thank you for your business. Please make payments to <span className="font-semibold text-gray-700">{invoiceData.companyName}</span>.</p>
            <p>For queries, contact us at {invoiceData.companyEmail} or {invoiceData.companyPhone}.</p>
          </div>
        </div>

        {/* PAGE 2: ANNEXURE / POST DETAILS (omitted for brevity) */}
        {postDetails.length > 0 && (
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto p-6 sm:p-12 shadow-xl relative text-gray-900 page-break mt-8 font-inter">
            
            {/* Page 2 Header (omitted for brevity) */}
            <div className={`border-b-2 ${theme.borderLight} pb-4 mb-8 flex justify-between items-end`}>
              <div>
                <h2 className={`text-2xl sm:text-3xl font-playfair-display font-bold text-${theme.primary}`}>ANNEXURE A</h2>
                <p className="text-sm text-gray-600">Work Log / Deliverables Detail for Invoice #{invoiceData.invoiceNumber}</p>
              </div>
              <p className="text-sm text-gray-500">Date: {invoiceData.date}</p>
            </div>

            {/* Post Details Table (omitted for brevity) */}
            <div className='overflow-x-auto'>
                <table className="w-full min-w-[500px] text-sm border-collapse border border-gray-200">
                <thead className={`${theme.bgAccent}`}> 
                    <tr>
                    <th className={`border border-gray-200 p-3 text-left font-bold text-${theme.primary} w-32`}>Date</th>
                    <th className={`border border-gray-200 p-3 text-left font-bold text-${theme.primary}`}>Deliverable / Post Title</th>
                    <th className={`border border-gray-200 p-3 text-center font-bold text-${theme.primary} w-32`}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {postDetails.map((post) => (
                    <tr key={post.id} className="odd:bg-white even:bg-gray-50">
                        <td className="border border-gray-200 p-3 text-gray-700">{post.date || '-'}</td>
                        <td className="border border-gray-200 p-3 text-gray-900 font-medium">{post.title || '-'}</td>
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
              <strong>Note:</strong> This is an itemized breakdown of the services rendered for the billing period mentioned in the main invoice.
            </div>
          </div>
        )}

      </div>

      {/* NEW CLIENT MODAL */}
      {showClientModal && (
          <NewClientModal onClose={closeClientModal} onSave={addClient} />
      )}
    </div>
  );
}


// --- NEW COMPONENT: NEW CLIENT MODAL ---
const NewClientModal = ({ onClose, onSave }) => {
    const [clientName, setClientName] = useState('');
    
    const handleSave = () => {
        onSave(clientName);
    };

    return (
        <div
  className="fixed inset-0  bg-opacity-30 backdrop-blur-md z-[100] flex items-center justify-center p-4"
  onClick={onClose}
>

            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-indigo-700">Add New Client</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Enter the name of your new client. This will create a dedicated history entry for them.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Ramesh Traders Inc."
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleSave(); }}
                        className="w-full p-3 border border-gray-300 rounded-lg text-base focus:border-indigo-500 focus:ring-indigo-500"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        disabled={!clientName.trim()}
                    >
                        <Save size={16} className="inline mr-1" /> Save Client
                    </button>
                </div>
            </div>
        </div>
    );
};


export default App;