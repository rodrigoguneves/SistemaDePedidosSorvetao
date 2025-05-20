import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, UserPlus, Package, DollarSign } from "lucide-react";
import { Link } from "wouter";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: "primary" | "blue" | "green" | "purple";
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActions({ actions, title = "Ações Rápidas", className }: QuickActionsProps) {
  const getButtonStyles = (color: QuickAction["color"]) => {
    switch (color) {
      case "primary":
        return "bg-primary hover:bg-primary/90";
      case "blue":
        return "bg-blue-500 hover:bg-blue-600";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "purple":
        return "bg-purple-500 hover:bg-purple-600";
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="font-bold text-foreground mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                className={`${getButtonStyles(
                  action.color
                )} text-white p-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center w-full`}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
