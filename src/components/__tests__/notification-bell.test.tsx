import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { NotificationBell } from "@/components/layout/notification-bell"

const markAsRead = vi.fn()
const markAllAsRead = vi.fn()

const mockUseNotifications = vi.fn()

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => mockUseNotifications(),
}))

const push = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}))

describe("NotificationBell", () => {
  beforeEach(() => {
    markAsRead.mockReset()
    markAllAsRead.mockReset()
    push.mockReset()
  })

  it("shows unread count and marks all read", () => {
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: "n1",
          message: "Task due soon",
          link: "/calendar",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      markAsRead,
      markAllAsRead,
    })

    render(<NotificationBell />)

    expect(screen.getByText("1")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }))
    fireEvent.click(screen.getByRole("button", { name: /mark all read/i }))

    expect(markAllAsRead).toHaveBeenCalled()
  })

  it("marks notification as read and navigates when clicked", () => {
    mockUseNotifications.mockReturnValue({
      notifications: [
        {
          id: "n1",
          message: "Assessment due",
          link: "/calendar",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      unreadCount: 1,
      markAsRead,
      markAllAsRead,
    })

    render(<NotificationBell />)

    fireEvent.click(screen.getByRole("button", { name: /notifications/i }))
    fireEvent.click(screen.getByRole("button", { name: /assessment due/i }))

    expect(markAsRead).toHaveBeenCalledWith("n1")
    expect(push).toHaveBeenCalledWith("/calendar")
  })
})
