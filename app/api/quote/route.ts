import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'

const FREE_LIMIT = 5

async function checkAndIncrementUsage(userId: string): Promise<{ allowed: boolean; count: number }> {
  const today = new Date().toISOString().split('T')[0]

  const { data: usage } = await supabase
    .from('usage')
    .select('quote_count, reset_date')
    .eq('user_id', userId)
    .single()

  if (usage) {
    const resetDate = new Date(usage.reset_date)
    const daysSinceReset = Math.floor((Date.now() - resetDate.getTime()) / (1000 * 60 * 60 * 24))

    // Reset if more than 30 days since last reset
    if (daysSinceReset >= 30) {
      await supabase
        .from('usage')
        .update({ quote_count: 1, reset_date: today })
        .eq('user_id', userId)
      return { allowed: true, count: 1 }
    }

    if (usage.quote_count >= FREE_LIMIT) {
      return { allowed: false, count: usage.quote_count }
    }

    await supabase
      .from('usage')
      .update({ quote_count: usage.quote_count + 1 })
      .eq('user_id', userId)

    return { allowed: true, count: usage.quote_count + 1 }
  }

  // First quote ever — create the row
  await supabase
    .from('usage')
    .insert({ user_id: userId, quote_count: 1, reset_date: today })

  return { allowed: true, count: 1 }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const { jobDescription } = await request.json()

    if (userId) {
      const { allowed, count } = await checkAndIncrementUsage(userId)
      if (!allowed) {
        return NextResponse.json(
          { error: 'Free limit reached. Upgrade to Pro.', count },
          { status: 403 }
        )
      }
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a professional estimator for Canadian contractors in Vancouver BC. Extract job details and return ONLY valid JSON, no markdown, no explanation:
{
  clientName: string (Unknown if not mentioned),
  jobTitle: string,
  jobAddress: string (Not specified if not mentioned),
  jobDescription: string (2-3 sentence professional description),
  lineItems: [{ description: string, quantity: number, unit: string, unitPrice: number, total: number }],
  laborTotal: number,
  materialsTotal: number,
  subtotal: number,
  tax: number,
  taxRate: 0.05,
  grandTotal: number,
  estimatedDays: number,
  validDays: 30,
  notes: string
}
Use realistic Vancouver BC market rates. GST is 5%.`,
      messages: [{ role: 'user', content: jobDescription }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const cleaned = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const quote = JSON.parse(cleaned)

    const { error: dbError } = await supabase.from('quotes').insert({
      user_id: userId,
      client_name: quote.clientName,
      job_title: quote.jobTitle,
      job_address: quote.jobAddress,
      job_description: quote.jobDescription,
      line_items: quote.lineItems,
      labor_total: quote.laborTotal,
      materials_total: quote.materialsTotal,
      subtotal: quote.subtotal,
      tax: quote.tax,
      grand_total: quote.grandTotal,
      estimated_days: quote.estimatedDays,
      notes: quote.notes,
    })

    if (dbError) console.error('Supabase insert error:', dbError)

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quote generation error:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
