import { useMemo, useState } from "react";
import { MoneyMode } from "@/types/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

// Function to format axis values
const formatAxisValue = (value: number) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

interface TopAccountsChartProps {
  moneyMode: MoneyMode;
  groupedDataByAmount: {
    name: string;
    amount: number;
    count: number;
  }[];
  groupedDataByCount: {
    name: string;
    amount: number;
    count: number;
  }[];
  totalAmount: number;
}

type DisplayMode = "amount" | "count";

const TopAccountsChart: React.FC<TopAccountsChartProps> = ({
  moneyMode,
  groupedDataByAmount,
  groupedDataByCount,
  totalAmount,
}) => {
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
          name:
            item.name.length > 20
              ? `${item.name.substring(0, 18)}...`
              : item.name,
        })),
    [displayCount, displayMode, groupedDataByAmount, groupedDataByCount]
  );

  // Set colors based on money mode
  const barColor = moneyMode === MoneyMode.MoneyIn ? "#00A63E" : "#FB2C36";

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {moneyMode === MoneyMode.MoneyIn ? (
            <ArrowDownCircle size={18} className="text-green-600" />
          ) : (
            <ArrowUpCircle size={18} className="text-red-600" />
          )}
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
            {moneyMode === MoneyMode.MoneyIn ? 'Senders' : 'Receivers'}
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={displayMode}
            className="border rounded-md"
          >
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
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                type="number"
                tickFormatter={formatAxisValue}
                domain={[0, "auto"]}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${displayMode === "amount" ? formatCurrency(value) : value}`,
                  displayMode === "amount" ? "Amount" : "Count",
                ]}
                labelFormatter={(label) => `${label}`}
                content={<CustomTooltip moneyMode={moneyMode} displayMode={displayMode} />}
              />
              <Bar dataKey={displayMode} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={barColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="font-medium">
            Total {moneyMode === MoneyMode.MoneyIn ? "Money In" : "Money Out"}:
            <span
              className={
                moneyMode === MoneyMode.MoneyIn
                  ? "text-green-600 ml-2"
                  : "text-red-600 ml-2"
              }
            >
              {formatCurrency(Math.abs(totalAmount))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopAccountsChart;

import { TooltipProps } from 'recharts';

const CustomTooltip = ({
  active,
  payload,
  label,
  displayMode
}: { moneyMode: MoneyMode, displayMode: DisplayMode } & TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-100 p-2 rounded-md shadow-sm text-sm">
        <p className="mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {displayMode === "amount" ? formatCurrency(entry.value as number) : `No. of Transactions: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

