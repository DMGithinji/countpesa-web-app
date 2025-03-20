import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CheckIcon, ChevronsUpDown, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface SelectionDropdownProps {
  title: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SelectionDropdown = ({
  title,
  placeholder,
  options,
  value,
  onChange,
  disabled = false
}: SelectionDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      <Popover open={!disabled && isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between"
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="p-2">
            <Input
              placeholder={`Search or type new ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />

            {searchQuery && (filteredOptions.length === 0 || !options.includes(searchQuery)) && (
              <Button
                variant="ghost"
                className="w-full justify-start mb-2 text-sm"
                onClick={() => {
                  onChange(searchQuery);
                  setIsOpen(false);
                  setSearchQuery("");
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Use "{searchQuery}"
              </Button>
            )}

            <div className="max-h-[200px] max-w-60 overflow-y-scroll">
              {filteredOptions.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm mb-1",
                    value === option ? "bg-accent text-accent-foreground" : ""
                  )}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SelectionDropdown;
