"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { getActiveOrgId } from "@/lib/active-org"

export interface Notification {
  id: string
  organizationId: string
  userId: string
  message: string
  link: string | null
  readAt: string | null
  createdAt: string
}

function mapRow(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    organizationId: row.organization_id as string,
    userId: row.user_id as string,
    message: row.message as string,
    link: (row.link as string) ?? null,
    readAt: (row.read_at as string) ?? null,
    createdAt: row.created_at as string,
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const activeOrgId = getActiveOrgId()
    let query = supabase
      .from("notifications")
      .select("id, organization_id, user_id, message, link, read_at, created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (activeOrgId) {
      query = query.eq("organization_id", activeOrgId)
    }

    const { data } = await query

    if (data) setNotifications(data.map(mapRow))
    setLoading(false)
  }, [supabase])

  const markAsRead = useCallback(
    async (id: string) => {
      const now = new Date().toISOString()
      await supabase.from("notifications").update({ read_at: now }).eq("id", id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: now } : n))
      )
    },
    [supabase]
  )

  const markAllAsRead = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return
    const now = new Date().toISOString()
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", userData.user.id)
      .is("read_at", null)
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: now })))
  }, [supabase])

  useEffect(() => {
    async function init() { await fetchNotifications() }
    void init()

    // Subscribe to new notifications via Supabase Realtime
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [mapRow(payload.new as Record<string, unknown>), ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}
