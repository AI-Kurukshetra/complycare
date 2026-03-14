"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"

export function AuthPanel({ onAuth }: { onAuth?: (email: string | null) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [currentEmail, setCurrentEmail] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      const userEmail = data.user?.email ?? null
      setCurrentEmail(userEmail)
      onAuth?.(userEmail)
    })
    return () => {
      active = false
    }
  }, [onAuth, supabase.auth])

  async function handleSignIn() {
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
      return
    }
    const { data } = await supabase.auth.getUser()
    const userEmail = data.user?.email ?? null
    setCurrentEmail(userEmail)
    onAuth?.(userEmail)
    setMessage("Signed in.")
  }

  async function handleSignUp() {
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
      return
    }
    setMessage("Check your email to confirm the account, then sign in.")
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setCurrentEmail(null)
    onAuth?.(null)
    setMessage("Signed out.")
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Authentication</h2>
      <p className="text-sm text-slate-500">
        Sign in to enable production-safe Supabase policies.
      </p>

      {currentEmail ? (
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{currentEmail}</p>
            <p className="text-xs text-slate-500">Authenticated</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSignIn}>
              Sign in
            </Button>
            <Button size="sm" variant="outline" onClick={handleSignUp}>
              Create account
            </Button>
          </div>
        </div>
      )}

      {message ? <p className="mt-3 text-xs text-slate-500">{message}</p> : null}
    </div>
  )
}
