'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeCheck,
  BellRing,
  BookMarked,
  CalendarDays,
  Clock8,
  Filter,
  LayoutGrid,
  LucideIcon,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';

export type TenderRecord = {
  id: string;
  title_ai: string | null;
  description_long: string | null;
  publication_date: string | null;
  deadline_date: string | null;
  link: string | null;
};

interface NavigationItem {
  label: string;
  description: string;
  icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Iskanje razpisov',
    description: 'Aktivni javni razpisi in razlage',
    icon: Search,
    active: true,
  },
  {
    label: 'Shranjeni razpisi',
    description: 'Hitri dostop do shranjenih priložnosti',
    icon: BookMarked,
    disabled: true,
  },
  {
    label: 'Shranjena iskanja',
    description: 'Avtomatizirana obveščanja',
    icon: BellRing,
    disabled: true,
  },
  {
    label: 'AI asistent',
    description: 'Povzetki in predlogi prilagojeni vam',
    icon: Sparkles,
    disabled: true,
  },
  {
    label: 'Profil in nastavitve',
    description: 'Nastavitve organizacije in ekipe',
    icon: UserRound,
    disabled: true,
  },
];

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

function formatDate(value: string | null) {
  if (!value) {
    return 'Ni podatka';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Ni podatka';
  }

  return new Intl.DateTimeFormat('sl-SI', DATE_FORMAT).format(date);
}

function getDeadlineLabel(value: string | null) {
  if (!value) {
    return {
      tone: 'secondary' as const,
      label: 'Brez roka',
    };
  }

  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) {
    return {
      tone: 'secondary' as const,
      label: 'Brez roka',
    };
  }

  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      tone: 'muted' as const,
      label: 'Rok zaključen',
    };
  }

  if (days <= 7) {
    return {
      tone: 'urgent' as const,
      label: `Rok čez ${days === 0 ? 'manj kot 24h' : `${days} dni`}`,
    };
  }

  if (days <= 30) {
    return {
      tone: 'warning' as const,
      label: `Rok čez ${days} dni`,
    };
  }

  return {
    tone: 'success' as const,
    label: `Rok ${formatDate(value)}`,
  };
}

type Tone = 'primary' | 'secondary' | 'warning' | 'success' | 'muted' | 'urgent';

function toneStyles(tone: Tone) {
  switch (tone) {
    case 'primary':
      return 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/40';
    case 'warning':
      return 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/30';
    case 'success':
      return 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
    case 'urgent':
      return 'bg-rose-500/10 text-rose-200 ring-1 ring-inset ring-rose-500/40';
    case 'muted':
      return 'bg-slate-700/40 text-slate-300 ring-1 ring-inset ring-slate-600/40';
    case 'secondary':
    default:
      return 'bg-slate-800/70 text-slate-300 ring-1 ring-inset ring-slate-700/60';
  }
}

