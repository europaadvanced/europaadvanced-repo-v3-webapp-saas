'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

async function sb() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );
}

/** Email + password signup (stores phone in user metadata) */
export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  if (!email || !password) return { error: 'Missing credentials' };

  const supabase = await sb();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { phone },
    },
  });

  if (error) return { error: error.message };
  return { data };
}

/** Email + password login */
export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const supabase = await sb();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect('/tenders');
}

/** Sign out */
export async function signOut() {
  const supabase = await sb();
  await supabase.auth.signOut();
  redirect('/');
}
