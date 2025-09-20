'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

function sb() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          cookieStore.delete({ name, ...options });
        }
      }
    }
  );
}

const site =
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

/** Magic-link email login (used by the starter) */
export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  if (!email) return;
  const { error } = await sb().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${site}/auth/callback` }
  });
  if (error) throw new Error(error.message);
}

/** Password login (optional) */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;
  const { error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect('/account');
}

/** Password signup */
export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;
  const { error } = await sb().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${site}/auth/callback` }
  });
  if (error) throw new Error(error.message);
  redirect('/account');
}

/** OAuth (expects form field "provider") */
export async function signInWithOAuth(formData: FormData) {
  const provider = String(formData.get('provider') || '');
  if (!provider) return;
  const { data, error } = await sb().auth.signInWithOAuth({
    provider: provider as any,
    options: { redirectTo: `${site}/auth/callback` }
  });
  if (error) throw new Error(error.message);
  redirect(data.url);
}

/** Sign out used by Navigation / AccountMenu */
export async function signOut() {
  await sb().auth.signOut();
  redirect('/login');
}
