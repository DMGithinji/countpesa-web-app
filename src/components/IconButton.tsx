import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface IconButtonProps {
  isActive: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size: number }>;
  title?: string;
  size?: number;
}

function IconButton({ isActive, onClick, Icon, size = 16, title }: IconButtonProps) {
  return (
    <Button
      variant="ghost"
      title={title}
      className={cn("p-1 rounded cursor-pointer", {
        "text-primary hover:text-primary": isActive,
      })}
      onClick={onClick}
    >
      <Icon size={size} />
    </Button>
  );
}

export default IconButton;
