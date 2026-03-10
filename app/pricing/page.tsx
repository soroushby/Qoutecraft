import Link from "next/link"
import { UserButton } from "@clerk/nextjs"

export default function PricingPage() {
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
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">My Quotes</Link>
          </div>
          <UserButton />
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-14 pb-10 text-center px-4">
        <h1 className="text-4xl font-extrabold text-[#1a1a2e] tracking-tight">
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-gray-500 text-base max-w-sm mx-auto">
          Start free. Upgrade when you need more.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Free Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-[#1a1a2e]">$0</span>
                <span className="text-gray-400 text-sm mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Perfect for getting started</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {[
                "5 quotes per month",
                "AI-generated estimates",
                "Vancouver BC market rates",
                "PDF export & print",
                "Email to clients",
                "Editable line items",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="w-full py-3 rounded-xl text-center text-sm font-semibold border-2 text-[#1a1a2e] border-[#1a1a2e] hover:bg-gray-50 transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="rounded-2xl p-8 flex flex-col relative overflow-hidden" style={{ backgroundColor: "#1a1a2e" }}>
            {/* Popular badge */}
            <div className="absolute top-5 right-5">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}>
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#c9a84c" }}>Pro</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">$49</span>
                <span className="text-gray-400 text-sm mb-1">/month</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">For contractors who quote daily</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {[
                "Unlimited quotes",
                "Everything in Free",
                "Custom branding & logo",
                "Quote history & dashboard",
                "Priority support",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#c9a84c" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-3 rounded-xl text-sm font-semibold text-[#1a1a2e] opacity-80 cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: "#c9a84c" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Coming Soon
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          All prices in CAD · Cancel anytime · No credit card required for free plan
        </p>
      </div>
    </div>
  )
}
