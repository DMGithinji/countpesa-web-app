import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
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
} from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

type PeriodType = "day" | "week" | "month" | "year" | "custom";

export default function CalendarWithPopover({
  range,
  onDateChange
}: {
  range?: DateRange;
  onDateChange: (date: DateRange) => void;
}) {
  const [date, setDate] = useState<DateRange | undefined>(range || {
    from: new Date(),
    to: addDays(new Date(), 7),
  });

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
    return `${format(date.from, "MMM d, yyyy")} - ${format(
      date.to,
      "MMM d, yyyy"
    )}`;
  };

  const handleRangeSelection = (range: DateRange | undefined) => {
    setDate(range);
  };

  // Determine the period type and if navigation arrows should be shown
  const { periodType, showNavigationArrows } = useMemo(() => getPeriodPresets(date), [date]);
  const navigateToPeriod = (change: number) => {
    const newDateRange = goToPeriod(date, periodType, change);
    if (!newDateRange) return;
    handlePresetChange(newDateRange);
    onDateChange(newDateRange);
  };

  // Handle preset selection
  const handlePresetChange = (preset: DateRange | undefined) => {
    if (!preset) return;
    const newDateRange = preset;
    setDate(newDateRange);
    onDateChange(newDateRange);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-2 items-center">

        <span className="hidden sm:block font-semibold">Transactions from</span>
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigateToPeriod(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[240px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        {showNavigationArrows && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
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

          {/* Calendar Column */}
          <div className="p-2">
            <Calendar
              mode="range"
              selected={date}
              onSelect={handleRangeSelection}
              numberOfMonths={2}
              defaultMonth={date?.from}
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

  // Check if it's a day
  if (isSameDay(fromDate, toDate)) {
    return { periodType: "day" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a week
  const weekStart = startOfWeek(fromDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(fromDate, { weekStartsOn: 1 });
  if (
    isEqual(fromDate, weekStart) &&
    isEqual(toDate, weekEnd)
  ) {
    return { periodType: "week" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a month
  const monthStart = startOfMonth(fromDate);
  const monthEnd = endOfMonth(fromDate);
  if (
    isEqual(fromDate, monthStart) &&
    isEqual(toDate, monthEnd)
  ) {
    return { periodType: "month" as PeriodType, showNavigationArrows: true };
  }

  // Check if it's a year
  const yearStart = startOfYear(fromDate);
  const yearEnd = endOfYear(fromDate);
  if (
    isEqual(fromDate, yearStart) &&
    isEqual(toDate, yearEnd)
  ) {
    return { periodType: "year" as PeriodType, showNavigationArrows: true };
  }

  return { periodType: "custom" as PeriodType, showNavigationArrows: false };
}

// Function to navigate to previous/next period
function goToPeriod(date: DateRange | undefined, periodType: PeriodType, change: number) {
  if (!date?.from || !date?.to) return;

  let newFrom, newTo;

  switch (periodType) {
    case "day":
      newFrom = change > 0 ? addDays(date.from, change) : subDays(date.from, Math.abs(change));
      newTo = change > 0 ? addDays(date.to, change) : subDays(date.to, Math.abs(change));
      break;
    case "week":
      newFrom = change > 0 ? addWeeks(date.from, change) : subWeeks(date.from, Math.abs(change));
      newTo = change > 0 ? addWeeks(date.to, change) : subWeeks(date.to, Math.abs(change));
      break;
    case "month":
      newFrom = addMonths(date.from, change);
      newTo = endOfMonth(newFrom);
      break;
    case "year":
      newFrom = change > 0 ? addYears(date.from, change) : subYears(date.from, Math.abs(change));
      newTo = change > 0 ? addYears(date.to, change) : subYears(date.to, Math.abs(change));
      break;
    default:
      return;
  }

  return { from: newFrom, to: newTo };
};
