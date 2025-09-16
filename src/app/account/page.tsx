import { redirect } from 'next/navigation';
import { getSession } from '@/features/account/controllers/get-session';
import ManageBillingButton from '@/components/manage-billing-button';

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) redirect('/auth/login');

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-xl">Account</h1>
      <p>Manage your subscription and billing.</p>
      <ManageBillingButton />
    </main>
  );
}
