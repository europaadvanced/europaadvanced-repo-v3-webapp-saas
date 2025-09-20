'use server';
import { createClient } from '@supabase/supabase-js';

function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (!email || !password) return { ok: false, message: 'Email and password required' };

  const supabase = supabaseServer();
  const redirectTo =
    `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/,'')}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectTo }
  });

  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Account created. Check email if confirmation is enabled.' };
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const supabase = supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
