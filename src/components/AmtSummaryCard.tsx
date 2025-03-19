import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { MoneyMode } from "@/types/Transaction";
import { LucideIcon } from "lucide-react";

interface AmtSummaryCardProps {
  type: "Sent" | "Received";
  count: number;
  amount: number;
  mode: MoneyMode;
  Icon: LucideIcon;
}
const AmtSummaryCard = ({ type, count, amount, mode, Icon }: AmtSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {type} ({count} Transactions)
        </CardTitle>
        <Icon className={`h-4 w-4 ${MoneyMode.MoneyIn === mode ? 'text-green-600' : 'text-red-600'}`} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", mode === MoneyMode.MoneyIn ? 'text-green-600' : 'text-red-600')}>
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
};

export default AmtSummaryCard;
