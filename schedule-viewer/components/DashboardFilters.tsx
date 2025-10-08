'use client';

interface DashboardFiltersProps {
  tcNames: string[];
  selectedTC: string;
  onTCChange: (tc: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: { start: string; end: string };
}

export default function DashboardFilters({
  tcNames,
  selectedTC,
  onTCChange,
  selectedDate,
  onDateChange,
  searchQuery,
  onSearchChange,
  dateRange,
}: DashboardFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* TC Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Treatment Coordinator
          </label>
          <select
            value={selectedTC}
            onChange={(e) => onTCChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All TCs</option>
            {tcNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        {/* Search */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Location or Patient
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Date Range Info */}
      {dateRange.start && dateRange.end && (
        <div className="text-sm text-gray-600">
          Showing schedules from <span className="font-medium">{dateRange.start}</span> to{' '}
          <span className="font-medium">{dateRange.end}</span>
        </div>
      )}
    </div>
  );
}
