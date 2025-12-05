export const STORAGE_KEY = 'blazingRenderInvoiceApp_v5'; 

export const THEMES = {
  SAPPHIRE: { name: 'Sapphire Tech (Blue)', primary: 'indigo-800', light: 'indigo-50', accent: 'indigo-600', bgAccent: 'bg-indigo-50', borderStrong: 'border-indigo-700', borderLight: 'border-indigo-200' },
  FOREST: { name: 'Modern Forest (Green)', primary: 'emerald-800', light: 'emerald-50', accent: 'emerald-600', bgAccent: 'bg-emerald-50', borderStrong: 'border-emerald-700', borderLight: 'border-emerald-200' },
  RUBY: { name: 'Classic Ruby (Red)', primary: 'red-800', light: 'red-50', accent: 'red-600', bgAccent: 'bg-red-50', borderStrong: 'border-red-700', borderLight: 'border-red-200' },
  CARBON: { name: 'Minimal Carbon (Grey)', primary: 'gray-800', light: 'gray-100', accent: 'gray-700', bgAccent: 'bg-gray-100', borderStrong: 'border-gray-800', borderLight: 'border-gray-300' },
};

export const CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
};

export const CURRENCY_MAP = Object.values(CURRENCIES).reduce((acc, curr) => ({ ...acc, [curr.code]: curr.symbol }), {});

export const DEFAULT_INVOICE_DATA = {
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
    notes: 'Payments are due upon receipt. Thank you for choosing Blazing Render Creation Hub LLP for your creative and technical needs!', 
    includeSignatoryBlock: true,
};

export const DEFAULT_ITEMS = [
    { id: 1, description: 'Social Media Creative Design (Monthly Retainer)', quantity: 1, price: 25000 },
];

export const DEFAULT_POSTS = [
    { id: 1, date: new Date().toISOString().split('T')[0], title: 'Diwali Sale Announcement', status: 'Completed' },
];


export const getNewInvoiceNumber = (clients) => {
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

export const getInitialState = () => {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      
      ['logo', 'qrCode', 'signature'].forEach(key => {
        const base64Key = `${key}Base64`;
        parsedState[key] = parsedState[base64Key] ? `data:image/png;base64,${parsedState[base64Key]}` : null;
      });
      
      if (parsedState.invoiceData) {
        if (!parsedState.invoiceData.gstRate) parsedState.invoiceData.gstRate = 18;
        if (!parsedState.invoiceData.paymentMethod) parsedState.invoiceData.paymentMethod = 'Both'; 
        if (!parsedState.invoiceData.notes) parsedState.invoiceData.notes = DEFAULT_INVOICE_DATA.notes; 
        if (parsedState.invoiceData.includeSignatoryBlock === undefined) parsedState.invoiceData.includeSignitoryBlock = true;
      }

      return { view: 'home', ...parsedState };
    }
  } catch (e) {
    console.error("Could not load state from localStorage", e);
  }

  return {
    view: 'home', 
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