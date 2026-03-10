"use client"

import { useState } from "react"
import { Quote, LineItem } from "@/types/quote"

interface Props {
  quote: Quote
  companyName: string
  companyPhone: string
  companyEmail: string
  companyLogo?: string
  onBack: () => void
}

interface EditableItem extends LineItem {
  total: number
}

interface Totals {
  laborTotal: number
  materialsTotal: number
  subtotal: number
  tax: number
  grandTotal: number
}

function recalculate(items: EditableItem[]): Totals {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const laborKeywords = /labour|labor|install|demo/i
  const laborTotal = items
    .filter((item) => laborKeywords.test(item.description))
    .reduce((sum, item) => sum + item.total, 0)
  const materialsTotal = subtotal - laborTotal
  const tax = subtotal * 0.05
  const grandTotal = subtotal + tax
  return { laborTotal, materialsTotal, subtotal, tax, grandTotal }
}

export default function QuotePreview({
  quote,
  companyName,
  companyPhone,
  companyEmail,
  companyLogo,
  onBack,
}: Props) {
  const quoteNumber = "QT-" + String(Date.now()).slice(-6)
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const [items, setItems] = useState<EditableItem[]>(
    quote.lineItems.map((item) => ({ ...item, total: item.quantity * item.unitPrice }))
  )
  const [totals, setTotals] = useState<Totals>(() => recalculate(
    quote.lineItems.map((item) => ({ ...item, total: item.quantity * item.unitPrice }))
  ))
  const [editing, setEditing] = useState<{ row: number; col: string } | null>(null)

  const [showEmailModal, setShowEmailModal] = useState(false)
  const [clientEmail, setClientEmail] = useState("")
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState("")

  const handleSendEmail = async () => {
    setEmailError("")
    setEmailSending(true)
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail,
          quote: { ...quote, lineItems: items, ...totals },
          companyName,
          companyPhone,
          companyEmail,
        }),
      })
      if (!res.ok) throw new Error()
      setEmailSent(true)
    } catch {
      setEmailError("Failed to send. Please try again.")
    } finally {
      setEmailSending(false)
    }
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" })

  const updateItem = (index: number, field: keyof EditableItem, value: string) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const next = { ...item }
      if (field === "description") {
        next.description = value
      } else if (field === "quantity") {
        next.quantity = parseFloat(value) || 0
        next.total = next.quantity * next.unitPrice
      } else if (field === "unitPrice") {
        next.unitPrice = parseFloat(value) || 0
        next.total = next.quantity * next.unitPrice
      }
      return next
    })
    setItems(updated)
    setTotals(recalculate(updated))
  }

  const isEditing = (row: number, col: string) =>
    editing?.row === row && editing?.col === col

  const editableCellClass =
    "group relative cursor-pointer hover:bg-blue-50 rounded transition-colors"

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowEmailModal(true); setEmailSent(false); setEmailError("") }}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg border-2 transition"
            style={{ borderColor: "#1a1a2e", color: "#1a1a2e" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Client
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-lg text-white transition"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            {emailSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#f0fdf4" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Quote sent!</h3>
                <p className="text-sm text-gray-500 mb-6">
                  The estimate was delivered to <span className="font-medium text-gray-700">{clientEmail}</span>
                </p>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white"
                  style={{ backgroundColor: "#1a1a2e" }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Email Quote to Client</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Sends a professional HTML estimate</p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Client Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && clientEmail.trim() && handleSendEmail()}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 focus:border-[#c9a84c] transition bg-gray-50"
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{emailError}</p>
                  )}
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !clientEmail.trim()}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#1a1a2e" }}
                  >
                    {emailSending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send Quote
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quote Document */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="px-10 py-8 flex items-start justify-between" style={{ backgroundColor: "#1a1a2e" }}>
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#c9a84c" }}>Estimate</p>
            {companyLogo ? (
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={companyLogo}
                  alt="Company logo"
                  className="object-contain rounded"
                  style={{ maxHeight: "60px", maxWidth: "160px" }}
                />
                {companyName && (
                  <h1 className="text-xl font-bold text-white">{companyName}</h1>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-white">{companyName || "Your Company"}</h1>
            )}
            {companyPhone && <p className="text-sm mt-1" style={{ color: "#c9a84c" }}>{companyPhone}</p>}
            {companyEmail && <p className="text-sm" style={{ color: "#c9a84c" }}>{companyEmail}</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold" style={{ color: "#c9a84c" }}>{quoteNumber}</p>
            <p className="text-sm text-gray-400 mt-1">{today}</p>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">
          {/* Prepared For / Project */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Prepared For</p>
              <p className="text-base font-semibold text-gray-900">{quote.clientName}</p>
              {quote.jobAddress && quote.jobAddress !== "Not specified" && (
                <p className="text-sm text-gray-500 mt-0.5">{quote.jobAddress}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Project</p>
              <p className="text-base font-semibold text-gray-900">{quote.jobTitle}</p>
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
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Scope of Work</p>
            <p className="text-sm text-gray-700 leading-relaxed">{quote.jobDescription}</p>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Line Items</p>
              <p className="text-xs text-blue-400 print:hidden">Click any cell to edit</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#1a1a2e" }}>
                  <th className="text-left px-4 py-3 text-white font-semibold rounded-tl-lg">Description</th>
                  <th className="text-right px-4 py-3 text-white font-semibold">Qty</th>
                  <th className="text-right px-4 py-3 text-white font-semibold">Unit</th>
                  <th className="text-right px-4 py-3 text-white font-semibold">Unit Price</th>
                  <th className="text-right px-4 py-3 text-white font-semibold rounded-tr-lg">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100"
                    style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#ffffff" }}
                  >
                    {/* Description */}
                    <td
                      className={`px-4 py-3 text-gray-800 ${editableCellClass}`}
                      onClick={() => setEditing({ row: i, col: "description" })}
                    >
                      {isEditing(i, "description") ? (
                        <input
                          autoFocus
                          type="text"
                          defaultValue={item.description}
                          onBlur={(e) => {
                            updateItem(i, "description", e.target.value)
                            setEditing(null)
                          }}
                          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          className="w-full border-b border-blue-400 bg-transparent outline-none text-gray-800"
                        />
                      ) : (
                        <span className="flex items-center gap-1">
                          {item.description}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </span>
                      )}
                    </td>

                    {/* Quantity */}
                    <td
                      className={`px-4 py-3 text-right text-gray-600 ${editableCellClass}`}
                      onClick={() => setEditing({ row: i, col: "quantity" })}
                    >
                      {isEditing(i, "quantity") ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            updateItem(i, "quantity", e.target.value)
                            setEditing(null)
                          }}
                          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          className="w-16 text-right border-b border-blue-400 bg-transparent outline-none"
                        />
                      ) : (
                        <span className="flex items-center justify-end gap-1">
                          {item.quantity}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </span>
                      )}
                    </td>

                    {/* Unit (read-only) */}
                    <td className="px-4 py-3 text-right text-gray-600">{item.unit}</td>

                    {/* Unit Price */}
                    <td
                      className={`px-4 py-3 text-right text-gray-600 ${editableCellClass}`}
                      onClick={() => setEditing({ row: i, col: "unitPrice" })}
                    >
                      {isEditing(i, "unitPrice") ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={item.unitPrice}
                          onBlur={(e) => {
                            updateItem(i, "unitPrice", e.target.value)
                            setEditing(null)
                          }}
                          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                          className="w-24 text-right border-b border-blue-400 bg-transparent outline-none"
                        />
                      ) : (
                        <span className="flex items-center justify-end gap-1">
                          {fmt(item.unitPrice)}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity print:hidden flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
                          </svg>
                        </span>
                      )}
                    </td>

                    {/* Total (auto-calculated) */}
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
                <span>{fmt(totals.laborTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Materials</span>
                <span>{fmt(totals.materialsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 border-t border-gray-200 pt-2">
                <span>Subtotal</span>
                <span>{fmt(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (5%)</span>
                <span>{fmt(totals.tax)}</span>
              </div>
              <div
                className="flex justify-between items-center px-4 py-3 rounded-xl mt-1"
                style={{ backgroundColor: "#1a1a2e" }}
              >
                <span className="text-white font-semibold text-sm">Grand Total</span>
                <span className="text-xl font-bold" style={{ color: "#c9a84c" }}>
                  {fmt(totals.grandTotal)}
                </span>
              </div>
              <p className="text-xs text-gray-400 text-center pt-1 leading-relaxed">
                AI-generated estimates based on Vancouver market rates. Review all figures before sending to clients.
              </p>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{quote.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-5 text-center" style={{ backgroundColor: "#1a1a2e" }}>
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
