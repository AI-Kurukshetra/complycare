import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppGuard } from "@/components/layout/app-guard"

const replaceMock = vi.fn()

vi.mock("next/navigation", () => ({
  usePathname: () => "/security",
  useRouter: () => ({
    replace: replaceMock,
  }),
}))

const getUserMock = vi.fn()
const fromMock = vi.fn()
const eqMock = vi.fn()
const selectMock = vi.fn()
const limitMock = vi.fn()

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: getUserMock,
    },
    from: fromMock,
  }),
}))

describe("AppGuard", () => {
  it("renders children when user has membership", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: { organization_id: "org-1" },
    })
    limitMock.mockReturnValue({ maybeSingle: maybeSingleMock })
    eqMock.mockReturnValue({ limit: limitMock })
    selectMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ select: selectMock })
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(
      <AppGuard>
        <div>Secure Content</div>
      </AppGuard>
    )

    expect(await screen.findByText("Secure Content")).toBeInTheDocument()
  })

  it("redirects to setup when membership missing", async () => {
    const maybeSingleMock = vi.fn().mockResolvedValue({ data: null })
    limitMock.mockReturnValue({ maybeSingle: maybeSingleMock })
    eqMock.mockReturnValue({ limit: limitMock })
    selectMock.mockReturnValue({ eq: eqMock })
    fromMock.mockReturnValue({ select: selectMock })
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(
      <AppGuard>
        <div>Secure Content</div>
      </AppGuard>
    )

    expect(await screen.findByText(/Checking organization access/i)).toBeInTheDocument()
    expect(replaceMock).toHaveBeenCalledWith("/setup")
  })
})
