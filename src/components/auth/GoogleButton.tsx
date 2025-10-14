'use client';

import { createSupabaseBrowserClient } from '@/libs/supabase/supabase-browser-client';

export default function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  const supabase = createSupabaseBrowserClient();

  const handleClick = async () => {
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border px-3 py-2 text-sm"
    >
      {label}
    </button>
  );
}
