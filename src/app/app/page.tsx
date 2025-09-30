import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export default async function AppHome() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .in('status', ['active', 'trialing'])
    .maybeSingle();

  if (error || !subscription) {
    redirect('/pricing');
  }

  return (
    <main className='p-6'>
      <h1 className='mb-2 text-xl'>Welcome</h1>
      <p>Your subscription is active.</p>
      <a className='underline' href='/tenders'>
        Go to Tenders
      </a>
    </main>
  );
}
