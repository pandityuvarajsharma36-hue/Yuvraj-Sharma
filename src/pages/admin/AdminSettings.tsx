import React, { useEffect, useState } from 'react';
import { Save, Lock, Sliders, ShieldCheck, CheckCircle2, AlertCircle, Facebook, Instagram, Share2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useData } from '../../context/DataContext.js';

function PinterestIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z" />
    </svg>
  );
}

export function AdminSettings() {
  const { token, admin } = useAuth();
  const { refreshData } = useData();

  const [settings, setSettings] = useState<Record<string, string>>({
    business_name: 'Sharma Woodcraft',
    phone: '+91 98100 12345',
    whatsapp: '919810012345',
    email: 'contact@sharmawoodcraft.in',
    address: 'Kirti Nagar Furniture Block, New Delhi, Delhi 110015, India',
    business_hours: 'Monday - Saturday: 10:00 AM - 8:00 PM (Sunday by Appointment)',
    headline: 'Crafting Beautiful Spaces, One Piece at a Time.',
    hero_description: 'Bespoke solid wood furniture, architectural woodwork, luxury modular kitchens, and custom wardrobe designs handcrafted in Delhi with heirloom joinery.',
    footer_text: 'Sharma Woodcraft — Handcrafted architectural millwork and heirloom custom furniture in Delhi NCR.',
    seo_title: 'Sharma Woodcraft | Bespoke Furniture & Custom Woodworking Delhi',
    seo_description: 'Handcrafted custom wardrobes, solid wood dining tables, modular kitchens, and architectural woodwork in Delhi, India. Request a free quote today.',
    facebook_url: 'https://facebook.com',
    instagram_url: 'https://instagram.com',
    pinterest_url: 'https://pinterest.com'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwFeedback, setPwFeedback] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      if (!token) return;
      try {
        setIsLoading(true);
        const res = await fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load settings.');
        const data = await res.json();
        setSettings(prev => ({ ...prev, ...(data.settings || {}) }));
      } catch (err: any) {
        setSettingsError(err.message || 'Error loading settings.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [token]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingSettings(true);
    setSettingsFeedback(null);
    setSettingsError(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings.');

      setSettingsFeedback('Website settings successfully saved to database and live on website.');
      await refreshData();
    } catch (err: any) {
      setSettingsError(err.message || 'Error saving settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setPwFeedback(null);
    setPwError(null);

    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed.');

      setPwFeedback('Admin password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwError(err.message || 'Could not update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
          Website Settings & Brand Configuration
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure business contact details, WhatsApp number, workshop address, homepage headlines, and security.
        </p>
      </div>

      {/* Website Settings Form */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
          <Sliders className="w-5 h-5 text-amber-700" />
          <h2 className="text-base font-serif font-bold text-stone-900">
            Business & Contact Information
          </h2>
        </div>

        {settingsFeedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{settingsFeedback}</span>
          </div>
        )}

        {settingsError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                value={settings.business_name || ''}
                onChange={(e) => handleSettingChange('business_name', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Phone Number (Calls)
              </label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => handleSettingChange('phone', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                WhatsApp Number (International Format, e.g. 919810012345)
              </label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => handleSettingChange('whatsapp', e.target.value)}
                placeholder="919810012345"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => handleSettingChange('email', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Workshop / Physical Address
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => handleSettingChange('address', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={settings.business_hours || ''}
              onChange={(e) => handleSettingChange('business_hours', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Homepage Hero Headline
            </label>
            <input
              type="text"
              value={settings.headline || ''}
              onChange={(e) => handleSettingChange('headline', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Homepage Hero Description
            </label>
            <textarea
              rows={3}
              value={settings.hero_description || ''}
              onChange={(e) => handleSettingChange('hero_description', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                value={settings.seo_title || ''}
                onChange={(e) => handleSettingChange('seo_title', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
                SEO Meta Description
              </label>
              <input
                type="text"
                value={settings.seo_description || ''}
                onChange={(e) => handleSettingChange('seo_description', e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Footer Text
            </label>
            <input
              type="text"
              value={settings.footer_text || ''}
              onChange={(e) => handleSettingChange('footer_text', e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Social Media Section */}
          <div className="pt-6 border-t border-stone-100 space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                सोशल मीडिया प्रोफाइल लिंक्स (Social Media Links for Footer)
              </h3>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              ये लिंक्स वेबसाइट के फूटर (Footer) में सोशल मीडिया आइकॉन्स के रूप में दिखाई देंगे। ग्राहक इन पर क्लिक करके सीधे आपके फेसबुक, इंस्टाग्राम और पिंटरेस्ट प्रोफाइल देख सकेंगे। यदि कोई लिंक खाली छोड़ते हैं, तो वह फूटर में स्वतः छिप जाएगा।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Facebook URL */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <span className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center">
                      <Facebook className="w-3.5 h-3.5" />
                    </span>
                    <span>Facebook URL</span>
                  </div>
                  {settings.facebook_url && (
                    <a
                      href={settings.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1877F2] hover:underline flex items-center gap-1"
                      title="Open link"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleSettingChange('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/sharmawoodcraft"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                />
                <p className="text-[10px] text-stone-500">उदा. https://facebook.com/your-page</p>
              </div>

              {/* Instagram URL */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                      <Instagram className="w-3.5 h-3.5" />
                    </span>
                    <span>Instagram URL</span>
                  </div>
                  {settings.instagram_url && (
                    <a
                      href={settings.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-rose-600 hover:underline flex items-center gap-1"
                      title="Open link"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleSettingChange('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/sharmawoodcraft"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-stone-500">उदा. https://instagram.com/your-handle</p>
              </div>

              {/* Pinterest URL */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                    <span className="w-6 h-6 rounded-lg bg-[#E60023] text-white flex items-center justify-center">
                      <PinterestIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>Pinterest URL</span>
                  </div>
                  {settings.pinterest_url && (
                    <a
                      href={settings.pinterest_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#E60023] hover:underline flex items-center gap-1"
                      title="Open link"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={settings.pinterest_url || ''}
                  onChange={(e) => handleSettingChange('pinterest_url', e.target.value)}
                  placeholder="https://pinterest.com/sharmawoodcraft"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#E60023]"
                />
                <p className="text-[10px] text-stone-500">उदा. https://pinterest.com/your-profile</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Saving Settings...' : 'Save Settings to Database'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Admin Password Change Form */}
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm max-w-xl">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-4 mb-6">
          <Lock className="w-5 h-5 text-amber-700" />
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              Admin Password & Authentication
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Logged in as: <span className="font-mono text-stone-800 font-semibold">{admin?.email}</span>
            </p>
          </div>
        </div>

        {pwFeedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pwFeedback}</span>
          </div>
        )}

        {pwError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              New Password (Min 8 Characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-60 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isUpdatingPassword ? 'पासवर्ड अपडेट हो रहा है...' : 'पासवर्ड अपडेट करें'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database & Supabase Integration Guide Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            DB
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-stone-900">
              डेटाबेस व Supabase इंटीग्रेशन गाइड
            </h2>
            <p className="text-xs text-stone-500">
              वर्तमान में SQLite डेटाबेस एक्टिव है। Supabase क्लाउड डेटाबेस जोड़ने के निर्देश नीचे दिए गए हैं।
            </p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2 text-emerald-950">
          <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Supabase क्लाइंट पैकेज (@supabase/supabase-js) और SQL स्कीमा तैयार है</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            प्रोजेक्ट के रूट फोल्डर में <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">supabase_schema.sql</code> फाइल मौजूद है।
            आप अपने Supabase Dashboard &gt; <b>SQL Editor</b> में जाकर इस फाइल का कोड पेस्ट करके <b>Run</b> कर सकते हैं।
          </p>
        </div>

        <div className="space-y-2 text-xs text-stone-700">
          <div className="font-semibold text-stone-900">आवश्यक Environment Variables (.env):</div>
          <pre className="p-3 bg-stone-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"`}
          </pre>
        </div>
      </div>

    </div>
  );
}
