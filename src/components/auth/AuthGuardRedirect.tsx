'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/libs/supabase/supabase-browser-client';

export default function AuthGuardRedirect() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace('/tenders');
    });
    return () => sub.subscription.unsubscribe();
  }, [router, supabase]);

  return null;
}
