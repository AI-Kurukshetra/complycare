"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function ResetPasswordForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleReset() {
    if (!email) {
      setMessage("Enter your email address.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/update-password`,
      })
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage("Check your email for the reset link.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send reset email.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Email address
        <input
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
      </label>
      <Button onClick={handleReset} disabled={loading}>
        {loading ? "Sending..." : "Send reset link"}
      </Button>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}
      <p className="text-xs text-slate-500">
        Back to{" "}
        <Link className="text-cyan-700 hover:text-cyan-900" href="/login">
          sign in
        </Link>
      </p>
    </div>
  )
}
