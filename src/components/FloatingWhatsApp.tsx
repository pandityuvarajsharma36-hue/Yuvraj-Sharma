import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Copy, Check, Phone } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export function FloatingWhatsApp() {
  const { settings } = useData();
  const { language, t, localize } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const rawWa = settings.whatsapp || '919810012345';
  const cleanWa = rawWa.replace(/[^\d]/g, '');
  const isConfigured = cleanWa.length >= 10;
  const displayPhone = settings.phone || (cleanWa ? `+${cleanWa}` : '+91 98100 12345');

  const prefilledMessage = encodeURIComponent(
    language === 'en'
      ? 'Hello Sharma Woodcraft! I am interested in bespoke custom furniture / architectural millwork for my home in Delhi NCR. Please share details.'
      : 'नमस्ते शर्मा वुडक्राफ्ट! मैं दिल्ली में अपने घर के लिए कस्टम फर्नीचर / काष्ठकला कार्य में रुचि रखता हूँ। कृपया जानकारी साझा करें।'
  );

  const whatsappUrl = `https://wa.me/${cleanWa}?text=${prefilledMessage}`;

  // Reset or initialize 5-second inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 5000);
  }, []);

  // When tooltip opens or closes, manage auto-collapse timer
  useEffect(() => {
    if (showTooltip) {
      resetInactivityTimer();
    } else if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [showTooltip, resetInactivityTimer]);

  const handleOpenTooltip = () => {
    setShowTooltip(true);
    resetInactivityTimer();
  };

  // Gentle tactile 'pop' audio feedback using Web Audio API
  const playSuccessPopSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Primary warm sine wave (tactile wooden pop)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);

      // Subtle soft harmonic overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1080, now);
      osc2.frequency.exponentialRampToValueAtTime(1360, now + 0.04);

      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.linearRampToValueAtTime(0.05, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.14);

      setTimeout(() => {
        try {
          ctx.close();
        } catch (_) {}
      }, 350);
    } catch (_) {
      // Audio playback fails gracefully if audio context is blocked
    }
  };

  const handleCopyPhone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    resetInactivityTimer();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(displayPhone);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = displayPhone;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      playSuccessPopSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Could not copy phone number to clipboard:', err);
    }
  };

  return (
    <aside 
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
      aria-label={localize('व्हाट्सएप संपर्क सहायता', 'WhatsApp Customer Support')}
      onMouseEnter={() => {
        if (showTooltip) resetInactivityTimer();
      }}
    >
      {showTooltip && (
        <div 
          className="mb-3 w-80 max-w-[calc(100vw-3rem)] bg-stone-900 text-stone-100 p-3.5 rounded-xl shadow-2xl border border-stone-700 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={resetInactivityTimer}
          onMouseMove={resetInactivityTimer}
          onClick={resetInactivityTimer}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-amber-400">
                {localize('शर्मा वुडक्राफ्ट डायरेक्ट', 'Sharma Woodcraft Direct')}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-stone-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
              aria-label="Close tooltip"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-stone-300 leading-relaxed mb-3">
            {localize(
              'क्या आपके पास कोई नक्शा, फर्नीचर स्केच या फोटो है? सीधे हमारे मास्टर कारीगर से व्हाट्सएप पर बात करें या फोन नंबर कॉपी करें।',
              'Do you have an architectural sketch, floor plan, or inspiration photo? Chat with our master craftsman directly or copy our number.'
            )}
          </p>

          {/* Quick Copy Number Box */}
          <div className="bg-stone-800/90 rounded-lg p-2.5 mb-3 border border-stone-700/80 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[10px] uppercase font-semibold text-stone-400 tracking-wider">
                <Phone className="w-3 h-3 text-amber-400" />
                <span>{localize('फोन / व्हाट्सएप', 'Phone / WhatsApp')}</span>
              </div>
              <div 
                className={`text-sm font-mono font-medium truncate mt-0.5 transition-all duration-300 inline-block px-1.5 py-0.5 -mx-1.5 rounded ${
                  copied
                    ? 'text-amber-300 bg-amber-500/20 font-bold scale-[1.03] ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                    : 'text-stone-100 hover:text-amber-200'
                }`}
              >
                {displayPhone}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyPhone}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-stone-700 hover:bg-stone-600 text-stone-200 hover:text-white hover:shadow'
              }`}
              title={localize('फोन नंबर क्लिपबोर्ड पर कॉपी करें', 'Copy number to clipboard')}
              aria-label={localize('फोन नंबर कॉपी करें', 'Copy phone number')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{localize('कॉपी हुआ!', 'Copied!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-300" />
                  <span>{localize('कॉपी करें', 'Copy')}</span>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp Direct Chat Button */}
          {isConfigured ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => resetInactivityTimer()}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors shadow-sm text-center cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('whatsapp', 'chat_btn')}</span>
            </a>
          ) : (
            <p className="text-stone-400 italic text-[11px]">
              WhatsApp number can be configured by the admin in website settings.
            </p>
          )}
        </div>
      )}

      {isConfigured ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={handleOpenTooltip}
          onClick={(e) => {
            if (!showTooltip && 'ontouchstart' in window) {
              e.preventDefault();
              setShowTooltip(true);
            }
          }}
          className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-emerald-400/30 cursor-pointer"
          aria-label={t('whatsapp', 'chat_btn')}
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline font-semibold text-xs tracking-wide">
            {t('home', 'chat_on_whatsapp')}
          </span>
        </a>
      ) : (
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center gap-3 bg-stone-700 text-stone-300 p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="hidden sm:inline font-semibold text-xs">WhatsApp</span>
        </button>
      )}
    </aside>
  );
}
