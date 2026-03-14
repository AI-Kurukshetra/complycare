"use client"

import { useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarNav, navItems } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ComplianceChatbot } from "@/components/ai/compliance-chatbot"

const shellExcludedRoutes = [
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
  "/setup",
  "/landing",
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const hideShell = shellExcludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  const breadcrumb = useMemo(() => {
    const match = navItems.find((item) =>
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    )
    return match?.label ?? "Dashboard"
  }, [pathname])

  if (hideShell) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header breadcrumb={breadcrumb} onOpenMobile={() => setMobileOpen(true)} />
          <div className="flex-1 px-4 py-6 lg:px-6">{children}</div>
        </div>
      </div>

      <ComplianceChatbot />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="flex h-full w-64 max-w-[85vw] flex-col bg-white px-4 py-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                  ComplyCare
                </p>
                <p className="text-sm text-slate-500">Compliance workspace</p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  )
}
