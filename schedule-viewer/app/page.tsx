'use client';

import { useEffect, useState, useMemo } from 'react';
import { loadAllData } from '@/lib/data-loader';
import { DashboardData } from '@/lib/types';
import CalendarGrid from '@/components/CalendarGrid';
import DashboardFilters from '@/components/DashboardFilters';
import StatsOverview from '@/components/StatsOverview';

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [selectedTC, setSelectedTC] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllData()
      .then((loadedData) => {
        setData(loadedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Get unique TC names for filter
  const tcNames = useMemo(() => {
    if (!data) return [];
    const names = new Set(data.tcSchedules.map((s) => s.tcName));
    return Array.from(names).sort();
  }, [data]);

  // Get date range
  const dateRange = useMemo(() => {
    if (!data || data.tcSchedules.length === 0) {
      return { start: '', end: '' };
    }

    const dates = data.tcSchedules.map((s) => new Date(s.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    return {
      start: minDate.toLocaleDateString(),
      end: maxDate.toLocaleDateString(),
    };
  }, [data]);

  // Filter schedules based on selected filters
  const filteredSchedules = useMemo(() => {
    if (!data) return [];

    let filtered = data.tcSchedules;

    // Filter by TC
    if (selectedTC) {
      filtered = filtered.filter((s) => s.tcName === selectedTC);
    }

    // Filter by date
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((s) => {
        const scheduleDate = new Date(s.date);
        scheduleDate.setHours(0, 0, 0, 0);

        switch (selectedDate) {
          case 'today':
            return scheduleDate.getTime() === today.getTime();
          case 'week': {
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return scheduleDate >= today && scheduleDate <= weekFromNow;
          }
          case 'month': {
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return scheduleDate >= today && scheduleDate <= monthFromNow;
          }
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.tcName.toLowerCase().includes(query) ||
          s.location.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.appointments.some(
            (appt) =>
              appt.patient_full_name.toLowerCase().includes(query) ||
              appt.appt_care_center_location.toLowerCase().includes(query)
          )
      );
    }

    return filtered;
  }, [data, selectedTC, selectedDate, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-xl mb-2">Error Loading Data</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Evenly Schedule Viewer
          </h1>
          <p className="text-gray-600 mt-2">
            Treatment Coordinator schedules and appointment workload
          </p>
        </div>

        {/* Stats Overview */}
        {data && <StatsOverview schedules={filteredSchedules} />}

        {/* Filters */}
        <DashboardFilters
          tcNames={tcNames}
          selectedTC={selectedTC}
          onTCChange={setSelectedTC}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dateRange={dateRange}
        />

        {/* Calendar View */}
        {filteredSchedules.length > 0 ? (
          <CalendarGrid schedules={filteredSchedules} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
            <p className="text-gray-500 text-lg">No schedules found matching your filters.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
