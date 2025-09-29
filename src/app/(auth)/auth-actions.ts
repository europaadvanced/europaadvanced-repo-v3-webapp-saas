'use server';
import { cookies } from 'next/headers';
import type { CookieOptions } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function createClient() {
  const c = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return c.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          c.set(name, value, options);
        },
        remove(name: string, options?: CookieOptions) {
          c.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/** Password login */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  if (!email || !password) return { error: 'Missing email/password' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/** Password signup – also saves phone into user metadata */
export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  if (!email || !password) return { error: 'Missing email/password' };

  const supabase = createClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || '';
  const emailRedirectTo = `${site}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: { phone }, // stored in user_metadata
    },
  });
  return { error: error?.message ?? null };
}

/** Sign out */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}
