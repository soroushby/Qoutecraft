import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) redirect("/")

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, job_title, client_name, grand_total, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  const fmt = (n: number) =>
    n.toLocaleString("en-CA", { style: "currency", currency: "CAD" })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f4f8" }}>
      {/* Header */}
      <header
        className="px-6 py-5 flex items-center justify-between"
        style={{ backgroundColor: "#1a1a2e" }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#c9a84c" }}>
            My Quotes
          </h1>
          <p className="text-xs mt-0.5 text-gray-400">Your saved estimates</p>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold px-4 py-2 rounded-lg transition"
          style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
        >
          + New Quote
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-10">
        {!quotes || quotes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-base mb-4">
              No quotes yet. Create your first quote.
            </p>
            <Link
              href="/"
              className="inline-block text-sm font-semibold px-6 py-3 rounded-lg text-white transition"
              style={{ backgroundColor: "#1a1a2e" }}
            >
              Create a Quote
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {quotes.map((q) => (
              <li
                key={q.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-5 flex items-center justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-gray-900">{q.job_title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{q.client_name}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmtDate(q.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "#1a1a2e" }}>
                    {fmt(q.grand_total)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Grand Total</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
