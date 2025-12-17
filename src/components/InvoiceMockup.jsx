import React from 'react';
import { Shield, Zap } from 'lucide-react';

const InvoiceMockup = ({ isDarkMode }) => {
  return (
    <div
      className={`relative w-full max-w-lg md:max-w-[480px] md:ml-auto shadow-2xl rounded-[32px]
      border overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
      }`}
      aria-hidden="true"
    >
      {/* Glow background */}
      <div
        className={`absolute inset-0 -z-10 blur-3xl opacity-70 ${
          isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-400/15'
        }`}
      />

      {/* Background card */}
      <div
        className={`absolute -top-6 -right-6 w-[72%] h-[68%] rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        } transform rotate-6 translate-y-3`}
      />

      {/* Main card */}
      <div className="relative p-6 md:p-8">
        <div
          className={`w-full aspect-[4/5] max-w-[380px] ml-auto rounded-3xl border shadow-xl
          overflow-hidden transform -rotate-2 motion-safe:animate-float ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'
          }`}
        >
          {/* Header */}
          <div
            className={`px-6 py-5 flex items-center justify-between border-b ${
              isDarkMode
                ? 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800'
                : 'bg-gradient-to-r from-slate-50 to-white border-slate-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600" />
              <div>
                <div
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-slate-50' : 'text-slate-900'
                  }`}
                >
                  Acme Studio
                </div>
                <div className="text-[11px] text-slate-500">
                  Invoice • Design work
                </div>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-xs font-medium uppercase tracking-[0.16em] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                INVOICE
              </div>
              <div className="text-[11px] text-slate-500 mt-1">#2024-001</div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex justify-between gap-4 text-[11px]">
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Bill to
                </div>
                <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                  Nova Labs LLC
                </div>
                <div className="text-slate-500">finance@novalabs.co</div>
              </div>

              <div className="space-y-1.5 text-right">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                  Due date
                </div>
                <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                  24 Aug 2024
                </div>
                <div className="text-slate-500">Net 14</div>
              </div>
            </div>

            <div className={`h-px my-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

            {/* Line items */}
            <div className="space-y-3 text-[11px]">
              {['Brand identity system', 'Landing page design'].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                      {item}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {idx === 0 ? 'Fixed scope' : '3 screens • responsive'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                      {idx === 0 ? '$2,800.00' : '$1,450.00'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {idx === 0 ? 'One-time' : 'Per project'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                <span>Subtotal</span>
                <span>$4,250.00</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-2">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.16em]">
                  Total due
                </span>
                <span
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-indigo-300' : 'text-slate-900'
                  }`}
                >
                  $4,250.00
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className={`mt-auto px-6 py-3 text-[10px] flex items-center justify-between border-t ${
              isDarkMode
                ? 'bg-slate-950/80 border-slate-900 text-slate-500'
                : 'bg-slate-50 border-slate-100 text-slate-500'
            }`}
          >
            <span>Payment via bank transfer</span>
            <span>Due in 14 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceMockup;
