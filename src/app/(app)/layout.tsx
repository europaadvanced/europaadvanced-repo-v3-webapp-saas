import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto,1fr]">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-3">
          <Link href="/tenders" className="font-semibold">
            Sredstva.ai
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
    </div>
  );
}
