import { ArrowRight, Hammer, Shield, Sparkles, Award } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  const { team } = useData();
  const { language, t, localize } = useLanguage();

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 font-sans block">
              {t('about', 'tag')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              {t('about', 'title')}
            </h1>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {t('about', 'desc')}
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {localize(
                'जहाँ आज का रेडीमेड बाज़ार पार्टिकल बोर्ड और प्लास्टिक लैमिनेट्स की तरफ मुड़ गया है, हम परिपक्व ठोस लकड़ी की भट्ठी-सुखाई (Kiln Drying), सही जोड़-तकनीक (Mortise & Tenon), हाथ की तराशी और पर्यावरण-अनुकूल पॉलिश की पुरानी अनुशासनप्रिय परंपरा को गर्व से बनाए हुए हैं।',
                'While modern mass retail has shifted toward flimsy particle boards and synthetic laminates, we proudly uphold time-tested traditions: kiln-drying, hand-cut mortise & tenon joints, manual hand-planing, and non-toxic Italian finishes.'
              )}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigate('quote')}
                className="px-6 py-3 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {localize('अपने प्रोजेक्ट पर चर्चा करें', 'Discuss Your Project')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="px-6 py-3 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-200/80 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer"
              >
                {localize('हमारी दिल्ली कार्यशाला पधारें', 'Visit Our Delhi Workshop')}
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-stone-900 aspect-4/3">
            <img
              src="/src/assets/images/artisan_woodworking_workshop_1793256795276.jpg"
              alt={localize("शर्मा वुडक्राफ्ट कारीगर कार्यशाला", "Sharma Woodcraft Artisan Workshop")}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-xs font-medium text-amber-300 uppercase tracking-wider">
                {localize('विशुद्ध हस्तशिल्प', 'Authentic Handcraft')}
              </p>
              <p className="text-sm font-serif">
                {localize(
                  'हमारी दिल्ली कार्यशाला में परिपक्व लकड़ी के तख्तों की हस्तनिर्मित रंदा-घिसाई',
                  'Hand-planing seasoned timber slabs inside our Kirti Nagar workshop'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Our Craft */}
        <div className="mb-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
              {localize('गुणवत्ता के मूल सिद्धांत', 'Foundational Principles')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {localize('प्रत्येक निर्माण के पीछे हमारे चार स्तंभ', 'The Four Pillars Behind Every Creation')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Hammer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {localize('1. संरचनात्मक मजबूती', '1. Structural Integrity')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {localize(
                  'हमारा मानना है कि फर्नीचर की असली मजबूती केवल कील या गोंद से नहीं, बल्कि सही जोड़ों से आती है। प्रत्येक भार-वाहक बिंदु को वर्षों के पारिवारिक उपयोग को ध्यान में रखकर तैयार किया जाता है।',
                  'True endurance comes from wood-to-wood joinery, not screws or surface adhesives. Every load-bearing joint is engineered for multi-generational domestic life.'
                )}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {localize('2. नमी व दीमक सुरक्षा', '2. Moisture & Pest Defense')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {localize(
                  'दिल्ली का मौसम अत्यधिक शुष्क गर्मियों और आर्द्र मानसून के बीच बदलता है। हम लकड़ी को सही तापमान पर सुखाते हैं और अलमारियों के पीछे विशेष एंटी-टर्माइट सील लगाते हैं।',
                  'Delhi experiences intense dry heat and humid monsoons. We kiln-dry timber to 8-12% moisture equilibrium and apply biological anti-termite seals behind carcasses.'
                )}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {localize('3. प्राकृतिक काष्ठ सौंदर्य', '3. Natural Grain Beauty')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {localize(
                  'हम लकड़ी के प्राकृतिक रेशों और गांठों को कृत्रिम रंगों से नहीं छुपाते, बल्कि हाथ से की जाने वाली तेल व वैक्स फिनिशिंग से उसके असली चरित्र को उभारते हैं।',
                  'We celebrate the distinctive grain patterns and warm hues of Burma teak and Indian rosewood using hand-rubbed hardwax oils and breathable matte coatings.'
                )}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-stone-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                {localize('4. सटीक कस्टमाइजेशन', '4. Exact Proportions')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {localize(
                  'प्रत्येक घर अलग होता है। हम कभी मानक आकारों का थोक उत्पादन नहीं करते; हर टुकड़ा आपके कमरे के मिलीमीटर नाप और व्यक्तिगत जीवनशैली के अनुरूप बनता है।',
                  'Every residence has distinct proportions. We never mass-produce static sizes; each installation is tailored to your ceiling height and personal storage rhythm.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* The Team / Craftspeople */}
        {team.length > 0 && (
          <div className="mb-20">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 block mb-1">
                {t('about', 'team_heading')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t('about', 'team_sub')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm flex flex-col"
                >
                  <div className="h-72 bg-stone-200 overflow-hidden">
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-stone-900">{member.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-3">
                        {member.role}
                      </p>
                      {member.short_bio && (
                        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                          {member.short_bio}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
