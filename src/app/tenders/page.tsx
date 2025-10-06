export const revalidate = 0; // no caching
export const dynamic = 'force-dynamic'; // always SSR

import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import TendersDashboard from './tenders-dashboard';

type Tender = {
  id: string;
  title_ai: string | null;
  description_long: string | null;
  publication_date: string | null;
  deadline_date: string | null;
  link: string | null;
};

export default async function TendersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServerClient();

  // Auth guard – redirect to login if no authenticated user is found.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login');
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const pageParam = resolvedSearchParams.page;
  const pageValue = Array.isArray(pageParam) ? pageParam[0] : pageParam;
@@ -36,138 +37,35 @@ export default async function TendersPage({

  const perPage = 30;
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('tenders_staging')
    .select(
      'id,title_ai,description_long,publication_date,deadline_date,link',
      { count: 'exact' }
    )
    .order('publication_date', { ascending: false, nullsFirst: false })
    .range(from, to);

  if (error) {
    return <p className="text-red-500">{error.message}</p>;
  }

  const tenders = (data as Tender[]) ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <TendersDashboard
      tenders={tenders}
      currentPage={currentPage}
      totalPages={totalPages}
      totalTenders={total}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}
