import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { LineItem } from '@/types/quote'

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { clientEmail, quote, companyName, companyPhone, companyEmail } =
      await request.json()

    const fmt = (n: number) =>
      Number(n).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })

    const lineItemsRows = quote.lineItems
      .map(
        (item: LineItem) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;">${item.description}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right;">${item.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right;">${item.unit}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right;">${fmt(item.unitPrice)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#374151;text-align:right;font-weight:600;">${fmt(item.total)}</td>
        </tr>`
      )
      .join('')

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:32px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0 0 4px;color:#c9a84c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Estimate</p>
                  <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;">${companyName || 'Your Contractor'}</h1>
                  ${companyPhone ? `<p style="margin:6px 0 0;color:#c9a84c;font-size:13px;">${companyPhone}</p>` : ''}
                  ${companyEmail ? `<p style="margin:2px 0 0;color:#c9a84c;font-size:13px;">${companyEmail}</p>` : ''}
                </td>
                <td align="right" valign="top">
                  <p style="margin:0;color:#c9a84c;font-size:26px;font-weight:800;">QT-${String(Date.now()).slice(-6)}</p>
                  <p style="margin:4px 0 0;color:#9ca3af;font-size:12px;">${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Prepared For / Project -->
        <tr>
          <td style="padding:28px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" valign="top">
                  <p style="margin:0 0 6px;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Prepared For</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:700;">${quote.clientName}</p>
                  ${quote.jobAddress && quote.jobAddress !== 'Not specified' ? `<p style="margin:3px 0 0;color:#6b7280;font-size:13px;">${quote.jobAddress}</p>` : ''}
                </td>
                <td width="50%" valign="top">
                  <p style="margin:0 0 6px;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Project</p>
                  <p style="margin:0;color:#111827;font-size:15px;font-weight:700;">${quote.jobTitle}</p>
                  <p style="margin:3px 0 0;color:#6b7280;font-size:13px;">Est. ${quote.estimatedDays} day${quote.estimatedDays !== 1 ? 's' : ''}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="height:2px;background:#c9a84c;border-radius:2px;"></div>
          </td>
        </tr>

        <!-- Scope of Work -->
        <tr>
          <td style="padding:20px 40px 0;">
            <p style="margin:0 0 8px;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Scope of Work</p>
            <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">${quote.jobDescription}</p>
          </td>
        </tr>

        <!-- Line Items -->
        <tr>
          <td style="padding:20px 40px 0;">
            <p style="margin:0 0 12px;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Line Items</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#1a1a2e;">
                  <th style="padding:10px 12px;color:#ffffff;font-size:12px;font-weight:600;text-align:left;">Description</th>
                  <th style="padding:10px 12px;color:#ffffff;font-size:12px;font-weight:600;text-align:right;">Qty</th>
                  <th style="padding:10px 12px;color:#ffffff;font-size:12px;font-weight:600;text-align:right;">Unit</th>
                  <th style="padding:10px 12px;color:#ffffff;font-size:12px;font-weight:600;text-align:right;">Unit Price</th>
                  <th style="padding:10px 12px;color:#ffffff;font-size:12px;font-weight:600;text-align:right;">Total</th>
                </tr>
              </thead>
              <tbody>${lineItemsRows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:20px 40px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td></td>
                <td width="260">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;">Labour</td>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;text-align:right;">${fmt(quote.laborTotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;">Materials</td>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;text-align:right;">${fmt(quote.materialsTotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0 5px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;">Subtotal</td>
                      <td style="padding:8px 0 5px;color:#6b7280;font-size:13px;text-align:right;border-top:1px solid #e5e7eb;">${fmt(quote.subtotal)}</td>
                    </tr>
                    <tr>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;">GST (5%)</td>
                      <td style="padding:5px 0;color:#6b7280;font-size:13px;text-align:right;">${fmt(quote.tax)}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:8px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:10px;">
                          <tr>
                            <td style="padding:12px 16px;color:#ffffff;font-size:13px;font-weight:600;">Grand Total</td>
                            <td style="padding:12px 16px;color:#c9a84c;font-size:18px;font-weight:800;text-align:right;">${fmt(quote.grandTotal)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${quote.notes ? `
        <!-- Notes -->
        <tr>
          <td style="padding:20px 40px 0;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
              <p style="margin:0 0 6px;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Notes</p>
              <p style="margin:0;color:#374151;font-size:13px;line-height:1.5;">${quote.notes}</p>
            </div>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="padding:28px 40px;margin-top:28px;background:#1a1a2e;text-align:center;margin-top:28px;">
            <p style="margin:0;color:#c9a84c;font-size:13px;">Valid for ${quote.validDays} days from date of issue</p>
            <p style="margin:6px 0 0;color:#6b7280;font-size:11px;">All prices in Canadian dollars · GST included as noted above</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    const { error } = await resend.emails.send({
      from: 'QuoteCraft <onboarding@resend.dev>',
      to: clientEmail,
      subject: `Your Quote from ${companyName || 'Your Contractor'} — ${quote.jobTitle}`,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
