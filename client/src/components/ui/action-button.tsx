import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  children: ReactNode;
  icon: ReactNode;
  variant?: "default" | "blue" | "green" | "purple";
  onClick?: () => void;
  className?: string;
}

export function ActionButton({
  children,
  icon,
  variant = "default",
  onClick,
  className,
}: ActionButtonProps) {
  const variantClasses = {
    default: "bg-primary hover:bg-primary/90 text-white",
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
  };

  return (
    <Button
      className={cn(
        "p-3 font-medium text-sm transition-colors flex items-center justify-center gap-2",
        variantClasses[variant],
        className
      )}
      onClick={onClick}
    >
      <span className="mr-1">{icon}</span>
      {children}
    </Button>
  );
}
