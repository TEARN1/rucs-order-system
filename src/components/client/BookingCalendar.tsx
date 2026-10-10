'use client';

import React, { useState, useMemo } from 'react';
import { DeliveryBooking } from '@/types/order';
import { useOrders } from '@/context/OrderContext';
import { 
  Calendar as CalendarIcon, 
  Lock, 
  Ban, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Truck,
  Clock,
  Info
} from 'lucide-react';

interface BookingCalendarProps {
  delivery: DeliveryBooking;
  onChange: (delivery: DeliveryBooking) => void;
}

export function BookingCalendar({ delivery, onChange }: BookingCalendarProps) {
  const { clientProfile } = useOrders();

  // Current anchor date is 2026-10-10 (Saturday)
  const CURRENT_SYSTEM_DATE = useMemo(() => new Date(2026, 9, 10), []);

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)

  // Facility-specific schedule rules (Mon/Wed/Fri booked, Tue/Sat banned by default, varies by client)
  const bookedDays = clientProfile.scheduleConfig?.bookedDays ?? [1, 3, 5]; // 1=Mon, 3=Wed, 5=Fri
  const bannedDays = clientProfile.scheduleConfig?.bannedDays ?? [2, 6];    // 2=Tue, 6=Sat

  const minSelectableDate = useMemo(() => {
    // 48 hours minimum cutoff from Oct 10 -> Earliest available is Oct 13 (though Oct 13 is a Tuesday / Banned Day)
    const d = new Date(CURRENT_SYSTEM_DATE);
    d.setDate(d.getDate() + 2); // 48h lead cutoff: Oct 10 + 2 = Oct 12 is within 48h
    return d;
  }, [CURRENT_SYSTEM_DATE]);

  const handlePrevMonth = () => {
    if (currentYear === 2026 && currentMonth === 9) return;
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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDateStr = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const isWithin48Hours = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day);
    return checkDate <= minSelectableDate;
  };

  const getDayStatus = (year: number, month: number, day: number) => {
    const checkDate = new Date(year, month, day);
    const dayOfWeek = checkDate.getDay();

    if (checkDate <= minSelectableDate) {
      return { type: 'lead-limit' as const, label: '<48h', reason: 'Locked: Within 48-Hour mandatory lead limit' };
    }
    if (dayOfWeek === 0) {
      return { type: 'closed' as const, label: 'Closed', reason: 'Sunday depot non-operational maintenance' };
    }
    if (bannedDays.includes(dayOfWeek)) {
      return { type: 'banned' as const, label: 'Banned', reason: 'Banned Day: Route delivery prohibited on Tuesdays & Saturdays' };
    }
    if (bookedDays.includes(dayOfWeek)) {
      return { type: 'booked' as const, label: 'Booked', reason: 'Booked Day: Scheduled rounds are at full booking capacity' };
    }
    return { type: 'available' as const, label: 'Open', reason: 'Available for routine logistics delivery' };
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
            <span>Delivery Date Booking (Client Schedule & 48h Limit)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Assigned routing for <strong>{clientProfile.facilityName}</strong>. Select your delivery date.
          </p>
        </div>

        {delivery.selectedDate && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Selected Date: <strong>{delivery.selectedDate}</strong></span>
          </div>
        )}
      </div>

      {/* Schedule Rule Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Facility Route Rules & Schedule:</span>
        </div>
        <div className="text-[11px] leading-relaxed text-amber-950 pl-6">
          <ul className="list-disc list-inside space-y-0.5">
            <li><strong>Booked Days (Mon, Wed, Fri):</strong> Standard sweep rounds are pre-committed / fully booked.</li>
            <li><strong>Banned Days (Tue, Sat):</strong> Waste transport strictly prohibited on these days for this client.</li>
            <li><strong>Available Days (Thu):</strong> Open for scheduled consignment booking.</li>
            <li><strong>48-Hour Lead Time:</strong> Earlier dates (Oct 10–12) are locked for decontamination & planning.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-8 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
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
            {daysOfWeek.map((day, idx) => {
              const isBannedCol = bannedDays.includes(idx);
              const isBookedCol = bookedDays.includes(idx);
              return (
                <div key={day} className="py-1">
                  <span className={isBannedCol ? 'text-rose-600 font-bold' : isBookedCol ? 'text-amber-700 font-bold' : ''}>
                    {day}
                  </span>
                  {isBannedCol && <span className="block text-[8px] text-rose-500 uppercase font-bold">Banned</span>}
                  {isBookedCol && <span className="block text-[8px] text-amber-600 uppercase font-bold">Booked</span>}
                  {idx === 4 && <span className="block text-[8px] text-emerald-600 uppercase font-bold">Open</span>}
                </div>
              );
            })}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="h-14 rounded-lg bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(currentYear, currentMonth, day);
              const dayStatus = getDayStatus(currentYear, currentMonth, day);
              const isSelected = delivery.selectedDate === dateStr;
              const isToday = currentYear === 2026 && currentMonth === 9 && day === 10;
              const isDisabled = dayStatus.type !== 'available';

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(dateStr)}
                  title={`${dateStr} - ${dayStatus.reason}`}
                  className={`relative h-14 rounded-lg p-1 flex flex-col justify-between items-center transition-all text-xs ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 scale-102 z-10'
                      : dayStatus.type === 'lead-limit'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                      : dayStatus.type === 'closed'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                      : dayStatus.type === 'banned'
                      ? 'bg-rose-50 text-rose-700 cursor-not-allowed border border-rose-300/80'
                      : dayStatus.type === 'booked'
                      ? 'bg-amber-50 text-amber-700 cursor-not-allowed border border-amber-300/80'
                      : 'bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-900 border border-slate-300 shadow-2xs font-semibold cursor-pointer'
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

                  <div className="w-full flex justify-center pb-0.5">
                    {isSelected ? (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    ) : dayStatus.type === 'lead-limit' ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        <Lock className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">&lt;48h</span>
                      </div>
                    ) : dayStatus.type === 'closed' ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-slate-400">
                        <Lock className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Closed</span>
                      </div>
                    ) : dayStatus.type === 'banned' ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-rose-600 font-bold">
                        <Ban className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Banned</span>
                      </div>
                    ) : dayStatus.type === 'booked' ? (
                      <div className="flex items-center gap-0.5 text-[9px] text-amber-700 font-bold">
                        <Clock className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Booked</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="hidden sm:inline">Open</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 flex items-center justify-center">
                <Lock className="w-2 h-2 text-slate-500" />
              </span>
              <span>&lt;48h Limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 flex items-center justify-center">
                <Ban className="w-2 h-2 text-rose-600" />
              </span>
              <span>Banned (Tue, Sat)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 flex items-center justify-center">
                <Clock className="w-2 h-2 text-amber-700" />
              </span>
              <span>Booked (Mon, Wed, Fri)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Available (Thu)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Instructions & Operations Info */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Operating Shifts & Schedule</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Deliveries run throughout standard daily routes across Midrand, Pretoria, and Kempton Park. Tuesdays & Saturdays are banned from scheduling, and Mondays, Wednesdays, and Fridays are at full booking capacity.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Delivery Instructions (Optional)
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
                placeholder="e.g. Ring pharmacy night bell, deliver to level 2 sluice room, night shift drop off."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Earliest Valid Booking:</span>
              <strong className="text-slate-800">2026-10-15 (Thursday)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Client Route Status:</span>
              <span className="font-semibold text-emerald-700">Mon/Wed/Fri Booked • Tue/Sat Banned</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
