'use client';

import { TCSchedule } from '@/lib/types';
import { useMemo } from 'react';

interface AppointmentDetailModalProps {
  schedule: TCSchedule;
  onClose: () => void;
}

export default function AppointmentDetailModal({
  schedule,
  onClose,
}: AppointmentDetailModalProps) {
  // Sort appointments by start time
  const sortedAppointments = useMemo(() => {
    return [...schedule.appointments].sort((a, b) => {
      return a.appt_time.localeCompare(b.appt_time);
    });
  }, [schedule.appointments]);

  const calculateTotalHours = (): string => {
    const start = new Date(`2000-01-01 ${schedule.startTime}`);
    const end = new Date(`2000-01-01 ${schedule.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours.toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{schedule.tcName}</h2>
              <p className="text-slate-200 mt-1 text-sm font-medium">
                {new Date(schedule.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-slate-600 rounded-full p-2 transition-all hover:rotate-90 duration-200"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</p>
              <p className="font-bold text-slate-900 mt-1">{schedule.location}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Schedule</p>
              <p className="font-bold text-slate-900 mt-1">
                {schedule.startTime} - {schedule.endTime} ({calculateTotalHours()}h)
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Appointments</p>
              <p className="font-bold text-slate-900 mt-1">
                {schedule.appointments.length}
              </p>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-white">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📅</span>
            Appointments (sorted by time)
          </h3>
          <div className="space-y-3">
            {sortedAppointments.map((appointment, index) => (
              <div
                key={appointment.appt_guid}
                className="border-2 border-slate-200 rounded-xl p-5 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {appointment.patient_full_name}
                      </h4>
                      <span className="text-blue-600 font-bold text-base bg-blue-50 px-3 py-1 rounded-lg">
                        {appointment.appt_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          appointment.is_consult === 'TRUE'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}
                      >
                        {appointment.is_consult === 'TRUE' ? '✓ Consult' : '✓ Regular'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          appointment.patient_status === 'New'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {appointment.patient_status}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Type:</span> {appointment.appt_type}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Chair:</span> {appointment.chair || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Care Center:</span>{' '}
                        {appointment.appt_care_center_location}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Assigned TC:</span>{' '}
                        {appointment.assigned_tc}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Patient ID:</span> {appointment.patient_id}
                      </p>
                      <p className="text-slate-700">
                        <span className="font-semibold text-slate-900">Total Visits:</span>{' '}
                        {appointment.pat_apt_count_all}
                      </p>
                    </div>

                    {appointment.appt_note && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                        <p className="text-sm text-slate-800">
                          <span className="font-bold text-amber-700">📝 Note:</span> {appointment.appt_note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t-2 border-slate-200">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-600 text-white rounded-lg hover:from-slate-600 hover:to-slate-500 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
