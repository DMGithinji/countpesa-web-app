import type { DateRange } from "react-day-picker";
import {
  addDays,
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  isSameDay,
  isEqual,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "./ui/button";

type PeriodType = "day" | "week" | "month" | "year" | "custom";

// Preset date ranges
const presets = [
  {
    name: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    name: "Yesterday",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    name: "This Week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    name: "Last Week",
    getValue: () => {
      const now = new Date();
      return {
        from: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
        to: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }),
      };
    },
  },
  {
    name: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    name: "Last Month",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    name: "This Year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    name: "Last Year",
    getValue: () => ({
      from: startOfYear(subYears(new Date(), 1)),
      to: endOfYear(subYears(new Date(), 1)),
    }),
  },
];

function getPeriodPresets(date: DateRange | undefined) {
  if (!date?.from || !date?.to) {
    return { periodType: "custom" as PeriodType, showNavigationArrows: false };
  }

  const fromDate = date.from;
  const toDate = date.to;
  const toDateIsToday = isSameDay(toDate, new Date());

  // Check if it's a year
  const yearStart = startOfYear(fromDate);
  const yearEnd = endOfYear(fromDate);
  if (isEqual(fromDate, yearStart) && (isEqual(toDate, yearEnd) || toDateIsToday)) {
    return { periodType: "year" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a month
  const monthStart = startOfMonth(fromDate);
  const monthEnd = endOfMonth(fromDate);
  if (isEqual(fromDate, monthStart) && (isEqual(toDate, monthEnd) || toDateIsToday)) {
    return { periodType: "month" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a week
  const weekStart = startOfWeek(fromDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(fromDate, { weekStartsOn: 1 });
  if (isEqual(fromDate, weekStart) && (isEqual(toDate, weekEnd) || toDateIsToday)) {
    return { periodType: "week" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a day
  if (isSameDay(fromDate, toDate)) {
    return { periodType: "day" as PeriodType, showNavigationArrows: true };
  }

  return { periodType: "custom" as PeriodType, showNavigationArrows: false };
}

// Function to navigate to previous/next period
function getGoToPeriod(
  date: DateRange | undefined,
  periodType: PeriodType,
  change: number
): DateRange | undefined {
  if (!date?.from || !date?.to) return undefined;

  let newFrom;
  let newTo;

  switch (periodType) {
    case "day":
      newFrom = addDays(date.from, change);
      newTo = endOfDay(newFrom);
      break;
    case "week":
      newFrom = addWeeks(date.from, change);
      newTo = endOfWeek(newFrom, { weekStartsOn: 1 });
      break;
    case "month":
      newFrom = addMonths(date.from, change);
      newTo = endOfMonth(newFrom);
      break;
    case "year":
      newFrom = addYears(date.from, change);
      newTo = endOfYear(newFrom);
      break;
    default:
      return undefined;
  }

  return { from: newFrom, to: newTo };
}

export default function DateRangePicker({
  range,
  onDateChange,
}: {
  range?: DateRange;
  onDateChange: (date: DateRange) => void;
}) {
  const [date, setDate] = useState<DateRange | undefined>(
    range || {
      from: new Date(),
      to: addDays(new Date(), 7),
    }
  );

  useEffect(() => {
    if (range) {
      setDate(range);
    }
  }, [range]);

  const [open, setOpen] = useState(false);

  // Format the date range for display on the button
  const formatDateRange = () => {
    if (!date?.from) return "Select date range";
    if (!date.to) return format(date.from, "PPP");
    return `${format(date.from, "MMM d, yyyy")} - ${format(date.to, "MMM d, yyyy")}`;
  };

  const handleRangeSelection = (dateRange: DateRange | undefined) => {
    setDate(dateRange);
    if (!dateRange || !dateRange.from || !dateRange.to) return;
    Object.assign(dateRange, { to: endOfDay(dateRange.from) });
    Object.assign(dateRange, { from: startOfDay(dateRange.from) });
    onDateChange(dateRange);
  };

  const nextDisabled = date?.to && isAfter(addDays(date.to, 1), new Date());

  // Handle preset selection
  const handlePresetChange = (preset: DateRange | undefined) => {
    if (!preset) return;
    if (preset.to && isAfter(new Date(preset.to), new Date())) {
      Object.assign(preset, { to: endOfDay(new Date()) });
    }
    const newDateRange = preset;
    setDate(newDateRange);
    onDateChange(newDateRange);
    setOpen(false);
  };

  // Determine the period type and if navigation arrows should be shown
  const { periodType, showNavigationArrows } = useMemo(() => getPeriodPresets(date), [date]);
  const navigateToPeriod = (change: number) => {
    const newDateRange = getGoToPeriod(date, periodType, change);
    if (!newDateRange) return;
    handlePresetChange(newDateRange);
    onDateChange(newDateRange);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-1 items-center">
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-foreground"
            onClick={() => navigateToPeriod(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[40px] md:w-[240px] justify-start text-left font-normal hover:text-foreground"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span className="hidden md:block">{formatDateRange()}</span>
          </Button>
        </PopoverTrigger>
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-foreground"
            disabled={nextDisabled}
            onClick={() => navigateToPeriod(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Preset Options Column */}
          <div className="w-32 border-r p-2 space-y-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="ghost"
                size="sm"
                className="text-sm justify-start font-normal w-full"
                onClick={() => handlePresetChange(preset.getValue())}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          <div className="p-2">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleRangeSelection}
              numberOfMonths={2}
              defaultMonth={date?.from}
              weekStartsOn={1}
            />
          </div>
        </div>
        <div className="border-t p-3 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
