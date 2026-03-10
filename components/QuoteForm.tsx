"use client"

import { useState } from "react"
import { Quote } from "@/types/quote"

interface Props {
  onQuoteGenerated: (
    quote: Quote,
    company: { name: string; phone: string; email: string; logo: string }
  ) => void
}

export default function QuoteForm({ onQuoteGenerated }: Props) {
  const [input, setInput] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyPhone, setCompanyPhone] = useState("")
  const [companyEmail, setCompanyEmail] = useState("")
  const [companyLogo, setCompanyLogo] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState("")
  const [logoError, setLogoError] = useState("")

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError("")
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setLogoError("Only PNG or JPG files are accepted.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("File must be under 2MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCompanyLogo(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleVoiceClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    if (listening) {
      ;(window as any)._recognition?.stop()
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
      if (!res.ok) throw new Error()
      const quote: Quote = await res.json()
      onQuoteGenerated(quote, { name: companyName, phone: companyPhone, email: companyEmail, logo: companyLogo })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

      {/* Section: Company Info */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#1a1a2e" }}>1</div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Your Company</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Company Name", value: companyName, setter: setCompanyName, placeholder: "Acme Contracting", type: "text" },
            { label: "Phone", value: companyPhone, setter: setCompanyPhone, placeholder: "604-555-0100", type: "tel" },
            { label: "Email", value: companyEmail, setter: setCompanyEmail, placeholder: "info@acme.ca", type: "email" },
          ].map(({ label, value, setter, placeholder, type }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] transition bg-gray-50 hover:bg-white"
              />
            </div>
          ))}
        </div>

        {/* Logo Upload */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Company Logo</label>
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <div className="relative group">
                <img
                  src={companyLogo}
                  alt="Company logo"
                  className="h-12 w-auto max-w-[120px] object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
                />
                <button
                  type="button"
                  onClick={() => setCompanyLogo("")}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#c9a84c] hover:text-[#c9a84c] cursor-pointer transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
            <span className="text-xs text-gray-400">PNG or JPG · Max 2MB</span>
          </div>
          {logoError && <p className="text-xs text-red-500 mt-1.5">{logoError}</p>}
        </div>
      </div>

      <div className="mx-8 border-t border-dashed border-gray-200" />

      {/* Section: Job Description */}
      <div className="px-8 pt-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: "#1a1a2e" }}>2</div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Job Description</h2>
          </div>
          <button
            type="button"
            onClick={handleVoiceClick}
            className="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border-2 transition"
            style={
              listening
                ? { borderColor: "#ef4444", color: "#ef4444", backgroundColor: "#fef2f2" }
                : { borderColor: "#c9a84c", color: "#c9a84c", backgroundColor: "#fffbf0" }
            }
          >
            {listening ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Stop Recording
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm6.364 9.05a.75.75 0 0 1 .736.912A7.003 7.003 0 0 1 12.75 17.93V20h2.25a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1 0-1.5H11.25v-2.07A7.003 7.003 0 0 1 4.9 10.962a.75.75 0 1 1 1.472-.288A5.502 5.502 0 0 0 17.5 11a5.478 5.478 0 0 0-.048-.663.75.75 0 0 1 .912-.287z" />
                </svg>
                Voice Input
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the job in plain English — include the client name, address, and what needs to be done. e.g. Replace kitchen faucet and under-sink plumbing at 123 Main St Vancouver for John Smith."
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] transition bg-gray-50 hover:bg-white leading-relaxed"
            />
            {listening && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs text-red-500 font-medium bg-red-50 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Listening…
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 5a1 1 0 1 1 2 0v4a1 1 0 1 1-2 0V7zm1 8a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 12 15z" clipRule="evenodd"/>
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            style={{ backgroundColor: "#1a1a2e", color: "#fff" }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Generating your quote…</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Quote with AI
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Uses Vancouver BC market rates · GST 5% included · Editable before printing
          </p>
        </form>
      </div>
    </div>
  )
}
