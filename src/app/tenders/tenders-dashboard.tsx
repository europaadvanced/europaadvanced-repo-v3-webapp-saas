'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type Tender = {
  id: string;
  title_ai: string | null;
  description_long: string | null;
  publication_date: string | null;
  deadline_date: string | null;
  link: string | null;
};

export default function TendersDashboard(props: {
  tenders: Tender[];
  currentPage: number;
  totalPages: number;
  totalTenders: number;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const { tenders, currentPage, totalPages, totalTenders, hasPrev, hasNext } = props;
  const router = useRouter();
  const sp = useSearchParams();

  const setPage = (p: number) => {
    const qs = new URLSearchParams(sp?.toString() ?? '');
    qs.set('page', String(p));
    router.push(`?${qs.toString()}`);
  };

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="ga-tenders min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Iskanje razpisov</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Najdenih razpisov: <strong>{totalTenders}</strong>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-10 space-y-4">
        {tenders.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            No results.
          </div>
        ) : (
          tenders.map((t) => (
            <article
              key={t.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-medium leading-snug">
                  {t.title_ai || 'Untitled call'}
                </h2>
                {t.link && (
                  <Link
                    href={t.link}
                    target="_blank"
                    className="text-sm underline underline-offset-2"
                  >
                    Odpri razpis →
                  </Link>
                )}
              </div>

              <p className="mt-2 text-sm text-neutral-700 line-clamp-3">
                {t.description_long || 'No summary available.'}
              </p>

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600">
                <span className="rounded-full border px-2 py-1">
                  Objavljeno: {fmt(t.publication_date)}
                </span>
                <span className="rounded-full border px-2 py-1">
                  Rok: {fmt(t.deadline_date)}
                </span>
              </div>
            </article>
          ))
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => hasPrev && setPage(currentPage - 1)}
            disabled={!hasPrev}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <div className="text-sm">
            Page {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => hasNext && setPage(currentPage + 1)}
            disabled={!hasNext}
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
