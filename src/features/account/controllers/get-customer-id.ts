import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

type Row = { stripe_customer_id: string | null };

export async function getCustomerId(userId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from<Row>('profiles') // change table name here if yours differs
    .select('stripe_customer_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.stripe_customer_id ?? null;
}
