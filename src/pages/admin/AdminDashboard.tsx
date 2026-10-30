import { useEffect, useState } from 'react';
import {
  Inbox,
  FolderKanban,
  Hammer,
  ArrowUpRight,
  PlusCircle,
  AlertCircle,
  PhoneCall,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface DashboardStats {
  totalInquiries: number;
  newInquiries: number;
  inProgressInquiries: number;
  completedInquiries: number;
  pendingCallbacks?: number;
  totalCallbacks?: number;
  publishedProjects: number;
  totalProjects: number;
  totalServices: number;
}

interface AdminDashboardProps {
  onTabChange: (tab: string) => void;
}

export function AdminDashboard({ onTabChange }: AdminDashboardProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) return;
      try {
        setIsLoading(false);
        const res = await fetch('/api/admin/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('डैशबोर्ड मेट्रिक्स लोड करने में विफल।');
        const data = await res.json();
        setStats(data.stats);
        setRecentInquiries(data.recentInquiries || []);
      } catch (err: any) {
        setError(err.message || 'डैशबोर्ड लोड करने में त्रुटि।');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-stone-500 text-sm">
        डेटाबेस से जानकारी लोड हो रही है...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600" />
        <span>{error}</span>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'नई';
      case 'contacted': return 'संपर्क किया';
      case 'in_progress': return 'प्रगति पर';
      case 'completed': return 'पूर्ण';
      case 'cancelled': return 'रद्द';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            कार्यशाला का संक्षिप्त विवरण
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            डेटाबेस द्वारा संचालित लाइव पूछताछ, कॉल बैक लीड्स और वेबसाइट प्रबंधन।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange('projects')}
            className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>नया प्रोजेक्ट जोड़ें</span>
          </button>
          <button
            onClick={() => onTabChange('inquiries')}
            className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>पूछताछ प्रबंधित करें</span>
          </button>
        </div>
      </div>

      {/* Database KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Total Inquiries */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">कुल लीड्स</span>
            <Inbox className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-stone-900 tabular-nums">
            {stats?.totalInquiries ?? 0}
          </div>
          <p className="text-[11px] text-stone-400">सभी ग्राहक अनुरोध</p>
        </div>

        {/* New / Unread */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">नए कोटेशन</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-emerald-700 tabular-nums">
            {stats?.newInquiries ?? 0}
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">समीक्षा हेतु लंबित</p>
        </div>

        {/* Pending Callbacks (Urgent) */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-300 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-xs font-semibold uppercase tracking-wider">कॉल बैक</span>
            <PhoneCall className="w-4 h-4 text-amber-700 animate-pulse" />
          </div>
          <div className="text-3xl font-bold font-serif text-amber-900 tabular-nums">
            {stats?.pendingCallbacks ?? 0}
          </div>
          <p className="text-[11px] text-amber-800 font-medium">फोन कॉल हेतु प्रतीक्षारत</p>
        </div>

        {/* Published Projects */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">प्रोजेक्ट्स</span>
            <FolderKanban className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-stone-900 tabular-nums">
            {stats?.publishedProjects ?? 0}
          </div>
          <p className="text-[11px] text-stone-400">वेबसाइट पर प्रकाशित</p>
        </div>

        {/* Total Services */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-semibold uppercase tracking-wider">सेवाएं</span>
            <Hammer className="w-4 h-4 text-stone-500" />
          </div>
          <div className="text-3xl font-bold font-serif text-stone-900 tabular-nums">
            {stats?.totalServices ?? 0}
          </div>
          <p className="text-[11px] text-stone-400">काष्ठकला की श्रेणियां</p>
        </div>

      </div>

      {/* Recent Inquiries List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              हालिया कोटेशन पूछताछ व कॉल बैक अनुरोध
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              वेबसाइट आगंतुकों द्वारा सबमिट की गई नवीनतम लीड्स
            </p>
          </div>
          <button
            onClick={() => onTabChange('inquiries')}
            className="text-xs font-semibold text-amber-900 hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>सभी पूछताछ देखें</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            अभी कोई पूछताछ दर्ज नहीं हुई है। सार्वजनिक वेबसाइट पर कोटेशन या कॉल बैक फॉर्म भरकर परीक्षण करें!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3">ग्राहक / प्रकार</th>
                  <th className="px-6 py-3">फोन नंबर</th>
                  <th className="px-6 py-3">सेवा / अनुरोध</th>
                  <th className="px-6 py-3">स्थान</th>
                  <th className="px-6 py-3">स्थिति</th>
                  <th className="px-6 py-3 text-right">त्वरित कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentInquiries.map((inq) => {
                  const statusColors: Record<string, string> = {
                    new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    contacted: 'bg-blue-50 text-blue-700 border-blue-200',
                    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
                    completed: 'bg-stone-100 text-stone-700 border-stone-200',
                    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
                  };
                  const cleanPhone = inq.phone ? inq.phone.replace(/[^\d+]/g, '') : '';
                  return (
                    <tr key={inq.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-stone-900 flex items-center gap-2">
                          <span>{inq.customer_name}</span>
                          {inq.is_callback ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                              <PhoneCall className="w-2.5 h-2.5 text-amber-700" />
                              <span>कॉल बैक</span>
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {inq.phone}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-900">{inq.service_needed}</div>
                        {inq.preferred_time && (
                          <div className="text-[10px] text-amber-800">समय: {inq.preferred_time}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {inq.location_area || 'दिल्ली एनसीआर'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase border ${statusColors[inq.status] || 'bg-stone-100 text-stone-700'}`}>
                          {getStatusLabel(inq.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition-colors"
                            title="ग्राहक को सीधे फोन करें"
                          >
                            <Phone className="w-3 h-3" />
                            <span>कॉल करें</span>
                          </a>
                        )}
                        <button
                          onClick={() => onTabChange('inquiries')}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-[11px] cursor-pointer"
                        >
                          विवरण
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
