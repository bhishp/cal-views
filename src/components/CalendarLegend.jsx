export default function CalendarLegend({ calendars, calendarColors, hiddenCalendarIds, onToggle }) {
  return (
    <div className="flex items-center gap-3 px-6 pb-3 flex-wrap">
      {calendars.map((cal) => {
        const color = calendarColors[cal.id] || '#4285f4'
        const isHidden = hiddenCalendarIds.has(cal.id)

        return (
          <button
            key={cal.id}
            onClick={() => onToggle(cal.id)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              isHidden
                ? 'border-gray-200 text-gray-400 bg-white'
                : 'border-gray-200 text-gray-700 bg-white hover:shadow-sm'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: isHidden ? '#d1d5db' : color,
              }}
            />
            <span className={isHidden ? 'line-through' : ''}>
              {cal.summary}
            </span>
          </button>
        )
      })}
    </div>
  )
}
