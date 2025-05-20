import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { ChartLine, PieChartIcon } from "lucide-react";

interface FinancialData {
  revenue: number;
  expenses: number;
  balance: number;
}

interface FinancialSummaryProps {
  data: FinancialData;
  title?: string;
  className?: string;
  chartLink?: string;
}

export function FinancialSummary({ 
  data, 
  title = "Resumo Financeiro", 
  className,
  chartLink = "#"
}: FinancialSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const chartData = [
    { name: "Receitas", value: data.revenue, color: "hsl(var(--chart-3))" },
    { name: "Despesas", value: data.expenses, color: "hsl(var(--chart-1))" }
  ];

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="font-bold text-foreground mb-4">{title}</h3>
        
        {/* Chart */}
        <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
          {data.revenue > 0 || data.expenses > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center">
              <div className="text-muted-foreground mb-1">
                <PieChartIcon className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-xs text-muted-foreground">Gráfico de Entradas/Saídas</p>
            </div>
          )}
        </div>
        
        {/* Financial data */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-muted-foreground">Receita (Mês)</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="text-sm text-muted-foreground">Despesas (Mês)</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(data.expenses)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm font-medium text-foreground">Saldo</span>
            <span className={cn(
              "text-sm font-bold",
              data.balance >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatCurrency(data.balance)}
            </span>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <a href={chartLink} className="text-primary hover:underline text-sm font-medium">
            Ver relatório completo
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
