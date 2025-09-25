// src/app/tenders/page.tsx
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic"; // don't cache SSR result

export default async function TendersPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set() {}, // not needed for a read page
        remove() {},
      },
    }
  );

  const { data, error } = await supabase
    .from("tenders")
    .select("id, title_ai, link")
    .order("id", { ascending: true })
    .limit(50);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Tenders</h1>
        <p className="text-red-500 mt-3">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Tenders</h1>
      {!data?.length ? (
        <p>No tenders yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.map((t) => (
            <li key={t.id} className="border p-3 rounded">
              <div className="font-medium">{t.title_ai ?? "Untitled"}</div>
              {t.link ? (
                <a
                  href={t.link}
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
      )}
    </div>
  );
}
