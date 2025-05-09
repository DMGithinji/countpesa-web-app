import { LineChart, Line, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { groupTransactionsByPeriod, Period, PeriodAverages, PeriodDict } from "@/lib/groupByPeriod";
import { getTotals } from "@/lib/getTotal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function CustomTooltip({
  active,
  payload,
  mode,
}: { mode: MoneyMode } & TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 rounded-md shadow-sm text-sm">
        <p className="">{`${payload[0].payload.date}`}</p>
        <p
          className={cn(
            "font-medium",
            mode === MoneyMode.MoneyOut ? "text-money-out" : "text-money-in"
          )}
        >{`${mode === MoneyMode.MoneyIn ? "Received" : "Spent"} ${formatCurrency(payload[0].value || 0)}`}</p>
      </div>
    );
  }
  return null;
}

type BalanceTrendCardProps = {
  mode: MoneyMode;
  data: {
    date: string;
    value: number;
  }[];
};

function Trend({ mode, data }: BalanceTrendCardProps) {
  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="linear"
            dataKey="value"
            stroke={mode === MoneyMode.MoneyIn ? "var(--money-in)" : "var(--money-out)"}
            strokeWidth={3}
            dot={false}
            isAnimationActive
          />
          <Tooltip
            content={<CustomTooltip mode={mode} />}
            cursor={{
              stroke: mode === MoneyMode.MoneyIn ? "var(--money-in)" : "var(--money-out)",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface AmtSummaryCardWithTrendProps {
  type: "Sent" | "Received";
  count: number;
  amount: number;
  mode: MoneyMode;
  transactions: Transaction[];
  periodOptions: Period[];
  defaultPeriod: Period;
  periodAverages: PeriodAverages;
}
function AmtSummaryCardWithTrend({
  type,
  count,
  amount,
  mode,
  transactions,
  periodOptions,
  defaultPeriod,
  periodAverages,
}: AmtSummaryCardWithTrendProps) {
  const [chartPeriod, setChartPeriod] = useState<Period>(defaultPeriod);
  const chartData = useMemo(() => {
    const groupedTrs = groupTransactionsByPeriod(transactions, chartPeriod);
    return Object.entries(groupedTrs).map(([date, trs]) => ({
      date,
      value: Math.abs(getTotals(trs).totalAmount),
    }));
  }, [transactions, chartPeriod]);

  useEffect(() => {
    setChartPeriod(defaultPeriod);
  }, [defaultPeriod]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-normal mb-0 pb-0">
          {type} ({count.toLocaleString()} Transactions)
        </CardTitle>
        {mode === MoneyMode.MoneyIn ? (
          <ArrowDownCircle size={18} className="text-money-in" />
        ) : (
          <ArrowUpCircle size={18} className="text-money-out" />
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div
            className={cn(
              "text-xl font-bold",
              mode === MoneyMode.MoneyIn ? "text-money-in" : "text-money-out"
            )}
          >
            {formatCurrency(amount)}
          </div>
          <span
            className={`${
              mode === MoneyMode.MoneyIn
                ? "text-money-in bg-money-in/20"
                : "text-money-out bg-money-out/20"
            } px- mx-1 text-sm`}
          >
            {mode === MoneyMode.MoneyIn
              ? formatCurrency(periodAverages[chartPeriod]?.moneyInAverage || 0)
              : formatCurrency(periodAverages[chartPeriod]?.moneyOutAverage || 0)}
          </span>
          <span className="text-muted-foreground">{PeriodDict[chartPeriod]} Avg </span>
        </div>
        <div className="md:mt-[-24px] hidden sm:block">
          <div>
            <Select value={chartPeriod} onValueChange={(value) => setChartPeriod(value as Period)}>
              <SelectTrigger className="h-7 w-auto border-none px-1 shadow-none flex gap-2 items-center focus:border-none focus:ring-none focus:outline-none capitalize">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    <span>{PeriodDict[option]} Trend</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Trend data={chartData} mode={mode} />
        </div>
      </CardContent>
    </Card>
  );
}

export default AmtSummaryCardWithTrend;
