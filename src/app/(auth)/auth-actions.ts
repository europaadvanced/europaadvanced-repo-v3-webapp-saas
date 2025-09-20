'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

async function sb() {
  // Resolve the cookie store once
  const store = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        // do not over-type options; Next’s type surface varies by version
        set(name: string, value: string, options?: any) {
          try {
            // both signatures are accepted across versions
            (store as any).set(name, value, options);
          } catch {
            try {
              (store as any).set({ name, value, ...(options || {}) });
            } catch {}
          }
        },
        remove(name: string, options?: any) {
          try {
            (store as any).delete(name, options);
          } catch {
            try {
              (store as any).delete({ name, ...(options || {}) });
            } catch {}
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
