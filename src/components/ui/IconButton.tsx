interface IconButtonProps {
  isActive: boolean;
  onClick: () => void;
  Icon: React.ComponentType<{ size: number }>;
  size?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  isActive,
  onClick,
  Icon,
  size = 16
}) => {
  return (
    <div
      className={`p-1 rounded cursor-pointer ${isActive ? "text-primary" : ""}`}
      onClick={onClick}
    >
      <Icon size={size} />
    </div>
  );
};

export default IconButton;