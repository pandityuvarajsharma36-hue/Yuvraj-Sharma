import { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  Hammer,
  Users,
  MessageSquareQuote,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { AdminDashboard } from './AdminDashboard.js';
import { AdminInquiries } from './AdminInquiries.js';
import { AdminProjects } from './AdminProjects.js';
import { AdminServices } from './AdminServices.js';
import { AdminTeam } from './AdminTeam.js';
import { AdminTestimonials } from './AdminTestimonials.js';
import { AdminSettings } from './AdminSettings.js';

interface AdminLayoutProps {
  onBackToWebsite: () => void;
}

export function AdminLayout({ onBackToWebsite }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const menuItems = [
    { id: 'dashboard', label: 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'inquiries', label: 'पूछताछ व लीड्स', icon: Inbox },
    { id: 'projects', label: 'प्रोजेक्ट्स व गैलरी', icon: FolderKanban },
    { id: 'services', label: 'सेवाएं व कीमतें', icon: Hammer },
    { id: 'team', label: 'टीम व कारीगर', icon: Users },
    { id: 'testimonials', label: 'ग्राहक समीक्षाएं', icon: MessageSquareQuote },
    { id: 'settings', label: 'वेबसाइट सेटिंग्स', icon: Settings },
  ];

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onTabChange={handleTabSelect} />;
      case 'inquiries':
        return <AdminInquiries />;
      case 'projects':
        return <AdminProjects />;
      case 'services':
        return <AdminServices />;
      case 'team':
        return <AdminTeam />;
      case 'testimonials':
        return <AdminTestimonials />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard onTabChange={handleTabSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-950 text-white p-4 flex items-center justify-between border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 font-serif font-bold flex items-center justify-center text-sm">
            श
          </div>
          <span className="font-serif font-bold text-sm">शर्मा वुडक्राफ्ट एडमिन</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToWebsite}
            className="p-1.5 text-stone-400 hover:text-white"
            title="लाइव वेबसाइट देखें"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 text-stone-400 hover:text-white"
          >
            {isMobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 text-stone-300 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Wordmark */}
          <div className="p-6 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif font-bold text-lg">
                श
              </div>
              <div>
                <span className="text-base font-serif font-bold text-white block">
                  शर्मा वुडक्राफ्ट
                </span>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                  एडमिन कंट्रोल पैनल
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-stone-800 space-y-3">
          <div className="px-3 py-2 bg-stone-900 rounded-xl text-xs">
            <p className="font-bold text-white truncate">{admin?.full_name || 'एडमिन'}</p>
            <p className="text-[11px] text-stone-400 font-mono truncate">{admin?.email}</p>
          </div>

          <button
            onClick={onBackToWebsite}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>लाइव वेबसाइट देखें</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto w-full">
        {renderActiveTabContent()}
      </main>

    </div>
  );
}
