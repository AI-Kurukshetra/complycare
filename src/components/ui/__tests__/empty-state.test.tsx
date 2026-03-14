import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EmptyState } from "@/components/ui/empty-state"

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="No data" description="Create your first item." />)
    expect(screen.getByText("No data")).toBeInTheDocument()
    expect(screen.getByText("Create your first item.")).toBeInTheDocument()
  })

  it("invokes action handler when provided", async () => {
    const onAction = vi.fn()
    render(
      <EmptyState
        title="No data"
        actionLabel="Create"
        onAction={onAction}
      />
    )

    screen.getByRole("button", { name: "Create" }).click()
    expect(onAction).toHaveBeenCalled()
  })
})
