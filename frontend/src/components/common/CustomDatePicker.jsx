import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check
} from "lucide-react";
import { isSunday } from "@/validations/common.schema.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * CustomDatePicker
 * - Consistently displays every Sunday in bold red inside the calendar popup grid.
 * - Supports both "date" (YYYY-MM-DD) and "datetime-local" (YYYY-MM-DDTHH:mm).
 * - Compatible with native input onChange events (synthetic event with target.name/target.value).
 */
export default function CustomDatePicker({
  type = "date",
  value = "",
  onChange,
  onBlur,
  name,
  id,
  min,
  max,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  error = false,
  icon: IconComponent
}) {
  const isDateTime = type === "datetime-local";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial or current value
  const parseValueToDate = (valStr) => {
    if (!valStr) return new Date();
    try {
      const d = new Date(valStr);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  };

  const [currentMonth, setCurrentMonth] = useState(() => parseValueToDate(value));
  
  // Time state for datetime-local
  const getTimeFromValue = (valStr) => {
    if (!valStr || !valStr.includes("T")) {
      const now = new Date();
      return {
        hours: String(now.getHours()).padStart(2, "0"),
        minutes: String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, "0")
      };
    }
    const timePart = valStr.split("T")[1] || "00:00";
    const [h, m] = timePart.split(":");
    return {
      hours: String(h || "00").padStart(2, "0"),
      minutes: String(m || "00").padStart(2, "0")
    };
  };

  const [timeState, setTimeState] = useState(() => getTimeFromValue(value));

  // Sync state when value changes externally
  useEffect(() => {
    if (value) {
      setCurrentMonth(parseValueToDate(value));
      if (isDateTime) {
        setTimeState(getTimeFromValue(value));
      }
    }
  }, [value, isDateTime]);

  // Close popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isOpen) {
          setIsOpen(false);
          if (onBlur) {
            onBlur({
              target: { name: name || "", value: value || "", id: id || "" }
            });
          }
        }
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen, onBlur, name, value, id]);

  const emitChange = (newVal) => {
    if (!onChange) return;
    const synthEvent = {
      target: {
        name: name || "",
        value: newVal,
        id: id || ""
      },
      currentTarget: {
        name: name || "",
        value: newVal,
        id: id || ""
      },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    onChange(synthEvent);
  };

  // Date selection logic
  const handleDateSelect = (selectedDate) => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    if (isDateTime) {
      const combinedVal = `${dateStr}T${timeState.hours}:${timeState.minutes}`;
      emitChange(combinedVal);
    } else {
      emitChange(dateStr);
      setIsOpen(false);
    }
  };

  const handleTimeChange = (field, val) => {
    const updatedTime = { ...timeState, [field]: val };
    setTimeState(updatedTime);

    if (value) {
      const datePart = value.includes("T") ? value.split("T")[0] : value;
      const combinedVal = `${datePart}T${updatedTime.hours}:${updatedTime.minutes}`;
      emitChange(combinedVal);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    emitChange("");
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  const handleTodayClick = (e) => {
    e.stopPropagation();
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  // Calendar calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Selected date comparison
  const selectedDateObj = value ? parseValueToDate(value) : null;
  const isSelectedDate = (d, isCurrentMonth) => {
    if (!selectedDateObj || !isCurrentMonth) return false;
    return (
      selectedDateObj.getFullYear() === year &&
      selectedDateObj.getMonth() === month &&
      selectedDateObj.getDate() === d
    );
  };

  const isTodayDate = (d, isCurrentMonth) => {
    if (!isCurrentMonth) return false;
    const now = new Date();
    return (
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === d
    );
  };

  const isDateDisabled = (dayDate) => {
    if (min) {
      const minDate = new Date(min.includes("T") ? min.split("T")[0] : min);
      minDate.setHours(0, 0, 0, 0);
      const testDate = new Date(dayDate);
      testDate.setHours(0, 0, 0, 0);
      if (testDate < minDate) return true;
    }
    if (max) {
      const maxDate = new Date(max.includes("T") ? max.split("T")[0] : max);
      maxDate.setHours(23, 59, 59, 999);
      const testDate = new Date(dayDate);
      testDate.setHours(0, 0, 0, 0);
      if (testDate > maxDate) return true;
    }
    return false;
  };

  // Years range: current year - 80 to current year + 25
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 106 }, (_, i) => currentYearNum - 80 + i);

  // Format display text for the input
  const formatDisplayValue = (valStr) => {
    if (!valStr) return "";
    return valStr;
  };

  const hasSundaySelected = isSunday(value);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Trigger */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`relative flex items-center cursor-pointer select-none ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none">
          {IconComponent ? (
            <IconComponent className="w-4 h-4" />
          ) : isDateTime ? (
            <Clock className="w-4 h-4" />
          ) : (
            <CalendarIcon className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          id={id}
          name={name}
          readOnly
          required={required}
          disabled={disabled}
          placeholder={placeholder || (isDateTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD")}
          value={formatDisplayValue(value)}
          className={`w-full pl-10 pr-9 py-2.5 h-[44px] bg-white border rounded-xl text-sm focus:outline-none font-medium font-poppins transition-colors cursor-pointer ${
            error
              ? "border-red-400 bg-red-50/20 text-red-900 ring-1 ring-red-400/30"
              : hasSundaySelected
              ? "border-red-300 text-red-600 font-bold"
              : "border-[#E7EAF0] text-[#1E293B] hover:border-[#A14000]"
          } ${className}`}
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
            title="Clear date"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-[320px] sm:w-[340px] bg-white dark:bg-slate-900 border border-[#E7EAF0] dark:border-slate-800 rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 font-poppins">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={month}
                onChange={handleMonthChange}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-[#1E293B] dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((mName, idx) => (
                  <option key={mName} value={idx}>
                    {mName}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={handleYearChange}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold text-[#1E293B] dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
              >
                {years.map((yNum) => (
                  <option key={yNum} value={yNum}>
                    {yNum}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sunday Highlight Indicator Banner */}
          <div className="flex items-center justify-between px-2 py-1 mb-2 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-100 dark:border-red-900/40">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Sundays are highlighted in red
            </span>
            <button
              type="button"
              onClick={handleTodayClick}
              className="text-[10px] font-bold text-[#A14000] hover:underline uppercase"
            >
              Today
            </button>
          </div>

          {/* Weekday Header: Sunday (Su) in RED */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_LABELS.map((day, idx) => (
              <div
                key={day}
                className={`text-[11px] font-bold py-1 ${
                  idx === 0
                    ? "text-red-600 dark:text-red-400 bg-red-50/60 dark:bg-red-950/30 rounded"
                    : "text-[#64748B] dark:text-slate-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Previous Month trailing days */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => {
              const dayNum = daysInPrevMonth - startingDayOfWeek + idx + 1;
              const isSun = idx === 0;
              return (
                <div
                  key={`prev-${idx}`}
                  className={`h-8 flex items-center justify-center text-xs rounded-lg select-none opacity-30 ${
                    isSun ? "text-red-400 font-semibold" : "text-slate-400"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(year, month, dayNum);
              const dayOfWeek = dateObj.getDay();
              const isSun = dayOfWeek === 0;
              const isSelected = isSelectedDate(dayNum, true);
              const isToday = isTodayDate(dayNum, true);
              const disabledDay = isDateDisabled(dateObj);

              let cellClasses = "h-8 flex items-center justify-center text-xs font-medium rounded-lg cursor-pointer transition-all select-none ";

              if (disabledDay) {
                cellClasses += "opacity-25 cursor-not-allowed pointer-events-none ";
              } else if (isSelected) {
                cellClasses += isSun
                  ? "bg-red-600 text-white font-bold shadow-md ring-2 ring-red-300 "
                  : "bg-[#A14000] text-white font-bold shadow-md ";
              } else if (isSun) {
                // Sunday Highlight: VIBRANT RED
                cellClasses += "text-red-600 dark:text-red-400 font-bold bg-red-50/80 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/40 dark:hover:bg-red-900/60 ";
              } else {
                cellClasses += "text-[#1E293B] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ";
              }

              if (isToday && !isSelected) {
                cellClasses += isSun
                  ? "ring-1 ring-red-500 font-extrabold "
                  : "ring-1 ring-[#A14000] font-bold ";
              }

              return (
                <button
                  type="button"
                  key={`day-${dayNum}`}
                  disabled={disabledDay}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateSelect(dateObj);
                  }}
                  className={cellClasses}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          {/* Time Picker Controls for Datetime-Local */}
          {isDateTime && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#64748B] dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#A14000]" />
                  Time (HH : MM)
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  {timeState.hours}:{timeState.minutes}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Hour</label>
                  <select
                    value={timeState.hours}
                    onChange={(e) => handleTimeChange("hours", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    {Array.from({ length: 24 }).map((_, h) => {
                      const hStr = String(h).padStart(2, "0");
                      return (
                        <option key={hStr} value={hStr}>
                          {hStr} ({h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Minute</label>
                  <select
                    value={timeState.minutes}
                    onChange={(e) => handleTimeChange("minutes", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full text-xs font-semibold px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none"
                  >
                    {Array.from({ length: 60 }).map((_, m) => {
                      const mStr = String(m).padStart(2, "0");
                      return (
                        <option key={mStr} value={mStr}>
                          {mStr}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-[#A14000] hover:bg-[#883500] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
