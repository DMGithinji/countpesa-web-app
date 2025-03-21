import { useMemo, useState } from "react";
import { MoneyMode } from "@/types/Transaction";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoriesDonutChartProps {
  title?: string;
  moneyMode: MoneyMode;
  groupedDataByAmount: {
    name: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  totalAmount: number;
}

// Define your color palette
const COLORS = [
  "#CCCCCC", // Gray for Uncategorized
  "#EC4899", // Pink for Debt financing
  "#4ADE80", // Green for Entertainment
  "#F97316", // Orange for Transfer
  "#3B82F6", // Blue for Bills & utilities
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#FBBF24", // Yellow
  "#06B6D4", // Cyan
  "#10B981", // Emerald
];

const CategoriesDonutChart: React.FC<CategoriesDonutChartProps> = ({
  moneyMode,
  groupedDataByAmount,
  totalAmount,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate total pages
  const totalPages = Math.ceil(groupedDataByAmount.length / itemsPerPage);

  // Prepare data for the chart
  const chartData = useMemo(() => {

    // Format data for pie chart
    return groupedDataByAmount.map((item) => ({
      name: item.name,
      value: item.amount,
      percentage: item.percentage,
      // Keep original data for tooltip
      originalAmount: item.amount,
      originalCount: item.count,
    }));
  }, [groupedDataByAmount]);

  // Get current page data for legend
  const currentLegendData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return chartData.slice(startIndex, startIndex + itemsPerPage);
  }, [chartData, currentPage]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-100 p-2 border rounded-md shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p>
            <span className="text-gray-600">Amount: </span>
            <span className="font-medium">{formatCurrency(data.originalAmount)}</span>
          </p>
          <p>
            <span className="text-gray-600">No of Trs: </span>
            <span className="font-medium">{data.originalCount}</span>
          </p>
          <p>
            <span className="text-gray-600">Percentage: </span>
            <span className="font-medium">{data.percentage.toFixed(1)}%</span>
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
            const actualIndex = ((currentPage - 1) * itemsPerPage) + index;
            return (
              <div key={`legend-${index}`} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[actualIndex % COLORS.length] }}
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
              className={`cursor-pointer ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => currentPage > 1 && setCurrentPage(prev => prev - 1)}
            />
            <span className="text-xs text-gray-600">{currentPage}/{totalPages}</span>
            <ChevronRight
              size={16}
              className={`cursor-pointer ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => currentPage < totalPages && setCurrentPage(prev => prev + 1)}
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
          <CardTitle className={`text-base font-medium ${moneyMode === MoneyMode.MoneyIn ? 'text-green-600' : 'text-red-600'}`}>
          <span >Total {moneyMode === MoneyMode.MoneyIn ? 'Money' : 'Expenses'}:</span> ({formatCurrency(Math.abs(totalAmount))})
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex flex-col h-64 relative">
          <ResponsiveContainer width="100%" height="75%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={31}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={1}
                dataKey="value"
                animationDuration={0}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <CustomLegend />
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoriesDonutChart;
