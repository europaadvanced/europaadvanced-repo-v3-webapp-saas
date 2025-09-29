export const revalidate = 0;            // no caching
export const dynamic = 'force-dynamic'; // always SSR

import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

function sb() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set: (n: string, v: string, o: any) => cookieStore.set({ name: n, value: v, ...o }),
        remove: (n: string, o: any) => cookieStore.set({ name: n, value: '', ...o, maxAge: 0 }),
      },
    }
  );
}

type SP = { page?: string };

export default async function TendersPage({
  // ✅ Next 15 expects Promise here
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const supabase = sb();

  // Auth guard
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect('/login');

  // Resolve search params
  const resolved = (await searchParams) ?? {};
  const page = Math.max(1, Number(resolved.page ?? '1'));

  // Pagination
  const perPage = 30;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('tenders')
    .select('*', { count: 'exact' })
    .order('publication_date', { nulls: 'last' })
    .range(from, to);

  if (error) return <p className="text-red-500">{error.message}</p>;

  const total = count ?? 0;
  const hasPrev = page > 1;
  const hasNext = to + 1 < total;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tenders</h1>

      <ul className="divide-y">
        {(data ?? []).map((row) => (
          <li key={row.id ?? row.link} className="py-3">
            <div className="font-medium">{row.title_ai ?? row.link}</div>
            <div className="text-sm text-muted-foreground">{row.issuing_authority}</div>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        {hasPrev ? <Link href={`/tenders?page=${page - 1}`} className="btn">Prev</Link> : null}
        <span className="text-sm">Page {page}</span>
        {hasNext ? <Link href={`/tenders?page=${page + 1}`} className="btn">Next</Link> : null}
      </div>
    </div>
  );
}
