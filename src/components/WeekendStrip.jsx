import { useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import WeekendCard from './WeekendCard'

dayjs.extend(isoWeek)

// Generate the next N weekends starting from today
function getUpcomingWeekends(count = 12) {
  const weekends = []
  let date = dayjs()

  // If today is after Sunday, start from next Saturday
  const dow = date.day() // 0=Sun, 6=Sat
  let daysToSat
  if (dow === 6) {
    daysToSat = 0
  } else if (dow === 0) {
    daysToSat = 6 // next Saturday
  } else {
    daysToSat = 6 - dow
  }

  let saturday = date.add(daysToSat, 'day').startOf('day')

  for (let i = 0; i < count; i++) {
    const sunday = saturday.add(1, 'day')
    weekends.push({
      key: saturday.format('YYYY-MM-DD'),
      saturday,
      sunday,
    })
    saturday = saturday.add(7, 'day')
  }

  return weekends
}

export default function WeekendStrip({ accessToken }) {
  const scrollRef = useRef(null)
  const weekends = useMemo(() => getUpcomingWeekends(12), [])
  const { eventsByWeekend, loading, error } = useCalendarEvents(accessToken, weekends)

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * 320, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Title bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-medium text-gray-600">Upcoming weekends</h2>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-sm text-gray-400">Loading events…</span>
          )}
          {error && (
            <span className="text-sm text-red-400">Could not load events</span>
          )}
          <button
            onClick={() => scroll(-1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Scrollable weekend strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-6 pb-6 flex-1 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {weekends.map((weekend) => (
          <WeekendCard
            key={weekend.key}
            weekend={weekend}
            events={eventsByWeekend[weekend.key]}
            loading={loading}
            accessToken={accessToken}
          />
        ))}
      </div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
