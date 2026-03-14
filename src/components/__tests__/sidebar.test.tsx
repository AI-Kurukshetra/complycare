import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { SidebarNav } from "@/components/layout/sidebar"

let pathname = "/"

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}))

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe("SidebarNav", () => {
  it("highlights the active navigation item", () => {
    pathname = "/security"
    render(<SidebarNav />)

    const securityLink = screen.getByRole("link", { name: "Security" })
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" })

    expect(securityLink.className).toContain("bg-slate-200/70")
    expect(dashboardLink.className).not.toContain("bg-slate-200/70")
  })
})
