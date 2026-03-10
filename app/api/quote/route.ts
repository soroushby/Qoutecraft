import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client } from '@/lib/anthropic'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const { jobDescription } = await request.json()

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

    await supabase.from('quotes').insert({
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

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Quote generation error:', error)
    return NextResponse.json({ error: 'Failed to generate quote' }, { status: 500 })
  }
}
