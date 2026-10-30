import React, { useState } from 'react';
import { MapPin, Phone, MessageSquare, Mail, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

export function ContactPage() {
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
    : (settings.business_hours || 'सोमवार - शनिवार: सुबह 10:00 से रात 8:00 बजे तक (रविवार केवल अपॉइंटमेंट द्वारा)');

  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const cleanWa = whatsapp.replace(/[^\d]/g, '');

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    service_needed: 'कस्टम वार्डरोब (अलमारियां)',
    location_area: 'दिल्ली एनसीआर',
    details: '',
    preferred_contact: 'phone'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Callback Card State
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbTime, setCbTime] = useState(language === 'en' ? 'Immediately (Within 5-10 Minutes)' : 'किसी भी समय (यथाशीघ्र)');
  const [cbSubmitting, setCbSubmitting] = useState(false);
  const [cbSuccess, setCbSuccess] = useState<string | null>(null);
  const [cbError, setCbError] = useState<string | null>(null);
  const [cbWaLink, setCbWaLink] = useState<string | null>(null);

  const validatePhone = (num: string) => {
    const trimmed = num.trim();
    if (!trimmed) return language === 'en' ? 'Please enter your phone number.' : 'कृपया फोन नंबर दर्ज करें।';
    if (!/^[+]?[\d\s\-().]{10,20}$/.test(trimmed)) {
      return language === 'en' ? 'Please enter a valid phone number.' : 'कृपया एक वैध फोन नंबर दर्ज करें।';
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10) return language === 'en' ? 'Phone number must have at least 10 digits.' : 'फोन नंबर कम से कम 10 अंकों का होना चाहिए।';
    if (digits.length > 15) return language === 'en' ? 'Phone number cannot exceed 15 digits.' : 'फोन नंबर 15 अंकों से अधिक नहीं हो सकता।';
    if (/^(\d)\1{9,}$/.test(digits)) return language === 'en' ? 'Please provide a valid active phone number.' : 'कृपया एक वास्तविक फोन नंबर दर्ज करें।';
    if (digits.length === 10 && !/^[6-9]/.test(digits)) {
      return language === 'en' ? 'Indian mobile numbers should begin with 6, 7, 8, or 9.' : 'भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए।';
    }
    return null;
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCbError(null);
    setCbSuccess(null);

    if (!cbName.trim() || cbName.trim().length < 2) {
      setCbError(language === 'en' ? 'Please enter your full name (at least 2 letters).' : 'कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर)।');
      return;
    }

    const phoneErr = validatePhone(cbPhone);
    if (phoneErr) {
      setCbError(phoneErr);
      return;
    }

    setCbSubmitting(true);
    try {
      const res = await fetch('/api/public/callbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: cbName.trim(),
          phone: cbPhone.trim(),
          preferred_time: cbTime,
          service_needed: 'संपर्क पृष्ठ से सीधा कॉल बैक'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (language === 'en' ? 'Failed to submit callback request.' : 'कॉल बैक अनुरोध भेजने में त्रुटि हुई।'));

      setCbSuccess(data.message || (language === 'en' ? 'Callback scheduled! We will contact you shortly.' : 'कॉल बैक दर्ज हो गया! हम शीघ्र ही आपसे संपर्क करेंगे।'));
      setCbWaLink(data.whatsapp_link || null);
      setCbName('');
      setCbPhone('');
    } catch (err: any) {
      setCbError(err.message || (language === 'en' ? 'Could not schedule callback.' : 'कॉल बैक अनुरोध दर्ज नहीं हो सका।'));
    } finally {
      setCbSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (language === 'en' ? 'Error sending message.' : 'संदेश भेजने में त्रुटि हुई।'));
      }

      setSuccessMsg(data.message || (language === 'en' ? 'Your inquiry has been received by our master craftsmen.' : 'आपकी पूछताछ सफलतापूर्वक हमारे मुख्य कारीगर तक पहुंच गई है!'));
      if (data.whatsapp_link) {
        setWhatsappLink(data.whatsapp_link);
      }
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        service_needed: 'कस्टम वार्डरोब (अलमारियां)',
        location_area: 'दिल्ली एनसीआर',
        details: '',
        preferred_contact: 'phone'
      });
    } catch (err: any) {
      setErrorMsg(err.message || (language === 'en' ? 'Unable to reach server. Please try again.' : 'सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 font-sans block mb-2">
            {t('contact', 'tag')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight mb-4">
            {t('contact', 'title')}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t('contact', 'desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Workshop & Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dedicated Request a Callback Card */}
            <div className="bg-stone-900 text-stone-100 p-6 sm:p-7 rounded-2xl border border-stone-800 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-white">
                    {t('contact', 'callback_banner_title')}
                  </h3>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold block">
                    {localize('शीघ्र प्रत्युत्तर · मुख्य कारीगर से सीधी बातचीत', 'Prompt Response · Direct Master Artisan Consultation')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {t('contact', 'callback_banner_desc')}
              </p>

              {cbSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cbSuccess}</span>
                  </div>
                  {cbWaLink && (
                    <a
                      href={cbWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{localize('व्हाट्सएप पर भी चैट करें →', 'Chat on WhatsApp as well →')}</span>
                    </a>
                  )}
                  <button
                    onClick={() => setCbSuccess(null)}
                    className="block text-[11px] text-stone-400 hover:text-stone-200 underline mt-1 cursor-pointer"
                  >
                    {localize('अन्य कॉल बैक अनुरोध भेजें', 'Request another callback')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3">
                  {cbError && (
                    <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{cbError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                      {t('callback', 'name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={cbName}
                      onChange={(e) => setCbName(e.target.value)}
                      placeholder={localize('उदा. सुनील वर्मा', 'e.g. Sunil Verma')}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                      {t('callback', 'phone')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={cbPhone}
                      onChange={(e) => setCbPhone(e.target.value)}
                      placeholder={localize('उदा. +91 98100 12345 या 9810012345', 'e.g. +91 98100 12345 or 9810012345')}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-1">
                      {t('callback', 'pref_time')}
                    </label>
                    <select
                      value={cbTime}
                      onChange={(e) => setCbTime(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={t('callback', 'time_asap')}>{t('callback', 'time_asap')}</option>
                      <option value={t('callback', 'time_morning')}>{t('callback', 'time_morning')}</option>
                      <option value={t('callback', 'time_afternoon')}>{t('callback', 'time_afternoon')}</option>
                      <option value={t('callback', 'time_evening')}>{t('callback', 'time_evening')}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={cbSubmitting}
                    className="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{cbSubmitting ? t('callback', 'submitting') : t('contact', 'callback_banner_btn')}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-4">
                {localize('कार्यशाला और स्टूडियो विवरण', 'Workshop & Studio Details')}
              </h2>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{t('contact', 'workshop_heading')}</h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
                    {address}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {localize('मेट्रो स्टेशन के पास · टिम्बर लोडिंग एवं पार्किंग सुविधा उपलब्ध', 'Close to Metro Station · Timber loading & customer parking available')}
                  </p>
                </div>
              </div>

              {cleanPhone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{t('contact', 'phone_heading')}</h3>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-sm sm:text-base font-medium text-stone-900 hover:text-amber-800 transition-colors block mt-1"
                    >
                      {phone}
                    </a>
                    <p className="text-[11px] text-stone-400">
                      {localize('सोमवार–शनिवार, सुबह 10:00 से रात 8:00 बजे तक उपलब्ध', 'Mon–Sat, 10:00 AM – 8:00 PM IST')}
                    </p>
                  </div>
                </div>
              )}

              {cleanWa && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{t('contact', 'whatsapp_heading')}</h3>
                    <a
                      href={`https://wa.me/${cleanWa}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-semibold text-emerald-700 hover:underline block mt-1"
                    >
                      +{cleanWa}
                    </a>
                    <p className="text-[11px] text-stone-400">
                      {localize('संदर्भ फोटो या स्केच सीधे भेजें', 'Send architectural sketches or mood boards')}
                    </p>
                  </div>
                </div>
              )}

              {email && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{t('contact', 'email_heading')}</h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs sm:text-sm text-stone-800 hover:text-amber-800 transition-colors block mt-1"
                    >
                      {email}
                    </a>
                    <p className="text-[11px] text-stone-400">
                      {localize('आर्किटेक्चरल ड्रॉइंग और ब्लूप्रिंट के लिए', 'For architectural drawings and RFP requests')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4 pt-2 border-t border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">{t('contact', 'hours_heading')}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed mt-1">{hours}</p>
                </div>
              </div>

            </div>

            {/* Delhi Area Coverage Notice */}
            <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200/80 text-xs text-stone-700 space-y-2">
              <h4 className="font-serif font-bold text-stone-900 text-sm">
                {t('contact', 'directions_title')}
              </h4>
              <p className="leading-relaxed">
                {t('contact', 'directions_desc')}
              </p>
            </div>

          </div>

          {/* Quick Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                {localize('संदेश या परामर्श अनुरोध भेजें', 'Send a Message or Consultation Request')}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mb-8">
                {localize('नीचे दिए गए विवरण भरें और हम 24 व्यावसायिक घंटों के भीतर आपसे संपर्क करेंगे।', 'Fill in your details below and we will respond within 24 business hours.')}
              </p>

              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-3">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                  {whatsappLink && (
                    <div className="pt-2">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{localize('व्हाट्सएप पर बात जारी रखें →', 'Continue on WhatsApp →')}</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder={t('quote', 'field_name_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_phone')}
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('quote', 'field_phone_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('quote', 'field_email_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_service')}
                    </label>
                    <select
                      value={formData.service_needed}
                      onChange={(e) => setFormData({ ...formData, service_needed: e.target.value })}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    >
                      <option value="कस्टम वार्डरोब (अलमारियां)">{localize('कस्टम वार्डरोब (अलमारियां)', 'Custom Wardrobes & Walk-Ins')}</option>
                      <option value="मॉड्यूलर किचन (आधुनिक रसोई)">{localize('मॉड्यूलर किचन (आधुनिक रसोई)', 'Luxury Modular Kitchens')}</option>
                      <option value="बेड व बेडरूम फर्नीचर">{localize('बेड व बेडरूम फर्नीचर', 'Solid Wood Beds & Bedroom Sets')}</option>
                      <option value="डाइनिंग टेबल और कुर्सियां">{localize('डाइनिंग टेबल और कुर्सियां', 'Dining Tables & Chairs')}</option>
                      <option value="सोफा और लिविंग रूम फर्नीचर">{localize('सोफा और लिविंग रूम फर्नीचर', 'Sofas & Living Room Furniture')}</option>
                      <option value="टीवी यूनिट व वॉल पैनल्स">{localize('टीवी यूनिट व वॉल पैनल्स', 'TV Units & Wall Panels')}</option>
                      <option value="मुख्य लकड़ी के दरवाजे और चौखट">{localize('मुख्य लकड़ी के दरवाजे और चौखट', 'Solid Teak Main Doors')}</option>
                      <option value="ऑफिस और कमर्शियल काष्ठकला">{localize('ऑफिस और कमर्शियल काष्ठकला', 'Office & Commercial Millwork')}</option>
                      <option value="कस्टम अलमारियां और बार कंसोल">{localize('कस्टम अलमारियां और बार कंसोल', 'Bar Consoles & Display Units')}</option>
                      <option value="फर्नीचर मरम्मत, पॉलिश और नवीनीकरण">{localize('फर्नीचर मरम्मत, पॉलिश और नवीनीकरण', 'Restoration & Re-Polishing')}</option>
                      <option value="पूरे फ्लैट/घर का संपूर्ण काष्ठकार्य">{localize('पूरे फ्लैट/घर का संपूर्ण काष्ठकार्य', 'Complete House Millwork')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    {t('quote', 'field_location')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location_area}
                    onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                    placeholder={t('quote', 'field_location_placeholder')}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    {t('quote', 'field_details')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder={t('quote', 'field_details_placeholder')}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                    {t('quote', 'field_contact_pref')}
                  </label>
                  <div className="flex items-center gap-6 text-xs text-stone-700">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        value="phone"
                        checked={formData.preferred_contact === 'phone'}
                        onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as any })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{t('quote', 'contact_phone')}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        value="whatsapp"
                        checked={formData.preferred_contact === 'whatsapp'}
                        onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as any })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{t('quote', 'contact_whatsapp')}</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="contact_pref"
                        value="email"
                        checked={formData.preferred_contact === 'email'}
                        onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as any })}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{t('quote', 'contact_email')}</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t('quote', 'submitting') : localize('संदेश भेजें', 'Send Inquiry')}</span>
                </button>

              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
