"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function UpdatePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const code = searchParams.get("code")

  useEffect(() => {
    let active = true
    async function exchangeCode() {
      if (!code) {
        setMessage("Missing recovery code. Use the reset link from your email.")
        return
      }
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!active) return
      if (error) {
        setMessage(error.message)
        return
      }
      setReady(true)
    }

    exchangeCode()
    return () => {
      active = false
    }
  }, [code])

  async function handleUpdate() {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setMessage(error.message)
        return
      }
      router.replace("/login?reset=1")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update password.")
    } finally {
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="text-sm text-slate-600">
        {message ?? "Validating reset link..."}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        New password
        <input
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Confirm password
        <input
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
        />
      </label>
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
      <p className="text-xs text-slate-500">
        Return to{" "}
        <Link className="text-cyan-700 hover:text-cyan-900" href="/login">
          sign in
        </Link>
      </p>
    </div>
  )
}
