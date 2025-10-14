export const revalidate = 0; // no caching
export const dynamic = 'force-dynamic'; // always SSR

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import TendersDashboard from './tenders-dashboard';
import type { Tender } from '@/types/tenders';

// Next 15: searchParams is a Promise
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TendersPage(
  { searchParams }: { searchParams: SearchParams }
) {
  const supabase = await createSupabaseServerClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // read query
  const sp = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const perPage = 30;
  const pageRaw = one(sp?.page) ?? '1';
  const pageNum = Number.parseInt(pageRaw, 10);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  // NOTE: alias the mixed-case column
  const { data, count, error } = await supabase
    .from('tenders_staging')
    .select(
      'id,title_ai,description_long:"Description_long",publication_date,deadline_date,link',
      { count: 'exact' }
    )
    .order('publication_date', { ascending: false })
    .range(from, to);

  if (error) {
    return (
      <div className="p-6 text-red-600 text-sm">
        {error.message}
      </div>
    );
  }

  const tenders: Tender[] = (data ?? []) as Tender[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <TendersDashboard
      tenders={tenders}
      currentPage={currentPage}
      totalPages={totalPages}
      totalTenders={total}
      hasPrev={currentPage > 1}
      hasNext={currentPage < totalPages}
    />
  );
}
