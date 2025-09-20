'use server';

import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;

  const { error } = await sb().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` }
  });
  if (error) throw new Error(error.message);
  redirect('/account'); // go to the app after signup
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return;

  const { error } = await sb().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  redirect('/account'); // go to the app after login
}
