"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignUp() {
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/login?verified=1`,
        },
      })
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage("Check your email to confirm the account, then sign in.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign up.")
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
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Password
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

      <Button onClick={handleSignUp} disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>

      {message ? <p className="text-xs text-slate-500">{message}</p> : null}

      <p className="text-xs text-slate-500">
        Already have an account?{" "}
        <Link className="text-cyan-700 hover:text-cyan-900" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  )
}
