import { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface HeaderNavItemProps {
  icon: ReactNode;
  label: string;
  to: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function HeaderNavItem({ icon, label, to, isActive, onClick }: HeaderNavItemProps) {
  return (
    <Link href={to}>
      <a
        className={cn(
          "flex flex-col items-center gap-1",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={onClick}
      >
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          isActive ? "bg-primary/10" : "bg-gray-100 dark:bg-muted"
        )}>
          <span className={isActive ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        </div>
        <span className="text-sm font-semibold">{label}</span>
      </a>
    </Link>
  );
}