interface TendersDashboardProps {
  tenders: TenderRecord[];
  currentPage: number;
  totalPages: number;
  totalTenders: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function TendersDashboard({
  tenders,
  currentPage,
  totalPages,
  totalTenders,
  hasPrev,
  hasNext,
}: TendersDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTenders = useMemo(() => {
    if (!searchQuery.trim()) {
      return tenders;
    }

    const normalizedQuery = searchQuery.toLowerCase();
    return tenders.filter((tender) => {
      const title = tender.title_ai?.toLowerCase() ?? '';
      const summary = tender.description_long?.toLowerCase() ?? '';

      return title.includes(normalizedQuery) || summary.includes(normalizedQuery);
    });
  }, [searchQuery, tenders]);

  const now = useMemo(() => new Date(), []);
  const newThisWeek = useMemo(() => {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    return tenders.filter((tender) => {
      if (!tender.publication_date) {
        return false;
      }

      const publication = new Date(tender.publication_date);
      if (Number.isNaN(publication.getTime())) {
        return false;
      }

      return publication >= weekAgo;
    }).length;
  }, [now, tenders]);

  const closingSoon = useMemo(() => {
    const inFourteenDays = new Date(now);
    inFourteenDays.setDate(now.getDate() + 14);

    return tenders.filter((tender) => {
      if (!tender.deadline_date) {
        return false;
      }

      const deadline = new Date(tender.deadline_date);
      if (Number.isNaN(deadline.getTime())) {
        return false;
      }

      return deadline >= now && deadline <= inFourteenDays;
    }).length;
  }, [now, tenders]);

  const latestUpdate = useMemo(() => {
    const timestamps = tenders
      .map((tender) => (tender.publication_date ? new Date(tender.publication_date).getTime() : null))
      .filter((value): value is number => value != null && !Number.isNaN(value));

    if (timestamps.length === 0) {
      return 'Ni nedavnih posodobitev';
    }

    const formatted = new Intl.DateTimeFormat('sl-SI', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(Math.max(...timestamps)));

    return `Zadnja posodobitev ${formatted}`;
  }, [tenders]);

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950/80 px-6 py-10 backdrop-blur-lg lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Europa Advanced</p>
          <h1 className="mt-4 text-2xl font-semibold text-white">Razpisni nadzorni center</h1>
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-3">
          {navigationItems.map(({ label, description, icon: Icon, active, disabled }) => (
            <button
              key={label}
              type="button"
              disabled={disabled && !active}
              className={`group flex flex-col rounded-2xl border border-white/10 px-5 py-4 text-left transition duration-200 hover:border-sky-400/40 hover:bg-slate-900/70 ${
                active
                  ? 'border-sky-400/60 bg-slate-900/60 shadow-[0_10px_40px_-20px_rgba(56,189,248,0.65)]'
                  : 'bg-slate-900/20 text-slate-400'
              } ${disabled && !active ? 'cursor-not-allowed opacity-60 hover:border-white/10 hover:bg-slate-900/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-200 transition group-hover:border-sky-400/40 group-hover:text-sky-200 ${
                    active ? 'border-sky-400/50 text-sky-200' : ''
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-200'}`}>{label}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </div>
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent p-5 text-sm text-slate-300">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Sparkles className="h-4 w-4 text-sky-300" />
            AI priporočila
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Pripravite osebna poročila, spremljajte konkurenco in avtomatizirajte prijave.
            Funkcionalnosti bodo aktivirane kmalu.
          </p>
        </div>
      </aside>

      <div className="flex w-full flex-col">
        <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 px-6 pb-16 pt-10 sm:px-10">
          <div className="absolute right-20 top-[-30px] hidden h-48 w-48 rounded-full bg-sky-500/20 blur-3xl sm:block" />
          <div className="relative z-10 max-w-5xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-sky-300/80">
                  <BadgeCheck className="h-3 w-3" />
                  Posodobljeno v realnem času
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
                  Inteligentno središče za razpise
                </h2>
                <p className="mt-4 max-w-2xl text-sm text-slate-300 sm:text-base">
                  Prebrskajte najsodobnejše evropske in nacionalne razpise, filtrirajte jih po vaših
                  kriterijih in pripravite ekipo na pravočasne prijave.
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-200">
                    <LayoutGrid className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status platforme</p>
                    <p className="text-sm font-semibold text-white">Sinhronizacija aktivna</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{latestUpdate}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Aktivni razpisi"
                value={totalTenders.toLocaleString('sl-SI')}
                description="Vsi razpisi v Supabase bazi"
                tone="primary"
              />
              <SummaryCard
                title="Novi ta teden"
                value={newThisWeek.toLocaleString('sl-SI')}
                description="Dodani v zadnjih 7 dneh"
                tone="success"
              />
              <SummaryCard
                title="Roki v 14 dneh"
                value={closingSoon.toLocaleString('sl-SI')}
                description="Priložnosti, ki se hitro zapirajo"
                tone="warning"
              />
              <SummaryCard
                title="Priporočila AI"
                value="Kmalu"
                description="Samodejni predlogi razpisov"
                tone="secondary"
              />
            </div>
          </div>
        </header>

        <main className="-mt-12 flex-1 space-y-10 px-4 pb-16 sm:px-8">
          <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_25px_80px_-40px_rgba(15,118,230,0.55)] backdrop-blur">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
                <Search className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <label className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                    Hitro iskanje
                  </label>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Npr. digitalizacija, raziskave, EU Cohesion..."
                    className="mt-1 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                >
                  <Filter className="h-4 w-4" />
                  Filtri
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                >
                  <Clock8 className="h-4 w-4" />
                  Razpisi v teku
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                >
                  <CalendarDays className="h-4 w-4" />
                  Datum objave
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Chip label="EU Programi" active />
              <Chip label="ESIF & kohezijski skladi" />
              <Chip label="Digitalna transformacija" />
              <Chip label="Kmetijstvo & prehrana" />
              <Chip label="Trajnost & energija" />
              <Chip label="Inovacije & R&D" />
            </div>
          </section>

          <section className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              {filteredTenders.length === 0 ? (
                <EmptyState query={searchQuery} />
              ) : (
                filteredTenders.map((tender) => {
                  const deadline = getDeadlineLabel(tender.deadline_date);
                  const isNew = (() => {
                    if (!tender.publication_date) {
                      return false;
                    }

                    const publication = new Date(tender.publication_date);
                    if (Number.isNaN(publication.getTime())) {
                      return false;
                    }

                    const diffInDays = Math.floor((now.getTime() - publication.getTime()) / (1000 * 60 * 60 * 24));
                    return diffInDays <= 7;
                  })();

                  const summary = tender.description_long
                    ?.replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 360);

                  return (
                    <article
                      key={tender.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-[0_18px_60px_-45px_rgba(125,211,252,0.9)] transition duration-200 hover:border-sky-400/50 hover:shadow-[0_25px_70px_-45px_rgba(14,165,233,0.9)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                            toneStyles(isNew ? 'primary' : 'secondary')
                          }`}
                          >
                            {isNew ? 'Novo' : 'Razpis'}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneStyles(deadline.tone)}`}
                          >
                            {deadline.label}
                          </span>
                        </div>
                        <Link
                          href={tender.link ?? '#'}
                          target={tender.link ? '_blank' : undefined}
                          rel="noreferrer"
                          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300 transition hover:text-sky-200"
                        >
                          <span>Odpri razpis</span>
                          <ArrowUpRightIcon />
                        </Link>
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-white lg:text-2xl">
                        {tender.title_ai ?? 'Razpis brez naslova'}
                      </h3>
                      {summary ? (
                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                          {summary}
                          {tender.description_long && tender.description_long.length > 360 ? '…' : ''}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-slate-400">
                          Povzetek razpisa trenutno ni na voljo.
                        </p>
                      )}

                      <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                          <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Objavljeno</dt>
                          <dd className="mt-1 text-sm font-medium text-white">{formatDate(tender.publication_date)}</dd>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                          <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Rok oddaje</dt>
                          <dd className="mt-1 text-sm font-medium text-white">{formatDate(tender.deadline_date)}</dd>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                          <dt className="text-xs uppercase tracking-[0.3em] text-slate-500">Status</dt>
                          <dd className="mt-1 text-sm font-medium text-white">
                            {deadline.tone === 'muted'
                              ? 'Zaključen'
                              : deadline.tone === 'urgent'
                                ? 'Pohitite z oddajo'
                                : 'Aktiven'}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                        >
                          Shrani za kasneje
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                        >
                          Deli z ekipo
                        </button>
                      </div>
                    </article>
                  );
                })
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasPrev={hasPrev}
                hasNext={hasNext}
              />
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-sky-300" />
                  <h4 className="text-lg font-semibold text-white">Pametni povzetki</h4>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Na voljo bo AI asistent, ki bo pripravil ključne poudarke razpisa, ocenil fit za vašo
                  organizacijo in predlagal naslednje korake.
                </p>
                <button
                  type="button"
                  className="mt-5 w-full rounded-full border border-sky-400/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-200 transition hover:bg-sky-500/20"
                >
                  Obvesti me ob zagonu
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
                <div className="flex items-center gap-3">
                  <BellRing className="h-5 w-5 text-sky-300" />
                  <h4 className="text-lg font-semibold text-white">Obvestila o razpisih</h4>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Nastavite dnevna ali tedenska poročila za ekipo in nikoli ne zamudite pomembnega
                  razpisa. Funkcionalnost je v pripravi.
                </p>
              </div>
            </aside>
          </section>
        </main>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: Tone;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-slate-300 shadow-[0_18px_60px_-35px_rgba(125,211,252,0.7)] ${toneStyles(
        tone
      )}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/70">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-200/70">{description}</p>
    </div>
  );
}

function Chip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
        active
          ? 'border-sky-400/60 bg-sky-500/10 text-sky-200 shadow-[0_12px_40px_-30px_rgba(14,165,233,1)]'
          : 'border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-sky-400/40 hover:text-sky-200'
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/80 p-12 text-center text-slate-300">
      <Search className="h-10 w-10 text-slate-500" />
      <h3 className="mt-6 text-xl font-semibold text-white">Ni zadetkov</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        {query
          ? `Za pojem "${query}" trenutno ni razpisov na tej strani. Poskusite z drugačnimi ključnimi besedami ali počakajte na nove sinhronizacije.`
          : 'Trenutno ni razpisov za prikaz. Ko bodo sinhronizirani novi zapisi, se bodo pojavili tukaj.'}
      </p>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  hasPrev,
  hasNext,
}: {
  currentPage: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const previousHref = `/tenders?page=${Math.max(1, currentPage - 1)}`;
  const nextHref = `/tenders?page=${Math.min(totalPages, currentPage + 1)}`;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/80 px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
      {hasPrev ? (
        <Link
          href={previousHref}
          className="flex items-center gap-2 text-sky-300 transition hover:text-sky-200"
        >
          <span>← Nazaj</span>
        </Link>
      ) : (
        <span className="text-slate-600">← Nazaj</span>
      )}

      <span className="text-slate-400">
        Stran {currentPage} / {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={nextHref}
          className="flex items-center gap-2 text-sky-300 transition hover:text-sky-200"
        >
          <span>Naprej →</span>
        </Link>
      ) : (
        <span className="text-slate-600">Naprej →</span>
      )}
    </nav>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}
