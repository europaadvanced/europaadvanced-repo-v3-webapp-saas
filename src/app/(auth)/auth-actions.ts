'use server';

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import type { ActionResponse } from '@/types/action-response';

function invalid(message: string): ActionResponse {
  return { error: { message } };
}

export async function signUpWithPassword(formData: FormData): Promise<ActionResponse> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();

  if (!email || !password) {
    return invalid('Please provide both email and password.');
  }

  if (!phone) {
    return invalid('Please provide a phone number.');
  }

  const supabase = await createSupabaseServerClient();

  const emailRedirectTo = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: { phone },
    },
  });

  if (error) {
    return invalid(error.message);
  }

  if (data.user && phone) {
    const { error: profileError } = await supabase
      .from('users')
      .upsert({ id: data.user.id, phone }, { onConflict: 'id' });

    if (profileError) {
      console.warn('Failed to persist phone number to public.users:', profileError.message);
    }
  }

  return { error: null };
}

export async function signInWithPassword(formData: FormData): Promise<ActionResponse> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '').trim();

  if (!email || !password) {
    return invalid('Please provide both email and password.');
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return invalid(error.message);
  }

  redirect('/tenders');
  return { error: null };
}

export async function signOut(): Promise<ActionResponse> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return invalid(error.message);
  }

  return { error: null };
}
