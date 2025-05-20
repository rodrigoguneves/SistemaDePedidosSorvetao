import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trendValue?: string;
  trendIcon?: ReactNode;
  trendColor?: "green" | "red" | "blue" | "orange" | "yellow" | "primary";
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon,
  trendValue,
  trendIcon,
  trendColor = "green",
  className,
}: KpiCardProps) {
  const colorClasses = {
    green: "text-green-500",
    red: "text-red-500",
    blue: "text-blue-500",
    orange: "text-orange-500",
    yellow: "text-yellow-500",
    primary: "text-primary"
  };

  const bgClasses = {
    green: "bg-green-100",
    red: "bg-red-100",
    blue: "bg-blue-100",
    orange: "bg-orange-100",
    yellow: "bg-yellow-100",
    primary: "bg-primary/10"
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {trendValue && (
              <div className={cn("flex items-center mt-2 text-sm", colorClasses[trendColor])}>
                {trendIcon && <span className="mr-1">{trendIcon}</span>}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bgClasses[trendColor])}>
            <span className={colorClasses[trendColor]}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
