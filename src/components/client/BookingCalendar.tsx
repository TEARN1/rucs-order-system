'use client';

import React, { useState, useMemo } from 'react';
import { DeliveryBooking } from '@/types/order';
import { FULLY_BOOKED_DATES } from '@/lib/constants';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Lock, 
  Ban, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertCircle 
} from 'lucide-react';

interface BookingCalendarProps {
  delivery: DeliveryBooking;
  onChange: (delivery: DeliveryBooking) => void;
}

export function BookingCalendar({ delivery, onChange }: BookingCalendarProps) {
  // Current anchor date is 2026-10-10
  const CURRENT_SYSTEM_DATE = useMemo(() => new Date(2026, 9, 10), []); // October is month 9 (0-indexed)

  // Current calendar view month (starts in October 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  const leadTimeHours = 48;
  const minSelectableDate = useMemo(() => {
    // 48 hours = 2 full days forward from Oct 10 -> Earliest available is Oct 13
    const d = new Date(CURRENT_SYSTEM_DATE);
    d.setDate(d.getDate() + 2); // 48h lead cutoff: today(10) + 2 days = 12th is still within 48h, so 13th is first eligible
    return d;
  }, [CURRENT_SYSTEM_DATE]);

  // Navigate months
  const handlePrevMonth = () => {
    if (currentYear === 2026 && currentMonth === 9) return; // Don't go before current month
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Compute calendar days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper to format YYYY-MM-DD
  const formatDateStr = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Helper to test if a date is within 48 hours of today
  const isWithin48Hours = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day);
    // If before or on minSelectableDate (Oct 12)
    return checkDate <= minSelectableDate;
  };

  // Helper to check if a date is fully booked
  const getBookedReason = (dateStr: string) => {
    return FULLY_BOOKED_DATES[dateStr];
  };

  const handleSelectDay = (dateStr: string) => {
    onChange({
      ...delivery,
      selectedDate: dateStr,
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            Delivery Date & Lead Time Scheduling
          </h3>
          <p className="text-xs text-slate-500">
            Subject to the mandatory 48-hour logistics limit and route capacity constraints.
          </p>
        </div>

        {delivery.selectedDate && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Selected Date: <strong>{delivery.selectedDate}</strong></span>
          </div>
        )}
      </div>

      {/* 48-Hour Restriction Policy Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Mandatory 48-Hour Minimum Lead Time:</span> Deliveries for today (Oct 10), tomorrow (Oct 11), and Oct 12 are strictly locked to allow medical container decontamination and route sequencing. Dates with route capacity exhaustion are marked as <span className="font-semibold text-rose-700">Fully Booked</span>.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View (8 cols) */}
        <div className="lg:col-span-7 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-slate-800 text-sm">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={currentYear === 2026 && currentMonth === 9}
                className="p-1 rounded-lg hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-14 rounded-lg bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(currentYear, currentMonth, day);
              const isLocked48h = isWithin48Hours(currentYear, currentMonth, day);
              const bookedReason = getBookedReason(dateStr);
              const isFullyBooked = Boolean(bookedReason);
              const isSelected = delivery.selectedDate === dateStr;
              const isToday = currentYear === 2026 && currentMonth === 9 && day === 10;

              const isDisabled = isLocked48h || isFullyBooked;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(dateStr)}
                  title={
                    isToday
                      ? 'Today (Oct 10, 2026) - Restricted (<48h limit)'
                      : isLocked48h
                      ? 'Restricted: Within 48-Hour minimum lead time'
                      : isFullyBooked
                      ? `Fully Booked: ${bookedReason}`
                      : `Available for booking (${dateStr})`
                  }
                  className={`relative h-14 rounded-lg p-1 flex flex-col justify-between items-center transition-all text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 scale-102 z-10'
                      : isLocked48h
                      ? 'bg-slate-100/80 text-slate-400 cursor-not-allowed border border-slate-200/50'
                      : isFullyBooked
                      ? 'bg-rose-50 text-rose-400 cursor-not-allowed border border-rose-200/80'
                      : 'bg-white hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="w-full flex items-center justify-between px-1">
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : ''}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] bg-slate-300 text-slate-700 px-1 rounded font-bold">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Status Indicator inside day cell */}
                  <div className="w-full flex justify-center pb-0.5">
                    {isSelected ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : isLocked48h ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        <Lock className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">&lt;48h</span>
                      </div>
                    ) : isFullyBooked ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-rose-500 font-semibold">
                        <Ban className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Booked</span>
                      </div>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 flex items-center justify-center">
                <Lock className="w-2 h-2 text-slate-500" />
              </span>
              <span>&lt;48h Lead Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 flex items-center justify-center">
                <Ban className="w-2 h-2 text-rose-500" />
              </span>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Time Slot & Instructions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferred Delivery Window</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="space-y-2">
                {[
                  {
                    slot: 'Morning (08:00 - 12:00)' as const,
                    desc: 'Optimal for Operating Theatre early replenishment',
                  },
                  {
                    slot: 'Afternoon (12:00 - 17:00)' as const,
                    desc: 'Standard hospital ward drop-off & collection',
                  },
                  {
                    slot: 'Express Priority' as const,
                    desc: 'Guaranteed first-run priority slot with direct driver contact',
                  },
                ].map((item) => (
                  <label
                    key={item.slot}
                    className={`flex items-start p-2.5 rounded-lg border cursor-pointer transition-all ${
                      delivery.timeSlot === item.slot
                        ? 'bg-emerald-50/40 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={item.slot}
                      checked={delivery.timeSlot === item.slot}
                      onChange={() => onChange({ ...delivery, timeSlot: item.slot })}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="ml-2.5">
                      <span className="block text-xs font-bold text-slate-800">
                        {item.slot}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {item.desc}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Site Delivery Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Delivery / Access Instructions
              </label>
              <textarea
                rows={3}
                value={delivery.specialDeliveryInstructions || ''}
                onChange={(e) =>
                  onChange({
                    ...delivery,
                    specialDeliveryInstructions: e.target.value,
                  })
                }
                placeholder="e.g. Ring buzzer at Bay 2; high security badge required for Ward 4B; pallet jack required."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Date Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Earliest Valid Booking:</span>
              <strong className="text-slate-800">2026-10-13</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Logistics Lead Time:</span>
              <span className="font-semibold text-emerald-700">48h Minimum (Enforced)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
