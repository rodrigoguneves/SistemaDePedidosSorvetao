import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface SalesData {
  name: string;
  value: number;
}

interface SalesChartProps {
  data: SalesData[];
  className?: string;
  title?: string;
}

export function SalesChart({ data, className, title = "Vendas Recentes" }: SalesChartProps) {
  const [period, setPeriod] = useState<"monthly" | "weekly" | "daily">("monthly");

  const periodButtons = [
    { label: "Mensal", value: "monthly" },
    { label: "Semanal", value: "weekly" },
    { label: "Diário", value: "daily" },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground">{title}</h3>
          <div className="flex space-x-2">
            {periodButtons.map((button) => (
              <Button
                key={button.value}
                variant="outline"
                size="sm"
                className={cn(
                  "px-3 py-1 text-sm rounded-lg font-medium",
                  period === button.value
                    ? "bg-primary/10 text-primary border-primary/10"
                    : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
                )}
                onClick={() => setPeriod(button.value as "monthly" | "weekly" | "daily")}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Vendas"]}
                labelFormatter={(label) => `${period === "monthly" ? "Mês" : period === "weekly" ? "Semana" : "Dia"}: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary) / 0.2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
