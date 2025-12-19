import React from 'react';
import { X } from 'lucide-react';

const PrivacyModal = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
          isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold">Privacy Policy</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 text-sm leading-relaxed space-y-4 max-h-[70vh] overflow-y-auto">
          <p>
            IndieByll is a privacy-first invoice and quotation generator.
            Everything runs entirely in your browser.
          </p>

          <p>
            We do <strong>not</strong> collect, store, or transmit your invoices,
            client data, or financial information to any server.
          </p>

          <p>
            We do not use cookies, trackers, analytics scripts, or third-party
            monitoring tools.
          </p>

          <p>
            Any data you enter is stored locally in your browser using local
            storage and remains fully under your control.
          </p>

          <p>
            If you clear your browser data, your invoices will be removed.
            IndieByll is provided as-is without server-side backups.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Last updated: 2025
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
