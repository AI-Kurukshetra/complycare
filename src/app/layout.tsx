import type { Metadata } from "next"
import { AppShell } from "@/components/layout/app-shell"
import { AppGuard } from "@/components/layout/app-guard"
import "./globals.css"

export const metadata: Metadata = {
  title: "HIPAA Risk Snapshot",
  description: "Generate a HIPAA compliance risk snapshot in minutes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AppGuard>
          <AppShell>{children}</AppShell>
        </AppGuard>
      </body>
    </html>
  )
}
