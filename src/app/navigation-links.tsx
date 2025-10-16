"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/utils/cn";

type LinkItem = {
  href: string;
  label: string;
};

type NavigationLinksProps = {
  links: LinkItem[];
  className?: string;
  linkClassName?: string;
};

export function NavigationLinks({
  links,
  className,
  linkClassName,
}: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className={className}>
      {links.map(({ href, label }) => {
        const isActive = pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              isActive
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
              linkClassName
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
