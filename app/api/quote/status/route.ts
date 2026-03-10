import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

const VALID_STATUSES = ['draft', 'sent', 'accepted', 'rejected']

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quoteId, status } = await request.json()

    if (!quoteId || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid quoteId or status' }, { status: 400 })
    }

    // Only update if the quote belongs to this user
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', quoteId)
      .eq('user_id', userId)
      .select('id, status')
      .single()

    if (error || !data) {
      console.error('Status update error:', error)
      return NextResponse.json({ error: 'Quote not found or update failed' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Status route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
