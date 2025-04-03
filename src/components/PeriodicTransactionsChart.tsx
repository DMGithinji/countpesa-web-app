import { useCallback, useEffect, useMemo, useState } from "react";
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

type PeriodicTransactionsChartProps = {
  transactions: Transaction[];
  defaultPeriod: Period;
  periodOptions: Period[];
};

enum MoneyFilter {
  all = "all",
  in = "in",
  out = "out",
}

const PeriodicTransactionsChart = ({
  transactions,
  defaultPeriod,
  periodOptions,
}: PeriodicTransactionsChartProps) => {
  const [filter, setFilter] = useState<MoneyFilter>(MoneyFilter.all);
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const [selectedTransactions, setSelectedTransactions] = useState<{
    title: string;
    transactions: Transaction[];
  }>({
    title: "",
    transactions: [],
  });

  const handleBarClick = useCallback(
    (
      activePayload: { payload: { dateRange: string; trs: Transaction[] } }[]
    ) => {
      const selectedTrs = activePayload.at(0)?.payload?.trs || [];
      setSelectedTransactions({
        title: activePayload.at(0)?.payload.dateRange || "Chart Transactions",
        transactions: selectedTrs,
      });
    },
    []
  );

  useEffect(() => {
    setPeriod(defaultPeriod);
  }, [defaultPeriod]);

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
        trs,
      };
    });
    return totals;
  }, [transactions, period]);

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
      <Card className="w-full h-full lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-1">
            <CardTitle className="text-lg font-medium">
              Total periodic transactions
            </CardTitle>
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
            {Object.values(MoneyFilter).map((filterVal) => (
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
            {
              !groupedTrs.length ? (
                <NoData />
              ) : (<ResponsiveContainer width="100%" height="100%">
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
                  {(filter === MoneyFilter.all || filter === MoneyFilter.in) && (
                    <Bar
                      dataKey="moneyIn"
                      name="Money In"
                      fill="#00A63E"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      className="cursor-pointer"
                    />
                  )}
                  {(filter === MoneyFilter.all || filter === MoneyFilter.out) && (
                    <Bar
                      dataKey="moneyOut"
                      name="Money Out"
                      fill="#FB2C36"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                      className="cursor-pointer"
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
              )
            }
          </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-1">
        <ChartTransactions
          selected={selectedTransactions}
          defaultSortBy="date"
          defaultDisplayMode={
            { all: "all", in: "moneyIn", out: "moneyOut" }[filter] as
              | "all"
              | "moneyIn"
              | "moneyOut"
          }
          defaultSortDirection="desc"
        />
      </div>
    </div>
  );
};

export default PeriodicTransactionsChart;

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md shadow text-sm">
        <p className="mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name === "moneyIn" ? "Money In: " : "Money Out: "}
            {formatCurrency(entry.value || 0)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};