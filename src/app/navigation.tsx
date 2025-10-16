import { IoMenu } from "react-icons/io5";

import { AccountMenu } from "@/components/account-menu";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from "@/components/ui/sheet";
import { getSession } from "@/features/account/controllers/get-session";

import { signOut } from "./(auth)/auth-actions";
import { NavigationLinks } from "./navigation-links";

const signedInLinks = [
  { href: "/app", label: "App" },
  { href: "/tenders", label: "Tenders" },
  { href: "/tenders-ga", label: "Javni razpisi" },
  { href: "/pricing", label: "Pricing" },
  { href: "/account", label: "Account" },
];

const signedOutLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Register" },
];

export async function Navigation() {
  const session = await getSession();

  return (
    <div className="relative flex items-center gap-6">
      {session ? (
        <>
          {/* desktop links when signed in */}
          <NavigationLinks
            links={signedInLinks}
            className="hidden gap-4 lg:flex lg:items-center"
            linkClassName="text-sm"
          />

          <AccountMenu signOut={signOut} />

          {/* mobile menu when signed in */}
          <Sheet>
            <SheetTrigger className="block lg:hidden">
              <IoMenu size={28} />
            </SheetTrigger>
            <SheetContent className="w-full bg-card">
              <SheetHeader>
                <Logo />
                <SheetDescription className="py-8">
                  <NavigationLinks
                    links={signedInLinks}
                    className="grid gap-4"
                    linkClassName="text-lg"
                  />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          {/* desktop links when signed out */}
          <NavigationLinks
            links={signedOutLinks}
            className="hidden gap-4 lg:flex lg:items-center"
            linkClassName="text-sm"
          />

          {/* mobile menu when signed out */}
          <Sheet>
            <SheetTrigger className="block lg:hidden">
              <IoMenu size={28} />
            </SheetTrigger>
            <SheetContent className="w-full bg-card">
              <SheetHeader>
                <Logo />
                <SheetDescription className="py-8">
                  <NavigationLinks
                    links={signedOutLinks}
                    className="grid gap-4"
                    linkClassName="text-lg"
                  />
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
