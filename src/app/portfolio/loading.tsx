import { DashboardSkeleton } from "@/components/layout/dashboard-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="px-4 py-6 lg:px-6">
        <DashboardSkeleton />
      </div>
    </div>
  )
}
