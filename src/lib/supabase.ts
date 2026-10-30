import { createClient } from '@supabase/supabase-js';

// Environment variables can be injected via VITE_SUPABASE_URL or SUPABASE_URL
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE_URL') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
);

// Returns Supabase client or null if not yet configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Helper to test Supabase connection
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL और Anon Key अभी .env में कॉन्फ़िगर नहीं हैं।'
    };
  }

  try {
    const { error } = await supabase.from('website_settings').select('business_name').limit(1);
    if (error) {
      return {
        success: false,
        message: `Supabase त्रुटि: ${error.message}`
      };
    }
    return {
      success: true,
      message: 'Supabase डेटाबेस सफलतापूर्वक कनेक्ट हो गया है!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `कनेक्शन विफलता: ${err.message || 'अज्ञात त्रुटि'}`
    };
  }
}
