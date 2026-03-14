import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TaskDetailPanel } from "@/components/calendar/task-detail-panel"
import type { CalendarTask } from "@/types/operations"

describe("TaskDetailPanel", () => {
  it("renders empty state when no task", () => {
    render(
      <TaskDetailPanel
        task={null}
        actionLoading={false}
        actionMessage={null}
        onMarkComplete={vi.fn()}
        onSnooze={vi.fn()}
        onReassign={vi.fn()}
      />
    )

    expect(screen.getByText(/No task selected/i)).toBeInTheDocument()
  })

  it("calls action handlers", () => {
    const task: CalendarTask = {
      id: "task-1",
      title: "HIPAA training",
      dueDate: "2026-03-20",
      status: "open",
      taskType: "training_renewal",
      recurrenceRule: "monthly",
      notificationDaysBefore: [7, 1],
      assignedTo: "user-1",
      linkedEntityId: null,
      completedAt: null,
    }

    const onMarkComplete = vi.fn().mockResolvedValue(task)
    const onSnooze = vi.fn().mockResolvedValue(task)
    const onReassign = vi.fn().mockResolvedValue(task)

    render(
      <TaskDetailPanel
        task={task}
        actionLoading={false}
        actionMessage={null}
        onMarkComplete={onMarkComplete}
        onSnooze={onSnooze}
        onReassign={onReassign}
      />
    )

    fireEvent.click(screen.getByRole("button", { name: /Mark complete/i }))
    expect(onMarkComplete).toHaveBeenCalledWith(task)

    fireEvent.click(screen.getByRole("button", { name: /Snooze 7 days/i }))
    expect(onSnooze).toHaveBeenCalledWith(task, 7)

    const input = screen.getByPlaceholderText(/User ID/i)
    fireEvent.change(input, { target: { value: " user-2 " } })
    fireEvent.click(screen.getByRole("button", { name: /Reassign/i }))
    expect(onReassign).toHaveBeenCalledWith("task-1", "user-2")
  })
})
