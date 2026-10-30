import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Hammer,
  TreePine,
  Ruler,
  ShieldAlert,
  Star
} from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Project } from '../types/index.js';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (project: Project) => void;
  onRequestCallback?: () => void;
}

export function HomePage({ onNavigate, onRequestCallback }: HomePageProps) {
  const { settings, services, projects, team, testimonials } = useData();
  const { language, t, localize, localizeDynamic } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedProjectModal, setSelectedProjectModal] = useState<Project | null>(null);

  const headline = language === 'en'
    ? 'Crafting Beautiful Spaces, One Piece at a Time.'
    : (settings.headline || 'हर कोने को सुंदर बनाएं, एक-एक शिल्परूप के साथ।');

  const heroDescription = language === 'en'
    ? 'Over 35 years of bespoke solid teak & rosewood joinery, architectural woodwork, luxury modular kitchens, and custom wardrobes handcrafted in Delhi NCR.'
    : (settings.hero_description || 'दिल्ली में 35+ वर्षों के अनुभव के साथ हस्तनिर्मित ठोस सागौन व शीशम का फर्नीचर, वास्तुशिल्प काष्ठकला, लक्ज़री मॉड्यूलर किचन और कस्टम वार्डरोब।');

  const businessPhone = settings.phone || '+91 98100 12345';
  const whatsapp = settings.whatsapp || '919810012345';
  const cleanPhone = businessPhone.replace(/[^\d+]/g, '');
  const cleanWa = whatsapp.replace(/[^\d]/g, '');

  const featuredServices = services.slice(0, 6);
  const featuredProjects = projects.filter((p) => p.is_featured).length > 0
    ? projects.filter((p) => p.is_featured).slice(0, 4)
    : projects.slice(0, 4);

  const faqs = language === 'en' ? [
    {
      q: 'What types of timber and materials do you use?',
      a: 'We exclusively work with kiln-dried seasoned hardwoods such as Burma Teak, Indian Rosewood (Sheesham), American Walnut, and calibrated waterproof BWP Marine Plywood. All fittings are genuine German Blum and Hettich soft-close systems.'
    },
    {
      q: 'Do you visit homes across Delhi NCR for on-site measurement?',
      a: 'Yes, absolutely. For custom wardrobes, modular kitchens, media units, and acoustic wall paneling, our senior master craftsmen conduct complimentary on-site laser measurements and space planning visits throughout Delhi, Gurugram, and Noida.'
    },
    {
      q: 'Can we provide reference photos from Pinterest, Instagram, or an Architect?',
      a: 'Over 70% of our bespoke orders originate from client sketches, Instagram reels, Pinterest mood boards, or architectural CAD drawings. You can easily upload reference images through our Get a Quote form.'
    },
    {
      q: 'How long does bespoke furniture take to be completed?',
      a: 'Individual pieces like dining tables, king-size beds, and credenzas take 2 to 3 weeks. Complete luxury modular kitchens or multi-room wardrobes typically take 3 to 4 weeks once the 3D drawings are finalized.'
    },
    {
      q: 'Can we inspect the raw timber at your Kirti Nagar workshop before polishing?',
      a: 'We strongly encourage it! We maintain a 100% open-workshop policy. You are invited to visit our workshop at any time to inspect jointing, timber grain, and carcass assembly prior to final Italian PU polishing.'
    }
  ] : [
    {
      q: 'आप किस प्रकार की लकड़ी और सामग्रियों का उपयोग करते हैं?',
      a: 'हम मुख्य रूप से भट्ठी में सुखाई गई (Kiln-dried) अनुभवी दृढ़ लकड़ियों जैसे बर्मा टीक (सागौन), भारतीय शीशम (रोज़वुड), अमेरिकन वॉलनट (अखरोट) और उच्च गुणवत्ता वाले वाटरप्रूफ बीब्लूपी मरीन प्लाईवुड (BWP Marine Ply) का उपयोग करते हैं।'
    },
    {
      q: 'क्या आप ऑन-साइट नाप लेने के लिए दिल्ली एनसीआर में घर आते हैं?',
      a: 'हाँ, बिल्कुल। कस्टम वार्डरोब, मॉड्यूलर किचन, टीवी यूनिट और वॉल पैनलिंग के लिए हमारे वरिष्ठ कारीगर दक्षिण दिल्ली, पश्चिम दिल्ली, गुरुग्राम, नोएडा आदि सभी क्षेत्रों में लेजर मेजरमेंट और स्पेस प्लानिंग के लिए स्वयं विजिट करते हैं।'
    },
    {
      q: 'क्या हम Pinterest, Instagram या आर्किटेक्ट की कोई फोटो दे सकते हैं?',
      a: 'बिल्कुल! हमारे 70% से अधिक ऑर्डर ग्राहकों के संदर्भ फोटो, स्केच या आर्किटेक्चरल ड्रॉइंग पर आधारित होते हैं। आप हमारे "कोटेशन प्राप्त करें" फॉर्म के जरिए आसानी से फोटो अपलोड कर सकते हैं।'
    },
    {
      q: 'कस्टम फर्नीचर तैयार होने में कितना समय लगता है?',
      a: 'डाइनिंग टेबल, बेड और क्रेडेंज़ा जैसे व्यक्तिगत फर्नीचर में 2 से 3 सप्ताह का समय लगता है। वहीं पूरी मॉड्यूलर रसोई या बड़ी अलमारियों के लिए 3D डिजाइन फाइनल होने के बाद 3 से 4 सप्ताह का समय लगता है।'
    },
    {
      q: 'क्या हम पॉलिश से पहले कीर्ति नगर कार्यशाला में अपनी लकड़ी देख सकते हैं?',
      a: 'हम इसका दृढ़ता से स्वागत करते हैं! हमारी खुली कार्यशाला नीति है। आप फाइनल पॉलिश या पीयू कोटिंग होने से पहले किसी भी समय कार्यशाला आकर लकड़ी के तख्ते, जोड़ और फिटिंग की जांच कर सकते हैं।'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center bg-stone-950 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg"
            alt={localize("शर्मा वुडक्राफ्ट लक्ज़री कस्टम फर्नीचर", "Sharma Woodcraft Luxury Custom Furniture")}
            className="w-full h-full object-cover object-center filter brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
          <div className="max-w-2xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('home', 'hero_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              {headline}
            </h1>

            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-xl font-normal">
              {heroDescription}
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('quote')}
                className="px-6 py-3.5 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
              >
                <span>{t('home', 'get_free_quote')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {onRequestCallback && (
                <button
                  onClick={onRequestCallback}
                  className="px-5 py-3.5 text-sm font-semibold text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>{t('nav', 'request_callback')}</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('projects')}
                className="px-6 py-3.5 text-sm font-medium text-stone-200 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                {t('home', 'explore_work')}
              </button>

              {cleanWa && (
                <a
                  href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                    language === 'en'
                      ? 'Hello Sharma Woodcraft! I am interested in custom furniture for my home in Delhi.'
                      : 'नमस्ते शर्मा वुडक्राफ्ट! मैं दिल्ली में अपने घर के लिए कस्टम फर्नीचर के बारे में पूछताछ करना चाहता हूँ।'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3.5 text-sm font-medium text-emerald-300 hover:text-emerald-200 bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-700/50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">{t('home', 'chat_on_whatsapp')}</span>
                </a>
              )}
            </div>

            {/* Key Trust Factors */}
            <div className="pt-8 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{localize('100% असली ठोस लकड़ी', '100% Solid Seasoned Wood')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{localize('35+ वर्षों की शिल्पकला', '35+ Years Experience')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{localize('घर पर निःशुल्क विजिट', 'Complimentary Site Visit')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{localize('सीधे वर्कशॉप मूल्य', 'Direct Workshop Pricing')}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED SERVICES STRIP */}
      <section className="py-20 bg-stone-100/70 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-sans block mb-1">
                {t('home', 'services_tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t('home', 'services_title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors group cursor-pointer"
            >
              <span>{t('home', 'view_all_services')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service) => {
              const displayTitle = localizeDynamic(service.title);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
                >
                  <div className="h-56 relative overflow-hidden bg-stone-100">
                    <img
                      src={service.image_url}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
                    {service.starting_price && (
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-stone-950/90 text-amber-400 rounded-md text-xs font-semibold tabular-nums backdrop-blur-sm">
                        {t('home', 'starting_from')} {service.starting_price}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
                        {displayTitle}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                        {service.description}
                      </p>
                    </div>
                    <button
                      onClick={() => onNavigate('quote')}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{localize(`${displayTitle} के लिए कोटेशन मांगें`, `Request Quote for ${displayTitle}`)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FEATURED COMPLETED PROJECTS */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-sans block mb-1">
                {t('home', 'projects_tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t('home', 'projects_title')}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('projects')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors group cursor-pointer"
            >
              <span>{t('home', 'view_all_projects')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredProjects.map((project) => {
              const displayTitle = localizeDynamic(project.title);
              const displayCategory = localizeDynamic(project.category);
              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectModal(project)}
                  className="group cursor-pointer bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="h-72 sm:h-80 relative overflow-hidden bg-stone-200">
                    <img
                      src={project.images[0] || '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg'}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/80 backdrop-blur-sm text-stone-100 rounded-md text-xs font-medium">
                      {displayCategory}
                    </div>
                    {project.completion_date && (
                      <div className="absolute top-4 right-4 text-xs text-stone-300 bg-stone-900/60 backdrop-blur-sm px-2.5 py-1 rounded">
                        {project.completion_date}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-serif font-bold group-hover:text-amber-300 transition-colors">
                        {displayTitle}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-amber-900 font-semibold pt-2 border-t border-stone-200">
                      <span>{project.images.length} {t('home', 'photos_count')}</span>
                      <span className="flex items-center gap-1 group-hover:underline">
                        {localize('प्रोजेक्ट विवरण देखें →', 'View Project Details →')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* WHY CHOOSE SHARMA WOODCRAFT */}
      <section className="py-20 bg-stone-950 text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block mb-2">
              {t('home', 'why_tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              {t('home', 'why_title')}
            </h2>
            <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
              {localize(
                'सस्ते पार्टिकल बोर्ड के रेडीमेड शोरूम फर्नीचर के विपरीत, शर्मा वुडक्राफ्ट आपके घर के सटीक नाप और दिल्ली के मौसम के अनुसार असली ठोस लकड़ी से टिकाऊ फर्नीचर तैयार करता है।',
                'Unlike mass-manufactured flatpack furniture, Sharma Woodcraft builds enduring heirloom woodwork proportioned to your specific room and acclimated to Delhi weather.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TreePine className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">{t('home', 'why_card1_title')}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {t('home', 'why_card1_desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Hammer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">{t('home', 'why_card2_title')}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {t('home', 'why_card2_desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">{t('home', 'why_card3_title')}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {t('home', 'why_card3_desc')}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-white">{t('home', 'why_card4_title')}</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {t('home', 'why_card4_desc')}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-stone-50 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                {t('home', 'testimonials_tag')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t('home', 'testimonials_title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonialItem) => (
                <div
                  key={testimonialItem.id}
                  className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 mb-4">
                      {[...Array(testimonialItem.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-stone-700 italic leading-relaxed mb-6 font-serif">
                      "{testimonialItem.content}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-sm font-bold text-stone-900">{testimonialItem.client_name}</p>
                    <p className="text-xs text-stone-500">{testimonialItem.location_or_project}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* TEAM PREVIEW SECTION */}
      {team.length > 0 && (
        <section className="py-20 bg-stone-100/50 border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                  {t('home', 'team_tag')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                  {t('home', 'team_title')}
                </h2>
              </div>
              <button
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 hover:text-amber-700 transition-colors group cursor-pointer"
              >
                <span>{localize('हमारी कहानी पढ़ें', 'Read Our Story')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl overflow-hidden border border-stone-200/80 shadow-sm"
                >
                  <div className="h-64 bg-stone-200 overflow-hidden">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-serif font-bold text-stone-900">{member.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-2">
                      {member.role}
                    </p>
                    {member.short_bio && (
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {member.short_bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
              {t('home', 'faq_tag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {t('home', 'faq_title')}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-stone-200 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 bg-stone-50 hover:bg-stone-100/70 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-semibold text-stone-900">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 py-4 bg-white text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* FINAL QUOTATION CALL-TO-ACTION */}
      <section className="py-20 bg-stone-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            {localize('अपने सपनों का प्रोजेक्ट शुरू करें', 'Start Your Dream Woodwork Project')}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight">
            {t('home', 'cta_title')}
          </h2>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t('home', 'cta_desc')}
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('quote')}
              className="px-8 py-4 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xl hover:shadow-2xl transition-all cursor-pointer"
            >
              {t('home', 'cta_btn_quote')}
            </button>
            {onRequestCallback && (
              <button
                onClick={onRequestCallback}
                className="px-6 py-4 text-sm font-medium text-amber-300 hover:text-white bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{t('home', 'cta_btn_callback')}</span>
              </button>
            )}
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="px-6 py-4 text-sm font-medium text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{t('nav', 'call_us')}: {businessPhone}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* PROJECT DETAIL MODAL */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-80 sm:h-96 bg-stone-950">
              <img
                src={selectedProjectModal.images[0]}
                alt={localizeDynamic(selectedProjectModal.title)}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setSelectedProjectModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-b-xl text-white">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  {localizeDynamic(selectedProjectModal.category)}
                </span>
                <h3 className="text-2xl font-serif font-bold text-white mt-1">
                  {localizeDynamic(selectedProjectModal.title)}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 font-sans">
                  {localize('प्रोजेक्ट विवरण और विनिर्देश', 'Project Specifications & Joinery')}
                </h4>
                <p className="text-sm text-stone-700 leading-relaxed">
                  {selectedProjectModal.description}
                </p>
              </div>

              {selectedProjectModal.images.length > 1 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 font-sans">
                    {localize(`अन्य तस्वीरें (${selectedProjectModal.images.length})`, `Additional Photos (${selectedProjectModal.images.length})`)}
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedProjectModal.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Photo ${i + 1}`}
                        className="h-24 w-full object-cover rounded-lg border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-stone-500">
                  {selectedProjectModal.completion_date && (
                    <span>{localize('पूर्णता तिथि:', 'Completed:')} {selectedProjectModal.completion_date}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedProjectModal(null);
                    onNavigate('quote');
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer"
                >
                  {localize('ऐसा ही कस्टम फर्नीचर बनवाएं', 'Request Similar Custom Furniture')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
