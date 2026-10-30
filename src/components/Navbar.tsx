import { useState } from 'react';
import { Menu, X, PhoneCall, Languages } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onRequestCallback?: () => void;
}

export function Navbar({ currentPage, onNavigate, onRequestCallback }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useData();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { id: 'home', label: t('nav', 'home') },
    { id: 'services', label: t('nav', 'services') },
    { id: 'projects', label: t('nav', 'projects') },
    { id: 'about', label: t('nav', 'about') },
    { id: 'contact', label: t('nav', 'contact') },
  ];

  const handleLinkClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const businessName = language === 'en'
    ? (settings.business_name?.includes('शर्मा') ? 'Sharma Woodcraft' : (settings.business_name || 'Sharma Woodcraft'))
    : (settings.business_name || 'शर्मा वुडक्राफ्ट');

  const businessPhone = settings.phone || '+91 98100 12345';
  const cleanPhone = businessPhone.replace(/[^\d+]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-xl group-hover:border-amber-400 transition-colors">
              {language === 'en' ? 'S' : 'श'}
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-stone-100 block whitespace-nowrap">
                {businessName}
              </span>
              <span className="text-[11px] tracking-widest text-amber-300/80 block font-sans">
                {t('nav', 'brand_subtitle')}
              </span>
            </div>
          </button>

          {/* Zone 2: Single-line Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-amber-400 font-semibold'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions + Language Toggle + Quick Callback + Phone */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 shrink-0">
            
            {/* Language Toggle Button (हिं / EN) */}
            <div
              className="flex items-center bg-stone-950/80 border border-stone-700/80 rounded-xl p-1 shadow-inner text-xs font-semibold"
              role="group"
              aria-label="Language Selector"
            >
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  language === 'hi'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="हिंदी में पढ़ें"
              >
                हिं
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Read in English"
              >
                EN
              </button>
            </div>

            {onRequestCallback && (
              <button
                onClick={onRequestCallback}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors cursor-pointer"
                title={t('nav', 'request_callback')}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('nav', 'request_callback')}</span>
              </button>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="hidden xl:flex items-center gap-2 text-xs text-stone-300 hover:text-amber-400 transition-colors whitespace-nowrap"
                title={`${t('nav', 'call_us')}: ${businessPhone}`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{businessPhone}</span>
              </a>
            )}

            <button
              onClick={() => handleLinkClick('quote')}
              className="px-4 lg:px-5 py-2.5 text-xs font-semibold tracking-wide text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('nav', 'get_quote')}
            </button>
          </div>

          {/* Mobile top bar buttons */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Compact Language Switch */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="px-2 py-1.5 text-xs font-bold rounded-lg border border-stone-700 bg-stone-800 text-amber-400 hover:bg-stone-700 transition-colors cursor-pointer flex items-center gap-1"
              title={t('nav', 'switch_language')}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'EN' : 'हिं'}</span>
            </button>

            {onRequestCallback && (
              <button
                onClick={onRequestCallback}
                className="p-1.5 text-amber-400 bg-stone-800 rounded-md border border-stone-700 cursor-pointer"
                title={t('nav', 'request_callback')}
              >
                <PhoneCall className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleLinkClick('quote')}
              className="px-2.5 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md whitespace-nowrap cursor-pointer"
            >
              {t('nav', 'quote_short')}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-stone-400 hover:text-white focus:outline-none rounded-lg cursor-pointer"
              aria-label="Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-b border-stone-800 px-4 pt-3 pb-6 space-y-3">
          
          {/* Mobile Dedicated Language Selector Card */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
            <div className="flex items-center gap-2 text-xs font-medium text-stone-300">
              <Languages className="w-4 h-4 text-amber-400" />
              <span>{t('nav', 'language_label')}</span>
            </div>
            <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  language === 'hi'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  language === 'en'
                    ? 'bg-amber-400 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`block w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-stone-800 text-amber-400 font-semibold'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-stone-800 flex flex-col gap-2">
            {onRequestCallback && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onRequestCallback();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-stone-100 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('nav', 'request_callback_mobile')}</span>
              </button>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-300 hover:text-amber-400"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>{t('nav', 'call_us')}: {businessPhone}</span>
              </a>
            )}

            <button
              onClick={() => handleLinkClick('quote')}
              className="w-full text-center py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm cursor-pointer"
            >
              {t('nav', 'get_quote_mobile')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
