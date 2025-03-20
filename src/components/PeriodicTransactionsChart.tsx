import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { cn, formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";
import CustomTooltip from "./CustomTooltip";

type PeriodicTransactionsChartProps = {
  transactions: Transaction[];
  defaultPeriod: Period;
  periodOptions: Period[];
};

const PeriodicTransactionsChart = ({
  transactions,
  defaultPeriod,
  periodOptions,
}: PeriodicTransactionsChartProps) => {
  const [filter, setFilter] = useState("all");
  const [period, setPeriod] = useState<Period>(defaultPeriod);

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
              value={option}
              key={option}
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <ToggleGroup type="single" value={filter}>
          {["all", "in", "out"].map((filterVal) => (
            <ToggleGroupItem
              className={"cursor-pointer capitalize"}
              onClick={() => setFilter(filterVal)}
              value={filterVal}
              key={filterVal}
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
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
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
                  fill="#00A63E"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                />
              )}
              {(filter === "all" || filter === "out") && (
                <Bar
                  dataKey="moneyOut"
                  name="Money Out"
                  fill="#FB2C36"
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

