"use client"

import { useEffect, useRef, useState } from "react"
import { useAIChat } from "@/hooks/useAIChat"

const SUGGESTED_PROMPTS = [
  "What should I do first to improve my score?",
  "How do I respond to a data breach?",
  "Explain the HIPAA Security Rule",
]

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant"
  content: string
  isStreaming: boolean
}) {
  const isUser = role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-cyan-600 text-white"
            : "border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <span style={{ whiteSpace: "pre-wrap" }}>{content}</span>
        {isStreaming && role === "assistant" && content.length > 0 && (
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-slate-400" />
        )}
      </div>
    </div>
  )
}

export function ComplianceChatbot() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const { messages, isStreaming, sendMessage, clearHistory } = useAIChat()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  function handleSend() {
    if (!input.trim() || isStreaming) return
    void sendMessage(input)
    setInput("")
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function handleSuggest(prompt: string) {
    void sendMessage(prompt)
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex w-full flex-col border-0 bg-white shadow-2xl sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[360px] sm:max-w-[calc(100vw-2rem)] sm:rounded-3xl sm:border sm:border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Compliance Assistant</p>
              <p className="text-xs text-slate-500">Powered by Claude · HIPAA-aware</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                  title="Clear chat"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                aria-label="Close chat"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 sm:max-h-80">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-3">
                <p className="text-center text-xs text-slate-400">
                  Ask me anything about HIPAA compliance.
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSuggest(prompt)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && index === messages.length - 1}
                />
              ))
            )}
            {/* Streaming thinking indicator — only when assistant message is still empty */}
            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 border-t border-slate-100 px-4 py-3">
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-cyan-400 focus:bg-white"
              placeholder="Ask a compliance question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ maxHeight: "100px", overflowY: "auto" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:opacity-40"
              aria-label="Send message"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition hover:bg-cyan-700 active:scale-95 sm:right-6"
        aria-label={open ? "Close compliance assistant" : "Open compliance assistant"}
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {/* Unread indicator — shows on close state when no messages yet */}
        {!open && messages.length === 0 && (
          <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-white bg-rose-500" />
        )}
      </button>
    </>
  )
}
