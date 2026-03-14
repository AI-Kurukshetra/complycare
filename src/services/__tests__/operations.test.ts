import { describe, expect, it, vi } from "vitest"
import { createOrganization } from "@/services/operations"

const insertMock = vi.fn()
const upsertMock = vi.fn()
const getUserMock = vi.fn()

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: getUserMock,
    },
    from: () => ({
      insert: insertMock,
      upsert: upsertMock,
    }),
  }),
}))

describe("createOrganization", () => {
  it("creates organization and membership", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } })
    vi.spyOn(crypto, "randomUUID").mockReturnValue("org-1")
    insertMock.mockResolvedValue({ error: null })
    upsertMock.mockResolvedValue({ error: null })

    const result = await createOrganization({
      name: "Northwind",
      orgType: "Clinic",
      orgSize: "1-10",
      primaryContact: "admin@northwind.test",
    })

    expect(result).toBe("org-1")
    expect(upsertMock).toHaveBeenCalled()
  })

  it("throws when no user is present", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } })
    await expect(
      createOrganization({ name: "Northwind" })
    ).rejects.toThrow("No authenticated user")
  })
})
