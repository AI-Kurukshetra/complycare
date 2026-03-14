"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Security", href: "/security" },
  { label: "Operations", href: "/operations" },
  { label: "Governance", href: "/governance" },
  { label: "Training", href: "/training" },
  { label: "Documents", href: "/documents" },
  { label: "Insights", href: "/insights" },
  { label: "Reports", href: "/reports" },
  { label: "Scale", href: "/scale" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Team", href: "/settings/team" },
  { label: "Lab", href: "/lab" },
]

type SidebarNavProps = {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
              isActive && "bg-slate-200/70 text-slate-900"
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          ComplyCare
        </p>
        <p className="text-sm text-slate-500">Compliance workspace</p>
      </div>
      <SidebarNav />
    </aside>
  )
}
