export const revalidate = 0;
export const dynamic = 'force-dynamic';

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

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TendersPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const sp = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  const perPage = 30;
  const pageRaw = one(sp?.page) ?? '1';
  const pageNum = Number.parseInt(pageRaw, 10);
  const currentPage = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;

  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('tenders_staging')
    .select(
      // alias the mixed-case column so TS stays simple
      'id,title_ai,description_long:"Description_long",publication_date,deadline_date,link',
      { count: 'exact' }
    )
    .order('publication_date', { ascending: false })
    .range(from, to);

  if (error) {
    // keep page alive; show inline error but do not blank the whole UI
    return (
      <div className="p-6">
        <div className="text-red-600 text-sm font-medium">{error.message}</div>
      </div>
    );
  }

  const tenders: Tender[] = (data ?? []).map((r: any) => ({
    id: r.id,
    title_ai: r.title_ai ?? null,
    description_long: r.description_long ?? null,
    publication_date: r.publication_date ?? null,
    deadline_date: r.deadline_date ?? null,
    link: r.link ?? null,
  }));

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
