import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  UserCircle, 
  DollarSign, 
  ShoppingCart,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ActivityType = "order_completed" | "customer_update" | "payment" | "new_order" | "order_processing" | "payment_overdue";

interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  data?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  title?: string;
  className?: string;
  viewAllLink?: string;
}

export function ActivityFeed({ 
  activities, 
  title = "Atividades Recentes", 
  className, 
  viewAllLink = "#" 
}: ActivityFeedProps) {
  
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "order_completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          bg: "bg-green-100",
          color: "text-green-500"
        };
      case "customer_update":
        return {
          icon: <UserCircle className="h-4 w-4" />,
          bg: "bg-blue-100",
          color: "text-blue-500"
        };
      case "payment":
        return {
          icon: <DollarSign className="h-4 w-4" />,
          bg: "bg-purple-100",
          color: "text-purple-500"
        };
      case "new_order":
        return {
          icon: <ShoppingCart className="h-4 w-4" />,
          bg: "bg-yellow-100",
          color: "text-yellow-500"
        };
      case "order_processing":
        return {
          icon: <Clock className="h-4 w-4" />,
          bg: "bg-blue-100",
          color: "text-blue-500"
        };
      case "payment_overdue":
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          bg: "bg-red-100",
          color: "text-red-500"
        };
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="font-bold text-foreground mb-4">{title}</h3>
        <div className="space-y-4">
          {activities.map((activity) => {
            const iconConfig = getActivityIcon(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={cn(
                  "min-w-10 w-10 h-10 rounded-full flex items-center justify-center",
                  iconConfig.bg,
                  iconConfig.color
                )}>
                  {iconConfig.icon}
                </div>
                <div>
                  <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: activity.message }} />
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <a href={viewAllLink} className="text-primary hover:underline text-sm font-medium">
            Ver todas as atividades
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
