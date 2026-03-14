import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AccessControlMatrix } from "@/components/security/access-control-matrix"
import type { AccessCategory } from "@/types/access-control"

const categories: AccessCategory[] = ["phi_records", "billing", "admin_settings", "reports"]

describe("AccessControlMatrix", () => {
  it("renders matrix and toggles flag", () => {
    const onToggleFlag = vi.fn()
    const isFlagged = vi.fn().mockReturnValue(false)

    render(
      <AccessControlMatrix
        categories={categories}
        rows={[
          {
            user: { id: "user-1", name: "Ava Patel", role: "Compliance Officer" },
            access: {
              phi_records: true,
              billing: false,
              admin_settings: false,
              reports: true,
            },
            required: ["phi_records", "reports"],
            score: 90,
            excessive: 0,
            missing: 0,
          },
        ]}
        onToggleFlag={onToggleFlag}
        isFlagged={isFlagged}
      />
    )

    fireEvent.click(screen.getAllByRole("button", { name: /Access/i })[0])
    expect(onToggleFlag).toHaveBeenCalledWith("user-1", "phi_records")
  })
})
