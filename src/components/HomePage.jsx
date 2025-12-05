import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Zap,
  ArrowRight,
  CheckCircle,
  Shield,
  WifiOff,
  Printer,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Lock,
  LayoutTemplate,
  Download
} from 'lucide-react';

/* -------------------------
   Small shared components
   ------------------------- */
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
        isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
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
   ------------------------- */
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
   Navbar
   ------------------------- */
const Navbar = ({ onStart, isDarkMode, toggleDarkMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const btn = mobileMenuRef.current.querySelector(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      btn?.focus();
    }
  }, [mobileMenuOpen]);

  const navClasses = isScrolled
    ? isDarkMode
      ? 'bg-slate-950/90 border-slate-800 backdrop-blur-xl'
      : 'bg-white/90 border-slate-200 backdrop-blur-xl'
    : isDarkMode
      ? 'bg-slate-950 border-transparent'
      : 'bg-white border-transparent';

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const yOffset = -80; // fixed navbar height
    const y =
      el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${navClasses}`}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white p-1.5 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <span
            className={`text-[17px] md:text-lg font-semibold tracking-tight flex items-baseline ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Invoicely
            <span
              className={`ml-1 ${
                isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
              } tracking-normal`}
            >
              Free
            </span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <button
            type="button"
            onClick={() => scrollToId('features')}
            className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToId('trust')}
            className={`text-sm font-medium transition-colors ${
              isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Why privacy
          </button>
          <div className={`h-4 w-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDarkMode
                ? 'text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:ring-slate-700'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100 focus-visible:ring-indigo-300'
            }`}
            aria-pressed={isDarkMode}
            aria-label={isDarkMode ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            onClick={onStart}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              isDarkMode
                ? 'bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-400'
                : 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900'
            }`}
          >
            Open generator
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${
              isDarkMode ? 'text-slate-400' : 'text-slate-500'
            } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
            aria-label={isDarkMode ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`absolute top-full left-0 w-full border-b shadow-lg md:hidden p-4 flex flex-col gap-4 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}
          role="dialog"
          aria-modal="false"
        >
          <button
            type="button"
            className={`text-base font-medium ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
            onClick={() => {
              scrollToId('features');
              setMobileMenuOpen(false);
            }}
          >
            Features
          </button>
          <button
            type="button"
            className={`text-base font-medium ${
              isDarkMode ? 'text-slate-200' : 'text-slate-700'
            }`}
            onClick={() => {
              scrollToId('trust');
              setMobileMenuOpen(false);
            }}
          >
            Why privacy
          </button>
          <button
            onClick={() => {
              onStart();
              setMobileMenuOpen(false);
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
          >
            Create invoice
          </button>
        </div>
      )}
    </nav>
  );
};

/* -------------------------
   Invoice Mockup
   ------------------------- */
