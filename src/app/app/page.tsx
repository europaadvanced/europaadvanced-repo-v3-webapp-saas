import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default async function AppHome(){
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global:{ headers:{ Cookie: cookies().toString() } }});
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: sub } = await supabase.from('subscriptions')
    .select('status').eq('user_id', user.id).in('status',['active','trialing']).maybeSingle();

  if (!sub) return <meta httpEquiv="refresh" content="0; url=/pricing" />;

  return (<main className="p-6">
    <h1 className="text-xl mb-2">Welcome</h1>
    <p>Your subscription is active.</p>
    <a className="underline" href="/tenders">Go to Tenders</a>
  </main>);
}
