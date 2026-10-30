import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, MessageSquare, PhoneCall, Sparkles, X } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface QuotePageProps {
  initialService?: string;
  onNavigate: (page: string) => void;
  onRequestCallback?: () => void;
}

export function QuotePage({ initialService, onNavigate }: QuotePageProps) {
  const { services } = useData();
  const { language, t, localize, localizeDynamic } = useLanguage();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState(initialService || (language === 'en' ? 'Custom Wardrobes & Walk-Ins' : 'कस्टम अलमारी व वार्डरोब'));
  const [dimensions, setDimensions] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [locationArea, setLocationArea] = useState('');
  const [details, setDetails] = useState('');
  const [preferredContact, setPreferredContact] = useState<'phone' | 'whatsapp' | 'email'>('phone');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [inquiryId, setInquiryId] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Callback Form State
  const [showCallbackBox, setShowCallbackBox] = useState(false);
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbTime, setCbTime] = useState(language === 'en' ? 'Immediately (Within 5-10 Minutes)' : 'किसी भी समय (यथाशीघ्र)');
  const [cbSubmitting, setCbSubmitting] = useState(false);
  const [cbSuccess, setCbSuccess] = useState<string | null>(null);
  const [cbError, setCbError] = useState<string | null>(null);
  const [cbWaLink, setCbWaLink] = useState<string | null>(null);

  const validatePhone = (num: string) => {
    const trimmed = num.trim();
    if (!trimmed) return language === 'en' ? 'Phone number is required.' : 'फोन नंबर दर्ज करना अनिवार्य है।';
    if (!/^[+]?[\d\s\-().]{10,20}$/.test(trimmed)) {
      return language === 'en' ? 'Please enter a valid phone number.' : 'कृपया एक मान्य फोन नंबर दर्ज करें।';
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10) return language === 'en' ? 'Phone number must have at least 10 digits.' : 'फोन नंबर में कम से कम 10 अंक होने चाहिए।';
    if (digits.length > 15) return language === 'en' ? 'Phone number cannot exceed 15 digits.' : 'फोन नंबर 15 अंकों से अधिक नहीं हो सकता।';
    if (/^(\d)\1{9,}$/.test(digits)) return language === 'en' ? 'Please provide a valid active phone number.' : 'कृपया वास्तविक फोन नंबर दर्ज करें।';
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
          service_needed: `Quote Page Callback (${serviceNeeded})`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (language === 'en' ? 'Failed to schedule callback.' : 'कॉल बैक अनुरोध दर्ज नहीं हो सका।'));

      setCbSuccess(data.message || (language === 'en' ? 'Callback scheduled! We will contact you shortly.' : 'कॉल बैक अनुरोध दर्ज हो गया! हमारे मुख्य कारीगर जल्द ही आपसे संपर्क करेंगे।'));
      setCbWaLink(data.whatsapp_link || null);
      setCbName('');
      setCbPhone('');
    } catch (err: any) {
      setCbError(err.message || (language === 'en' ? 'Unable to schedule callback.' : 'कॉल बैक अनुरोध दर्ज करने में असमर्थ। कृपया पुनः प्रयास करें।'));
    } finally {
      setCbSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage(language === 'en' ? 'Please upload a valid image file (JPG, PNG, or WebP).' : 'कृपया मान्य फोटो फ़ाइल (JPG, PNG या WebP) अपलोड करें।');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(language === 'en' ? 'Image file size cannot exceed 10MB.' : 'फोटो का आकार 10MB से कम होना चाहिए।');
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter your full name.' : 'कृपया अपना पूरा नाम दर्ज करें।');
      setIsSubmitting(false);
      return;
    }

    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(language === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें ताकि हमारे कारीगर आपसे संपर्क कर सकें।');
      setIsSubmitting(false);
      return;
    }

    if (!locationArea.trim()) {
      setErrorMessage(language === 'en' ? 'Please specify your location or area in Delhi NCR.' : 'कृपया दिल्ली एनसीआर में अपना क्षेत्र या इलाका दर्ज करें।');
      setIsSubmitting(false);
      return;
    }

    if (!details.trim()) {
      setErrorMessage(language === 'en' ? 'Please provide project specifications or description.' : 'कृपया अपनी आवश्यकता या फर्नीचर का विवरण दर्ज करें।');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('customer_name', customerName.trim());
      formData.append('phone', phone.trim());
      if (email.trim()) formData.append('email', email.trim());
      formData.append('service_needed', serviceNeeded);
      if (dimensions.trim()) formData.append('dimensions', dimensions.trim());
      if (budgetRange.trim()) formData.append('budget_range', budgetRange);
      formData.append('location_area', locationArea.trim());
      formData.append('details', details.trim());
      formData.append('preferred_contact', preferredContact);

      if (selectedFile) {
        formData.append('reference_image', selectedFile);
      }

      const res = await fetch('/api/public/inquiries', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (language === 'en' ? 'Failed to submit quote request.' : 'कोटेशन अनुरोध भेजने में विफल।'));
      }

      setSubmissionSuccess(true);
      setInquiryId(data.inquiry_id);
      setWhatsappLink(data.whatsapp_link || null);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'en' ? 'Database connection error. Please try again or call us.' : 'डेटाबेस से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें या हमें सीधे फोन करें।'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmissionSuccess(false);
    setInquiryId(null);
    setWhatsappLink(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setDimensions('');
    setBudgetRange('');
    setLocationArea('');
    setDetails('');
    removeFile();
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-amber-900 text-xs font-semibold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>{localize('प्रत्यक्ष कार्यशाला कोटेशन', 'Direct Workshop Quotation')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight mb-3">
            {t('quote', 'title')}
          </h1>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
            {t('quote', 'desc')}
          </p>
        </div>

        {/* Success View */}
        {submissionSuccess ? (
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t('quote', 'success_title')}
              </h2>
              <p className="text-xs font-mono uppercase tracking-widest text-stone-500">
                {localize('पूछताछ संदर्भ:', 'Inquiry Reference:')} #{inquiryId?.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
              {localize(
                'आपकी पूछताछ हमारी कार्यशाला के डेटाबेस में सुरक्षित दर्ज हो गई है। मुख्य कारीगर ओमप्रकाश शर्मा आपकी आवश्यकताओं की समीक्षा करेंगे और 24 घंटे के भीतर आपसे संपर्क करेंगे।',
                'Your inquiry has been logged securely in our workshop database. Senior master craftsman Omprakash Sharma will review your requirements and reach out within 24 hours.'
              )}
            </p>

            {whatsappLink && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 max-w-md mx-auto space-y-3">
                <p className="text-xs font-medium text-emerald-900">
                  {localize('त्वरित उत्तर चाहते हैं? व्हाट्सएप पर सीधे हमारे कारीगर से जुड़ें:', 'Prefer faster turnaround? Connect on WhatsApp directly with our artisan:')}
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{localize('व्हाट्सएप पर कोटेशन विवरण भेजें', 'Send Details on WhatsApp')}</span>
                </a>
              </div>
            )}

            <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={resetForm}
                className="px-6 py-2.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
              >
                {t('quote', 'success_btn')}
              </button>
              <button
                onClick={() => onNavigate('projects')}
                className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
              >
                {localize('पूर्ण प्रोजेक्ट्स देखें →', 'View Completed Projects →')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Callback Option Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall className="w-5 h-5 text-amber-800" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900">
                      {localize('समय की कमी है या अभी सटीक नाप नहीं है?', 'Short on time or don\'t have exact measurements yet?')}
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {localize(
                        '5 मिनट के त्वरित फोन कॉल बैक का अनुरोध करें। केवल अपना नाम और फोन नंबर दर्ज करें, हमारे कारीगर आपको कॉल करेंगे।',
                        'Request a quick 5-minute callback. Simply share your name and number, and our master craftsman will dial you.'
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCallbackBox(!showCallbackBox)}
                  className="px-4 py-2 text-xs font-semibold text-stone-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl shadow-xs transition-colors shrink-0 self-start sm:self-center cursor-pointer"
                >
                  {showCallbackBox 
                    ? localize('कॉल बैक फॉर्म छिपाएं', 'Hide Callback Form')
                    : localize('कॉल बैक का अनुरोध करें', 'Request Quick Callback')}
                </button>
              </div>

              {/* Collapsible Callback Form */}
              {showCallbackBox && (
                <div className="mt-5 pt-5 border-t border-amber-200/80 animate-in fade-in duration-200">
                  {cbSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{cbSuccess}</span>
                      </div>
                      {cbWaLink && (
                        <a
                          href={cbWaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-800 font-bold hover:underline"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{localize('व्हाट्सएप पर भी बात करें →', 'Chat on WhatsApp as well →')}</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleCallbackSubmit} className="space-y-4">
                      {cbError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{cbError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                            {t('callback', 'name')}
                          </label>
                          <input
                            type="text"
                            required
                            value={cbName}
                            onChange={(e) => setCbName(e.target.value)}
                            placeholder={localize('उदा. राहुल शर्मा', 'e.g. Rahul Sharma')}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                            {t('callback', 'phone')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={cbPhone}
                            onChange={(e) => setCbPhone(e.target.value)}
                            placeholder={localize('उदा. +91 98100 12345', 'e.g. +91 98100 12345')}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                            {t('callback', 'pref_time')}
                          </label>
                          <select
                            value={cbTime}
                            onChange={(e) => setCbTime(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value={t('callback', 'time_asap')}>{t('callback', 'time_asap')}</option>
                            <option value={t('callback', 'time_morning')}>{t('callback', 'time_morning')}</option>
                            <option value={t('callback', 'time_afternoon')}>{t('callback', 'time_afternoon')}</option>
                            <option value={t('callback', 'time_evening')}>{t('callback', 'time_evening')}</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-1">
                        <button
                          type="submit"
                          disabled={cbSubmitting}
                          className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>{cbSubmitting ? t('callback', 'submitting') : t('contact', 'callback_banner_btn')}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Comprehensive Quotation Form */}
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-md">
            
            {errorMessage && (
              <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Customer Contact Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 font-sans">
                  {localize('१. आपकी संपर्क जानकारी', '1. Contact Information')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('quote', 'field_phone_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('quote', 'field_email_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_location')}
                    </label>
                    <input
                      type="text"
                      required
                      value={locationArea}
                      onChange={(e) => setLocationArea(e.target.value)}
                      placeholder={t('quote', 'field_location_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Furniture Scope & Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 font-sans">
                  {localize('२. फर्नीचर व प्रोजेक्ट की आवश्यकता', '2. Furniture & Project Requirements')}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_service')}
                    </label>
                    <select
                      value={serviceNeeded}
                      onChange={(e) => setServiceNeeded(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    >
                      {services && services.length > 0 ? (
                        services.map((s) => (
                          <option key={s.id} value={s.title}>{localizeDynamic(s.title)}</option>
                        ))
                      ) : (
                        <>
                          <option value="कस्टम अलमारी व वार्डरोब">{localize('कस्टम अलमारी व वार्डरोब', 'Custom Wardrobes & Walk-Ins')}</option>
                          <option value="मॉड्यूलर किचन">{localize('मॉड्यूलर किचन', 'Modular Kitchen')}</option>
                          <option value="डबल बेड व बेडरूम फर्नीचर">{localize('डबल बेड व बेडरूम फर्नीचर', 'Solid Wood Beds & Bedroom Sets')}</option>
                          <option value="डाइनिंग टेबल व कुर्सियां">{localize('डाइनिंग टेबल व कुर्सियां', 'Dining Tables & Chairs')}</option>
                          <option value="सोफा व लिविंग रूम फर्नीचर">{localize('सोफा व लिविंग रूम फर्नीचर', 'Sofas & Living Room Sets')}</option>
                          <option value="टीवी यूनिट व वॉल पैनलिंग">{localize('टीवी यूनिट व वॉल पैनलिंग', 'TV Units & Wall Panels')}</option>
                          <option value="लकड़ी के मुख्य दरवाजे">{localize('लकड़ी के मुख्य दरवाजे', 'Solid Teak Main Doors')}</option>
                          <option value="ऑफिस व कमर्शियल फर्नीचर">{localize('ऑफिस व कमर्शियल फर्नीचर', 'Office & Commercial Furniture')}</option>
                          <option value="कस्टम स्टोरेज व बार कैबिनेट">{localize('कस्टम स्टोरेज व बार कैबिनेट', 'Bar Cabinets & Credenzas')}</option>
                          <option value="फर्नीचर मरम्मत व जीर्णोद्धार">{localize('फर्नीचर मरम्मत व जीर्णोद्धार', 'Restoration & Polishing')}</option>
                        </>
                      )}
                      <option value="संपूर्ण घर का वुडवर्क (फुल होम इंटीरियर)">{localize('संपूर्ण घर का वुडवर्क (फुल होम इंटीरियर)', 'Complete House Millwork & Interior')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_dimensions')}
                    </label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder={t('quote', 'field_dimensions_placeholder')}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      {t('quote', 'field_budget')}
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    >
                      <option value="">{localize('बजट चुनें...', 'Select budget range...')}</option>
                      <option value="₹50,000 से कम">{localize('₹50,000 से कम', 'Under ₹50,000')}</option>
                      <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                      <option value="₹1,00,000 - ₹2,50,000">₹1,00,000 - ₹2,50,000</option>
                      <option value="₹2,50,000 - ₹5,00,000">₹2,50,000 - ₹5,00,000</option>
                      <option value="₹5,00,000+ (संपूर्ण घर का वुडवर्क)">{localize('₹5,00,000+ (संपूर्ण घर का वुडवर्क)', '₹5,00,000+ (Full Home Millwork)')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    {t('quote', 'field_details')}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={t('quote', 'field_details_placeholder')}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Reference Image Upload */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 font-sans">
                  {localize('३. डिज़ाइन रेफरेंस या कमरे की फोटो (वैकल्पिक)', '3. Design Reference or Room Photo (Optional)')}
                </h3>

                {filePreview ? (
                  <div className="relative p-4 bg-stone-100 rounded-2xl border border-stone-200 flex items-center gap-4">
                    <img
                      src={filePreview}
                      alt="Uploaded reference preview"
                      className="h-20 w-20 object-cover rounded-xl border border-stone-300"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-stone-800 line-clamp-1">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {selectedFile ? (selectedFile.size / (1024 * 1024)).toFixed(2) : 0} MB · {localize('अपलोड के लिए तैयार', 'Ready to upload')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-stone-200"
                      title={localize('फोटो हटाएं', 'Remove photo')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 hover:border-amber-500/80 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-colors group">
                    <UploadCloud className="w-8 h-8 text-stone-400 group-hover:text-amber-600 transition-colors mb-2" />
                    <span className="text-xs sm:text-sm font-medium text-stone-800 text-center">
                      {localize('डिज़ाइन फोटो, ब्लू-प्रिंट या स्केच अपलोड करने के लिए क्लिक करें', 'Click to upload design photo, blueprint, or sketch')}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">
                      {t('quote', 'image_help')}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Preferred Contact Method */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  {t('quote', 'field_contact_pref')}
                </label>
                <div className="flex flex-wrap items-center gap-6 text-xs text-stone-700">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact_pref"
                      value="phone"
                      checked={preferredContact === 'phone'}
                      onChange={() => setPreferredContact('phone')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('quote', 'contact_phone')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact_pref"
                      value="whatsapp"
                      checked={preferredContact === 'whatsapp'}
                      onChange={() => setPreferredContact('whatsapp')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('quote', 'contact_whatsapp')}</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact_pref"
                      value="email"
                      checked={preferredContact === 'email'}
                      onChange={() => setPreferredContact('email')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{t('quote', 'contact_email')}</span>
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 text-sm font-bold tracking-wide text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>{t('quote', 'submitting')}</span>
                ) : (
                  <>
                    <span>{t('quote', 'submit_btn')}</span>
                    <Sparkles className="w-4 h-4 text-stone-950" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-stone-400">
                {t('callback', 'privacy_note')}
              </p>

            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
