import Link from 'next/link';
import { IoMenu } from 'react-icons/io5';

import { AccountMenu } from '@/components/account-menu';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { getSession } from '@/features/account/controllers/get-session';

import { signOut } from './(auth)/auth-actions';

export async function Navigation() {
  const session = await getSession();

  return (
    <div className="relative flex items-center gap-6">
      {session ? (
        <>
          {/* desktop links when signed in */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/app">App</Link>
            <Link href="/tenders">Tenders</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/account">Account</Link>
          </nav>

          <AccountMenu signOut={signOut} />

          {/* mobile menu when signed in */}
          <Sheet>
            <SheetTrigger className="block lg:hidden">
              <IoMenu size={28} />
            </SheetTrigger>
            <SheetContent className="w-full bg-black">
              <SheetHeader>
                <Logo />
                <SheetDescription className="py-8">
                  <div className="grid gap-4 text-lg">
                    <Link href="/app">App</Link>
                    <Link href="/tenders">Tenders</Link>
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/account">Account</Link>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          {/* desktop links when signed out */}
          <nav className="hidden lg:flex items-center gap-4">
            <Link href="/pricing">Pricing</Link>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </nav>

          <Button variant="sexy" className="hidden flex-shrink-0 lg:flex" asChild>
            <Link href="/signup">Get started for free</Link>
          </Button>

          {/* mobile menu when signed out */}
          <Sheet>
            <SheetTrigger className="block lg:hidden">
              <IoMenu size={28} />
            </SheetTrigger>
            <SheetContent className="w-full bg-black">
              <SheetHeader>
                <Logo />
                <SheetDescription className="py-8">
                  <div className="grid gap-4 text-lg">
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/auth/login">Login</Link>
                    <Link href="/auth/register">Register</Link>
                  </div>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
