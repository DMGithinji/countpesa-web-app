import { useMemo, useState } from "react";
import { MoneyMode } from "@/types/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FieldGroupSummary, GroupByField, groupTransactionsByField } from "@/lib/groupByField";
import { SidepanelTransactions } from "@/stores/ui.store";
import NoData from "./NoData";
import { generateLivelyColor } from "@/lib/colorGenerator";
interface CategoriesDonutChartProps {
  title?: string;
  moneyMode: MoneyMode;
  groupedDataByAmount: FieldGroupSummary[];
  totalAmount: number;
  onItemClick?: (item: SidepanelTransactions) => void;
}

const CategoriesDonutChart: React.FC<CategoriesDonutChartProps> = ({
  moneyMode,
  groupedDataByAmount,
  totalAmount,
  onItemClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(groupedDataByAmount.length / itemsPerPage);

  const chartData = useMemo(() => {
    if (groupedDataByAmount.length === 1) {
      const groupedBySubcategories = groupTransactionsByField(groupedDataByAmount[0].transactions, GroupByField.Subcategory);


      return groupedBySubcategories.map((item, i) => ({
        ...item,
        value: item.amount,
        color: generateLivelyColor(item.name, moneyMode, i),
      }));
    }

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

  const CustomTooltip = ({ active, payload }: any) => {
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
            <span className="font-medium">
              {data.amountPercentage.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = () => {
    return (
      <div className="flex flex-col items-center mt-4">
        <div className="flex flex-wrap justify-center gap-3 mb-2">
          {currentLegendData.map((entry, index) => {
            return (
              <div key={`legend-${index}`} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs">{entry.name}</span>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <ChevronLeft
              size={16}
              className={`cursor-pointer ${
                currentPage === 1
                  ? "text-gray-300"
                  : ""
              }`}
              onClick={() =>
                currentPage > 1 && setCurrentPage((prev) => prev - 1)
              }
            />
            <span className="text-xs">
              {currentPage}/{totalPages}
            </span>
            <ChevronRight
              size={16}
              className={`cursor-pointer ${
                currentPage === totalPages
                  ? "text-gray-300"
                  : ""
              }`}
              onClick={() =>
                currentPage < totalPages && setCurrentPage((prev) => prev + 1)
              }
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle
            className={`text-base font-medium ${
              moneyMode === MoneyMode.MoneyIn
                ? "text-money-in"
                : "text-money-out"
            }`}
          >
            <span>
              Total {moneyMode === MoneyMode.MoneyIn ? "Money In" : "Money Out"}
              :
            </span>{" "}
            ({formatCurrency(Math.abs(totalAmount))})
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
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
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

          <CustomLegend />
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesDonutChart;

const getCategoryColor = (name: string): string => {
  // Special case for Uncategorized
  if (name === "Uncategorized") {
    return "#CCCCCC"; // Gray
  }

  // Vibrant color palette
  const vibrantColors = [
    "#FF5252", // Red
    "#448AFF", // Blue
    "#66BB6A", // Green
    "#FFCA28", // Amber
    "#AB47BC", // Purple
    "#26C6DA", // Cyan
    "#FFA726", // Orange
    "#EC407A", // Pink
    "#7E57C2", // Deep Purple
    "#9CCC65", // Light Green
    "#5C6BC0", // Indigo
    "#FF7043", // Deep Orange
    "#78909C", // Blue Gray
    "#42A5F5", // Light Blue
    "#4DD0E1", // Light Cyan
    "#DCE775", // Lime
  ];

  // Hash the name to get a consistent color for the same category
  let hashCode = 0;
  for (let i = 0; i < name.length; i++) {
    hashCode = name.charCodeAt(i) + ((hashCode << 5) - hashCode);
  }

  // Use the hash to pick a color, with fallback to index for stability
  const colorIndex = Math.abs(hashCode) % vibrantColors.length;
  return vibrantColors[colorIndex];
};
