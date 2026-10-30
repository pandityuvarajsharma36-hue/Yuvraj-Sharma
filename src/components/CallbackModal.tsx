import React, { useState } from 'react';
import { PhoneCall, X, CheckCircle2, AlertCircle, Clock, MessageSquare, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export function CallbackModal({ isOpen, onClose, defaultService }: CallbackModalProps) {
  const { language, t, localize } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState(language === 'en' ? 'Immediately (Within 5-10 Minutes)' : 'किसी भी समय (यथाशीघ्र)');
  const [serviceNeeded, setServiceNeeded] = useState(defaultService || (language === 'en' ? 'General Woodcraft Consultation' : 'सामान्य काष्ठकला पूछताछ'));
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; whatsapp_link?: string | null; phone: string } | null>(null);

  if (!isOpen) return null;

  // Client-side phone validator
  const validatePhoneClient = (num: string) => {
    const trimmed = num.trim();
    if (!trimmed) {
      return language === 'en' ? 'Please enter your phone number.' : 'कृपया फोन नंबर दर्ज करें।';
    }
    if (!/^[+]?[\d\s\-().]{10,20}$/.test(trimmed)) {
      return language === 'en' ? 'Please enter a valid phone number.' : 'कृपया एक वैध फोन नंबर दर्ज करें।';
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10) {
      return language === 'en' ? 'Phone number must have at least 10 digits.' : 'फोन नंबर कम से कम 10 अंकों का होना चाहिए।';
    }
    if (digits.length > 15) {
      return language === 'en' ? 'Phone number cannot exceed 15 digits.' : 'फोन नंबर 15 अंकों से अधिक नहीं हो सकता।';
    }
    if (/^(\d)\1{9,}$/.test(digits)) {
      return language === 'en' ? 'Please provide a valid active phone number.' : 'कृपया एक सक्रिय और सही फोन नंबर दर्ज करें।';
    }
    if (digits.length === 10 && !/^[6-9]/.test(digits)) {
      return language === 'en' ? 'Indian mobile numbers should begin with 6, 7, 8, or 9.' : 'भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setErrorMessage(language === 'en' ? 'Please enter your full name (at least 2 letters).' : 'कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।');
      return;
    }

    const phoneErr = validatePhoneClient(phone);
    if (phoneErr) {
      setErrorMessage(phoneErr);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/callbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          phone: phone.trim(),
          preferred_time: preferredTime,
          service_needed: serviceNeeded,
          notes: notes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (language === 'en' ? 'Failed to submit callback request.' : 'कॉल बैक अनुरोध भेजने में त्रुटि हुई।'));
      }

      setSuccessData({
        message: data.message || (language === 'en' ? 'Callback request scheduled successfully.' : 'कॉल बैक अनुरोध सफलतापूर्वक दर्ज हो गया है।'),
        whatsapp_link: data.whatsapp_link,
        phone: phone.trim()
      });
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'en' ? 'Could not connect to server. Please dial our phone line directly.' : 'सर्वर से संपर्क नहीं हो पा रहा है। कृपया हमें सीधे कॉल करें।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setErrorMessage(null);
    setCustomerName('');
    setPhone('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-6 sm:p-8 border-b border-stone-800">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {localize('शर्मा वुडक्राफ्ट डायरेक्ट', 'Sharma Woodcraft Direct')}
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            {t('callback', 'modal_title')}
          </h2>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            {t('callback', 'modal_subtitle')}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {successData ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  {t('callback', 'success_title')}
                </h3>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  {localize(
                    `हमने ${successData.phone} पर कॉल बैक दर्ज कर लिया है। मास्टर कारीगर आपके चुने गए समय में आपसे सीधे संपर्क करेंगे।`,
                    `We have scheduled a callback for ${successData.phone}. Our master craftsman will connect with you at your chosen time.`
                  )}
                </p>
              </div>

              {successData.whatsapp_link && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <p className="font-semibold text-emerald-950">
                    {localize('क्या आपको तुरंत उत्तर या फोटो भेजना है?', 'Need an immediate reply or want to send photos?')}
                  </p>
                  <a
                    href={successData.whatsapp_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{localize('सीधे व्हाट्सएप चैट खोलें', 'Open WhatsApp Chat Now')}</span>
                  </a>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  {localize('पूर्ण (बंद करें)', 'Done (Close)')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
                  {t('callback', 'name')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={localize('उदा. राजेश शर्मा', 'e.g. Rajesh Sharma')}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
                  {t('callback', 'phone')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={localize('उदा. +91 98100 12345 या 9810012345', 'e.g. +91 98100 12345 or 9810012345')}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                  />
                  <PhoneCall className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  {t('callback', 'privacy_note')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
                    {t('callback', 'pref_time')}
                  </label>
                  <div className="relative">
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={t('callback', 'time_asap')}>{t('callback', 'time_asap')}</option>
                      <option value={t('callback', 'time_morning')}>{t('callback', 'time_morning')}</option>
                      <option value={t('callback', 'time_afternoon')}>{t('callback', 'time_afternoon')}</option>
                      <option value={t('callback', 'time_evening')}>{t('callback', 'time_evening')}</option>
                    </select>
                    <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
                    {localize('आवश्यक फर्नीचर / सेवा', 'Required Furniture')}
                  </label>
                  <select
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={localize('कस्टम वार्डरोब (अलमारी)', 'Custom Wardrobe')}>{localize('कस्टम वार्डरोब (अलमारी)', 'Custom Wardrobe')}</option>
                    <option value={localize('मॉड्यूलर किचन', 'Modular Kitchen')}>{localize('मॉड्यूलर किचन', 'Modular Kitchen')}</option>
                    <option value={localize('डाइनिंग टेबल व कुर्सियां', 'Dining Table & Chairs')}>{localize('डाइनिंग टेबल व कुर्सियां', 'Dining Table & Chairs')}</option>
                    <option value={localize('बेड व बेडरूम सेट', 'Bed & Bedroom Set')}>{localize('बेड व बेडरूम सेट', 'Bed & Bedroom Set')}</option>
                    <option value={localize('टीवी यूनिट व वॉल पैनल', 'TV Media Unit & Wall Panels')}>{localize('टीवी यूनिट व वॉल पैनल', 'TV Media Unit & Wall Panels')}</option>
                    <option value={localize('ठोस सागौन के दरवाजे', 'Solid Teak Main Doors')}>{localize('ठोस सागौन के दरवाजे', 'Solid Teak Main Doors')}</option>
                    <option value={localize('पूरे घर का संपूर्ण काष्ठकार्य', 'Complete House Millwork')}>{localize('पूरे घर का संपूर्ण काष्ठकार्य', 'Complete House Millwork')}</option>
                    <option value={localize('सामान्य काष्ठकला पूछताछ', 'General Woodcraft Consultation')}>{localize('सामान्य काष्ठकला पूछताछ', 'General Woodcraft Consultation')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 font-sans">
                  {localize('संक्षिप्त विवरण या प्रश्न (वैकल्पिक)', 'Brief Specifications (Optional)')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={localize(
                    'उदा. 8 सीटर डाइनिंग टेबल या मास्टर बेडरूम की 4 डोर स्लाइडिंग अलमारी के बारे में जानना है...',
                    'e.g. 8-seater dining table or master bedroom 4-door sliding wardrobe specifications...'
                  )}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-xs sm:text-sm font-bold tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isSubmitting ? t('callback', 'submitting') : t('callback', 'submit')}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>{t('callback', 'privacy_note')}</span>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
