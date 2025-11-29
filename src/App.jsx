import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Printer, FileText, Image as ImageIcon, Globe, Palette, Building2 } from 'lucide-react';

// --- THEME DEFINITIONS ---
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
// -------------------------

// Currency map for the dropdown
const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
};

function App() {
  // --- THEME STATE ---
  const [selectedTheme, setSelectedTheme] = useState('SAPPHIRE');
  const theme = THEMES[selectedTheme]; // Access the current theme object

  // --- GENERAL STATE MANAGEMENT ---
  const [logo, setLogo] = useState(null);
  const [isGstEnabled, setIsGstEnabled] = useState(false);
  
  // States for Localization/Currency
  const [isIndianClient, setIsIndianClient] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState(CURRENCIES.INR.symbol);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: 'INV-2025-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    
    // Default Agency Details - UPDATED
    companyName: 'Blazing Render Creation Hub LLP',
    companyAddress: 'Toranagallu, Ballari (dist.), Kanataka, India - 583123',
    companyEmail: 'info@blazingrender.com', // Added
    companyPhone: '+91 98765 43210', // Added
    
    clientName: '',
    clientAddress: '',
    serviceType: 'Graphic Designing',
    advancePaid: 0,
    previousDue: 0, // Carried forward outstanding balance
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Social Media Creative Design (Monthly Retainer)', quantity: 1, price: 25000 },
  ]);

  const [postDetails, setPostDetails] = useState([
    { id: 1, date: new Date().toISOString().split('T')[0], title: 'Diwali Sale Announcement', status: 'Completed' },
  ]);

  // --- ACTIONS ---
  
  // Custom formatter function for currency display
  const formatCurrency = useCallback((amount) => {
    // Ensure amount is a number and handle potential NaN issues gracefully
    const numAmount = Number(amount) || 0;
    return `${currencySymbol}${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [currencySymbol]);

  // Handle Logo Upload (converts file to a URL object for preview)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  // --- Billing Item Handlers ---
  const addItem = () => setItems([...items, { id: Date.now(), description: '', quantity: 1, price: 0 }]);

  const removeItem = (id) => setItems(items.filter(item => item.id !== id));
  
  const updateItem = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };
  // -----------------------------

  // Post Detail Handlers (Page 2)
  const addPost = () => setPostDetails([...postDetails, { id: Date.now(), date: new Date().toISOString().split('T')[0], title: '', status: 'Pending' }]);
  const removePost = (id) => setPostDetails(postDetails.filter(p => p.id !== id));
  const updatePost = (id, field, value) => {
    setPostDetails(postDetails.map(p => p.id === id ? { ...p, [field]: value } : p));
  };


  // --- CALCULATIONS ---
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const gstAmount = isGstEnabled ? subtotal * 0.18 : 0;
  const totalAmount = subtotal + gstAmount;
  
  // FINAL CALCULATION: Total + Previous Due - Advance Paid
  const finalDueAmount = totalAmount + invoiceData.previousDue - invoiceData.advancePaid;


  // --- UI ---
  return (
    // Updated container for desktop fixed sidebar
    <div className="min-h-screen bg-gray-50 flex font-inter text-gray-800"> 
      
      {/* 1. LEFT PANEL: FIXED EDITOR (No Print) */}
      <div className="w-full md:w-[450px] bg-white border-r border-gray-200 h-screen no-print shadow-2xl z-20 flex flex-col md:fixed md:top-0 md:left-0">
        
        {/* Editor Header */}
        <div className="p-6 pb-2 border-b border-gray-100">
           <h2 className="text-2xl font-bold text-gray-800">Invoice Editor</h2>
        </div>

        {/* Editor Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* 1. Branding & Settings */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4 shadow-inner"> 
            <h3 className="font-semibold text-sm text-gray-700 uppercase">1. Branding & Settings</h3> 
            
            {/* NEW: THEME SELECTOR */}
            <div className={`p-3 rounded-lg border ${theme.borderLight} ${theme.bgAccent}`}>
                <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Palette size={14}/> Invoice Theme</h4>
                <select 
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {Object.entries(THEMES).map(([key, item]) => (
                        <option key={key} value={key}>{item.name}</option>
                    ))}
                </select>
            </div>
            {/* END THEME SELECTOR */}


            {/* Logo Upload & Company Details */}
            <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
              <div className="relative w-16 h-16 bg-white border border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-indigo-500 cursor-pointer flex-shrink-0">
                {logo ? <img src={logo} alt="Agency Logo" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Logo" />
              </div>
              <div className="flex-1 space-y-1">
                <input 
                  type="text" 
                  placeholder="Company Name" 
                  value={invoiceData.companyName}
                  onChange={(e) => setInvoiceData({...invoiceData, companyName: e.target.value})}
                  className="w-full p-1 border border-gray-300 rounded text-sm font-medium"
                />
                <textarea 
                  placeholder="Company Address" 
                  rows="2"
                  value={invoiceData.companyAddress}
                  onChange={(e) => setInvoiceData({...invoiceData, companyAddress: e.target.value})}
                  className="w-full p-1 border border-gray-300 rounded text-xs"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={invoiceData.companyEmail}
                  onChange={(e) => setInvoiceData({...invoiceData, companyEmail: e.target.value})}
                  className="w-full p-1 border border-gray-300 rounded text-xs"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  value={invoiceData.companyPhone}
                  onChange={(e) => setInvoiceData({...invoiceData, companyPhone: e.target.value})}
                  className="w-full p-1 border border-gray-300 rounded text-xs"
                />
              </div>
            </div>

            {/* GST Toggle */}
            <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-300 shadow-sm">
              <span className="text-sm font-medium">Add GST (18%)?</span>
              <input 
                type="checkbox" 
                checked={isGstEnabled}
                onChange={(e) => setIsGstEnabled(e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
            
            {/* Service Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Service Category</label>
              <select 
                value={invoiceData.serviceType}
                onChange={(e) => setInvoiceData({...invoiceData, serviceType: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option>Graphic Designing</option>
                <option>Website Development</option>
                <option>SaaS Product Development</option>
                <option>App Development</option>
                <option>Social Media Marketing</option>
                <option>Consulting</option>
              </select>
            </div>

            {/* Client Country/Currency Selector */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Globe size={14}/> Client Region</h4>
              
              {/* India Checkbox */}
              <label className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={isIndianClient}
                  onChange={(e) => {
                    setIsIndianClient(e.target.checked);
                    setCurrencySymbol(e.target.checked ? CURRENCIES.INR.symbol : CURRENCIES.USD.symbol);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                Client is in India (Use INR)
              </label>

              {/* International Currency Dropdown */}
              {!isIndianClient && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Select Currency</label>
                  <select 
                    value={Object.keys(CURRENCIES).find(key => CURRENCIES[key].symbol === currencySymbol) || 'USD'}
                    onChange={(e) => setCurrencySymbol(CURRENCIES[e.target.value].symbol)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {Object.entries(CURRENCIES).map(([key, { symbol, name }]) => (
                      <option key={key} value={key}>{symbol} - {name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* 2. Client Details */}
          <div className="space-y-4">
             <h3 className="font-semibold text-sm text-gray-600 uppercase">2. Client & Billing Info</h3>
             <input type="text" placeholder="Invoice Number (e.g. INV-001)" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             <input type="text" placeholder="Client Name" value={invoiceData.clientName} onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             <textarea placeholder="Client Address" rows="2" value={invoiceData.clientAddress} onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm focus:border-indigo-500 focus:ring-indigo-500"/>
             
             {/* Due Date */}
             <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
          </div>


          {/* 3. Financials */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600 uppercase">3. Financial Items (Page 1)</h3>
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
              {/* Previous Due Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Previous Balance Due ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={invoiceData.previousDue}
                  onChange={(e) => setInvoiceData({...invoiceData, previousDue: Number(e.target.value)})}
                  className="w-full p-2 border border-red-300 rounded text-sm mt-1 bg-red-50 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              {/* Advance Paid Slot */}
              <div>
                <label className="block text-xs font-semibold text-gray-600">Advance Received ({currencySymbol})</label>
                <input 
                  type="number" 
                  value={invoiceData.advancePaid}
                  onChange={(e) => setInvoiceData({...invoiceData, advancePaid: Number(e.target.value)})}
                  className="w-full p-2 border border-green-300 rounded text-sm mt-1 bg-green-50 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* 4. Annexure (Page 2) */}
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
            <Printer size={18} /> Print Invoice
          </button>
        </div>
      </div>

      {/* 2. RIGHT PANEL: SCROLLABLE PREVIEW (Offset by the fixed left panel) */}
      <div className="flex-1 bg-gray-100 overflow-y-auto p-8 print-container md:ml-[450px]">
        
        {/* PAGE 1: MAIN INVOICE */}
        <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 shadow-xl relative text-gray-900 font-inter"> 
          
          {/* Header */}
           <div className="flex justify-between items-start mb-16">
            <div className="flex flex-col gap-4">
              {logo ? (
                <img src={logo} alt="Agency Logo" className="h-20 w-auto object-contain self-start mb-4" />
              ) : (
                <Building2 size={64} className={`text-${theme.accent} mb-4`}/> // Themed Placeholder
              )}
              
              <div>
                <h1 className={`text-5xl font-playfair-display font-bold text-${theme.primary} mb-2`}>INVOICE</h1> {/* Themed Primary */}
                <p className="text-gray-600 text-sm">Invoice #<span className="font-semibold">{invoiceData.invoiceNumber}</span></p>
                <p className="text-gray-600 text-sm">Date: <span className="font-semibold">{invoiceData.date}</span></p>
                {invoiceData.dueDate && <p className="text-gray-600 text-sm">Due: <span className="font-semibold text-red-600">{invoiceData.dueDate}</span></p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className={`text-2xl font-bold text-${theme.primary} mb-1`}>{invoiceData.companyName}</h2> {/* Themed Primary */}
              <p className="text-sm text-gray-700 max-w-[250px] ml-auto whitespace-pre-line leading-snug">
                {invoiceData.companyAddress}
                {!isIndianClient && <span className="font-medium block mt-1">International Client</span>} 
              </p>
              <p className="text-sm text-gray-700 mt-2">Email: {invoiceData.companyEmail}</p>
              <p className="text-sm text-gray-700">Phone: {invoiceData.companyPhone}</p>

              <div className={`mt-4 inline-block bg-${theme.light} text-${theme.primary} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}> {/* Themed Light/Primary */}
                {invoiceData.serviceType}
              </div>
            </div>
          </div>

          {/* Client Info Grid */}
          <div className={`grid grid-cols-2 gap-12 mb-16 border-b-2 ${theme.borderLight} pb-8`}> 
            <div>
              <h3 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>Billed To</h3> {/* Themed Accent */}
              <p className="text-lg font-semibold text-gray-900">{invoiceData.clientName || '---'}</p>
              <p className="text-gray-700 whitespace-pre-line text-sm mt-1">{invoiceData.clientAddress || '---'}</p>
            </div>
            <div className="text-right">
              <h3 className={`text-xs font-bold text-${theme.accent} uppercase tracking-wider mb-2`}>Payment Details</h3> {/* Themed Accent */}
              {isGstEnabled && <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">GSTIN:</span> 29ABCDE1234F1Z5</p>}
              <p className="text-sm text-gray-700 mt-1"><span className="font-medium text-gray-900">Bank Name:</span> Your Bank</p>
              <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">Account No:</span> XXXXXX12345</p>
              <p className="text-sm text-gray-700"><span className="font-medium text-gray-900">IFSC Code:</span> ABCD0001234</p>
            </div>
          </div>

          {/* Main Items Table */}
          <table className="w-full mb-8 text-sm">
            <thead>
              <tr className={`border-b-2 ${theme.borderStrong} ${theme.bgAccent}`}> {/* Themed Strong Border / Light BG */}
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
          <div className="flex justify-end mt-8">
            <div className={`w-80 space-y-3 p-4 ${theme.bgAccent} rounded-lg border ${theme.borderLight}`}> {/* Themed Light BG / Light Border */}
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              {isGstEnabled && (
                <div className="flex justify-between text-sm text-gray-700">
                  <span>GST (18%)</span>
                  <span>{formatCurrency(gstAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-300">
                <span>Current Month Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>

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

              <div className={`flex justify-between text-xl font-black text-${theme.accent} pt-4 border-t-2 ${theme.borderLight}`}> {/* Themed Accent / Light Border */}
                <span>BALANCE DUE</span>
                <span>{formatCurrency(finalDueAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Page 1 */}
          <div className="absolute bottom-8 left-12 right-12 text-center text-gray-500 text-xs">
            <p className="mb-1">Thank you for your business. Please make payments to <span className="font-semibold text-gray-700">{invoiceData.companyName}</span>.</p>
            <p>For queries, contact us at {invoiceData.companyEmail} or {invoiceData.companyPhone}.</p>
          </div>
        </div>

        {/* PAGE 2: ANNEXURE / POST DETAILS (Only shows if there are posts) */}
        {postDetails.length > 0 && (
          <div className="bg-white w-[210mm] min-h-[297mm] mx-auto p-12 shadow-xl relative text-gray-900 page-break mt-8 font-inter">
            
            {/* Page 2 Header */}
            <div className={`border-b-2 ${theme.borderLight} pb-4 mb-8 flex justify-between items-end`}>
              <div>
                <h2 className={`text-3xl font-playfair-display font-bold text-${theme.primary}`}>ANNEXURE A</h2>
                <p className="text-sm text-gray-600">Work Log / Deliverables Detail for Invoice #{invoiceData.invoiceNumber}</p>
              </div>
              <p className="text-sm text-gray-500">Date: {invoiceData.date}</p>
            </div>

            {/* Post Details Table */}
            <table className="w-full text-sm border-collapse border border-gray-200">
              <thead className={`${theme.bgAccent}`}> {/* Themed Light BG */}
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
            
            <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded text-sm text-gray-800">
              <strong>Note:</strong> This is an itemized breakdown of the services rendered for the billing period mentioned in the main invoice.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;