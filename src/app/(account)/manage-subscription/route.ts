// src/app/(account)/manage-subscription/route.ts
import { redirect } from 'next/navigation';

import { getCustomerId } from '@/features/account/controllers/get-customer-id';
import { getSession } from '@/features/account/controllers/get-session';
import { stripeAdmin } from '@/libs/stripe/stripe-admin';
import { getURL } from '@/utils/get-url';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) throw Error('Could not get userId');

  const customerId = await getCustomerId(session.user.id);
  if (!customerId) throw Error('Could not get customer');

  const { url } = await stripeAdmin.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getURL()}/account`,
  });

  redirect(url);
}
