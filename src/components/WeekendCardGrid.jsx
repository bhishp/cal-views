import dayjs from 'dayjs'

const HOUR_HEIGHT = 48 // px per hour
const START_HOUR = 7
const END_HOUR = 22
const TOTAL_HOURS = END_HOUR - START_HOUR
const HOURS = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)

function hexToTint(hex, opacity = 0.2) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function getEventTimes(event) {
  const start = dayjs(event.start.dateTime)
  const end = dayjs(event.end.dateTime)
  return {
    startMinutes: start.hour() * 60 + start.minute(),
    endMinutes: end.hour() * 60 + end.minute(),
  }
}

// Lay out overlapping events side by side (Google Calendar algorithm)
// Returns events with added `column` and `totalColumns` properties
function layoutOverlappingEvents(events) {
  if (events.length === 0) return []

  // Sort by start time, then by duration (longer first)
  const sorted = [...events]
    .map((e) => ({ ...e, ...getEventTimes(e) }))
    .sort((a, b) => a.startMinutes - b.startMinutes || (b.endMinutes - b.startMinutes) - (a.endMinutes - a.startMinutes))

  // Group into clusters of overlapping events
  const clusters = []
  let currentCluster = [sorted[0]]
  let clusterEnd = sorted[0].endMinutes

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startMinutes < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(sorted[i])
      clusterEnd = Math.max(clusterEnd, sorted[i].endMinutes)
    } else {
      clusters.push(currentCluster)
      currentCluster = [sorted[i]]
      clusterEnd = sorted[i].endMinutes
    }
  }
  clusters.push(currentCluster)

  // Assign columns within each cluster
  const result = []
  for (const cluster of clusters) {
    const columns = [] // each column tracks its end time
    for (const event of cluster) {
      // Find the first column where this event fits (doesn't overlap)
      let placed = false
      for (let col = 0; col < columns.length; col++) {
        if (event.startMinutes >= columns[col]) {
          columns[col] = event.endMinutes
          result.push({ ...event, column: col, totalColumns: 0 })
          placed = true
          break
        }
      }
      if (!placed) {
        result.push({ ...event, column: columns.length, totalColumns: 0 })
        columns.push(event.endMinutes)
      }
    }
    // Set totalColumns for all events in this cluster
    const total = columns.length
    for (const r of result) {
      if (cluster.some((c) => c.id === r.id)) {
        r.totalColumns = total
      }
    }
  }

  return result
}

function formatTimeRange(event) {
  if (event.start?.date) return 'All day'
  const start = dayjs(event.start.dateTime).format('h:mm')
  const end = dayjs(event.end.dateTime).format('h:mm A')
  return `${start} – ${end}`
}

function AllDaySection({ events, calendarColors }) {
  if (!events || events.length === 0) return null

  return (
    <div className="flex flex-col gap-1 px-0.5 mb-1">
      {events.map((event) => {
        const color = calendarColors?.[event.calendarId] || '#4285f4'
        return (
          <div
            key={event.id}
            className="text-xs rounded px-2 py-0.5 truncate cursor-default"
            title={event.summary || '(no title)'}
            style={{
              backgroundColor: hexToTint(color),
              color: color,
              borderLeft: `3px solid ${color}`,
            }}
          >
            {event.summary || '(no title)'}
          </div>
        )
      })}
    </div>
  )
}

