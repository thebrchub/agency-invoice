import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  WifiOff,
  Printer,
  Menu,
  X,
  Moon,
  Sun,
  Lock,
  LayoutTemplate,
  Download,
  FileSpreadsheet
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

// NOTE: This import is commented out for the preview to work. 
// Uncomment this in your local environment and remove the placeholder below.
import HeroMockupSwitcher from '../components/HeroMockupSwitcher';
import PrivacyModal from '../components/PrivacyModal';
import TermsModal from '../components/TermsModal';



// -------------------------------------------------------------

/* -------------------------
   Small shared components
--------------------------*/
const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold
    tracking-[0.18em] uppercase ${className}`}
  >
    {children}
  </span>
);

const TrustPill = ({ icon: Icon, text, isDarkMode }) => (
  <div
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium
    transition-colors ${
      isDarkMode
        ? 'bg-slate-900 text-slate-200 border border-slate-800'
        : 'bg-white text-slate-700 border border-slate-200'
    }`}
  >
    <Icon className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
    <span>{text}</span>
  </div>
);

const FeatureRow = ({ icon: Icon, title, desc, isDarkMode }) => (
  <div
    className={`flex items-start gap-4 p-6 rounded-2xl transition-colors border ${
      isDarkMode
        ? 'border-slate-800 hover:bg-slate-900/60'
        : 'border-slate-100 hover:bg-slate-50'
    }`}
  >
    <div
      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
        isDarkMode ? 'bg-emerald-900/40 text-emerald-300' : 'bg-emerald-50 text-emerald-600'
      }`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3
        className={`text-base md:text-lg font-semibold mb-1.5 ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h3>
      <p
        className={`leading-relaxed text-sm ${
          isDarkMode ? 'text-slate-400' : 'text-slate-600'
        }`}
      >
        {desc}
      </p>
    </div>
  </div>
);


/* -------------------------
   Scroll reveal wrapper
--------------------------*/
const RevealOnScroll = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      {children}
    </div>
  );
};

