import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OrgSwitcher } from "@/components/layout/org-switcher"

const setActiveOrgId = vi.fn()

vi.mock("@/hooks/useActiveOrg", () => ({
  useActiveOrg: () => ({
    organizations: [
      { id: "org-1", name: "Northwind", complianceScore: 82 },
      { id: "org-2", name: "Contoso", complianceScore: 76 },
    ],
    activeOrg: { id: "org-1", name: "Northwind", complianceScore: 82 },
    setActiveOrgId,
  }),
}))

describe("OrgSwitcher", () => {
  it("opens menu and switches org", () => {
    render(<OrgSwitcher />)

    fireEvent.click(screen.getByRole("button"))
    fireEvent.click(screen.getByRole("button", { name: /Contoso/i }))

    expect(setActiveOrgId).toHaveBeenCalledWith("org-2")
  })
})
