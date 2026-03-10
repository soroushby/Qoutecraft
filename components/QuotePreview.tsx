"use client"

import { Quote } from "@/types/quote"

interface Props {
  quote: Quote
  companyName: string
  companyPhone: string
  companyEmail: string
  onBack: () => void
}

export default function QuotePreview({
  quote,
  companyName,
  companyPhone,
  companyEmail,
  onBack,
}: Props) {
  const quoteNumber = "QT-" + String(Date.now()).slice(-6)
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" })

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg text-white transition"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
            />
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Quote Document */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="px-10 py-8 flex items-start justify-between" style={{ backgroundColor: "#1a1a2e" }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#c9a84c" }}>
              Estimate
            </p>
            <h1 className="text-2xl font-bold text-white">
              {companyName || "Your Company"}
            </h1>
            {companyPhone && (
              <p className="text-sm mt-1" style={{ color: "#c9a84c" }}>
                {companyPhone}
              </p>
            )}
            {companyEmail && (
              <p className="text-sm" style={{ color: "#c9a84c" }}>
                {companyEmail}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: "#c9a84c" }}>
              {quoteNumber}
            </p>
            <p className="text-sm text-gray-400 mt-1">{today}</p>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">
          {/* Prepared For / Project */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Prepared For
              </p>
              <p className="text-base font-semibold text-gray-900">
                {quote.clientName}
              </p>
              {quote.jobAddress && quote.jobAddress !== "Not specified" && (
                <p className="text-sm text-gray-500 mt-0.5">{quote.jobAddress}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Project
              </p>
              <p className="text-base font-semibold text-gray-900">
                {quote.jobTitle}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Estimated duration: {quote.estimatedDays}{" "}
                {quote.estimatedDays === 1 ? "day" : "days"}
              </p>
            </div>
          </div>

          {/* Gold Divider */}
          <div className="h-0.5 w-full rounded-full" style={{ backgroundColor: "#c9a84c" }} />

          {/* Job Description */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Scope of Work
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {quote.jobDescription}
            </p>
          </div>

          {/* Line Items Table */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Line Items
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1a1a2e" }}>
                  <th className="text-left px-4 py-3 text-white font-semibold rounded-tl-lg">
                    Description
                  </th>
                  <th className="text-right px-4 py-3 text-white font-semibold">
                    Qty
                  </th>
                  <th className="text-right px-4 py-3 text-white font-semibold">
                    Unit
                  </th>
                  <th className="text-right px-4 py-3 text-white font-semibold">
                    Unit Price
                  </th>
                  <th className="text-right px-4 py-3 text-white font-semibold rounded-tr-lg">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100"
                    style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#ffffff" }}
                  >
                    <td className="px-4 py-3 text-gray-800">{item.description}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {fmt(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Labour</span>
                <span>{fmt(quote.laborTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Materials</span>
                <span>{fmt(quote.materialsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-2">
                <span>Subtotal</span>
                <span>{fmt(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (5%)</span>
                <span>{fmt(quote.tax)}</span>
              </div>
              <div
                className="flex justify-between items-center px-4 py-3 rounded-xl mt-1"
                style={{ backgroundColor: "#1a1a2e" }}
              >
                <span className="text-white font-semibold text-sm">Grand Total</span>
                <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>
                  {fmt(quote.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-10 py-5 text-center"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          <p className="text-sm" style={{ color: "#c9a84c" }}>
            Valid for {quote.validDays} days from date of issue
          </p>
          <p className="text-xs text-gray-500 mt-1">
            All prices in Canadian dollars and include applicable taxes as noted above.
          </p>
        </div>
      </div>
    </div>
  )
}
