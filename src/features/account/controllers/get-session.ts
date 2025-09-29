import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getSession() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
  }

  const session = data.session;

  if (session?.user) {
    const metadataPhone = session.user.user_metadata?.phone;
    const phoneFromMetadata = typeof metadataPhone === 'string' ? metadataPhone.trim() : '';
    const phoneFromProfile = typeof session.user.phone === 'string' ? session.user.phone.trim() : '';
    const phone = phoneFromMetadata || phoneFromProfile;

    if (phone) {
      const { error: phoneUpdateError } = await supabase
        .from('users')
        .update({ phone })
        .eq('id', session.user.id);

      if (phoneUpdateError) {
        console.error(phoneUpdateError);
      }
    }
  }

  return session;
}
