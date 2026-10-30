import { useState } from 'react';
import { ArrowRight, Image as ImageIcon, Calendar, X } from 'lucide-react';
import { useData } from '../context/DataContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Project } from '../types/index.js';

interface ProjectsPageProps {
  onNavigate: (page: string, prefillDetails?: string) => void;
}

export function ProjectsPage({ onNavigate }: ProjectsPageProps) {
  const { projects } = useData();
  const { language, t, localize, localizeDynamic } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const categories = [
    { id: 'all', label: language === 'en' ? 'All Projects' : 'सभी प्रोजेक्ट्स' },
    { id: 'living', label: language === 'en' ? 'Living Room' : 'लिविंग रूम' },
    { id: 'bedroom', label: language === 'en' ? 'Bedroom' : 'बेडरूम' },
    { id: 'kitchen', label: language === 'en' ? 'Kitchen' : 'रसोई' },
    { id: 'office', label: language === 'en' ? 'Office' : 'ऑफिस' },
    { id: 'custom', label: language === 'en' ? 'Custom Furniture' : 'कस्टम फर्नीचर' },
    { id: 'doors', label: language === 'en' ? 'Doors & Paneling' : 'दरवाजे व पैनलिंग' },
  ];

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter((p) => {
        const cat = (p.category || '').toLowerCase();
        if (selectedCategory === 'living' && (cat.includes('living') || cat.includes('लिविंग'))) return true;
        if (selectedCategory === 'bedroom' && (cat.includes('bed') || cat.includes('बेडरूम'))) return true;
        if (selectedCategory === 'kitchen' && (cat.includes('kitchen') || cat.includes('रसोई'))) return true;
        if (selectedCategory === 'office' && (cat.includes('office') || cat.includes('ऑफिस'))) return true;
        if (selectedCategory === 'custom' && (cat.includes('custom') || cat.includes('कस्टम'))) return true;
        if (selectedCategory === 'doors' && (cat.includes('door') || cat.includes('दरवाजे') || cat.includes('panel'))) return true;
        return false;
      });

  const openProjectModal = (p: Project) => {
    setActiveModalProject(p);
    setActiveImageIndex(0);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-800 font-sans block mb-2">
            {t('projects', 'tag')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight mb-4">
            {t('projects', 'title')}
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            {t('projects', 'desc')}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-12 p-1.5 bg-stone-200/70 rounded-xl w-fit">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-stone-200">
            <ImageIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-stone-800 mb-1">
              {localize('इस श्रेणी में अभी कोई प्रोजेक्ट नहीं है', 'No projects found in this category')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mb-4">
              {localize('कृपया अन्य श्रेणी चुनें या हमारे पूरे कार्य की झलक देखें।', 'Please select another category or view all completed projects.')}
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
            >
              {localize('सभी पूर्ण प्रोजेक्ट्स देखें →', 'View all completed projects →')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => {
              const displayTitle = localizeDynamic(project.title);
              const displayCategory = localizeDynamic(project.category);
              return (
                <div
                  key={project.id}
                  onClick={() => openProjectModal(project)}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="h-64 sm:h-72 relative overflow-hidden bg-stone-200">
                    <img
                      src={project.images[0] || '/src/assets/images/hero_walnut_furniture_living_1793256792332.jpg'}
                      alt={displayTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4 px-2.5 py-1 bg-stone-950/80 backdrop-blur-sm text-amber-300 rounded text-[11px] font-semibold tracking-wide">
                      {displayCategory}
                    </div>

                    {project.completion_date && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-stone-950/70 backdrop-blur-sm text-stone-300 rounded text-[11px]">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        <span>{project.completion_date}</span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-lg font-serif font-bold group-hover:text-amber-300 transition-colors line-clamp-1">
                        {displayTitle}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-amber-900 font-semibold pt-3 border-t border-stone-100">
                      <span className="text-stone-500 font-normal">
                        {project.images.length} {project.images.length === 1 ? localize('तस्वीर', 'Photo') : localize('तस्वीरें', 'Photos')}
                      </span>
                      <span className="flex items-center gap-1 group-hover:underline">
                        {t('projects', 'view_details')} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Project Detail Modal */}
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
              
              {/* Modal Main Image */}
              <div className="relative h-80 sm:h-[420px] bg-stone-950">
                <img
                  src={activeModalProject.images[activeImageIndex] || activeModalProject.images[0]}
                  alt={localizeDynamic(activeModalProject.title)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                <button
                  onClick={() => setActiveModalProject(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-950/80 hover:bg-stone-950 text-white flex items-center justify-center shadow-lg cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-b-xl text-white">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
                    <span>{localizeDynamic(activeModalProject.category)}</span>
                    {activeModalProject.completion_date && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{localize('पूर्णता:', 'Completed:')} {activeModalProject.completion_date}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {localizeDynamic(activeModalProject.title)}
                  </h2>
                </div>
              </div>

              {/* Thumbnails if multiple images exist */}
              {activeModalProject.images.length > 1 && (
                <div className="p-4 bg-stone-100 flex items-center gap-3 overflow-x-auto border-b border-stone-200">
                  {activeModalProject.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`h-16 w-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        activeImageIndex === i
                          ? 'border-amber-600 ring-2 ring-amber-400/50 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Content and Action */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 font-sans">
                    {localize('प्रोजेक्ट विवरण एवं काष्ठ सामग्री', 'Project Specifications & Materials')}
                  </h4>
                  <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                    {activeModalProject.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-stone-500">
                    {localize('शर्मा वुडक्राफ्ट द्वारा हस्तनिर्मित · दिल्ली, भारत', 'Handcrafted by Sharma Woodcraft · Delhi, India')}
                  </div>
                  <button
                    onClick={() => {
                      const reqText = `${localize('प्रोजेक्ट से प्रेरित पूछताछ:', 'Inquiry inspired by project:')} ${localizeDynamic(activeModalProject.title)} (${localizeDynamic(activeModalProject.category)})`;
                      setActiveModalProject(null);
                      onNavigate('quote', reqText);
                    }}
                    className="px-6 py-3 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t('projects', 'modal_request_similar')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
