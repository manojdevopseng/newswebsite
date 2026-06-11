'use client'

import { useEffect, useState } from 'react'

// Browsers sometimes return "GMT+5:30" instead of "IST" — fix known offsets
const TZ_FIX: Record<string, string> = {
  'GMT+5:30':  'IST',
  'GMT+5:45':  'NPT',   // Nepal
  'GMT+6':     'BST',   // Bangladesh
  'GMT+6:30':  'MMT',   // Myanmar
  'GMT+7':     'WIB',   // Indonesia West
  'GMT+8':     'CST',   // China / Singapore / HK
  'GMT+9':     'JST',   // Japan
  'GMT+9:30':  'ACST',  // Australia Central
  'GMT+10':    'AEST',  // Australia East
  'GMT+11':    'AEDT',
  'GMT+3':     'AST',   // Arabia
  'GMT+4':     'GST',   // UAE / Dubai
  'GMT+3:30':  'IRST',  // Iran
  'GMT-5':     'EST',
  'GMT-4':     'EDT',
  'GMT-6':     'CST',
  'GMT-7':     'MST',
  'GMT-8':     'PST',
}

interface Props { date: string }

export function PublishDate({ date }: Props) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const d      = new Date(date)
    if (isNaN(d.getTime())) return

    // Get date/time parts without timezone name first
    const datePart = d.toLocaleString('en-US', {
      timeZone: userTz,
      day:      'numeric',
      month:    'short',
      year:     'numeric',
      hour:     'numeric',
      minute:   '2-digit',
      hour12:   true,
    })

    // Get timezone abbreviation separately so we can fix "GMT+X:XX"
    const tzRaw = new Intl.DateTimeFormat('en-US', {
      timeZone:     userTz,
      timeZoneName: 'short',
    }).formatToParts(d).find(p => p.type === 'timeZoneName')?.value ?? ''

    const tz = TZ_FIX[tzRaw] ?? tzRaw

    setFormatted(`${datePart} ${tz}`)
  }, [date])

  // SSR fallback — IST until hydration
  const _d = new Date(date)
  const fallback = isNaN(_d.getTime()) ? '' : _d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day:      'numeric',
    month:    'short',
    year:     'numeric',
    hour:     'numeric',
    minute:   '2-digit',
    hour12:   true,
  }) + ' IST'

  return <time dateTime={date}>{formatted || fallback}</time>
}
