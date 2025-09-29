'use server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getSession() {
  const c = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => c.get(name)?.value,
        set: (name: string, value: string, options?: any) => c.set(name, value, options),
        remove: (name: string, options?: any) => c.set(name, '', { ...options, maxAge: 0 }),
      },
    }
  );
  const { data } = await supabase.auth.getSession();
  return data.session;
}
