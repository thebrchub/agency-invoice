import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  getInitialState,
  DEFAULT_INVOICE_DATA,
  DEFAULT_ITEMS,
  DEFAULT_POSTS,
  THEMES,
  CURRENCIES,
  CURRENCY_MAP,
  getNewInvoiceNumber,
  STORAGE_KEY
} from './utils/constants';

import HomePage from './components/HomePage';
import InvoiceGeneratorScreen from './components/InvoiceGeneratorScreen';

function App() {
  const [appState, setAppState] = useState(getInitialState);

  // ---- Auto-save ----
  useEffect(() => {
    const stateToSave = {
      ...appState,
      // store only base64 strings (if you keep them in state)
      logoBase64: appState.logoBase64 || null,
      qrBase64: appState.qrBase64 || null,
      signatureBase64: appState.signatureBase64 || null,
      view: appState.view === 'invoice' ? 'invoice' : 'home'
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.warn('LocalStorage save failed', err);
    }

    // UI save feedback (keeps it local, doesn't re-trigger this effect)
    setAppState(prev => ({ ...prev, showSaveMessage: true }));
    const timer = setTimeout(() => {
      setAppState(prev => ({ ...prev, showSaveMessage: false }));
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    // use the unified names
    appState.invoiceData,
    appState.items,
    appState.postDetails,
    appState.clients,
    appState.selectedTheme,
    appState.isGstEnabled,
    appState.isIndianClient,
    appState.currencyCode,
    appState.logoBase64,
    appState.qrBase64,
    appState.signatureBase64,
    appState.view
  ]);

  const setAppPartialState = useCallback((newProps) => {
    setAppState(prev => ({ ...prev, ...newProps }));
  }, []);

  const setView = useCallback((newView) => {
    setAppState(prev => ({ ...prev, view: newView }));
  }, []);

  const memoizedHandlers = useMemo(() => {
    const handlers = {
      setAppPartialState,
      setAppState,
      setInvoiceField: (field, value) => setAppState(prev => ({ ...prev, invoiceData: { ...prev.invoiceData, [field]: value } })),

      addClient: (name) => {
        const trimmed = (name || '').trim();
        if (!trimmed) { alert('Client name required'); return; }
        setAppState(prev => {
          const newClientId = Date.now().toString();
          const newClients = {
            ...prev.clients,
            [newClientId]: { name: trimmed, invoices: [] }
          };
          return {
            ...prev,
            clients: newClients,
            currentClientId: newClientId,
            invoiceData: { ...DEFAULT_INVOICE_DATA, invoiceNumber: getNewInvoiceNumber(newClients), clientName: trimmed },
            items: DEFAULT_ITEMS,
            postDetails: DEFAULT_POSTS,
            showClientModal: false,
            view: 'invoice'
          };
        });
      },

      openClientModal: () => setAppState(prev => ({ ...prev, showClientModal: true })),
      closeClientModal: () => setAppState(prev => ({ ...prev, showClientModal: false })),

      loadClientData: (clientId) => {
        setAppState(prev => {
          const client = prev.clients?.[clientId];
          if (!client) return prev;
          const latestInvoice = client.invoices?.[client.invoices.length - 1];
          return {
            ...prev,
            currentClientId: clientId,
            invoiceData: latestInvoice ? { ...latestInvoice.invoiceData } : { ...DEFAULT_INVOICE_DATA, invoiceNumber: getNewInvoiceNumber(prev.clients), clientName: client.name },
            items: latestInvoice ? [...latestInvoice.items] : DEFAULT_ITEMS,
            postDetails: latestInvoice ? [...latestInvoice.postDetails] : DEFAULT_POSTS
          };
        });
      },

      saveCurrentInvoice: () => {
        setAppState(prev => {
          const currentClientId = prev.currentClientId;
          if (!currentClientId || !prev.clients?.[currentClientId]) {
            // keep state unchanged, but inform user
            alert('Please select or create a client first.');
            return prev;
          }

          const newInvoice = {
            invoiceId: prev.invoiceData.invoiceNumber,
            invoiceData: { ...prev.invoiceData },
            items: [...prev.items],
            postDetails: [...prev.postDetails],
            dateSaved: new Date().toISOString()
          };

          const currentClient = prev.clients[currentClientId];
          const currentInvoices = Array.isArray(currentClient.invoices) ? currentClient.invoices : [];
          const existingIndex = currentInvoices.findIndex(inv => inv.invoiceId === newInvoice.invoiceId);

          const updatedInvoices = existingIndex !== -1
            ? currentInvoices.map((inv, idx) => idx === existingIndex ? newInvoice : inv)
            : [...currentInvoices, newInvoice];

          return {
            ...prev,
            clients: { ...prev.clients, [currentClientId]: { ...currentClient, invoices: updatedInvoices } },
            showSaveMessage: true
          };
        });
      },

      startNewInvoice: () => {
        setAppState(prev => {
          const cid = prev.currentClientId;
          if (!cid || !prev.clients?.[cid]) {
            alert('Please select a client before starting a new invoice.');
            return prev;
          }
          return {
            ...prev,
            invoiceData: { ...DEFAULT_INVOICE_DATA, invoiceNumber: getNewInvoiceNumber(prev.clients), clientName: prev.clients[cid].name },
            items: DEFAULT_ITEMS,
            postDetails: DEFAULT_POSTS
          };
        });
      },

      setView
    };

    return handlers;
  }, [
    setAppPartialState,
    setAppState,
    setView,
    // keep these deps up-to-date so handlers recreate when clients/currentClientId change
    appState.currentClientId,
    appState.clients,
    appState.invoiceData,
    appState.items,
    appState.postDetails,
    appState.logoBase64,
    appState.qrBase64,
    appState.signatureBase64
  ]);

  // Routing
  if (appState.view === 'home') return <HomePage onViewChange={setView} />;

  if (appState.view === 'invoice') {
    const currency = CURRENCY_MAP?.[appState.currencyCode];
    const theme = THEMES?.[appState.selectedTheme] || THEMES?.default || {};
    return (
      <InvoiceGeneratorScreen
        appState={appState}
        setAppState={memoizedHandlers.setAppState}
        currencySymbol={currency ? currency.symbol : appState.currencyCode || '₹'}
        theme={theme}
        setInvoiceField={memoizedHandlers.setInvoiceField}
        addClient={memoizedHandlers.addClient}
        openClientModal={memoizedHandlers.openClientModal}
        closeClientModal={memoizedHandlers.closeClientModal}
        loadClientData={memoizedHandlers.loadClientData}
        saveCurrentInvoice={memoizedHandlers.saveCurrentInvoice}
        startNewInvoice={memoizedHandlers.startNewInvoice}
        setAppPartialState={memoizedHandlers.setAppPartialState}
        setView={memoizedHandlers.setView}
      />
    );
  }

  return null;
}

export default App;
