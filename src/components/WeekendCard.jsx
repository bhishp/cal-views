import dayjs from 'dayjs'

// Convert a hex color to a lighter background tint
function hexToTint(hex, opacity = 0.15) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function formatTime(event) {
  if (event.start?.date) return 'All day'
  if (event.start?.dateTime) {
    return dayjs(event.start.dateTime).format('h:mm A')
  }
  return ''
}

function DaySection({ label, date, events, loading, calendarColors }) {
  const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            isToday ? 'bg-blue-600 text-white' : 'text-gray-400'
          }`}
        >
          {date.format('D')}
        </span>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
        {loading ? (
          <>
            <div className="h-5 bg-gray-100 rounded animate-pulse" />
            <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4" />
          </>
        ) : events && events.length > 0 ? (
          events.map((event) => {
            const color = calendarColors?.[event.calendarId] || '#4285f4'
            return (
              <div
                key={event.id}
                className="text-xs rounded px-2 py-1 leading-snug"
                style={{
                  backgroundColor: hexToTint(color),
                  color: color,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div className="font-medium truncate">{event.summary || '(no title)'}</div>
                <div style={{ opacity: 0.7 }}>{formatTime(event)}</div>
              </div>
            )
          })
        ) : (
          !loading && (
            <span className="text-xs text-gray-300 italic">Free</span>
          )
        )}
      </div>
    </div>
  )
}

export default function WeekendCard({ weekend, events, loading, calendarColors }) {
  const { saturday, sunday } = weekend
  const isSameMonth = saturday.format('MM') === sunday.format('MM')
  const monthDisplay = isSameMonth
    ? saturday.format('MMMM YYYY')
    : `${saturday.format('MMM')} / ${sunday.format('MMM YYYY')}`

  const totalEvents =
    (events?.saturday?.length ?? 0) + (events?.sunday?.length ?? 0)
  const isBusy = totalEvents >= 3
  const isFree = !loading && totalEvents === 0

  return (
    <div
      className={`flex-none w-64 rounded-xl border flex flex-col p-4 transition-shadow hover:shadow-md bg-white ${
        isFree
          ? 'border-green-200'
          : isBusy
          ? 'border-orange-200'
          : 'border-gray-200'
      }`}
    >
      {/* Card header */}
      <div className="mb-3">
        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
          {monthDisplay}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-700">
            {saturday.format('D')} – {sunday.format('D')}
          </div>
          {isFree && (
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
          {isBusy && (
            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
              Busy
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 mb-3" />

      {/* Day sections */}
      <div className="flex gap-3 flex-1 min-h-0">
        <DaySection
          label="Sat"
          date={saturday}
          events={events?.saturday}
          loading={loading}
          calendarColors={calendarColors}
        />
        <div className="w-px bg-gray-100" />
        <DaySection
          label="Sun"
          date={sunday}
          events={events?.sunday}
          loading={loading}
          calendarColors={calendarColors}
        />
      </div>
    </div>
  )
}
