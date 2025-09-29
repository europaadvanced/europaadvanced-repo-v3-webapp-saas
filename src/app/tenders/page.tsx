export const revalidate = 0; // no caching
export const dynamic = 'force-dynamic'; // always SSR

import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

type Tender = {
  id: string;
  title: string | null;
  summary: string | null;
  publication_date: string | null;
  deadline_date: string | null;
  source_url: string | null;
};

type SearchParams = { page?: string };

async function getSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name: string, options: any) =>
          cookieStore.set({ name, value: '', ...options, maxAge: 0 }),
      },
    }
  );
}

export default async function TendersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const supabase = await getSupabaseServerClient();

  // Auth guard – redirect to login if no authenticated user is found.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login');
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const currentPage = Math.max(1, Number(resolvedSearchParams.page ?? '1'));

  const perPage = 30;
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('tenders')
    .select('*', { count: 'exact' })
    .order('publication_date', { nulls: 'last' })
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

          {tenders.map((tender) => (
            <li key={tender.id} className="flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-medium">
                  {tender.title ?? 'Untitled tender'}
                </h2>
                {tender.summary ? (
                  <p className="text-sm text-muted-foreground">
                    {tender.summary}
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
                    {tender.source_url ? (
                      <a
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                        href={tender.source_url}
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
          ))}
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
