"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  Settings,
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/units", label: "Browse condos", icon: Home },
  { href: "/bookings", label: "My stays", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function TenantSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 md:top-[4.5rem] z-30 bg-white/95 backdrop-blur border-b border-[#EBEBEB]">
      <nav className="mx-auto max-w-7xl px-5 md:px-8">
        <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 md:px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? "text-[#222222] border-[#222222]"
                      : "text-[#717171] border-transparent hover:text-[#222222] hover:border-[#EBEBEB]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
