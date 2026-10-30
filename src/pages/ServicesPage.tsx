import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface ServicesPageProps {
  onNavigate: (page: string, prefilledService?: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const { services } = useData();
  const { language, t, localize, localizeDynamic } = useLanguage();

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 font-sans block mb-2">
            {t('services', 'tag')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight mb-4">
            {t('services', 'title')}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t('services', 'desc')}
          </p>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const displayTitle = localizeDynamic(service.title);
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
              >
                <div className="h-64 sm:h-72 relative overflow-hidden bg-stone-100">
                  <img
                    src={service.image_url}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                  
                  {service.starting_price && (
                    <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-stone-950/90 text-amber-400 rounded-lg text-xs font-semibold tabular-nums backdrop-blur-sm border border-stone-800">
                      {t('home', 'starting_from')} {service.starting_price}
                    </div>
                  )}
                  
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-[11px] font-mono tracking-widest text-stone-300 uppercase block mb-1">
                      {localize('सेवा', 'Service')} 0{index + 1}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold group-hover:text-amber-300 transition-colors">
                      {displayTitle}
                    </h2>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{localize('दिल्ली एनसीआर में घर पर निःशुल्क लेजर नाप और परामर्श', 'Complimentary site laser measurement & consultation in Delhi NCR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{localize('पसंदीदा लकड़ी का चयन: सागौन (Teak), शीशम, अखरोट (Walnut)', 'Timber Selection: Burma Teak, Indian Rosewood, American Walnut')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>{localize('जर्मन ब्लम / हेतित सॉफ्ट-क्लोज़ प्रीमियम फिटिंग्स', 'German Blum & Hettich soft-close architectural fittings')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('quote', service.title)}
                    className="w-full py-3 px-4 text-xs font-semibold tracking-wide text-stone-950 bg-stone-100 hover:bg-amber-400 hover:text-stone-950 border border-stone-300 hover:border-amber-400 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{localize(`${displayTitle} के लिए निःशुल्क कोटेशन मांगें`, `Request Free Quote for ${displayTitle}`)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Design Assistance Banner */}
        <div className="mt-16 p-8 rounded-2xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-stone-800">
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              {t('services', 'bottom_banner_title')}
            </h3>
            <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
              {t('services', 'bottom_banner_desc')}
            </p>
          </div>
          <button
            onClick={() => onNavigate('quote')}
            className="px-6 py-3 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl whitespace-nowrap transition-colors cursor-pointer"
          >
            {t('services', 'bottom_banner_btn')}
          </button>
        </div>

      </div>
    </div>
  );
}
