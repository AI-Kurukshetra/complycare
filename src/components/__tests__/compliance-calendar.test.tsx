import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { ComplianceCalendar } from "@/components/calendar/compliance-calendar"
import type { CalendarTask } from "@/types/operations"

const today = new Date("2026-03-14T08:00:00.000Z")

function formatIso(date: Date) {
  return date.toISOString().slice(0, 10)
}

describe("ComplianceCalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(today)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders tasks and calls onSelect", () => {
    const tasks: CalendarTask[] = [
      {
        id: "task-1",
        title: "Quarterly access review",
        dueDate: formatIso(today),
        status: "open",
        taskType: "training_renewal",
        recurrenceRule: "none",
        notificationDaysBefore: [7],
        assignedTo: null,
        linkedEntityId: null,
        completedAt: null,
      },
    ]

    const onSelect = vi.fn()

    render(<ComplianceCalendar tasks={tasks} selectedTaskId={null} onSelect={onSelect} />)

    const taskButton = screen.getByRole("button", { name: /Quarterly access review/i })
    fireEvent.click(taskButton)

    expect(onSelect).toHaveBeenCalledWith(tasks[0])
  })

  it("switches to week view", () => {
    render(<ComplianceCalendar tasks={[]} selectedTaskId={null} onSelect={vi.fn()} />)

    fireEvent.click(screen.getByRole("button", { name: "week" }))
    expect(screen.getAllByText(/No tasks scheduled/i).length).toBeGreaterThan(0)
  })
})
