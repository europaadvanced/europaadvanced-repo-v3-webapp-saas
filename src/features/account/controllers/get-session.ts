import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { supabaseAdminClient } from '@/libs/supabase/supabase-admin';

export async function getSession() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Failed to retrieve Supabase session', error);
    return null;
  }

  const session = data.session ?? null;

  const user = session?.user;
  const metadataPhone = typeof user?.user_metadata?.phone === 'string' ? user.user_metadata.phone.trim() : '';
  const authPhone = typeof user?.phone === 'string' ? user.phone.trim() : '';
  const phone = metadataPhone || authPhone;

  if (user?.id && phone) {
    try {
      const { error: syncError } = await supabaseAdminClient
        .from('users')
        .upsert({ id: user.id, phone }, { onConflict: 'id' });

      if (syncError) {
        console.error('Failed to sync Supabase user phone number', syncError);
      }
    } catch (syncError) {
      console.error('Unexpected error syncing Supabase user phone number', syncError);
    }
  }

  return session;
}
