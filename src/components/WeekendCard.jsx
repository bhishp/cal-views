import dayjs from 'dayjs'

const EVENT_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
]

function eventColor(index) {
  return EVENT_COLORS[index % EVENT_COLORS.length]
}

function formatTime(event) {
  if (event.start?.date) return 'All day'
  if (event.start?.dateTime) {
    return dayjs(event.start.dateTime).format('h:mm A')
  }
  return ''
}

function DaySection({ label, date, events, loading }) {
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
          events.map((event, i) => (
            <div
              key={event.id}
              className={`text-xs rounded px-2 py-1 ${eventColor(i)} leading-snug`}
            >
              <div className="font-medium truncate">{event.summary || '(no title)'}</div>
              <div className="opacity-70">{formatTime(event)}</div>
            </div>
          ))
        ) : (
          !loading && (
            <span className="text-xs text-gray-300 italic">Free</span>
          )
        )}
      </div>
    </div>
  )
}

export default function WeekendCard({ weekend, events, loading }) {
  const { saturday, sunday } = weekend
  const monthLabel = saturday.format('MMM')
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
        />
        <div className="w-px bg-gray-100" />
        <DaySection
          label="Sun"
          date={sunday}
          events={events?.sunday}
          loading={loading}
        />
      </div>
    </div>
  )
}
