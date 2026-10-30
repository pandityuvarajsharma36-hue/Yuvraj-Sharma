import { MapPin, Phone, Mail, Clock, MessageSquare, ShieldCheck, ArrowRight, Facebook, Instagram, Share2 } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

function PinterestIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
    </svg>
  );
}

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { settings } = useData();
  const { language, t, localize } = useLanguage();

  const businessName = language === 'en'
    ? (settings.business_name?.includes('शर्मा') ? 'Sharma Woodcraft' : (settings.business_name || 'Sharma Woodcraft'))
    : (settings.business_name || 'शर्मा वुडक्राफ्ट');

  const phone = settings.phone || '+91 98100 12345';
  const whatsapp = settings.whatsapp || '919810012345';
  const email = settings.email || 'contact@sharmawoodcraft.in';
  
  const address = language === 'en'
    ? 'Kirti Nagar Furniture Block, New Delhi, Delhi 110015, India'
    : (settings.address || 'कीर्ति नगर फर्नीचर ब्लॉक, नई दिल्ली, दिल्ली 110015, भारत');

  const hours = language === 'en'
    ? 'Monday - Saturday: 10:00 AM - 8:00 PM (Sunday by Appointment)'
    : (settings.business_hours || 'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक');

  const footerText = language === 'en'
    ? 'Sharma Woodcraft — Handcrafted architectural millwork and heirloom custom furniture in Delhi NCR.'
    : (settings.footer_text || 'शर्मा वुडक्राफ्ट — दिल्ली एनसीआर में हस्तनिर्मित वास्तुशिल्प काष्ठकला और पीढ़ियों तक चलने वाला कस्टम फर्नीचर।');

  const facebookUrl = settings.facebook_url?.trim() || '';
  const instagramUrl = settings.instagram_url?.trim() || '';
  const pinterestUrl = settings.pinterest_url?.trim() || '';
  const hasSocialLinks = Boolean(facebookUrl || instagramUrl || pinterestUrl);

  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const cleanWa = whatsapp.replace(/[^\d]/g, '');

  const quickNav = [
    { id: 'home', label: t('nav', 'home') },
    { id: 'services', label: t('nav', 'services') },
    { id: 'projects', label: t('nav', 'projects') },
    { id: 'about', label: t('nav', 'about') },
    { id: 'contact', label: t('nav', 'contact') },
    { id: 'quote', label: t('nav', 'get_quote') },
  ];

  const popularServices = language === 'en'
    ? [
        'Custom Master Walk-In Wardrobes',
        'Solid Teak Luxury Modular Kitchens',
        'Handcrafted Teak Dining Tables',
        'Acoustic Fluted Wood Wall Paneling',
        'Solid Carved Main Entrance Doors',
        'Living Room Credenzas & Media Units',
      ]
    : [
        'कस्टम मास्टर वार्डरोब (अलमारी)',
        'ठोस लकड़ी के मॉड्यूलर किचन',
        'शाही सागौन डाइनिंग टेबल',
        'एकॉस्टिक वुडन वॉल पैनलिंग',
        'नक्काशीदार मुख्य प्रवेश द्वार',
        'लिविंग रूम क्रेडेंज़ा और टीवी यूनिट',
      ];

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Craftsmanship Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif font-bold text-lg">
                {language === 'en' ? 'S' : 'श'}
              </div>
              <span className="text-xl font-serif font-bold tracking-tight text-white">
                {businessName}
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              {footerText}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('footer', 'philosophy')}</span>
            </div>

            {/* Quick Social Icons */}
            {hasSocialLinks && (
              <div className="pt-3">
                <span className="text-[11px] font-semibold text-stone-400 block mb-2 font-sans uppercase tracking-wider">
                  {t('footer', 'social_follow')}
                </span>
                <div className="flex items-center gap-2.5">
                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Sharma Woodcraft on Facebook"
                      aria-label="Facebook"
                      className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Sharma Woodcraft on Instagram"
                      aria-label="Instagram"
                      className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 hover:border-transparent flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {pinterestUrl && (
                    <a
                      href={pinterestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Sharma Woodcraft on Pinterest"
                      aria-label="Pinterest"
                      className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:bg-[#E60023] hover:border-[#E60023] flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105"
                    >
                      <PinterestIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 mb-4 font-sans">
              {t('footer', 'quick_links')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              {quickNav.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onNavigate(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-stone-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 group cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3 text-stone-600 group-hover:text-amber-400 transition-colors" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Bespoke Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 mb-4 font-sans">
              {t('footer', 'bespoke_craft')}
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              {popularServices.map((srv, idx) => (
                <li key={idx} className="hover:text-stone-200 transition-colors">
                  {srv}
                </li>
              ))}
            </ul>
          </div>

          {/* Delhi Workshop & Contact */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-100 mb-4 font-sans">
              {t('footer', 'workshop_heading')}
            </h4>
            
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
              <span>{address}</span>
            </div>

            {cleanPhone && (
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </div>
            )}

            {cleanWa && (
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  {localize('व्हाट्सएप:', 'WhatsApp:')} +{cleanWa}
                </a>
              </div>
            )}

            {email && (
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </div>
            )}

            <div className="flex items-start gap-3 text-xs text-stone-500 pt-1">
              <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <span>{hours}</span>
            </div>
          </div>

        </div>

        {/* Dedicated Social Media Section */}
        {hasSocialLinks && (
          <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border border-stone-800 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-serif font-bold text-white">
                  {t('footer', 'social_heading')}
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xl">
                  {t('footer', 'social_sub')}
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-3">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-[#1877F2] text-stone-300 hover:text-white text-xs font-semibold border border-stone-700/80 hover:border-[#1877F2] transition-all duration-200 shadow-sm hover:scale-105"
                >
                  <Facebook className="w-4 h-4 text-[#1877F2] group-hover:text-white" />
                  <span>Facebook</span>
                </a>
              )}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700/80 hover:border-transparent transition-all duration-200 shadow-sm hover:scale-105"
                >
                  <Instagram className="w-4 h-4 text-pink-400 group-hover:text-white" />
                  <span>Instagram</span>
                </a>
              )}

              {pinterestUrl && (
                <a
                  href={pinterestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-[#E60023] text-stone-300 hover:text-white text-xs font-semibold border border-stone-700/80 hover:border-[#E60023] transition-all duration-200 shadow-sm hover:scale-105"
                >
                  <PinterestIcon className="w-4 h-4 text-[#E60023] group-hover:text-white" />
                  <span>Pinterest</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar: Copyright & Discrete Admin Link */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {businessName}। {t('footer', 'copyright')}</p>
          <div className="flex items-center gap-6">
            <span>{t('footer', 'dedication')}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                onNavigate('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-stone-400 hover:text-amber-400 underline decoration-stone-700 hover:decoration-amber-400 transition-colors cursor-pointer"
            >
              {t('footer', 'admin_portal')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
