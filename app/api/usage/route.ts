import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ count: 0, limit: 5 })

    const { data } = await supabase
      .from('usage')
      .select('quote_count, reset_date')
      .eq('user_id', userId)
      .single()

    if (!data) return NextResponse.json({ count: 0, limit: 5 })

    const resetDate = new Date(data.reset_date)
    const daysSinceReset = Math.floor((Date.now() - resetDate.getTime()) / (1000 * 60 * 60 * 24))
    const count = daysSinceReset >= 30 ? 0 : data.quote_count

    return NextResponse.json({ count, limit: 5 })
  } catch {
    return NextResponse.json({ count: 0, limit: 5 })
  }
}
