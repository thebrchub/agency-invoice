import React from 'react';

const QuotationMockup = ({ isDarkMode }) => {
  return (
    <div
      className={`relative w-full max-w-lg md:max-w-[480px] md:ml-auto shadow-2xl rounded-[32px]
      border overflow-hidden transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'
      }`}
      aria-hidden="true"
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 -z-10 blur-3xl opacity-70 ${
          isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-400/15'
        }`}
      />

      {/* Background tilted card */}
      <div
        className={`absolute -top-6 -right-6 w-[72%] h-[68%] rounded-3xl border ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        } transform -rotate-6 translate-y-3`}
      />

      {/* Main card */}
      <div className="relative p-6 md:p-8">
        <div
          className={`w-full aspect-[4/5] max-w-[380px] ml-auto rounded-3xl border shadow-xl
          overflow-hidden transform rotate-1 motion-safe:animate-float ${
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
            <div>
              <div
                className={`text-xs font-medium uppercase tracking-[0.16em] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                QUOTATION
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                QT-2024-003
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-slate-500">Valid until</div>
              <div
                className={`text-sm font-semibold ${
                  isDarkMode ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                14 Sep 2024
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-4 text-[11px]">
            {/* Client */}
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">
                Prepared for
              </div>
              <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                Nova Labs LLC
              </div>
              <div className="text-slate-500">business@novalabs.co</div>
            </div>

            <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

            {/* Scope items */}
            <div className="space-y-3">
              {[
                'Brand identity system',
                'Landing page design',
                'Design handoff & assets',
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                    {item}
                  </span>
                  <span className="text-slate-500">
                    {idx === 0 ? '$2,800' : idx === 1 ? '$1,450' : 'Included'}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className={`mt-3 pt-3 border-t ${
                isDarkMode ? 'border-slate-800' : 'border-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-[0.16em]">
                  Estimated total
                </span>
                <span
                  className={`text-lg font-semibold ${
                    isDarkMode ? 'text-emerald-300' : 'text-slate-900'
                  }`}
                >
                  $4,250.00
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Final amount may vary based on scope.
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
            <span>No payment required now</span>
            <span>Estimate only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationMockup;
