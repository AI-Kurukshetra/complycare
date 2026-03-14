"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

const publicRoutes = ["/login", "/signup", "/reset-password", "/update-password", "/landing"]

export function AppGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    async function checkMembership() {
      const isPublicRoute =
        publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
        pathname === "/setup"

      if (isPublicRoute) {
        if (active) setReady(true)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase.auth.getUser()
      if (!active) return
      if (error || !data.user) {
        router.replace("/landing")
        return
      }

      const { data: membership } = await supabase
        .from("org_members")
        .select("organization_id")
        .eq("user_id", data.user.id)
        .limit(1)
        .maybeSingle()

      if (!active) return

      if (!membership?.organization_id) {
        router.replace("/setup")
        return
      }

      setReady(true)
    }

    checkMembership()

    return () => {
      active = false
    }
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-700">
        <div className="mx-auto flex w-full max-w-4xl items-center px-6 py-16 text-sm">
          Checking organization access...
        </div>
      </div>
    )
  }

  return <>{children}</>
}