/* -------------------------
   Navbar Component
--------------------------*/
const Navbar = ({ isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToId = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors ${
        isDarkMode ? 'bg-slate-950/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div
          className="relative flex items-center cursor-pointer"
          onClick={scrollToTop}
        >
          {/* Light logo */}
          <img
            src="/logo1.png"
            alt="IndieByll Light"
            className={`absolute h-40 md:h-40 w-auto object-contain transition-opacity duration-300 ease-in-out
              ${isDarkMode ? 'opacity-0' : 'opacity-100'}
            `}
          />

          {/* Dark logo */}
          <img
            src="/logo2.png"
            alt="IndieByll Dark"
            className={`h-40 md:h-40 w-auto object-contain transition-opacity duration-300 ease-in-out
              ${isDarkMode ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToId('features')}
            className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Features
          </button>

          <button
            onClick={() => scrollToId('trust')}
            className={`text-sm font-medium ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Why privacy
          </button>

          <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Quotation */}
          <button
            onClick={() => navigate('/quotation')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-transparent border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            Quotation
          </button>

          {/* Invoice */}
          <button
            onClick={() => navigate('/invoice')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 ${
              isDarkMode ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
             Invoice <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-5 py-4 border-t ${isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'}`}>
              <button onClick={() => navigate('/invoice')} className="block w-full text-left py-3 font-semibold text-emerald-500">Create Invoice</button>
              <button onClick={() => navigate('/quotation')} className="block w-full text-left py-3 font-semibold text-emerald-500">Create Quotation</button>
        </div>
      )}
    </nav>
  );
};

/* -------------------------
   Main HomePage Component
--------------------------*/
const THEME_KEY = 'invoicely-theme';

const HomePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const navigate = useNavigate();
  // Load initial theme
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      setIsDarkMode(true);
      return;
    }
    if (saved === 'light') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      setIsDarkMode(false);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
      return next;
    });
  };

  const mainWrapperClasses = isDarkMode
    ? 'bg-slate-950 text-white selection:bg-emerald-900 selection:text-emerald-100'
    : 'bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900';

  return (
    <div className={`min-h-screen transition-colors duration-300 scroll-smooth ${mainWrapperClasses}`}>

      <Navbar toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

      {/* Hero Section */}
      {/* EDITED: Reduced padding from pt-20 md:pt-32 to pt-10 md:pt-20 */}
      <section className="relative pt-10 md:pt-20 pb-20 md:pb-28 px-5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Side */}
          <RevealOnScroll>
            <div className="max-w-xl">
              <Badge
                className={
                  isDarkMode
                    ? 'bg-emerald-900 text-emerald-100 border border-emerald-800'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                }
              >
                <Zap className="w-3 h-3 mr-1" />
                v2.0 · Quotations Added
              </Badge>

              <h1
                className={`mt-5 text-[32px] leading-[1.12] md:text-[40px] lg:text-[44px] font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Professional invoices,
                <br />
                <span className={isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}>
                    quotes & estimates.
                </span>
              </h1>

              <p
                className={`mt-4 text-sm md:text-base leading-relaxed max-w-lg ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                A privacy-first generator for freelancers. Create Invoices or Quotes instantly. 
                No accounts, no dashboards, no lock-in. Just clean PDFs.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3.5">
                {/* Invoice Button */}
                <button
                  onClick={() => navigate('/invoice')}
                  className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl
                  text-sm font-semibold shadow-lg hover:shadow-emerald-600/25 hover:-translate-y-0.5
                  transition-all flex items-center justify-center gap-2 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-300"
                >
                  Create Invoice
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quotation Button */}
                <button
                  onClick={() => navigate('/quotation')}
                  className={`px-7 py-3 rounded-xl text-sm font-semibold border transition-all
                  flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  focus-visible:ring-slate-300`}
                >
                  Create Quotation
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>

              {/* Trust Row */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TrustPill icon={WifiOff} text="Works fully offline" isDarkMode={isDarkMode} />
                <TrustPill icon={Shield} text="100% client-side" isDarkMode={isDarkMode} />
                <TrustPill icon={Lock} text="No login required" isDarkMode={isDarkMode} />
              </div>

              {/* Social Proof */}
              <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase text-slate-500 tracking-[0.16em]">
                <span>Open source</span>
                <span className="h-3 w-px bg-slate-700/40" />
                <span>Designed for freelancers</span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right Side */}
          <RevealOnScroll delay={120}>
            <div className="relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-3xl rounded-full pointer-events-none ${
                  isDarkMode ? 'bg-emerald-500/15' : 'bg-emerald-500/10'
                }`}
              />
              <HeroMockupSwitcher isDarkMode={isDarkMode} />

            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* Trust Section */}
      <section
        id="trust"
        className={`py-14 border-y ${
          isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5">
          <RevealOnScroll>
            <div className="grid md:grid-cols-3 gap-10">
              
              <div>
                <h4 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Shield className="w-4 h-4 text-emerald-500" />
                  Privacy-first architecture
                </h4>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Everything runs in your browser. We don’t store invoice data anywhere.
                </p>
              </div>

              <div>
                <h4 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Download className="w-4 h-4 text-emerald-500" />
                  Clean, standard exports
                </h4>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Optimised PDFs with perfect margins, text clarity & compatibility.
                </p>
              </div>

              <div>
                <h4 className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <Zap className="w-4 h-4 text-emerald-500" />
                  Built for speed
                </h4>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  Instant render updates, no account setup, no loading spinners.
                </p>
              </div>

            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-5">

          <RevealOnScroll>
            <div className="text-center mb-14">
              <Badge
                className={
                  isDarkMode
                    ? 'bg-slate-900 text-slate-200 border border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }
              >
                Core features
              </Badge>

              <h2 className={`mt-4 text-2xl md:text-3xl font-semibold ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Everything you need to bill clients.
              </h2>

              <p className={`mt-3 text-sm md:text-base ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Built with simplicity in mind — but powerful enough for real projects.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="grid md:grid-cols-2 gap-6">

              <FeatureRow
                icon={LayoutTemplate}
                title="Professional Templates"
                desc="Create Invoices or Estimates (Quotations) that look great on any device."
                isDarkMode={isDarkMode}
              />

              <FeatureRow
                icon={CheckCircle}
                title="Automatic math"
                desc="Subtotals, discounts, GST, everything updates instantly as you type."
                isDarkMode={isDarkMode}
              />

              <FeatureRow
                icon={Printer}
                title="Print & PDF ready"
                desc="One-click export to crisp vector PDFs for you to email to clients."
                isDarkMode={isDarkMode}
              />

              <FeatureRow
                icon={Shield}
                title="Zero data retention"
                desc="No accounts, no servers — your data stays inside your browser."
                isDarkMode={isDarkMode}
              />

            </div>
          </RevealOnScroll>

        </div>
      </section>

      {/* EDITED: Added About Us Section */}
      <section className={`py-16 border-t ${
        isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-100 bg-slate-50/50'
      }`}>
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            About Us
          </h2>
          <p className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Indiebyll is a free tool built by{' '}
            <a
              href="https://www.thebrchub.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400 font-medium"
            >
              Blazing Render Creation Hub LLP
            </a>
            , designed to support freelancers and small businesses with simple, practical solutions.  
            We’re committed to keeping Indiebyll free and continuously improving it. If you have feature requests or face any issues, feel free to share feedback or reach out using the contact details provided — your input helps us make the tool better.
          </p>
        </div>
      </section>


      {/* Footer */}
<footer
  className={`py-12 border-t ${
    isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
  }`}
>
  <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

    {/* Left */}
    <div>
      <div
        className={`text-lg font-semibold ${
          isDarkMode ? 'text-white' : 'text-slate-900'
        }`}
      >
        Indie
        <span className={isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}>
          Byll
        </span>
      </div>

      <p className={`mt-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        A focused, privacy-respecting invoice & quote generator.
      </p>

      <p className={`mt-3 text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
        © 2025 IndieByll. All rights reserved.
      </p>
    </div>

    {/* Right */}
    <div className="flex flex-col items-start md:items-end gap-3 text-sm">
      <div className={`flex gap-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className={`transition-colors ${
            isDarkMode ? 'hover:text-emerald-300' : 'hover:text-emerald-600'
          }`}
        >
          Privacy
        </button>

        <button
          type="button"
          onClick={() => setShowTerms(true)}
          className={`transition-colors ${
            isDarkMode ? 'hover:text-emerald-300' : 'hover:text-emerald-600'
          }`}
        >
          Terms
        </button>
      </div>

      <a
        href="mailto:indiebyll@thebrchub.tech"
        className={`text-sm transition-colors ${
          isDarkMode
            ? 'text-slate-400 hover:text-emerald-300'
            : 'text-slate-600 hover:text-emerald-600'
        }`}
      >
        Contact: indiebyll@thebrchub.tech
      </a>

      <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
        No cookies. No trackers. Just invoices.
      </div>
    </div>

  </div>
</footer>

<PrivacyModal
  isOpen={showPrivacy}
  onClose={() => setShowPrivacy(false)}
  isDarkMode={isDarkMode}
/>

<TermsModal
  isOpen={showTerms}
  onClose={() => setShowTerms(false)}
  isDarkMode={isDarkMode}
/>


      {/* FIXED: Standard HTML Style Tag instead of 'style jsx' */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(-1deg); }
          100% { transform: translateY(0px) rotate(-2deg); }
        }
        .motion-safe\\:animate-float {
          animation: float 7s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default HomePage;