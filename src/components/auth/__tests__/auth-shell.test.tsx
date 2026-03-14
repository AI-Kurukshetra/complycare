import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { AuthShell } from "@/components/auth/auth-shell"

describe("AuthShell", () => {
  it("renders title and description", () => {
    render(
      <AuthShell title="Sign in" description="Welcome back.">
        <div>Child</div>
      </AuthShell>
    )

    expect(screen.getByText("Sign in")).toBeInTheDocument()
    expect(screen.getByText("Welcome back.")).toBeInTheDocument()
    expect(screen.getByText("Child")).toBeInTheDocument()
  })

  it("renders back link when provided", () => {
    render(
      <AuthShell
        title="Reset"
        backHref="/login"
        backLabel="Sign in"
      >
        <div>Child</div>
      </AuthShell>
    )

    const link = screen.getByRole("link", { name: "Sign in" })
    expect(link).toHaveAttribute("href", "/login")
  })
})