function DayColumn({ events, calendarColors }) {
  const timedEvents = events?.filter((e) => e.start?.dateTime) ?? []
  const laid = layoutOverlappingEvents(timedEvents)

  return (
    <div className="relative flex-1 min-w-0" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
      {/* Hour lines */}
      {HOURS.map((hour) => (
        <div
          key={hour}
          className="absolute w-full border-t border-gray-100 dark:border-gray-700/50"
          style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
        />
      ))}

      {/* Timed events */}
      {laid.map((event) => {
        const startMinutes = event.startMinutes
        const endMinutes = event.endMinutes
        const durationMinutes = Math.max(endMinutes - startMinutes, 20)

        const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
        const height = (durationMinutes / 60) * HOUR_HEIGHT
        const clampedTop = Math.max(0, top)
        const clampedHeight = Math.min(height, TOTAL_HOURS * HOUR_HEIGHT - clampedTop)

        const widthPercent = 100 / event.totalColumns
        const leftPercent = event.column * widthPercent

        const color = calendarColors?.[event.calendarId] || '#4285f4'
        return (
          <div
            key={event.id}
            className="absolute rounded px-1 py-0.5 overflow-hidden cursor-default"
            title={`${event.summary || '(no title)'}\n${formatTimeRange(event)}`}
            style={{
              top: clampedTop,
              height: clampedHeight,
              left: `${leftPercent}%`,
              width: `calc(${widthPercent}% - 2px)`,
              backgroundColor: hexToTint(color, 0.25),
              color: color,
              borderLeft: `3px solid ${color}`,
              zIndex: 1,
            }}
          >
            <div className="text-xs font-medium truncate leading-tight">
              {event.summary || '(no title)'}
            </div>
            {clampedHeight >= 36 && (
              <div className="text-xs leading-tight" style={{ opacity: 0.7 }}>
                {formatTimeRange(event)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function WeekendCardGrid({ weekend, events, loading, calendarColors }) {
  const { saturday, sunday } = weekend
  const isSameMonth = saturday.format('MM') === sunday.format('MM')
  const monthDisplay = isSameMonth
    ? saturday.format('MMMM YYYY')
    : `${saturday.format('MMM')} / ${sunday.format('MMM YYYY')}`

  const totalEvents =
    (events?.saturday?.length ?? 0) + (events?.sunday?.length ?? 0)
  const isBusy = totalEvents >= 3
  const isFree = !loading && totalEvents === 0

  const satAllDay = events?.saturday?.filter((e) => e.start?.date) ?? []
  const sunAllDay = events?.sunday?.filter((e) => e.start?.date) ?? []

  return (
    <div
      className={`flex-none w-96 rounded-xl border flex flex-col p-4 transition-shadow hover:shadow-md overflow-hidden ${
        isFree
          ? 'border-green-200 dark:border-green-900 bg-white dark:bg-gray-800'
          : isBusy
          ? 'border-orange-200 dark:border-orange-900 bg-white dark:bg-gray-800'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      {/* Card header */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide mb-0.5">
          {monthDisplay}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {saturday.format('D')} – {sunday.format('D')}
          </div>
          {isFree && (
            <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
          {isBusy && (
            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              Busy
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-3" />

      {/* Day headers */}
      <div className="flex mb-2">
        <div className="w-10 flex-shrink-0" />
        <div className="flex flex-1 min-w-0">
          <DayHeader date={saturday} label="Sat" />
          <div className="w-px mx-1 flex-shrink-0" />
          <DayHeader date={sunday} label="Sun" />
        </div>
      </div>

      {/* All-day events row */}
      {(satAllDay.length > 0 || sunAllDay.length > 0) && (
        <div className="flex mb-2">
          <div className="w-10 flex-shrink-0" />
          <div className="flex flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <AllDaySection events={satAllDay} calendarColors={calendarColors} />
            </div>
            <div className="w-px mx-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <AllDaySection events={sunAllDay} calendarColors={calendarColors} />
            </div>
          </div>
        </div>
      )}

      {/* Time grid content */}
      <div className="flex flex-1 min-h-0 overflow-y-auto">
        {/* Hour labels */}
        <div className="flex-shrink-0 w-10 relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="absolute text-xs text-gray-400 dark:text-gray-500 -translate-y-1/2"
              style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}
            >
              {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
            </div>
          ))}
        </div>

        {/* Day columns aligned with hour labels */}
        <DayColumn events={events?.saturday} calendarColors={calendarColors} />
        <div className="w-px bg-gray-100 dark:bg-gray-700 mx-1 flex-shrink-0" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }} />
        <DayColumn events={events?.sunday} calendarColors={calendarColors} />
      </div>
    </div>
  )
}

function DayHeader({ date, label }) {
  const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  return (
    <div className="flex-1 flex items-center gap-2 px-1">
      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span
        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          isToday ? 'bg-blue-600 text-white' : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {date.format('D')}
      </span>
    </div>
  )
}
