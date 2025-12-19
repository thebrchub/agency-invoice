import React from 'react';
import { X } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, isDarkMode }) => {
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
          <h3 className="text-lg font-bold">Terms of Use</h3>
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
            IndieByll is provided as a free tool for generating invoices and
            quotations.
          </p>

          <p>
            You are solely responsible for the accuracy, legality, and validity
            of the invoices generated using this tool.
          </p>

          <p>
            We do not guarantee compliance with tax laws, accounting standards,
            or legal requirements in your jurisdiction.
          </p>

          <p>
            IndieByll is provided “as is”, without warranties of any kind.
            Blazing Render Creation Hub LLP shall not be liable for any losses,
            damages, or disputes arising from the use of this tool.
          </p>

          <p>
            By using IndieByll, you agree to these terms.
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

export default TermsModal;
