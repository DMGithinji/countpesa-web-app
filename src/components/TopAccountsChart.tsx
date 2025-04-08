import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import { MoneyMode } from "@/types/Transaction";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";

import { SidepanelTransactions } from "@/stores/ui.store";
import { FieldGroupSummary } from "@/lib/groupByField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import NoData from "./NoData";

type DisplayMode = "amount" | "count";

function CustomTooltip({
  active,
  payload,
  label,
  displayMode,
}: { displayMode: DisplayMode } & TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 rounded-md shadow-sm text-sm">
        <p className="mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {displayMode === "amount"
              ? formatCurrency(entry.value as number)
              : `No. of Transactions: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface TopAccountsChartProps {
  moneyMode: MoneyMode;
  groupedDataByAmount: FieldGroupSummary[];
  groupedDataByCount: FieldGroupSummary[];
  totalAmount: number;
  onItemClick?: (item: SidepanelTransactions) => void;
}

// Function to format axis values
const formatAxisValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

function TopAccountsChart({
  moneyMode,
  groupedDataByAmount,
  groupedDataByCount,
  totalAmount,
  onItemClick,
}: TopAccountsChartProps) {
  const [displayCount, setDisplayCount] = useState<number>(15);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("amount");

  // Prepare data for the chart - limit by displayCount and format long names
  const chartData = useMemo(
    () =>
      [...(displayMode === "amount" ? groupedDataByAmount : groupedDataByCount)]
        .sort((a, b) => b[displayMode] - a[displayMode])
        .slice(0, displayCount)
        .map((item) => ({
          ...item,
          name: item.name.length > 20 ? `${item.name.substring(0, 18)}...` : item.name,
        })),
    [displayCount, displayMode, groupedDataByAmount, groupedDataByCount]
  );

  // Set colors based on money mode
  const barColor = moneyMode === MoneyMode.MoneyIn ? "var(--money-in)" : "var(--money-out)";

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium flex items-center gap-1">
            <span>Top</span>
            <Select
              value={String(displayCount)}
              onValueChange={(value) => setDisplayCount(Number(value))}
            >
              <SelectTrigger className="h-7 w-auto border-none px-1 shadow-none flex gap-2 items-center focus:ring-0 focus:outline-none text-md">
                <SelectValue placeholder="Count">{displayCount}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30].map((count) => (
                  <SelectItem key={count} value={String(count)}>
                    <span>{count}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {moneyMode === MoneyMode.MoneyIn ? "Senders" : "Receivers"}
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={displayMode}>
            {[
              { value: "amount", label: "Amount" },
              { value: "count", label: "Count" },
            ].map((item) => (
              <ToggleGroupItem
                className="text-xs h-8 px-3"
                onClick={() => setDisplayMode(item.value as "count" | "amount")}
                value={item.value}
                key={item.value}
              >
                {item.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartData.length > 0 ? (
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                <XAxis type="number" tickFormatter={formatAxisValue} domain={[0, "auto"]} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [
                    `${displayMode === "amount" ? formatCurrency(value) : value}`,
                    displayMode === "amount" ? "Amount" : "Count",
                  ]}
                  labelFormatter={(label) => `${label}`}
                  content={<CustomTooltip displayMode={displayMode} />}
                />
                <Bar dataKey={displayMode} radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={barColor}
                      className="cursor-pointer"
                      onClick={() => onItemClick && onItemClick(entry)}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <NoData />
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="font-medium text-base">
            <span
              className={` ${moneyMode === MoneyMode.MoneyIn ? "text-money-in" : "text-money-out"}`}
            >
              Total {moneyMode === MoneyMode.MoneyIn ? "Money In" : "Money Out"}:{" "}
              {formatCurrency(Math.abs(totalAmount))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopAccountsChart;
