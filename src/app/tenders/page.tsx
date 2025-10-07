export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import TendersDashboard from './tenders-dashboard';

type Tender = {
  id: string;
  title: string | null;
  summary: string | null;
  description: string | null;
  publicationDate: string | null;
  deadlineDate: string | null;
  callStatus: string | null;
  issuingAuthority: string | null;
  fundingInstitution: string | null;
  callUrl: string | null;
  sourceLink: string | null;
  bullets: string[];
  applicationTips: string[];
  redFlags: string[];
  keywords: string[];
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
      [
        'id',
        'title_ai',
        'summary_ai',
        'description_long:"Description_long"',
        'publication_date',
        'deadline_date',
        'call_status',
        'issuing_authority',
        'funding_institution',
        'call_url',
        'source_link',
        'link',
        'bullets_ai',
        'application_tips',
        'red_flags',
        'keywords_ai',
      ].join(','),
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

  const splitLines = (value?: string | null) =>
    (value ?? '')
      .split(/\r?\n+/)
      .map((entry) => entry.replace(/^[\s•\-\u2022]+/, '').trim())
      .filter(Boolean);

  const splitDelimited = (value?: string | null) =>
    (value ?? '')
      .split(/[,;\n]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);

  const tenders: Tender[] = (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title_ai?.trim() ?? null,
    summary: r.summary_ai?.trim() ?? null,
    description: r.description_long?.trim() ?? null,
    publicationDate: r.publication_date ?? null,
    deadlineDate: r.deadline_date ?? null,
    callStatus: r.call_status?.trim() ?? null,
    issuingAuthority: r.issuing_authority?.trim() ?? null,
    fundingInstitution: r.funding_institution?.trim() ?? null,
    callUrl: r.call_url?.trim() ?? r.link?.trim() ?? null,
    sourceLink: r.source_link?.trim() ?? null,
    bullets: splitLines(r.bullets_ai),
    applicationTips: splitLines(r.application_tips),
    redFlags: splitLines(r.red_flags),
    keywords: splitDelimited(r.keywords_ai).map((kw: string) => kw.replace(/^#/, '')),
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
