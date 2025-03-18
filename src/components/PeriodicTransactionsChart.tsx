import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { cn, formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";
import { differenceInDays, endOfDay, isSameDay, startOfDay } from "date-fns";

type PeriodicTransactionsChartProps = {
  transactions: Transaction[];
};

const PeriodicTransactionsChart = ({
  transactions,
}: PeriodicTransactionsChartProps) => {
  const [filter, setFilter] = useState("all");
  const [period, setPeriod] = useState<Period>();
  const [periodOptions, setPeriodOptions] = useState<Period[]>([]);

  // Set default period transactions are grouped by and period options
  useEffect(() => {
    const defaultPeriod = getDefaultPeriod(transactions);
    setPeriod(defaultPeriod);
    switch (defaultPeriod) {
      case Period.WEEK:
        setPeriodOptions(Object.values(Period).slice(1, 3));
        break;
      case Period.MONTH:
        setPeriodOptions(Object.values(Period).slice(1));
        break;
      case Period.DATE:
        setPeriodOptions(Object.values(Period).slice(1, 2));
        break;
      default:
        setPeriodOptions(Object.values(Period).slice(1));
        break;
    }
  }, [transactions]);

  const groupedTrs = useMemo(() => {
    if (!period) return [];
    const trsGroups = groupTransactionsByPeriod(transactions, period);
    const totals = Object.keys(trsGroups).map((g) => {
      const trs = trsGroups[g];
      const totals = calculateTransactionTotals(trs);
      return {
        dateRange: g,
        moneyIn: totals.moneyInAmount,
        moneyOut: Math.abs(totals.moneyOutAmount),
      };
    });
    return totals;
  }, [transactions, period]);

  return (
    <Card className="w-full h-full ">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-1">
          <CardTitle className="text-lg font-medium">
            Total periodic transactions
          </CardTitle>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </div>

        <ToggleGroup value={period} type="single">
          {periodOptions.map((option) => (
            <ToggleGroupItem
              className={cn(
                "cursor-pointer capitalize",
                option === period ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setPeriod(option)}
              value="period"
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup type="single" value={filter}>
          {["all", "in", "out"].map((filterVal) => (
            <ToggleGroupItem
              className={cn(
                "cursor-pointer capitalize",
                filterVal === filter ? "opacity-100" : "opacity-50"
              )}
              onClick={() => setFilter(filterVal)}
              value="period"
            >
              {filterVal}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>

      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groupedTrs}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={0}
            >
              <XAxis
                dataKey="dateRange"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={formatCurrency}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              {(filter === "all" || filter === "in") && (
                <Bar
                  dataKey="moneyIn"
                  name="Money In"
                  fill="#10B981"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              )}
              {(filter === "all" || filter === "out") && (
                <Bar
                  dataKey="moneyOut"
                  name="Money Out"
                  fill="#F87171"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PeriodicTransactionsChart;

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 p-3 border border-zinc-700 rounded-md shadow-md">
        <p className="text-zinc-300 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name === "moneyIn" ? "Money In: " : "Money Out: "}
            Ksh {entry.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function getDefaultPeriod(orderedTrs: Transaction[]) {
  if (!orderedTrs.length) return Period.DATE;

  const from = new Date(orderedTrs[0].date);
  const to = new Date(orderedTrs[orderedTrs.length - 1].date);
  const start = startOfDay(from);
  const end = endOfDay(to);

  const showHours = isSameDay(start, end);
  if (showHours) return Period.HOUR;

  const showMonths = differenceInDays(end, start) >= 61;
  if (showMonths) return Period.MONTH;

  const showDays = differenceInDays(end, start) <= 7;
  if (showDays) return Period.DATE;

  const showWeeks = differenceInDays(end, start) > 7;
  if (showWeeks) return Period.WEEK;

  return Period.DATE;
}
