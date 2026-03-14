import { OrganizationSetupForm } from "@/components/setup/organization-setup-form"

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">
            Setup
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Organization setup</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create your organization profile to unlock dashboards and workflows.
          </p>
        </div>
        <OrganizationSetupForm />
      </div>
    </main>
  )
}
