export default function ViewModeToggle({ viewMode, onChange }) {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
      <button
        onClick={() => onChange('schedule')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
          viewMode === 'schedule'
            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        title="Schedule view"
      >
        <ListIcon />
        <span className="hidden sm:inline">Schedule</span>
      </button>
      <button
        onClick={() => onChange('calendar')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-colors ${
          viewMode === 'calendar'
            ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
        }`}
        title="Calendar view"
      >
        <GridIcon />
        <span className="hidden sm:inline">Calendar</span>
      </button>
    </div>
  )
}

function ListIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}
