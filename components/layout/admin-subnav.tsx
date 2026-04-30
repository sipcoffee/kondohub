"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  Settings,
} from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/units", label: "Units", icon: Building2 },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSubNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 md:top-[4.5rem] z-30 bg-white/95 backdrop-blur border-b border-[#EBEBEB]">
      <nav className="mx-auto max-w-7xl px-5 md:px-8">
        <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));
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
