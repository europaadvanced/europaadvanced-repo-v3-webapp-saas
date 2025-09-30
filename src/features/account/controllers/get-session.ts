'use server';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
