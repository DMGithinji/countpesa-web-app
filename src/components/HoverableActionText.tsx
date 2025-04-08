import React, { useState } from "react";
import { Eye, EyeClosed, EyeOff } from "lucide-react";
import { Filter } from "@/types/Filters";
import useTransactionStore from "@/stores/transactions.store";

const formatFilterText = (filter: Filter) => {
  if (filter.field === "code") {
    return "Just exclude this transaction";
  }
  if (filter.operator === "!=") {
    return "Exclude similar transactions";
  }
  return "Show similar transactions";
};

interface HoverableTextProps {
  children: React.ReactNode;
  actions: Filter[];
  hoverState?: boolean;
  className?: string;
}

function HoverableActionText({
  children,
  actions,
  hoverState,
  className = "",
}: HoverableTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const validateAndAddFilters = useTransactionStore((state) => state.validateAndAddFilters);

  const handleActionClick = (action: Filter) => {
    const filter: Filter = {
      field: action.field,
      operator: action.operator,
      value: action.value,
    };
    validateAndAddFilters(filter);
  };

  const getActionIcon = (action: Filter) => {
    if (action.field === "code") {
      return <EyeClosed size={16} />;
    }
    if (action.operator === "!=") {
      return <EyeOff size={16} />;
    }
    return <Eye size={16} />;
  };

  return (
    <div
      className={`${className} relative inline-flex items-center group pr-[80px] w-full`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={className}>{children}</span>
      {(hoverState || isHovered) && (
        <div className="flex space-x-1 transition-all pl-4 mr-[-80px] z-[999]">
          {actions.map((action) => (
            <button
              type="button"
              key={`${action.field}-${action.operator}-${action.value}`}
              onClick={(e) => {
                e.stopPropagation();
                handleActionClick(action);
              }}
              className="text-gray-500 pr-1 hover:text-primary transition-all cursor-pointer"
              title={formatFilterText(action)}
            >
              {getActionIcon(action)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HoverableActionText;
