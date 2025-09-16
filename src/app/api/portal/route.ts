import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/features/account/controllers/get-session';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await getSession();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  // server-side Supabase client with service role
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // read Stripe customer id mapped to this user
  const { data: row, error } = await supabase
    .from('customers')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) return new Response(error.message, { status: 500 });
  if (!row?.stripe_customer_id) return new Response('No Stripe customer', { status: 404 });

  const portal = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
  });

  return Response.json({ url: portal.url });
}
