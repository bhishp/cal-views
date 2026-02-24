import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

async function fetchCalendarList(accessToken) {
  const res = await fetch(`${CALENDAR_API}/users/me/calendarList`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`CalendarList API error: ${res.status}`)
  const data = await res.json()
  // Return all selected (visible) calendars
  return data.items?.filter((cal) => cal.selected) ?? []
}

async function fetchEventsForCalendar(accessToken, calendarId, timeMin, timeMax) {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  })

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) throw new Error(`Calendar API error: ${res.status} for ${calendarId}`)
  const data = await res.json()
  return (data.items ?? []).map((event) => ({
    ...event,
    calendarId,
  }))
}

function groupEventsByWeekend(allEvents, weekends) {
  const grouped = {}
  weekends.forEach(({ saturday, sunday, key }) => {
    const satStr = saturday.format('YYYY-MM-DD')
    const sunStr = sunday.format('YYYY-MM-DD')
    grouped[key] = { saturday: [], sunday: [] }

    allEvents.forEach((event) => {
      const eventDate =
        event.start?.date || event.start?.dateTime?.slice(0, 10)
      if (eventDate === satStr) grouped[key].saturday.push(event)
      if (eventDate === sunStr) grouped[key].sunday.push(event)
    })
  })

  // Sort events within each day by start time
  for (const key of Object.keys(grouped)) {
    for (const day of ['saturday', 'sunday']) {
      grouped[key][day].sort((a, b) => {
        const aTime = a.start?.dateTime || a.start?.date || ''
        const bTime = b.start?.dateTime || b.start?.date || ''
        return aTime.localeCompare(bTime)
      })
    }
  }

  return grouped
}

export function useCalendarEvents(accessToken, weekends) {
  const [eventsByWeekend, setEventsByWeekend] = useState({})
  const [calendars, setCalendars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!accessToken || weekends.length === 0) return

    const firstSat = weekends[0].saturday
    const lastSun = weekends[weekends.length - 1].sunday
    const timeMin = firstSat.startOf('day').toISOString()
    const timeMax = lastSun.endOf('day').toISOString()

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCalendarList(accessToken)
      .then((cals) => {
        if (cancelled) return
        setCalendars(cals)
        // Fetch events from all visible calendars in parallel
        return Promise.all(
          cals.map((cal) =>
            fetchEventsForCalendar(accessToken, cal.id, timeMin, timeMax)
          )
        )
      })
      .then((results) => {
        if (cancelled || !results) return
        const allEvents = results.flat()
        setEventsByWeekend(groupEventsByWeekend(allEvents, weekends))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [accessToken, weekends])

  return { eventsByWeekend, calendars, loading, error }
}
