import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { DataProvider, useData } from './context/DataContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.js';
import { HomePage } from './pages/HomePage.js';
import { ServicesPage } from './pages/ServicesPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { QuotePage } from './pages/QuotePage.js';
import { AdminLogin } from './pages/admin/AdminLogin.js';
import { AdminLayout } from './pages/admin/AdminLayout.js';
import { CallbackModal } from './components/CallbackModal.js';

function MainApp() {
  const { admin, isLoading: isAuthLoading } = useAuth();
  const { settings } = useData();
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Page routing
  const [currentPage, setCurrentPage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'admin') return 'admin';
      if (path === 'services') return 'services';
      if (path === 'projects') return 'projects';
      if (path === 'about') return 'about';
      if (path === 'contact') return 'contact';
      if (path === 'quote') return 'quote';
    }
    return 'home';
  });

  const [prefilledService, setPrefilledService] = useState<string | undefined>(undefined);

  const navigateTo = (page: string, service?: string) => {
    setCurrentPage(page);
    setPrefilledService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const targetPath = page === 'home' ? '/' : `/${page}`;
    window.history.pushState({ page }, '', targetPath);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        setCurrentPage(e.state.page);
      } else {
        const path = window.location.pathname.replace(/^\//, '');
        setCurrentPage(path || 'home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync title and SEO metadata from settings
  useEffect(() => {
    if (settings.seo_title) {
      document.title = settings.seo_title;
    }
  }, [settings.seo_title]);

  // If viewing admin route
  if (currentPage === 'admin') {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center text-stone-300 text-sm">
          Loading admin authentication...
        </div>
      );
    }

    if (!admin) {
      return <AdminLogin onBackToWebsite={() => navigateTo('home')} />;
    }

    return <AdminLayout onBackToWebsite={() => navigateTo('home')} />;
  }

  // Public Website Render
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onRequestCallback={() => setIsCallbackModalOpen(true)}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={navigateTo}
            onRequestCallback={() => setIsCallbackModalOpen(true)}
          />
        )}
        {currentPage === 'services' && (
          <ServicesPage onNavigate={navigateTo} />
        )}
        {currentPage === 'projects' && (
          <ProjectsPage onNavigate={navigateTo} />
        )}
        {currentPage === 'about' && (
          <AboutPage onNavigate={navigateTo} />
        )}
        {currentPage === 'contact' && (
          <ContactPage />
        )}
        {currentPage === 'quote' && (
          <QuotePage
            initialService={prefilledService}
            onNavigate={navigateTo}
            onRequestCallback={() => setIsCallbackModalOpen(true)}
          />
        )}
      </main>

      <Footer onNavigate={navigateTo} />
      <FloatingWhatsApp />

      <CallbackModal
        isOpen={isCallbackModalOpen}
        onClose={() => setIsCallbackModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <MainApp />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
}
