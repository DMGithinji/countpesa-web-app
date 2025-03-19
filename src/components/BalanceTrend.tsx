import { LineChart, Line, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MinusCircle, TrendingUpDown } from "lucide-react";

type BalanceTrendCardProps = {
  latestBalance: number;
  data: {
    date: string;
    balance: number;
  }[];
};

const BalanceTrendCard = ({ latestBalance, data }: BalanceTrendCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Balance Trend</CardTitle>
        <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-baseline">
          <p className="text-2xl font-semibold">
            {formatCurrency(latestBalance)}
          </p>
          <span className="text-sm text-zinc-400">(Latest)</span>
        </div>

        <div className="h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "3 3" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceTrendCard;

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 p-2 rounded-md shadow-md text-sm">
        <p className="text-zinc-300">{`Date: ${payload[0].payload.date}`}</p>
        <p className="text-emerald-400 font-medium">{`Balance: Ksh ${payload[0].value?.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};
