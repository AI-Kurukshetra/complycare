import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OnboardingWizard } from "@/components/onboarding-wizard"

describe("OnboardingWizard", () => {
  it("shows organization summary details", () => {
    render(
      <OnboardingWizard
        organizationId="org-123"
        orgName="Northwind"
        orgType="Clinic"
        orgSize="11-50"
        primaryContact="admin@northwind.test"
      />
    )

    expect(screen.getByText(/Northwind/)).toBeInTheDocument()
    expect(screen.getByText(/Clinic/)).toBeInTheDocument()
    expect(screen.getByText(/11-50/)).toBeInTheDocument()
    expect(screen.getByText(/admin@northwind.test/)).toBeInTheDocument()
  })

  it("shows validation when invite email is empty", async () => {
    render(<OnboardingWizard organizationId="org-123" />)

    fireEvent.click(screen.getByRole("button", { name: /Add member/i }))
    expect(await screen.findByText("Enter an email address.")).toBeInTheDocument()
  })

  it("sends invite request when email provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response)

    render(<OnboardingWizard organizationId="org-123" />)

    const input = screen.getByLabelText(/Team member email/i)
    fireEvent.change(input, { target: { value: "member@test.com" } })
    fireEvent.click(screen.getByRole("button", { name: /Add member/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/members/invite",
        expect.objectContaining({
          method: "POST",
        })
      )
    })

    fetchSpy.mockRestore()
  })
})
