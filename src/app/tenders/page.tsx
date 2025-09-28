import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSession } from '@/features/account/controllers/get-session';
import { getSubscription } from '@/features/account/controllers/get-subscription';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

const PAGE_SIZE = 30;

type PageSearchParams = Record<string, string | string[] | undefined>;

export const dynamic = 'force-dynamic'; // don't cache SSR result

export default async function TendersPage({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const [session, subscription] = await Promise.all([getSession(), getSubscription()]);

  const requestedPageParam = searchParams?.page;
  const requestedPageValue = Array.isArray(requestedPageParam) ? requestedPageParam[0] : requestedPageParam;
  const requestedPageQuery = requestedPageValue ? `?page=${requestedPageValue}` : '';

  if (!session) {
    const redirectPath = `/tenders${requestedPageQuery}`;
    redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  }

  if (!subscription) {
    redirect('/pricing');
  }

  const parsedPage = Number(requestedPageValue ?? '1');
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const rangeStart = (currentPage - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;

  const supabase = await createSupabaseServerClient();

  const { data, error, count } = await supabase
    .from('tenders')
    .select('id, title_ai, link', { count: 'exact' })
    .order('id', { ascending: true })
    .range(rangeStart, rangeEnd);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Tenders</h1>
        <p className="mt-3 text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const tenders = data ?? [];
  const totalItems = typeof count === 'number' ? count : tenders.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 1;
  const boundedPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));

  if (boundedPage !== currentPage) {
    redirect(`/tenders?page=${boundedPage}`);
  }

  const showPagination = totalPages > 1;
  const fromItem = totalItems === 0 ? 0 : rangeStart + 1;
  const toItem = totalItems === 0 ? 0 : Math.min(rangeStart + tenders.length, totalItems);

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-semibold">Tenders</h1>
      {!tenders.length ? (
        <p>No tenders found.</p>
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-400">
            Showing {fromItem}-{toItem} of {totalItems} tenders
          </p>
          <ul className="space-y-2">
            {tenders.map((tender) => (
              <li key={tender.id} className="rounded border p-3">
                <div className="font-medium">{tender.title_ai ?? 'Untitled'}</div>
                {tender.link ? (
                  <a
                    href={tender.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    Open source
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
          {showPagination ? (
            <div className="mt-6 flex items-center justify-between">
              <Link
                className={`rounded border px-4 py-2 text-sm ${boundedPage === 1 ? 'pointer-events-none opacity-40' : ''}`}
                href={`/tenders?page=${Math.max(1, boundedPage - 1)}`}
                aria-disabled={boundedPage === 1}
              >
                Previous
              </Link>
              <span className="text-sm text-neutral-400">
                Page {boundedPage} of {totalPages}
              </span>
              <Link
                className={`rounded border px-4 py-2 text-sm ${boundedPage >= totalPages ? 'pointer-events-none opacity-40' : ''}`}
                href={`/tenders?page=${Math.min(totalPages, boundedPage + 1)}`}
                aria-disabled={boundedPage >= totalPages}
              >
                Next
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
