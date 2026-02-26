import { useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import WeekendCard from './WeekendCard'
import WeekendCardGrid from './WeekendCardGrid'
import CalendarLegend from './CalendarLegend'
import ViewModeToggle from './ViewModeToggle'

dayjs.extend(isoWeek)

const VIEW_KEY = 'cal_views_view_mode'

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

function filterEvents(events, hiddenCalendarIds) {
  if (!events || hiddenCalendarIds.size === 0) return events
  if (!events) return events
  return {
    saturday: events.saturday.filter((e) => !hiddenCalendarIds.has(e.calendarId)),
    sunday: events.sunday.filter((e) => !hiddenCalendarIds.has(e.calendarId)),
  }
}

export default function WeekendStrip({ accessToken }) {
  const scrollRef = useRef(null)
  const weekends = useMemo(() => getUpcomingWeekends(12), [])
  const { eventsByWeekend, calendars, loading, error } = useCalendarEvents(accessToken, weekends)
  const [hiddenCalendarIds, setHiddenCalendarIds] = useState(new Set())
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_KEY) || 'schedule')

  const handleViewChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem(VIEW_KEY, mode)
  }

  // Build a map of calendarId → background color from Google's API
  const calendarColors = useMemo(() => {
    const map = {}
    calendars.forEach((cal) => {
      map[cal.id] = cal.backgroundColor || '#4285f4'
    })
    return map
  }, [calendars])

  const toggleCalendar = (calendarId) => {
    setHiddenCalendarIds((prev) => {
      const next = new Set(prev)
      if (next.has(calendarId)) {
        next.delete(calendarId)
      } else {
        next.add(calendarId)
      }
      return next
    })
  }

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const scrollAmount = viewMode === 'calendar' ? 420 : 340
    el.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' })
  }

  const CardComponent = viewMode === 'calendar' ? WeekendCardGrid : WeekendCard

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Title bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-base font-medium text-gray-600 dark:text-gray-300">Upcoming weekends</h2>
          <ViewModeToggle viewMode={viewMode} onChange={handleViewChange} />
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-sm text-gray-400 dark:text-gray-500">Loading events…</span>
          )}
          {error && (
            <span className="text-sm text-red-400">Could not load events</span>
          )}
          <button
            onClick={() => scroll(-1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => scroll(1)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Calendar legend */}
      {calendars.length > 0 && (
        <CalendarLegend
          calendars={calendars}
          calendarColors={calendarColors}
          hiddenCalendarIds={hiddenCalendarIds}
          onToggle={toggleCalendar}
        />
      )}

      {/* Scrollable weekend strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-6 pb-6 flex-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', overscrollBehaviorX: 'contain' }}
      >
        {weekends.map((weekend) => (
          <CardComponent
            key={weekend.key}
            weekend={weekend}
            events={filterEvents(eventsByWeekend[weekend.key], hiddenCalendarIds)}
            loading={loading}
            calendarColors={calendarColors}
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
