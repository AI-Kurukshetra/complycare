"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const nextParam = searchParams.get("next")
  const verifiedParam = searchParams.get("verified")
  const resetParam = searchParams.get("reset")
  const redirectTo = nextParam && nextParam.startsWith("/") ? nextParam : "/"

  async function handleSignIn() {
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient({
        storage: remember ? localStorage : sessionStorage,
      })
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
        return
      }
      router.replace(redirectTo)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setMessage("Enter your email to receive a magic link.")
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createClient({
        storage: remember ? localStorage : sessionStorage,
      })
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/login?verified=1`,
        },
      })
      if (error) {
        setMessage(error.message)
        return
      }
      setMessage("Magic link sent. Check your email to continue.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send magic link.")
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
          autoComplete="current-password"
        />
      </label>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          Remember me
        </label>
        <Link className="text-cyan-700 hover:text-cyan-900" href="/reset-password">
          Forgot password?
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={handleSignIn} disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
        <Button variant="outline" onClick={handleMagicLink} disabled={loading}>
          Send magic link
        </Button>
      </div>

      {verifiedParam ? (
        <p className="text-xs text-emerald-600">
          Email verified. You can sign in now.
        </p>
      ) : null}
      {resetParam ? (
        <p className="text-xs text-emerald-600">Password updated. Please sign in.</p>
      ) : null}
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}

      <p className="text-xs text-slate-500">
        New here?{" "}
        <Link className="text-cyan-700 hover:text-cyan-900" href="/signup">
          Create an account
        </Link>
      </p>
    </div>
  )
}