const InvoiceMockup = ({ isDarkMode }) => (
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

    {/* Back card (depth) */}
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
        style={{ willChange: 'transform' }}
      >
        {/* Invoice header */}
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
              className={`text-xs font-medium tracking-[0.16em] uppercase ${
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
            {['Brand identity system', 'Landing page design'].map((label, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className={isDarkMode ? 'text-slate-100' : 'text-slate-900'}>
                    {label}
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

        {/* Footer bar */}
        <div
          className={`mt-auto px-6 py-3 flex items-center justify-between text-[10px] border-t ${
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

/* -------------------------
   Main HomePage
   ------------------------- */
const THEME_KEY = 'invoicely-theme'; // 'dark' | 'light' | null

const HomePage = ({ onViewChange = () => {} }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme
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

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      setIsDarkMode(false);
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
    ? 'bg-slate-950 text-white selection:bg-indigo-900 selection:text-indigo-100'
    : 'bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900';

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 scroll-smooth ${mainWrapperClasses}`}
    >
      <Navbar
        onStart={() => onViewChange('invoice')}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Hero */}
      <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column */}
          <RevealOnScroll>
            <div className="max-w-xl">
              <Badge
                className={
                  isDarkMode
                    ? 'bg-indigo-900 text-indigo-100 border border-indigo-800'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
                }
              >
                <Zap className="w-3 h-3 mr-1" />
                v1.0 · Now available
              </Badge>

              <h1
                className={`mt-5 text-[32px] leading-[1.12] md:text-[40px] lg:text-[44px]
                font-bold tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Professional invoices,
                <br />
                <span
                  className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}
                >
                  zero friction.
                </span>
              </h1>

              <p
                className={`mt-4 text-sm md:text-base leading-relaxed max-w-lg ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                A privacy-first invoice generator for freelancers and solo studios.
                No accounts, no dashboards, no lock-in. Just clean PDFs that clients
                actually pay from.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3.5">
                <button
                  onClick={() => onViewChange('invoice')}
                  className="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl
                  text-sm font-semibold shadow-lg hover:shadow-indigo-600/25 hover:-translate-y-0.5
                  transition-all flex items-center justify-center gap-2 focus:outline-none
                  focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-300"
                >
                  Create invoice
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  className={`px-7 py-3 rounded-xl text-sm font-medium border transition-all
                  flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                  focus-visible:ring-slate-300`}
                >
                  <LayoutTemplate className="w-4 h-4" />
                  View templates
                </button>
              </div>

              {/* Trust row */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <TrustPill icon={WifiOff} text="Works fully offline" isDarkMode={isDarkMode} />
                <TrustPill icon={Shield} text="100% client-side · no tracking" isDarkMode={isDarkMode} />
                <TrustPill icon={Lock} text="No login · no accounts" isDarkMode={isDarkMode} />
              </div>

              {/* Social proof */}
              <div
                className={`mt-5 flex flex-wrap items-center gap-3 text-[11px] font-medium
                uppercase tracking-[0.16em] ${
                  isDarkMode ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                <span>Open source</span>
                <span className="h-3 w-px bg-slate-700/40" />
                <span>Designed for freelancers</span>
                <span className="h-3 w-px bg-slate-700/40 hidden sm:inline" />
                <span className="hidden sm:inline">
                  No onboarding · start in seconds
                </span>
              </div>
            </div>
          </RevealOnScroll>

          {/* Right column */}
          <RevealOnScroll delay={120}>
            <div className="relative">
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[120%] h-[120%] blur-3xl rounded-full pointer-events-none ${
                  isDarkMode ? 'bg-indigo-500/15' : 'bg-indigo-500/10'
                }`}
              />
              <InvoiceMockup isDarkMode={isDarkMode} />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Trust & Architecture */}
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
                <h4
                  className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Privacy-first architecture
                </h4>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Everything runs in your browser. We don’t have a database to leak because we
                  don’t store invoice data at all.
                </p>
              </div>
              <div>
                <h4
                  className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  Clean, standard exports
                </h4>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  PDFs are optimised for A4/Letter, with clear hierarchy and all the fields
                  accountants expect to see.
                </p>
              </div>
              <div>
                <h4
                  className={`mb-2 flex items-center gap-2 text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 text-indigo-500" />
                  Built for speed
                </h4>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  Lightweight, no-auth app that opens instantly. Preview updates as you type.
                  No loading spinners, ever.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-24">
        <div className="max-w-5xl mx-auto px-5">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <Badge
                className={
                  isDarkMode
                    ? 'bg-slate-900 text-slate-200 border border-slate-700'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }
              >
                Core features
              </Badge>
              <h2
                className={`mt-4 text-2xl md:text-3xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Everything you need to send a serious invoice.
              </h2>
              <p
                className={`mt-3 text-sm md:text-base ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Designed for freelancers who care about how they look, but don’t want a bloated
                “billing suite.”
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="grid md:grid-cols-2 gap-6">
              <FeatureRow
                icon={LayoutTemplate}
                title="Clean, professional templates"
                desc="A small, opinionated set of layouts that print beautifully and look great in email threads."
                isDarkMode={isDarkMode}
              />
              <FeatureRow
                icon={CheckCircle}
                title="Automatic math"
                desc="Subtotals, discounts and tax are kept in sync as you type. No manual formulas, no spreadsheet mistakes."
                isDarkMode={isDarkMode}
              />
              <FeatureRow
                icon={Printer}
                title="Print & PDF ready"
                desc="One-click exports to lightweight PDFs with embedded fonts. No weird margins, no fuzzy text."
                isDarkMode={isDarkMode}
              />
              <FeatureRow
                icon={Shield}
                title="Zero data retention"
                desc="Clear your browser and everything is gone. There’s no server-side copy for us, or anyone else, to access."
                isDarkMode={isDarkMode}
              />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`py-10 border-t ${
          isDarkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div
              className={`text-sm font-semibold flex items-baseline gap-1 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Invoicely
              <span className={isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}>
                Free
              </span>
            </div>
            <p
              className={`mt-1 text-xs ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              A focused, privacy-respecting invoice generator for independent professionals.
            </p>
            <p
              className={`mt-2 text-[11px] ${
                isDarkMode ? 'text-slate-600' : 'text-slate-500'
              }`}
            >
              © 2024 InvoicelyFree. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <div
              className={`flex gap-4 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <a
                href="#"
                className={isDarkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-600'}
              >
                Privacy
              </a>
              <a
                href="#"
                className={isDarkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-600'}
              >
                Terms
              </a>
              <a
                href="#"
                className={isDarkMode ? 'hover:text-indigo-300' : 'hover:text-indigo-600'}
              >
                GitHub
              </a>
            </div>
            <div
              className={`text-[11px] ${
                isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}
            >
              No cookies. No trackers. Just invoices.
            </div>
          </div>
        </div>
      </footer>

      {/* motion utility */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-6px) rotate(-1deg);
          }
          100% {
            transform: translateY(0px) rotate(-2deg);
          }
        }
        .motion-safe\\:animate-float {
          animation: float 7s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-float {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
