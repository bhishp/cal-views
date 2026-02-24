import { useState, useEffect } from 'react'
import dayjs from 'dayjs'

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'

export function useCalendarEvents(accessToken, weekends) {
  const [eventsByWeekend, setEventsByWeekend] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!accessToken || weekends.length === 0) return

    const firstSat = weekends[0].saturday
    const lastSun = weekends[weekends.length - 1].sunday

    const timeMin = firstSat.startOf('day').toISOString()
    const timeMax = lastSun.endOf('day').toISOString()

    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    fetch(`${CALENDAR_API}/calendars/primary/events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // Group events by which weekend they belong to
        const grouped = {}
        weekends.forEach(({ saturday, sunday, key }) => {
          const satStr = saturday.format('YYYY-MM-DD')
          const sunStr = sunday.format('YYYY-MM-DD')
          grouped[key] = { saturday: [], sunday: [] }

          data.items?.forEach((event) => {
            const eventDate =
              event.start?.date || event.start?.dateTime?.slice(0, 10)
            if (eventDate === satStr) grouped[key].saturday.push(event)
            if (eventDate === sunStr) grouped[key].sunday.push(event)
          })
        })
        setEventsByWeekend(grouped)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [accessToken, weekends])

  return { eventsByWeekend, loading, error }
}
