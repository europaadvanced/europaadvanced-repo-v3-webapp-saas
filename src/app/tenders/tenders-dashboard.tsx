'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/styles/tenders-ai.css'; // your exported CSS, namespaced

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

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '—');
  const linkHref = (t: Tender) => t.callUrl || t.sourceLink;

  const renderList = (title: string, items: string[], variant: 'default' | 'warning' = 'default') => {
    if (items.length === 0) return null;

    const accent =
      variant === 'warning'
        ? 'border-amber-300 bg-amber-50'
        : 'border-neutral-200 bg-neutral-50';
    const headingColor = variant === 'warning' ? 'text-amber-900' : 'text-neutral-800';
    const listTextColor = variant === 'warning' ? 'text-amber-900' : 'text-neutral-700';

    return (
      <section className={`rounded-lg border ${accent} p-4 space-y-2`}>
        <h3 className={`text-sm font-semibold ${headingColor}`}>{title}</h3>
        <ul className={`list-disc space-y-1 pl-5 text-sm ${listTextColor}`}>
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`}>{item}</li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <div className="tenders-ai min-h-screen bg-white text-neutral-900">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-semibold">Iskanje razpisov</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Najdenih razpisov: <strong>{totalTenders}</strong>
        </p>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-6 pb-10 space-y-4">
        {tenders.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6">
            No results.
          </div>
        )}

        {tenders.map((t) => (
          <article
            key={t.id}
            className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <header className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold leading-snug">
                  {t.title || 'Neimenovan razpis'}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
                  {t.callStatus && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-1 font-medium text-blue-700">
                      Status: {t.callStatus}
                    </span>
                  )}
                  {t.issuingAuthority && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1" title="Izdajatelj razpisa">
                      Izdajatelj: {t.issuingAuthority}
                    </span>
                  )}
                  {t.fundingInstitution && (
                    <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1" title="Financer">
                      Financer: {t.fundingInstitution}
                    </span>
                  )}
                </div>
              </div>
              {linkHref(t) && (
                <Link
                  href={linkHref(t)!}
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                  Odpri razpis →
                </Link>
              )}
            </header>

            <div className="space-y-2 text-sm text-neutral-700">
              {t.summary && <p>{t.summary}</p>}
              {!t.summary && t.description && <p>{t.description}</p>}
              {!t.summary && !t.description && (
                <p className="italic text-neutral-500">Povzetek ni na voljo.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
              <span className="rounded-full border px-2 py-1">
                Objavljeno: {fmtDate(t.publicationDate)}
              </span>
              <span className="rounded-full border px-2 py-1">
                Rok: {fmtDate(t.deadlineDate)}
              </span>
            </div>

            {renderList('Ključne informacije', t.bullets)}
            {renderList('Nasveti za prijavo', t.applicationTips)}
            {renderList('Opozorila', t.redFlags, 'warning')}

            {t.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {t.keywords.map((keyword, idx) => (
                  <span
                    key={`${t.id}-keyword-${idx}`}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600"
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}

        {/* Pagination */}
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
