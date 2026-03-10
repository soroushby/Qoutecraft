"use client"

import { useState, useEffect } from "react"
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs"
import Link from "next/link"
import { Quote } from "@/types/quote"
import QuoteForm from "@/components/QuoteForm"
import QuotePreview from "@/components/QuotePreview"

type CompanyInfo = { name: string; phone: string; email: string; logo: string }

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [step, setStep] = useState<"input" | "preview">("input")
  const [usageCount, setUsageCount] = useState<number | null>(null)
  const FREE_LIMIT = 5

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => setUsageCount(d.count))
      .catch(() => {})
  }, [step]) // re-fetch after returning from preview

  const handleQuoteGenerated = (q: Quote, company: CompanyInfo) => {
    setQuote(q)
    setCompanyInfo(company)
    setStep("preview")
  }

  const showBanner = usageCount !== null && usageCount >= 3

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: "#1a1a2e" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#c9a84c" }}>
              <span className="text-[#1a1a2e] font-black text-sm">Q</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Quote<span style={{ color: "#c9a84c" }}>Craft</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition">New Quote</Link>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">My Quotes</Link>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 transition">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition hover:opacity-90"
                  style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
                >
                  Get Started
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-white/10 hover:border-white/25 transition hidden sm:block"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* Usage Banner */}
      {showBanner && step === "input" && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="max-w-6xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800">
                <span className="font-semibold">{usageCount} of {FREE_LIMIT} free quotes used</span> this month.
                {usageCount >= FREE_LIMIT
                  ? " You've reached your limit."
                  : ` ${FREE_LIMIT - usageCount} remaining.`}
              </p>
            </div>
            <Link
              href="/pricing"
              className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition hover:opacity-90"
              style={{ backgroundColor: "#1a1a2e", color: "#c9a84c" }}
            >
              Upgrade →
            </Link>
          </div>
        </div>
      )}

      {/* Hero (only on input step) */}
      {step === "input" && (
        <div className="pt-14 pb-10 text-center px-4">
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
            style={{ backgroundColor: "#1a1a2e", color: "#c9a84c" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI-Powered · Vancouver BC Rates · GST Included
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a1a2e] tracking-tight leading-tight">
            Professional quotes,<br />
            <span style={{ color: "#c9a84c" }}>in seconds.</span>
          </h1>
          <p className="mt-4 text-gray-500 text-base max-w-md mx-auto">
            Describe any job and get a detailed, printable estimate with accurate Vancouver market rates.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-3xl mx-auto px-4 ${step === "input" ? "pb-16" : "py-10"}`}>
        {step === "input" && (
          <QuoteForm onQuoteGenerated={handleQuoteGenerated} />
        )}
        {step === "preview" && quote && companyInfo && (
          <QuotePreview
            quote={quote}
            companyName={companyInfo.name}
            companyPhone={companyInfo.phone}
            companyEmail={companyInfo.email}
            companyLogo={companyInfo.logo}
            onBack={() => setStep("input")}
          />
        )}
      </main>
    </div>
  )
}
