import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppShell } from "@/components/layout/app-shell"

vi.mock("next/navigation", () => ({
  usePathname: () => "/security",
}))

vi.mock("@/components/layout/header", () => ({
  Header: ({ breadcrumb }: { breadcrumb: string }) => <div>{breadcrumb}</div>,
}))

describe("AppShell", () => {
  it("renders navigation and children for app routes", () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>
    )

    expect(screen.getByRole("link", { name: "Security" })).toBeInTheDocument()
    expect(screen.getByText("Content")).toBeInTheDocument()
  })
})
