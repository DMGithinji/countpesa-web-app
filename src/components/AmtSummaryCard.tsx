import { LucideIcon } from "lucide-react";
import { Period, PeriodDict } from "@/lib/groupByPeriod";
import { cn, formatCurrency } from "@/lib/utils";
import { MoneyMode } from "@/types/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface AmtSummaryCardProps {
  type: "Sent" | "Received";
  count: number;
  amount: number;
  mode: MoneyMode;
  Icon: LucideIcon;
  period: Period;
  average?: number;
}
function AmtSummaryCard({ type, count, amount, mode, Icon, average, period }: AmtSummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm md:text-base font-normal">
          {type} ({count} Transactions)
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${MoneyMode.MoneyIn === mode ? "text-money-in" : "text-money-out"}`}
        />
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-lg md:text-xl font-bold",
            mode === MoneyMode.MoneyIn ? "text-money-in" : "text-money-out"
          )}
        >
          {formatCurrency(amount)}
        </div>
        {!!average && (
          <div className="text-sm text-muted-foreground space-x-1 mt-4">
            <span className="bg-money-in/10 text-money-in px-2 py-0.5 rounded-sm inline-block">
              {formatCurrency(Math.round(average))}
            </span>
            <span>{PeriodDict[period]} Avg</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AmtSummaryCard;
