// Server component
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function sb() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string)       { return cookieStore.get(name)?.value },
        set() { /* noop for server components */ },
        remove() { /* noop for server components */ },
      },
    }
  )
}

export default async function TendersPage() {
  const supabase = sb()

  // adjust fields to what you actually have
  const { data, error } = await supabase
    .from('tenders')
    .select('id, title_ai, publication_date, deadline_date, link')
    .order('publication_date', { ascending: false })
    .limit(50)

  if (error) {
    return <div className="p-6">Failed to load tenders: {error.message}</div>
  }

  if (!data?.length) {
    return <div className="p-6">No tenders yet.</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Latest Tenders</h1>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Published</th>
            <th className="py-2 pr-4">Deadline</th>
            <th className="py-2">Link</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id} className="border-b">
              <td className="py-2 pr-4">{row.title_ai ?? '—'}</td>
              <td className="py-2 pr-4">{row.publication_date ?? '—'}</td>
              <td className="py-2 pr-4">{row.deadline_date ?? '—'}</td>
              <td className="py-2">
                {row.link ? <a className="underline" href={row.link} target="_blank">Open</a> : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
