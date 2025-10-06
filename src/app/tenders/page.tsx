export const revalidate = 0; // no caching
export const dynamic = 'force-dynamic'; // always SSR

import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

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
  const parsedPage = Number.parseInt(pageValue ?? '1', 10);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Tenders</h1>
        <p className="text-muted-foreground">
          Browse the latest tenders that have been synced from your Supabase
          project.
        </p>
      </header>

      <section className="rounded-lg border bg-background shadow-sm">
        <ul className="divide-y">
          {tenders.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              No tenders found.
            </li>
          )}

          {tenders.map((tender) => {
            const normalizedSummary =
              tender.description_long?.replace(/\s+/g, ' ').trim() ?? null;
            const summarySnippet =
              normalizedSummary && normalizedSummary.length > 280
                ? `${normalizedSummary.slice(0, 280)}…`
                : normalizedSummary;

            return (
              <li key={tender.id} className="flex flex-col gap-4 p-6">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-medium">
                    {tender.title_ai ?? 'Untitled tender'}
                  </h2>
                {summarySnippet ? (
                  <p className="text-sm text-muted-foreground">
                    {summarySnippet}
                  </p>
                ) : null}
                </div>

                <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="font-medium text-foreground">Published</dt>
                  <dd className="text-muted-foreground">
                    {tender.publication_date
                      ? new Date(tender.publication_date).toLocaleDateString()
                      : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-foreground">Deadline</dt>
                  <dd className="text-muted-foreground">
                    {tender.deadline_date
                      ? new Date(tender.deadline_date).toLocaleDateString()
                      : '—'}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-foreground">Source</dt>
                  <dd className="text-muted-foreground">
                    {tender.link ? (
                      <a
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                        href={tender.link}
                      >
                        View tender
                      </a>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              </dl>
            </li>
            );
          })}
        </ul>
      </section>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between gap-4 text-sm">
          {hasPrev ? (
            <Link
              className="text-primary underline"
              href={`/tenders?page=${currentPage - 1}`}
            >
              ← Previous
            </Link>
          ) : (
            <span className="text-muted-foreground">← Previous</span>
          )}

          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          {hasNext ? (
            <Link
              className="text-primary underline"
              href={`/tenders?page=${currentPage + 1}`}
            >
              Next →
            </Link>
          ) : (
            <span className="text-muted-foreground">Next →</span>
          )}
        </nav>
      )}
    </main>
  );
}
