import Link from "next/link"

type AuthShellProps = {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function AuthShell({
  eyebrow = "Access",
  title,
  description,
  children,
  footer,
  backHref,
  backLabel,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
            {description ? (
              <p className="mt-2 text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          {backHref && backLabel ? (
            <Link
              className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 transition hover:text-slate-600"
              href={backHref}
            >
              {backLabel}
            </Link>
          ) : null}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
        {footer ? (
          <div className="text-center text-xs text-slate-500">{footer}</div>
        ) : null}
      </div>
    </main>
  )
}
