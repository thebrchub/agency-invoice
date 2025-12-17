import React, {
  useState,
  useCallback,
  useMemo,
  useEffect
} from "react";

import {
  getInitialState,
  DEFAULT_INVOICE_DATA,
  DEFAULT_ITEMS,
  DEFAULT_POSTS,
  THEMES,
  CURRENCY_MAP,
  getNewInvoiceNumber,
  STORAGE_KEY
} from "./utils/constants";

// Pages
import HomePage from "./pages/HomePage";
import InvoicePage from "./pages/InvoicePage";
import QuotationPage from "./pages/QuotationPage"; // <--- 1. Import Added

import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams
} from "react-router-dom";

// ---------------------------
// Wrapper to inject router params & navigation into InvoicePage
// ---------------------------
function InvoicePageWrapper({ appState, handlers }) {
  const { id } = useParams(); // invoice ID from URL
  const navigate = useNavigate();

  // Load invoice if URL contains ID
  useEffect(() => {
    if (id && handlers.loadClientData) {
      // handlers.loadInvoiceById(id);
    }
  }, [id, handlers]);

  const currency =
    CURRENCY_MAP?.[appState.currencyCode] || { symbol: "₹" };
  const theme =
    THEMES?.[appState.selectedTheme] ||
    THEMES?.default ||
    {};

  return (
    <InvoicePage
      appState={appState}
      setAppState={handlers.setAppState}
      currencySymbol={currency.symbol}
      theme={theme}
      setInvoiceField={handlers.setInvoiceField}
      addClient={handlers.addClient}
      openClientModal={handlers.openClientModal}
      closeClientModal={handlers.closeClientModal}
      loadClientData={handlers.loadClientData}
      saveCurrentInvoice={handlers.saveCurrentInvoice}
      startNewInvoice={handlers.startNewInvoice}
      setAppPartialState={handlers.setAppPartialState}
      navigate={navigate}
    />
  );
}

function App() {
  // ---------------------------
  // GLOBAL STATE
  // ---------------------------
  const [appState, setAppState] = useState(getInitialState);

  // ---------------------------
  // AUTO SAVE TO LOCAL STORAGE
  // ---------------------------
  useEffect(() => {
    const stateToSave = {
      ...appState,
      logoBase64: appState.logoBase64 || null,
      qrBase64: appState.qrBase64 || null,
      signatureBase64: appState.signatureBase64 || null
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn("LocalStorage save failed", err);
    }

    // Save feedback
    if (appState.showSaveMessage) {
        const timer = setTimeout(() => {
            setAppState((prev) => ({ ...prev, showSaveMessage: false }));
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [appState]);

  // ---------------------------
  // STATE UPDATERS
  // ---------------------------
  const setAppPartialState = useCallback((newProps) => {
    setAppState((prev) => ({ ...prev, ...newProps }));
  }, []);

  const memoizedHandlers = useMemo(() => {
    return {
      setAppPartialState,
      setAppState,

      setInvoiceField: (field, value) =>
        setAppState((prev) => ({
          ...prev,
          invoiceData: { ...prev.invoiceData, [field]: value }
        })),

      addClient: (name) => {
        const trimmed = (name || "").trim();
        if (!trimmed) {
          alert("Client name required");
          return;
        }
        setAppState((prev) => {
          const newClientId = Date.now().toString();
          const newClients = {
            ...prev.clients,
            [newClientId]: { name: trimmed, invoices: [] }
          };
          return {
            ...prev,
            clients: newClients,
            currentClientId: newClientId,
            invoiceData: {
              ...DEFAULT_INVOICE_DATA,
              invoiceNumber: getNewInvoiceNumber(newClients),
              clientName: trimmed
            },
            items: DEFAULT_ITEMS,
            postDetails: DEFAULT_POSTS,
            showClientModal: false
          };
        });
      },

      openClientModal: () =>
        setAppState((prev) => ({ ...prev, showClientModal: true })),
      closeClientModal: () =>
        setAppState((prev) => ({ ...prev, showClientModal: false })),

      loadClientData: (clientId) => {
        setAppState((prev) => {
          const client = prev.clients?.[clientId];
          if (!client) return prev;

          const latestInvoice =
            client.invoices?.[client.invoices.length - 1];

          return {
            ...prev,
            currentClientId: clientId,
            invoiceData: latestInvoice
              ? { ...latestInvoice.invoiceData }
              : {
                  ...DEFAULT_INVOICE_DATA,
                  invoiceNumber: getNewInvoiceNumber(prev.clients),
                  clientName: client.name
                },
            items: latestInvoice ? [...latestInvoice.items] : DEFAULT_ITEMS,
            postDetails: latestInvoice
              ? [...latestInvoice.postDetails]
              : DEFAULT_POSTS
          };
        });
      },

      saveCurrentInvoice: () => {
        setAppState((prev) => {
          const currentClientId = prev.currentClientId;
          if (!currentClientId || !prev.clients?.[currentClientId]) {
            alert("Please select or create a client first.");
            return prev;
          }

          const newInvoice = {
            invoiceId: prev.invoiceData.invoiceNumber,
            invoiceData: { ...prev.invoiceData },
            items: [...prev.items],
            postDetails: [...prev.postDetails],
            dateSaved: new Date().toISOString()
          };

          const client = prev.clients[currentClientId];
          const invoices = Array.isArray(client.invoices)
            ? client.invoices
            : [];
          const idx = invoices.findIndex(
            (inv) => inv.invoiceId === newInvoice.invoiceId
          );

          const updatedInvoices =
            idx !== -1
              ? invoices.map((inv, i) => (i === idx ? newInvoice : inv))
              : [...invoices, newInvoice];

          return {
            ...prev,
            clients: {
              ...prev.clients,
              [currentClientId]: {
                ...client,
                invoices: updatedInvoices
              }
            },
            showSaveMessage: true
          };
        });
      },

      startNewInvoice: () => {
        setAppState((prev) => {
          const cid = prev.currentClientId;
          if (!cid || !prev.clients?.[cid]) {
            alert("Please select a client before creating a new invoice.");
            return prev;
          }
          return {
            ...prev,
            invoiceData: {
              ...DEFAULT_INVOICE_DATA,
              invoiceNumber: getNewInvoiceNumber(prev.clients),
              clientName: prev.clients[cid].name
            },
            items: DEFAULT_ITEMS,
            postDetails: DEFAULT_POSTS
          };
        });
      }
    };
  }, [setAppPartialState]);

  // ---------------------------
  // ROUTING
  // ---------------------------
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        {/* --- 2. Route Added --- */}
        <Route path="/quotation" element={<QuotationPage />} />

        <Route
          path="/invoice"
          element={
            <InvoicePageWrapper appState={appState} handlers={memoizedHandlers} />
          }
        />

        <Route
          path="/invoice/:id"
          element={
            <InvoicePageWrapper appState={appState} handlers={memoizedHandlers} />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;