import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppGuard } from "@/components/layout/app-guard"

let pathname = "/"
const replace = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace }),
}))

let authUser: { id: string } | null = null
let membershipOrgId: string | null = null

const getUser = vi.fn(async () => ({ data: { user: authUser }, error: null }))
const maybeSingle = vi.fn(async () => ({
  data: membershipOrgId ? { organization_id: membershipOrgId } : null,
}))

const supabaseClient = {
  auth: { getUser },
  from: vi.fn(() => ({
    select: () => ({
      eq: () => ({ limit: () => ({ maybeSingle }) }),
    }),
  })),
}

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => supabaseClient,
}))

describe("AppGuard", () => {
  beforeEach(() => {
    pathname = "/"
    authUser = null
    membershipOrgId = null
    replace.mockClear()
    getUser.mockClear()
    maybeSingle.mockClear()
  })

  it("renders children on public routes", async () => {
    pathname = "/landing"
    render(
      <AppGuard>
        <div>Public Content</div>
      </AppGuard>
    )

    expect(await screen.findByText("Public Content")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it("redirects unauthenticated users to landing", async () => {
    pathname = "/security"
    render(
      <AppGuard>
        <div>Protected Content</div>
      </AppGuard>
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/landing")
    })
  })

  it("redirects authenticated users without org membership to setup", async () => {
    pathname = "/"
    authUser = { id: "user-1" }
    membershipOrgId = null

    render(
      <AppGuard>
        <div>Protected Content</div>
      </AppGuard>
    )

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/setup")
    })
  })

  it("renders children for authenticated users with org membership", async () => {
    pathname = "/operations"
    authUser = { id: "user-1" }
    membershipOrgId = "org-123"

    render(
      <AppGuard>
        <div>Protected Content</div>
      </AppGuard>
    )

    expect(await screen.findByText("Protected Content")).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
