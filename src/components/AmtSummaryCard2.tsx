import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEffect, useMemo, useState } from "react";
import { getTotals } from "@/lib/getTotal";

interface AmtSummaryCardProps {
  type: "Sent" | "Received";
  count: number;
  amount: number;
  mode: MoneyMode;
  transactions: Transaction[];
  periodOptions: Period[];
  defaultPeriod: Period;
}
const AmtSummaryCard = ({
  type,
  count,
  amount,
  mode,
  transactions,
  periodOptions,
  defaultPeriod,
}: AmtSummaryCardProps) => {
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
        <CardTitle className="text-sm font-medium mb-0 pb-0">
          Total {type} ({count} Transactions)
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div
            className={cn(
              "text-2xl font-bold",
              mode === MoneyMode.MoneyIn ? "text-green-600" : "text-red-600"
            )}
          >
            {formatCurrency(amount)}
          </div>
          <span
            className={`${
              mode === MoneyMode.MoneyIn
                ? "text-green-600 bg-green-600/20"
                : "text-red-600 bg-red-600/20"
            } px- mx-1`}
          >
            {formatCurrency(Math.floor((amount) / count) || 0)}
          </span>
          <span>Avg {type}</span>
        </div>
        <div className="md:mt-[-24px]">
          <div>
            <Select
              value={chartPeriod}
              onValueChange={(value) => setChartPeriod(value as Period)}
            >
              <SelectTrigger className="h-7 w-auto border-none px-1 shadow-none flex gap-2 items-center focus:border-none focus:ring-none focus:outline-none capitalize">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    <span className="capitalize">{option}</span>
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
};

export default AmtSummaryCard;

type BalanceTrendCardProps = {
  mode: MoneyMode;
  data: {
    date: string;
    value: number;
  }[];
};

const Trend = ({ mode, data }: BalanceTrendCardProps) => {
  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="linear"
            dataKey="value"
            stroke={mode === MoneyMode.MoneyIn ? "#22c55e" : "#E7000B"}
            strokeWidth={2}
            dot={true}
            isAnimationActive={true}
          />
          <Tooltip
            content={<CustomTooltip mode={mode} />}
            cursor={{
              stroke: mode === MoneyMode.MoneyIn ? "#22c55e" : "#E7000B",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const CustomTooltip = ({
  active,
  payload,
  mode,
}: { mode: MoneyMode } & TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-100 p-2 rounded-md shadow-sm text-sm">
        <p className="">{`${payload[0].payload.date}`}</p>
        <p
          className={cn(
            "font-medium",
            mode === MoneyMode.MoneyOut ? "text-red-600" : "text-green-600"
          )}
        >{`Balance: Ksh ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};
