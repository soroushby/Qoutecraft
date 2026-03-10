"use client"

import { useState } from "react"

type Status = "draft" | "sent" | "accepted" | "rejected"

interface Props {
  id: string
  jobTitle: string
  clientName: string
  grandTotal: number
  createdAt: string
  status: Status
}

const STATUS_CONFIG: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  draft:    { label: "Draft",    dot: "bg-gray-400",  bg: "bg-gray-100",  text: "text-gray-600" },
  sent:     { label: "Sent",     dot: "bg-blue-500",  bg: "bg-blue-50",   text: "text-blue-700" },
  accepted: { label: "Accepted", dot: "bg-green-500", bg: "bg-green-50",  text: "text-green-700" },
  rejected: { label: "Rejected", dot: "bg-red-500",   bg: "bg-red-50",    text: "text-red-700" },
}

const fmt = (n: number) =>
  Number(n).toLocaleString("en-CA", { style: "currency", currency: "CAD" })

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

export default function QuoteCard({ id, jobTitle, clientName, grandTotal, createdAt, status: initialStatus }: Props) {
  const [status, setStatus] = useState<Status>(initialStatus)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(false)

  const handleStatusChange = async (newStatus: Status) => {
    if (newStatus === status) return
    setUpdating(true)
    setUpdateError(false)
    try {
      const res = await fetch("/api/quote/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: id, status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
      } else {
        setUpdateError(true)
      }
    } catch {
      setUpdateError(true)
    } finally {
      setUpdating(false)
    }
  }

  const cfg = STATUS_CONFIG[status]

  return (
    <li className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 flex items-center justify-between hover:shadow-md transition-shadow">
      {/* Left: icon + info */}
      <div className="flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "#1a1a2e" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{jobTitle}</p>
          <p className="text-xs text-gray-500 mt-0.5">{clientName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{fmtDate(createdAt)}</p>
        </div>
      </div>

      {/* Right: total + status + dropdown */}
      <div className="flex items-center gap-3">
        {updateError && (
          <span className="text-xs text-red-500" title="Failed to update status">⚠ Failed</span>
        )}
        <div className="text-right">
          <p className="text-base font-extrabold" style={{ color: "#1a1a2e" }}>
            {fmt(grandTotal)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Grand Total</p>
        </div>

        {/* Status badge + dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as Status)}
            disabled={updating}
            className={`
              appearance-none text-xs font-semibold pl-6 pr-7 py-1.5 rounded-full border-0 cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed transition-all
              ${cfg.bg} ${cfg.text}
            `}
          >
            {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>
          {/* Colored dot */}
          <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${cfg.dot} pointer-events-none`} />
          {/* Chevron */}
          {updating ? (
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${cfg.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </li>
  )
}
