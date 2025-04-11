import { useCallback, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { cn, formatCurrency } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";
import ChartTransactions from "./ChartTransactions";
import NoData from "./NoData";

function CustomTooltip({ label, active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 rounded-md shadow text-sm">
        <p className="mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name === "moneyIn" ? "Money In: " : "Money Out: "}
            {formatCurrency(entry.value || 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

type PeriodicTransactionsChartProps = {
  transactions: Transaction[];
  defaultPeriod: Period;
  periodOptions: Period[];
  onPeriodChange: (period: Period) => void;
};

enum MoneyFilter {
  all = "all",
  in = "in",
  out = "out",
}

function PeriodicTransactionsChart({
  transactions,
  defaultPeriod,
  periodOptions,
  onPeriodChange,
}: PeriodicTransactionsChartProps) {
  const [filter, setFilter] = useState<MoneyFilter>(MoneyFilter.all);
  const [selectedTransactions, setSelectedTransactions] = useState<{
    title: string;
    transactions: Transaction[];
  }>({
    title: "",
    transactions: [],
  });

  const handleBarClick = useCallback(
    (activePayload: { payload: { dateRange: string; trs: Transaction[] } }[]) => {
      const selectedTrs = activePayload.at(0)?.payload?.trs || [];
      setSelectedTransactions({
        title: activePayload.at(0)?.payload.dateRange || "Chart Transactions",
        transactions: selectedTrs,
      });
    },
    []
  );

  const groupedTrs = useMemo(() => {
    if (!defaultPeriod) return [];
    const trsGroups = groupTransactionsByPeriod(transactions, defaultPeriod);
    const totals = Object.keys(trsGroups).map((g) => {
      const trs = trsGroups[g];
      const groupTotals = calculateTransactionTotals(trs);
      return {
        dateRange: g,
        moneyIn: groupTotals.moneyInAmount,
        moneyOut: Math.abs(groupTotals.moneyOutAmount),
        trs,
      };
    });
    return totals;
  }, [transactions, defaultPeriod]);

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
      <Card className="w-full h-full lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="hidden md:flex">
            <CardTitle className="text-lg font-medium">Total periodic transactions</CardTitle>
          </div>

          <ToggleGroup value={defaultPeriod} type="single">
            {periodOptions.map((option) => (
              <ToggleGroupItem
                className={cn(
                  "cursor-pointer capitalize",
                  option === defaultPeriod ? "opacity-100" : "opacity-50"
                )}
                onClick={() => onPeriodChange(option)}
                value={option}
                key={option}
              >
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <ToggleGroup type="single" value={filter}>
            {Object.values(MoneyFilter).map((filterVal) => (
              <ToggleGroupItem
                className="cursor-pointer capitalize"
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
          <div className="h-76 w-full">
            {!groupedTrs.length ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupedTrs}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barGap={0}
                  onClick={(val) => {
                    handleBarClick(
                      val.activePayload as {
                        payload: { trs: Transaction[]; dateRange: string };
                      }[]
                    );
                  }}
                >
                  <CartesianGrid
                    horizontal
                    vertical={false}
                    strokeDasharray="1 1"
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
                  {(filter === MoneyFilter.all || filter === MoneyFilter.in) && (
                    <Bar
                      dataKey="moneyIn"
                      name="Money In"
                      fill="var(--money-in)"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      className="cursor-pointer"
                    />
                  )}
                  {(filter === MoneyFilter.all || filter === MoneyFilter.out) && (
                    <Bar
                      dataKey="moneyOut"
                      name="Money Out"
                      fill="var(--money-out)"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      className="cursor-pointer"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-1 hidden sm:block">
        <ChartTransactions
          selected={selectedTransactions}
          defaultSortBy="date"
          defaultDisplayMode={
            { all: "all", in: "moneyIn", out: "moneyOut" }[filter] as "all" | "moneyIn" | "moneyOut"
          }
          defaultSortDirection="desc"
        />
      </div>
    </div>
  );
}

export default PeriodicTransactionsChart;
