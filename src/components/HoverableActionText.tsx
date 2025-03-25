import React, { useState } from "react";
import { Eye, EyeClosed, EyeOff } from "lucide-react";
import { Filter } from "@/types/Filters";
import { useTransactionContext } from "@/context/TransactionDataContext";

interface HoverableTextProps {
  children: React.ReactNode;
  actions: Filter[];
  hoverState?: boolean;
  className?: string;
}

const HoverableActionText: React.FC<HoverableTextProps> = ({
  children,
  actions,
  hoverState,
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { validateAndAddFilters } = useTransactionContext();

  const handleActionClick = (action: Filter) => {
    const filter: Filter = {
      field: action.field,
      operator: action.operator,
      value: action.value,
    };
    validateAndAddFilters(filter);
  };

  return (
    <div
      className={`${className} relative inline-flex items-center group pr-[80px] w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={className}>{children}</span>
      {
        ((hoverState || isHovered) && (
          <div className="flex space-x-1 transition-all pl-4 mr-[-80px] z-[999]">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionClick(action);
                }}
                className="text-gray-500 pr-1 hover:text-gray-800 transition-all cursor-pointer"
                title={formatFilterText(action)}
              >
                {action.field === "code" ? (
                  <EyeClosed size={16} />
                ) : action.operator === "!=" ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            ))}
          </div>
        ))}
    </div>
  );
};

export default HoverableActionText;

const formatFilterText = (filter: Filter) => {
  return filter.field === "code"
    ? "Just exclude this transaction"
    : filter.operator === "!="
    ? "Exclude similar transactions"
    : "Show similar transactions";
};
