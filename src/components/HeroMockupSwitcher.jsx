import { useEffect, useState } from 'react';
import InvoiceMockup from './InvoiceMockup';
import QuotationMockup from './QuotationMockup';

const HeroMockupSwitcher = ({ isDarkMode }) => {
  const [active, setActive] = useState('invoice');

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev === 'invoice' ? 'quotation' : 'invoice'));
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-lg md:max-w-[480px] md:ml-auto">
      {/* Invoice */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out
          ${active === 'invoice'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
      >
        <InvoiceMockup isDarkMode={isDarkMode} />
      </div>

      {/* Quotation */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out
          ${active === 'quotation'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
      >
        <QuotationMockup isDarkMode={isDarkMode} />
      </div>

      {/* Spacer (prevents layout jump) */}
      <div className="invisible">
        <InvoiceMockup isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default HeroMockupSwitcher;
