"use client"

import { useState } from "react"
import { Quote } from "@/types/quote"

interface Props {
  onQuoteGenerated: (
    quote: Quote,
    company: { name: string; phone: string; email: string }
  ) => void
}

export default function QuoteForm({ onQuoteGenerated }: Props) {
  const [input, setInput] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState("")

  const toggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    if (listening) {
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-CA"

    recognition.onresult = (event: any) => {
      let transcript = ""
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      setInput(transcript)
    }

    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.start()
    setListening(true)

    ;(window as any)._recognition = recognition
  }

  const stopVoice = () => {
    ;(window as any)._recognition?.stop()
    setListening(false)
  }

  const handleVoiceClick = () => {
    if (listening) {
      stopVoice()
    } else {
      toggleVoice()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!input.trim()) {
      setError("Please enter a job description.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: input }),
      })

      if (!res.ok) throw new Error("Failed to generate quote")

      const quote: Quote = await res.json()
      onQuoteGenerated(quote, {
        name: companyName,
        phone: companyPhone,
        email: companyEmail,
      })
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
      {/* Card Header */}
      <div className="px-8 py-6" style={{ backgroundColor: "#1a1a2e" }}>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Generate a Quote
        </h2>
        <p className="text-sm mt-1" style={{ color: "#c9a84c" }}>
          Describe the job and we'll build a professional estimate instantly
        </p>
      </div>

      {/* Card Body */}
      <div className="bg-white px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Contracting"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "#c9a84c" } as any}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="604-555-0100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "#c9a84c" } as any}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email
              </label>
              <input
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder="info@acme.ca"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ "--tw-ring-color": "#c9a84c" } as any}
              />
            </div>
          </div>

          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Job Description
              </label>
              <button
                type="button"
                onClick={handleVoiceClick}
                title={listening ? "Stop recording" : "Start voice input"}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition"
                style={
                  listening
                    ? {
                        backgroundColor: "#fee2e2",
                        borderColor: "#fca5a5",
                        color: "#dc2626",
                      }
                    : {
                        backgroundColor: "#fdf8ee",
                        borderColor: "#c9a84c",
                        color: "#c9a84c",
                      }
                }
              >
                {listening ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Stop
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.05a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.93V20h2.25a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5H11.25v-2.07A7.003 7.003 0 0 1 4.9 10.962a.75.75 0 1 1 1.472-.288A5.502 5.502 0 0 0 17.5 11a5.478 5.478 0 0 0-.048-.663.75.75 0 0 1 .912-.287z" />
                    </svg>
                    Voice
                  </>
                )}
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Replace the kitchen faucet and under-sink plumbing at 123 Main St, Vancouver. Client is John Smith, 604-555-0199."
              rows={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold tracking-wide text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            {loading ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Generating Quote…
              </>
            ) : (
              <>
                <span style={{ color: "#c9a84c" }}>✦</span>
                Generate Quote
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
