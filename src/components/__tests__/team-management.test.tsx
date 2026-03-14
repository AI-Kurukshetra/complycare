import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TeamManagement } from "@/components/settings/team-management"
import type { TeamMember } from "@/services/team"

const members: TeamMember[] = [
  { id: "user-1", email: "owner@clinic.test", role: "owner", status: "active" },
  { id: "user-2", email: "member@clinic.test", role: "member", status: "active" },
]

describe("TeamManagement", () => {
  it("invites a member", () => {
    const onInvite = vi.fn()
    render(
      <TeamManagement
        members={members}
        loading={false}
        saving={false}
        error={null}
        onInvite={onInvite}
        onChangeRole={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: "new@clinic.test" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Invite/i }))
    expect(onInvite).toHaveBeenCalledWith("new@clinic.test", "member")
  })

  it("changes member role", () => {
    const onChangeRole = vi.fn()
    render(
      <TeamManagement
        members={members}
        loading={false}
        saving={false}
        error={null}
        onInvite={vi.fn()}
        onChangeRole={onChangeRole}
        onRemove={vi.fn()}
      />
    )

    const selects = screen.getAllByDisplayValue("member")
    fireEvent.change(selects[selects.length - 1], { target: { value: "admin" } })

    expect(onChangeRole).toHaveBeenCalledWith("user-2", "admin")
  })

  it("removes member", () => {
    const onRemove = vi.fn()
    render(
      <TeamManagement
        members={members}
        loading={false}
        saving={false}
        error={null}
        onInvite={vi.fn()}
        onChangeRole={vi.fn()}
        onRemove={onRemove}
      />
    )

    fireEvent.click(screen.getAllByRole("button", { name: /Remove/i })[0])
    expect(onRemove).toHaveBeenCalledWith("user-1")
  })
})
