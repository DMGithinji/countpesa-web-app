import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MoneyMode } from "@/types/Transaction";
import { formatCurrency } from "@/lib/utils";
import { FieldGroupSummary } from "@/lib/groupByField";
import { SidepanelTransactions } from "@/stores/ui.store";
import { generateLivelyColor } from "@/lib/colorGenerator";
import NoData from "./NoData";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background p-2 border rounded-md shadow-sm">
        <p className="font-medium">{data.name}</p>
        <p>
          <span>Amount: </span>
          <span className="font-medium">{formatCurrency(data.amount)}</span>
        </p>
        <p>
          <span>No of Trs: </span>
          <span className="font-medium">{data.count}</span>
        </p>
        <p>
          <span>Percentage: </span>
          <span className="font-medium">{data.amountPercentage.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
}

type LegendData = {
  name: string;
  color: string;
};
// Custom legend component
function CustomLegend({
  currentLegendData,
  totalPages,
  currentPage,
  setCurrentPage,
}: {
  currentLegendData: LegendData[];
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <div className="flex flex-col items-center mt-4">
      <div className="flex flex-wrap justify-center gap-3 mb-2">
        {currentLegendData.map((entry) => {
          return (
            <div key={entry.name} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs">{entry.name}</span>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-1">
          <ChevronLeft
            size={16}
            className={`cursor-pointer ${currentPage === 1 ? "text-gray-300" : ""}`}
            onClick={() => currentPage > 1 && setCurrentPage((prev) => prev - 1)}
          />
          <span className="text-xs">
            {currentPage}/{totalPages}
          </span>
          <ChevronRight
            size={16}
            className={`cursor-pointer ${currentPage === totalPages ? "text-gray-300" : ""}`}
            onClick={() => currentPage < totalPages && setCurrentPage((prev) => prev + 1)}
          />
        </div>
      )}
    </div>
  );
}
interface CategoriesDonutChartProps {
  moneyMode: MoneyMode;
  groupedDataByAmount: FieldGroupSummary[];
  totalAmount: number;
  onItemClick?: (item: SidepanelTransactions) => void;
}

function CategoriesDonutChart({
  moneyMode,
  groupedDataByAmount,
  totalAmount,
  onItemClick,
}: CategoriesDonutChartProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(groupedDataByAmount.length / itemsPerPage);

  const chartData = useMemo(() => {
    return groupedDataByAmount.map((item, i) => ({
      ...item,
      value: item.amount,
      color: generateLivelyColor(item.name, moneyMode, i),
    }));
  }, [groupedDataByAmount, moneyMode]);

  // Get current page data for legend
  const currentLegendData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return chartData.slice(startIndex, startIndex + itemsPerPage);
  }, [chartData, currentPage]);

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle
            className={`text-base font-medium ${
              moneyMode === MoneyMode.MoneyIn ? "text-money-in" : "text-money-out"
            }`}
          >
            <span>Total {moneyMode === MoneyMode.MoneyIn ? "Money In" : "Money Out"}:</span> (
            {formatCurrency(Math.abs(totalAmount))})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col h-64 relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={31}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={0}
                  dataKey="value"
                  animationDuration={500}
                  animationEasing="ease-in-out"
                  className="border-none"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="none"
                      className="cursor-pointer"
                      onClick={() => onItemClick && onItemClick(entry)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}

          <CustomLegend
            currentLegendData={currentLegendData}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoriesDonutChart;
