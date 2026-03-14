import Link from "next/link"
import { Button } from "@/components/ui/button"

type NavLink = { label: string; href: string }

type DashboardHeaderProps = {
  eyebrow: string
  title: string
  description: string
  /** When provided, shows a Save status badge on the right and nav links below the title row */
  saving?: boolean
  navLinks?: NavLink[]
  children?: React.ReactNode
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  saving,
  navLinks,
  children,
}: DashboardHeaderProps) {
  const hasSaveStatus = saving !== undefined
  const navButtons = navLinks?.map((link) => (
    <Button key={link.href} asChild variant="outline" size="sm">
      <Link href={link.href}>{link.label}</Link>
    </Button>
  ))

  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        {hasSaveStatus ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600 shadow-sm">
            {saving ? "Saving..." : "All changes saved"}
          </div>
        ) : (
          navButtons && <div className="flex flex-wrap gap-2">{navButtons}</div>
        )}
      </div>

      {hasSaveStatus && navButtons && (
        <div className="flex flex-wrap gap-2">{navButtons}</div>
      )}

      {children}
    </header>
  )
}
