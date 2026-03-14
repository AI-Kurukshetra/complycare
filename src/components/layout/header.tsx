"use client"

import { useEffect, useRef, useState } from "react"
import { Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { NotificationBell } from "@/components/layout/notification-bell"
import { OrgSwitcher } from "@/components/layout/org-switcher"
import { useRouter } from "next/navigation"

type HeaderProps = {
  breadcrumb: string
  onOpenMobile?: () => void
}

export function Header({ breadcrumb, onOpenMobile }: HeaderProps) {
  const [userInitials, setUserInitials] = useState("CC")
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let active = true
    async function loadHeader() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) return

      if (active) {
        const email = user.email ?? ""
        const initials = email
          ? email
              .split("@")[0]
              .split(/[._-]/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")
          : "CC"
        setUserInitials(initials || "CC")
      }

    }

    loadHeader()
    return () => {
      active = false
    }
  }, [])

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        {onOpenMobile ? (
          <Button variant="ghost" size="icon" onClick={onOpenMobile} className="lg:hidden">
            <Menu />
          </Button>
        ) : null}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {breadcrumb}
          </p>
          <OrgSwitcher />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex size-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {userInitials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-md border border-slate-200 bg-white shadow-md z-50">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
