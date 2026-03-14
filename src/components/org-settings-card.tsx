type OrgSettingsCardProps = {
  orgName: string
  orgType: string
  onOrgNameChange: (value: string) => void
  onOrgTypeChange: (value: string) => void
  children?: React.ReactNode
}

export function OrgSettingsCard({
  orgName,
  orgType,
  onOrgNameChange,
  onOrgTypeChange,
  children,
}: OrgSettingsCardProps) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm md:grid-cols-2">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Organization name
        <input
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          value={orgName}
          onChange={(event) => onOrgNameChange(event.target.value)}
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Practice type
        <input
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          value={orgType}
          onChange={(event) => onOrgTypeChange(event.target.value)}
        />
      </label>
      {children}
    </div>
  )
}
