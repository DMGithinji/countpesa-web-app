import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { FieldGroupSummary, GroupByField } from "@/lib/groupByField";
import { MoneyMode, Transaction } from "@/types/Transaction";
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

interface TopTrsGroupedByFieldProps {
  groupedBy: GroupByField;
  moneyInSummaryByAmt: FieldGroupSummary[];
  moneyOutSummaryByAmt: FieldGroupSummary[];
  moneyInSummaryByCount: FieldGroupSummary[];
  moneyOutSummaryByCount: FieldGroupSummary[];
  onSelectGroup: (selected: {
    title: string,
    transactions: Transaction[],
  }) => void;
}

const TopTrsGroupedByField: React.FC<TopTrsGroupedByFieldProps> = ({
  groupedBy,
  moneyInSummaryByAmt,
  moneyOutSummaryByAmt,
  moneyInSummaryByCount,
  moneyOutSummaryByCount,
  onSelectGroup,
}) => {
  const [moneyMode, setMoneyMode] = useState<MoneyMode>(MoneyMode.MoneyOut);
  const [summaryMode, setSummaryMode] = useState<"count" | "amount">("amount");
  const summary =
    moneyMode === MoneyMode.MoneyOut
      ? summaryMode === "amount"
        ? moneyOutSummaryByAmt
        : moneyOutSummaryByCount
      : summaryMode === "amount"
      ? moneyInSummaryByAmt
      : moneyInSummaryByCount;

  const groupTitle =
    groupedBy === GroupByField.Account ? "Top Accounts" : "Top Categories";

  const moneyModeOptions =
    groupedBy === GroupByField.Account
      ? [
          { label: "I Send To", value: MoneyMode.MoneyOut },
          { label: "I Receive From", value: MoneyMode.MoneyIn },
        ]
      : [
          { label: "(Money Out)", value: MoneyMode.MoneyOut },
          { label: "(Money In)", value: MoneyMode.MoneyIn },
        ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{groupTitle}</span>
            <Select
              value={moneyMode}
              onValueChange={(value) => setMoneyMode(value as MoneyMode)}
            >
              <SelectTrigger className="h-7 w-auto border-none px-1 shadow-none flex gap-2 items-center focus:border-none focus:ring-none focus:outline-none">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                {moneyModeOptions.map((option, index) => (
                  <SelectItem key={index} value={option.value}>
                    <span>{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>{" "}
        </CardTitle>
        <ToggleGroup type="single" value={summaryMode}>
          {["amount", "count"].map((value) => (
            <ToggleGroupItem
              className={"cursor-pointer capitalize text-xs"}
              onClick={() => setSummaryMode(value as "count" | "amount")}
              value={value}
              key={value}
            >
              {value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="px-4">
        {summary.map((item) => (
          <div key={item.name} className="space-y-1 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 text-sm max-w-[60%] truncate">
                {item.name}
              </span>
              <span className="text-gray-900 text-sm font-medium">
                {summaryMode === "amount"
                  ? formatCurrency(item.amount)
                  : item.count}
              </span>
            </div>
            <div>
              <Progress
                className="cursor-pointer"
                onClick={() => onSelectGroup({
                  title: item.name,
                  transactions: item.transactions
                })}
                color={
                  moneyMode === MoneyMode.MoneyIn
                    ? "bg-green-600"
                    : "bg-red-600"
                }
                value={
                  summaryMode === "count"
                    ? item.countPercentage
                    : item.amountPercentage
                }
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopTrsGroupedByField;
