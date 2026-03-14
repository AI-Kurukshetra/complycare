"use client"

import { useCallback, useRef, useState } from "react"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMessage: ChatMessage = { role: "user", content: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setIsStreaming(true)

    // Append an empty assistant message that will be filled by streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    abortRef.current = new AbortController()

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Chat request failed.")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream.")

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          const last = copy[copy.length - 1]
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: last.content + chunk }
          }
          return copy
        })
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      const message = err instanceof Error ? err.message : "Something went wrong."
      setMessages((prev) => {
        const copy = [...prev]
        const last = copy[copy.length - 1]
        if (last?.role === "assistant" && last.content === "") {
          copy[copy.length - 1] = { ...last, content: `Error: ${message}` }
        }
        return copy
      })
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [messages, isStreaming])

  const clearHistory = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setIsStreaming(false)
  }, [])

  return { messages, isStreaming, sendMessage, clearHistory }
}
