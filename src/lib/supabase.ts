import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in .env or
 * GitHub Actions Secrets / Cloudflare Pages Environment Variables, `supabase`
 * connects directly to your live Supabase PostgreSQL + Auth + Storage instance.
 * Otherwise, the platform runs in self-contained Local Persistence Mode so
 * GitHub Pages deployments work immediately out-of-the-box.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Helper to return current date string (YYYY-MM-DD) in Indian Standard Time (Asia/Kolkata)
 * for accurate daily streak and quiz participation boundaries.
 */
export function getCurrentDateIST(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}
