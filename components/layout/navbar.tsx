"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Building2,
  Globe,
  Menu,
  Heart,
  Settings,
  LogOut,
  User,
  Home,
} from "lucide-react";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const userRole =
    (user as { role?: string } | undefined)?.role || "TENANT";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  const getNavLinks = () => {
    const baseLinks = [{ href: "/units", label: "Browse condos", icon: Home }];
    if (!user) return baseLinks;

    // Page-level navigation now lives in role-specific sub-navs above the
    // page (AdminSubNav / OwnerSubNav / TenantSubNav). Keep the avatar
    // dropdown focused on profile/account actions only.
    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#EBEBEB] text-[#222222]"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 flex h-16 md:h-[4.5rem] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0484F] to-[#D5256E] text-white shadow-[0_4px_12px_-3px_rgba(224,72,79,0.5)] group-hover:shadow-[0_8px_18px_-3px_rgba(224,72,79,0.6)] transition-shadow">
            <Building2 className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span
            className="text-[1.35rem] font-extrabold tracking-[-0.02em] text-[#222222]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            kondo<span className="text-[#E0484F]">hub</span>
          </span>
        </Link>

        {/* Right nav */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link
            href="/signup?role=owner"
            className="hidden md:inline-block text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
          >
            List your condo
          </Link>

          <button
            className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors"
            aria-label="Language"
          >
            <Globe className="h-4 w-4 text-[#222222]" />
          </button>

          {isPending ? (
            <div className="h-10 w-[4.5rem] rounded-full bg-[#F7F7F7] animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group inline-flex items-center gap-2 border border-[#E5E7EB] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] rounded-full pl-3 pr-1.5 py-1.5 transition-shadow">
                  <Menu className="h-4 w-4 text-[#222222]" />
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.image || undefined} alt={user.name} />
                    <AvatarFallback className="bg-[#222222] text-white text-xs font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-2xl p-2 border-[#EBEBEB] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)]"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal px-3 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={user.image || undefined} alt={user.name} />
                      <AvatarFallback className="bg-[#FDE8E4] text-[#C13947] font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#222222] truncate">{user.name}</p>
                      <p className="text-xs text-[#717171] truncate">{user.email}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#E0484F] font-semibold mt-0.5">
                        {userRole.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild className="rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4 text-[#717171]" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                  <Link href="/wishlist">
                    <Heart className="mr-2 h-4 w-4 text-[#717171]" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4 text-[#717171]" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="rounded-lg px-3 py-2.5 text-sm cursor-pointer focus:bg-[#FDE8E4] focus:text-[#C13947]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden md:inline-block text-sm font-semibold text-[#222222] px-4 py-2 rounded-full hover:bg-[#F7F7F7] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden md:inline-flex items-center gap-2 bg-[#222222] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#E0484F] transition-colors"
              >
                Start booking
              </Link>

              {/* Mobile account pill */}
              <Sheet>
                <SheetTrigger className="md:hidden inline-flex items-center gap-2 border border-[#E5E7EB] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] rounded-full pl-3 pr-1.5 py-1.5 transition-shadow">
                  <Menu className="h-4 w-4 text-[#222222]" />
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#222222] text-white">
                    <User className="h-3.5 w-3.5" />
                  </span>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white border-l border-[#EBEBEB] p-6">
                  <div className="flex items-center gap-2 pt-1">
                    <span className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#E0484F] to-[#D5256E] text-white">
                      <Building2 className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <span
                      className="text-xl font-extrabold tracking-[-0.02em]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      kondo<span className="text-[#E0484F]">hub</span>
                    </span>
                  </div>

                  <nav className="mt-8 flex flex-col">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-3 py-3 border-b border-[#EBEBEB] text-[#222222] font-medium"
                      >
                        <link.icon className="h-4 w-4 text-[#717171]" />
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href="/signup?role=owner"
                      className="flex items-center gap-3 py-3 border-b border-[#EBEBEB] text-[#222222] font-medium"
                    >
                      <Building2 className="h-4 w-4 text-[#717171]" />
                      List your condo
                    </Link>
                  </nav>

                  <div className="mt-8 flex flex-col gap-3">
                    <Link
                      href="/signup"
                      className="text-center bg-[#222222] text-white py-3 rounded-full text-sm font-semibold"
                    >
                      Start booking
                    </Link>
                    <Link
                      href="/login"
                      className="text-center border border-[#E5E7EB] py-3 rounded-full text-sm font-semibold text-[#222222]"
                    >
                      Sign in
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
