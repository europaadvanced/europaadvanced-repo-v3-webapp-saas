'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

async function sb() {
  // Get the store once (async), then use sync cookie methods below
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions['set']) {
          try {
            cookieStore.set({ name, value, ...(options || {}) });
          } catch {
            /* ignore in edge runtimes */
          }
        },
        remove(name: string, options?: CookieOptions['remove']) {
          try {
            cookieStore.delete({ name, ...(options || {}) });
          } catch {
            /* ignore */
          }
        },
      },
    }
  );
}

const site =
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Magic-link email login */
export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  if (!email) return;
  const supabase = await sb();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/callback` },
  });
  if (error) throw new Error(error.message);
}

/** Password login (optional) */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;
  const supabase = await sb();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect('/account');
}

/** Password signup */
export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;
  const supabase = await sb();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${site}/auth/callback` },
  });
  if (error) throw new Error(error.message);
  redirect('/account');
}

/** OAuth (expects form field `provider`) */
export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get('provider') || '');
  if (!provider) return;
  const supabase = await sb();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: { redirectTo: `${site}/auth/callback` },
  });
  if (error) throw new Error(error.message);
  redirect(data.url);
}

/** Sign out */
export async function signOut() {
  const supabase = await sb();
  await supabase.auth.signOut();
  redirect('/login');
}
