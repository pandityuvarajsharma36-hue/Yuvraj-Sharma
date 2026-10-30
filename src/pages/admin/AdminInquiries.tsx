import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Phone,
  MessageSquare,
  Mail,
  Trash2,
  X,
  FileText,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Inquiry } from '../../types/index.js';

export function AdminInquiries() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Editable fields in modal
  const [modalStatus, setModalStatus] = useState<Inquiry['status']>('new');
  const [modalNotes, setModalNotes] = useState<string>('');

  const fetchInquiries = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const url = new URL('/api/admin/inquiries', window.location.origin);
      if (statusFilter === 'callbacks') {
        url.searchParams.append('callbacks', 'true');
      } else if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }
      if (searchTerm.trim()) url.searchParams.append('search', searchTerm.trim());

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('पूछताछ लोड करने में विफल।');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'पूछताछ लोड करने में त्रुटि।' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [token, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInquiries();
  };

  const openDetailModal = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setModalStatus(inq.status);
    setModalNotes(inq.admin_notes || '');
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry || !token) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${selectedInquiry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: modalStatus,
          admin_notes: modalNotes
        })
      });

      if (!res.ok) throw new Error('पूछताछ अपडेट करने में विफल।');

      setFeedback({ type: 'success', message: 'पूछताछ की स्थिति और निजी नोट्स अपडेट हो गए हैं।' });
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'अपडेट विफल रहा।' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('पूछताछ हटाने में विफल।');

      setFeedback({ type: 'success', message: 'पूछताछ डेटाबेस से स्थायी रूप से हटा दी गई है।' });
      setDeleteConfirmId(null);
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      fetchInquiries();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'हटाने में त्रुटि।' });
    }
  };

  const handleExportCsv = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/inquiries/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('CSV निर्यात विफल रहा।');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sharma-woodcraft-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'CSV निर्यात विफल रहा।' });
    }
  };

  const statusBadge = (st: string) => {
    const badges: Record<string, { label: string; cls: string }> = {
      new: { label: 'नई लीड', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
      contacted: { label: 'संपर्क किया', cls: 'bg-blue-50 text-blue-700 border-blue-300' },
      in_progress: { label: 'प्रगति पर', cls: 'bg-amber-50 text-amber-800 border-amber-300' },
      completed: { label: 'पूर्ण', cls: 'bg-stone-100 text-stone-700 border-stone-300' },
      cancelled: { label: 'रद्द', cls: 'bg-rose-50 text-rose-700 border-rose-300' }
    };
    const b = badges[st] || { label: st, cls: 'bg-stone-100 text-stone-700' };
    return (
      <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${b.cls}`}>
        {b.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            ग्राहक पूछताछ व लीड्स ({inquiries.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            ग्राहकों के कोटेशन अनुरोध, संदर्भ तस्वीरें और ऑर्डर की स्थिति देखें व प्रबंधित करें।
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-stone-600" />
          <span>CSV में डाउनलोड करें</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <input
            type="text"
            placeholder="ग्राहक का नाम, फोन, इलाका या सेवा द्वारा खोजें..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {[
            { id: 'all', label: 'सभी पूछताछ' },
            { id: 'callbacks', label: '⚡ केवल कॉल बैक' },
            { id: 'new', label: 'नई लीड्स' },
            { id: 'contacted', label: 'संपर्क किया' },
            { id: 'in_progress', label: 'प्रगति पर' },
            { id: 'completed', label: 'पूर्ण' },
            { id: 'cancelled', label: 'रद्द' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === item.id
                  ? item.id === 'callbacks'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-stone-900 text-white'
                  : item.id === 'callbacks'
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-stone-500">
            डेटाबेस से ग्राहक पूछताछ लोड हो रही है...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-2">
            <FileText className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-medium text-stone-700">वर्तमान फ़िल्टर से मेल खाती कोई पूछताछ नहीं मिली।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-100">
                <tr>
                  <th className="px-6 py-3.5">ग्राहक / संपर्क</th>
                  <th className="px-6 py-3.5">अनुरोधित सेवा</th>
                  <th className="px-6 py-3.5">स्थान</th>
                  <th className="px-6 py-3.5">फोटो</th>
                  <th className="px-6 py-3.5">दिनांक</th>
                  <th className="px-6 py-3.5">स्थिति</th>
                  <th className="px-6 py-3.5 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {inquiries.map((inq) => {
                  const cleanPhone = inq.phone.replace(/[^\d+]/g, '');
                  const cleanWa = inq.phone.replace(/[^\d]/g, '');

                  return (
                    <tr key={inq.id} className="hover:bg-stone-50/80 transition-colors">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900 text-sm">
                            {inq.customer_name}
                          </span>
                          {inq.is_callback && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Phone className="w-2.5 h-2.5 text-amber-700 animate-pulse" />
                              <span>कॉल बैक</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-stone-500 text-[11px] mt-0.5 font-mono">
                          <span>{inq.phone}</span>
                          {inq.email && <span>· {inq.email}</span>}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-900">
                          {inq.service_needed}
                        </div>
                        {inq.is_callback && inq.preferred_time && (
                          <div className="text-[11px] font-semibold text-amber-800 flex items-center gap-1 mt-0.5">
                            <span>समय: {inq.preferred_time}</span>
                          </div>
                        )}
                        {inq.budget_range && (
                          <div className="text-[11px] text-stone-500">
                            बजट: {inq.budget_range}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{inq.location_area || 'दिल्ली एनसीआर'}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {inq.reference_image_url ? (
                          <a
                            href={inq.reference_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold text-[11px]"
                          >
                            <span>फोटो देखें</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-stone-400 text-[11px]">कोई नहीं</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(inq.created_at).toLocaleDateString('hi-IN')}
                      </td>

                      <td className="px-6 py-4">
                        {statusBadge(inq.status)}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className={`p-1.5 rounded inline-flex items-center gap-1 text-xs font-semibold ${
                              inq.is_callback
                                ? 'bg-amber-600 text-white hover:bg-amber-700 px-2.5 py-1 shadow-sm'
                                : 'text-amber-800 hover:bg-amber-50'
                            }`}
                            title={`${inq.customer_name} को ${cleanPhone} पर कॉल करें`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {inq.is_callback && <span>कॉल करें</span>}
                          </a>
                        )}

                        {cleanWa && (
                          <a
                            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`नमस्ते ${inq.customer_name}, शर्मा वुडक्राफ्ट से आपके ${inq.is_callback ? 'कॉल बैक अनुरोध' : 'कोटेशन पूछताछ'} #${inq.id.slice(0, 8)} के संदर्भ में।`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded inline-block"
                            title="व्हाट्सएप पर बात करें"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => openDetailModal(inq)}
                          className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          विवरण
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(inq.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded inline-block cursor-pointer"
                          title="रिकॉर्ड हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
            
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold font-mono">
                  पूछताछ संदर्भ #{selectedInquiry.id.slice(0, 8).toUpperCase()}
                </span>
                <h2 className="text-xl font-serif font-bold text-white mt-0.5">
                  {selectedInquiry.customer_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Callback Notice Banner */}
              {selectedInquiry.is_callback && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                      <Phone className="w-4 h-4 text-amber-700 animate-pulse" />
                      <span>डायरेक्ट कॉल बैक अनुरोध</span>
                    </div>
                    <p className="text-xs text-amber-800">
                      ग्राहक ने फॉर्म के बजाय 5 मिनट के त्वरित फोन परामर्श का अनुरोध किया है।
                      {selectedInquiry.preferred_time && (
                        <span className="block font-semibold mt-0.5 text-stone-900">
                          सुविधाजनक समय: {selectedInquiry.preferred_time}
                        </span>
                      )}
                    </p>
                  </div>
                  <a
                    href={`tel:${selectedInquiry.phone.replace(/[^\d+]/g, '')}`}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>ग्राहक को तुरंत कॉल करें</span>
                  </a>
                </div>
              )}

              {/* Contact Actions Row */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <a
                  href={`tel:${selectedInquiry.phone.replace(/[^\d+]/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg text-xs font-semibold"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल करें ({selectedInquiry.phone})</span>
                </a>
                <a
                  href={`https://wa.me/${selectedInquiry.phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(`नमस्ते ${selectedInquiry.customer_name}, शर्मा वुडक्राफ्ट से संपर्क कर रहे हैं।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-lg text-xs font-semibold"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>व्हाट्सएप संदेश भेजें</span>
                </a>
                {selectedInquiry.email && (
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 text-stone-800 hover:bg-stone-300 rounded-lg text-xs font-semibold"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>ईमेल</span>
                  </a>
                )}
              </div>

              {/* Scope Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">सेवा</span>
                  <span className="font-semibold text-stone-900">{selectedInquiry.service_needed}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">स्थान</span>
                  <span className="font-semibold text-stone-900">{selectedInquiry.location_area || 'दिल्ली एनसीआर'}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">अनुमानित नाप</span>
                  <span className="font-semibold text-stone-900">{selectedInquiry.dimensions || 'उल्लेख नहीं किया'}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">बजट श्रेणी</span>
                  <span className="font-semibold text-stone-900">{selectedInquiry.budget_range || 'उल्लेख नहीं किया'}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">संपर्क वरीयता</span>
                  <span className="font-semibold text-stone-900 capitalize">{selectedInquiry.preferred_contact}</span>
                </div>
                <div>
                  <span className="text-stone-400 uppercase tracking-wider block text-[10px]">प्राप्ति दिनांक</span>
                  <span className="font-semibold text-stone-900">{new Date(selectedInquiry.created_at).toLocaleDateString('hi-IN')}</span>
                </div>
              </div>

              {/* Customer Project Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1 font-sans">
                  ग्राहक की प्रोजेक्ट आवश्यकताएं व विवरण
                </label>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                  {selectedInquiry.details}
                </div>
              </div>

              {/* Uploaded Reference Photo */}
              {selectedInquiry.reference_image_url && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 font-sans">
                    ग्राहक द्वारा अपलोड की गई डिज़ाइन / स्केच फोटो
                  </label>
                  <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-72">
                    <img
                      src={selectedInquiry.reference_image_url}
                      alt="Customer reference"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <a
                    href={selectedInquiry.reference_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline mt-1"
                  >
                    <span>पूरी मूल फोटो नई टैब में खोलें</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Status Update & Private Admin Notes */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    ऑर्डर / लीड की स्थिति
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="new">नई लीड (New Lead)</option>
                    <option value="contacted">ग्राहक से संपर्क किया (Contacted)</option>
                    <option value="in_progress">कार्य प्रगति पर - कार्यशाला (In Progress)</option>
                    <option value="completed">कार्य पूर्ण व डिलीवर (Completed)</option>
                    <option value="cancelled">रद्द (Cancelled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    आंतरिक एडमिन नोट्स (केवल आंतरिक रिकॉर्ड - वेबसाइट पर कभी नहीं दिखेगा)
                  </label>
                  <textarea
                    rows={3}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="उदा. गुरुवार को ग्राहक के घर पर नाप लिया। सागवान अलमारी का ₹1.8 लाख का एस्टीमेट दिया गया। सोमवार को फॉलो-अप कॉल करना है।"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedInquiry.id)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  पूछताछ हटाएं
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedInquiry(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-100 rounded-lg cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUpdateInquiry}
                    className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    {isUpdating ? 'सहेजा जा रहा है...' : 'बदलाव सुरक्षित करें'}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              पूछताछ स्थायी रूप से हटाएं?
            </h3>
            <p className="text-xs text-stone-500">
              यह कार्रवाई पूर्ववत नहीं की जा सकती और यह रिकॉर्ड डेटाबेस से हमेशा के लिए हटा दिया जाएगा।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                onClick={() => handleDeleteInquiry(deleteConfirmId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                रिकॉर्ड हटाएं
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
