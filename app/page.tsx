"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { Quote } from "@/types/quote"
import QuoteForm from "@/components/QuoteForm"
import QuotePreview from "@/components/QuotePreview"

type CompanyInfo = { name: string; phone: string; email: string }

export default function Home() {
  const [quote, setQuote] = useState<Quote | null>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [step, setStep] = useState<"input" | "preview">("input")

  const handleQuoteGenerated = (q: Quote, company: CompanyInfo) => {
    setQuote(q)
    setCompanyInfo(company)
    setStep("preview")
  }

  const handleBack = () => {
    setStep("input")
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f4f8" }}>
      {/* Header */}
      <header
        className="px-6 py-5 flex items-center justify-between"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#c9a84c" }}
          >
            QuoteCraft
          </h1>
          <p className="text-xs mt-0.5 text-gray-400">
            Professional Quotes in Seconds
          </p>
        </div>
        <UserButton />
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {step === "input" && (
          <QuoteForm onQuoteGenerated={handleQuoteGenerated} />
        )}
        {step === "preview" && quote && companyInfo && (
          <QuotePreview
            quote={quote}
            companyName={companyInfo.name}
            companyPhone={companyInfo.phone}
            companyEmail={companyInfo.email}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  )
}
