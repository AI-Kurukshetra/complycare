type AuthRequiredBannerProps = {
  message?: string
}

export function AuthRequiredBanner({
  message = "Production-safe policies require authentication. Sign in to continue.",
}: AuthRequiredBannerProps) {
  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-5 text-amber-800">
      <p className="text-sm font-semibold">Sign in required</p>
      <p className="text-sm text-amber-700">{message}</p>
    </div>
  )
}
