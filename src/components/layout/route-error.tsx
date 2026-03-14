"use client"

import { Button } from "@/components/ui/button"

type RouteErrorProps = {
  error?: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
}

export function RouteError({
  error,
  reset,
  title = "Something went wrong",
  description = "We could not load this section. Try again or come back later.",
}: RouteErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          {error?.message ? (
            <p className="mt-2 text-xs text-slate-400">{error.message}</p>
          ) : null}
          <div className="mt-4">
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
