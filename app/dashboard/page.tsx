import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { supabase } from "@/lib/supabase"
import QuoteCard from "@/components/QuoteCard"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) redirect("/")

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, job_title, client_name, grand_total, created_at, status")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: "#1a1a2e" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#c9a84c" }}>
              <span className="text-[#1a1a2e] font-black text-sm">Q</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Quote<span style={{ color: "#c9a84c" }}>Craft</span>
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition">New Quote</Link>
            <Link href="/dashboard" className="text-sm text-white font-medium">My Quotes</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition hover:opacity-90"
              style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
            >
              + New Quote
            </Link>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-2xl font-extrabold text-[#1a1a2e] tracking-tight">My Quotes</h1>
        <p className="text-sm text-gray-500 mt-1">
          {quotes && quotes.length > 0
            ? `${quotes.length} saved estimate${quotes.length !== 1 ? "s" : ""}`
            : "Your saved estimates will appear here"}
        </p>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        {!quotes || quotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center py-20 px-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#f0f2f5" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-base mb-1">No quotes yet.</p>
            <p className="text-gray-400 text-sm mb-6">Generate your first AI-powered estimate.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl text-white transition hover:opacity-90"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              <span style={{ color: "#c9a84c" }}>✦</span>
              Create a Quote
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => (
              <QuoteCard
                key={q.id}
                id={q.id}
                jobTitle={q.job_title}
                clientName={q.client_name}
                grandTotal={q.grand_total}
                createdAt={q.created_at}
                status={(q.status as "draft" | "sent" | "accepted" | "rejected") ?? "draft"}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
