"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useActiveOrg } from "@/hooks/useActiveOrg"

export function OrgSwitcher() {
  const { organizations, activeOrg, setActiveOrgId } = useActiveOrg()
  const [open, setOpen] = useState(false)

  if (organizations.length === 0) return null

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="text-sm font-semibold text-slate-900">
          {activeOrg?.name ?? "Organization"}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {activeOrg?.complianceScore ?? "--"}
        </span>
      </Button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">
            Switch organization
          </div>
          <div className="max-h-64 overflow-y-auto">
            {organizations.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => {
                  setActiveOrgId(org.id)
                  setOpen(false)
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${
                  activeOrg?.id === org.id ? "bg-slate-100" : ""
                }`}
              >
                <span className="font-medium text-slate-800">{org.name}</span>
                <span className="text-xs text-slate-500">
                  {org.complianceScore ?? "--"}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
