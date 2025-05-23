import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import "react-calendar-heatmap/dist/styles.css";
import CalendarHeatmap, { TooltipDataAttrs } from "react-calendar-heatmap";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MoneyMode, Transaction } from "@/types/Transaction";
import ChartTransactions from "../ChartTransactions";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { useTransactionHeatmap, HeatmapValue } from "./useTransactionHeatMap";

interface TransactionHeatmapProps {
  transactions: Transaction[];
}

export default function TransactionHeatmap({
  transactions,
}: TransactionHeatmapProps) {
  const {
    mode,
    setMode,
    selectedYear,
    setSelectedYear,
    availableYears,
    values,
    selectedTransactions,
    getColorClass,
    handleCellClick,
  } = useTransactionHeatmap(transactions);

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4 mt-4">
      <Card className="w-full h-full lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            {mode === MoneyMode.MoneyOut ? "Spending" : "Deposits"} Heatmap
            {availableYears.length > 1 && (
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
              >
                <SelectTrigger className="h-7 w-auto border-none px-0 shadow-none flex gap-2 items-center focus:border-none focus:ring-none focus:outline-none">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardTitle>
          <ToggleGroup type="single" value={mode}>
            {Object.values(MoneyMode).map((filterVal) => (
              <ToggleGroupItem
                onClick={() => setMode(filterVal)}
                value={filterVal}
                key={filterVal}
              >
                {filterVal === MoneyMode.MoneyIn ? "In" : "Out"}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardHeader>
        <CardContent className="px-4 py-2">
          <div className="w-full h-full lg:col-span-3 mt-2">
            <CalendarHeatmap
              startDate={new Date(`${selectedYear}-01-01`)}
              endDate={new Date(`${selectedYear}-12-31`)}
              values={values}
              classForValue={(value) =>
                value ? getColorClass(value.amount) : "color-empty"
              }
              onClick={(value) =>
                value && handleCellClick(value as HeatmapValue)
              }
              showWeekdayLabels
              tooltipDataAttrs={(value) => {
                if (!value || !value.date) {
                  return {
                    "data-tooltip-id": "",
                    "data-tooltip-content": "",
                  } as TooltipDataAttrs;
                }
                return {
                  "data-tooltip-id": "heatmap-tooltip",
                  "data-tooltip-content": `${format(
                    new Date(value.date),
                    "EEE, do MMM yyyy",
                  )}: ${formatCurrency(value.amount)}`,
                } as TooltipDataAttrs;
              }}
            />
            <Tooltip id="heatmap-tooltip" />
            <style>{`
              .react-calendar-heatmap .color-empty { fill: #99999920; }
              .react-calendar-heatmap .color-red-1 { fill: #ffcccc; }
              .react-calendar-heatmap .color-red-2 { fill: #ff9999; }
              .react-calendar-heatmap .color-red-3 { fill: #ff6666; }
              .react-calendar-heatmap .color-red-4 { fill: #ff0000; }
              .react-calendar-heatmap .color-green-1 { fill: #ccffcc; }
              .react-calendar-heatmap .color-green-2 { fill: #99ff99; }
              .react-calendar-heatmap .color-green-3 { fill: #66ff66; }
              .react-calendar-heatmap .color-green-4 { fill: #00cc00; }
              .react-calendar-heatmap rect {
                rx: 2;
                stroke: #f9fafb20;
                stroke-width: 1px;
                cursor: pointer;
              }
            `}</style>
          </div>
        </CardContent>
      </Card>
      <div className="lg:col-span-1 hidden sm:block">
        <ChartTransactions
          selected={selectedTransactions}
          defaultSortBy="date"
          showDisplayMode={false}
          defaultDisplayMode={
            {
              [MoneyMode.MoneyIn]: "moneyIn",
              [MoneyMode.MoneyOut]: "moneyOut",
            }[mode] as "moneyIn" | "moneyOut"
          }
          defaultSortDirection="desc"
        />
      </div>
    </div>
  );
}
