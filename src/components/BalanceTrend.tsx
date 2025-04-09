import { LineChart, Line, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { TrendingUpDown } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-2 rounded-md shadow-md text-sm">
        <p className="font-mono">{`${payload[0].payload.date}`}</p>
        <p className="font-medium">{`Balance: ${formatCurrency(payload[0].value || 0)}`}</p>
      </div>
    );
  }
  return null;
}

type BalanceTrendCardProps = {
  latestBalance: number;
  data: {
    date: string;
    balance: number;
  }[];
};

function BalanceTrendCard({ latestBalance, data }: BalanceTrendCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-normal text-sm md:text-base">Balance Trend</CardTitle>
        <TrendingUpDown className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 items-baseline">
          <p className="text-lg md:text-xl font-semibold">{formatCurrency(latestBalance)}</p>
          <span className="text-zinc-400 text-sm md:text-base">(Latest)</span>
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
                cursor={{
                  stroke: "#6b7280",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default BalanceTrendCard;
