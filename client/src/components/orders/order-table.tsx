import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, RefreshCw, CreditCard } from "lucide-react";
import { Link } from "wouter";

export interface Order {
  id: number;
  date: string;
  customer_name?: string;
  total: number;
  status: string;
  payment_status: string;
}

interface OrderTableProps {
  orders: Order[];
  isAdmin?: boolean;
  showCustomer?: boolean;
  onView?: (orderId: number) => void;
  onEdit?: (orderId: number) => void;
  onRepeat?: (orderId: number) => void;
  onPayment?: (orderId: number) => void;
}

export function OrderTable({
  orders,
  isAdmin = false,
  showCustomer = false,
  onView,
  onEdit,
  onRepeat,
  onPayment,
}: OrderTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left text-sm font-semibold text-muted-foreground">Nº {isAdmin ? "Pedido" : ""}</TableHead>
            {showCustomer && (
              <TableHead className="text-left text-sm font-semibold text-muted-foreground">Cliente</TableHead>
            )}
            <TableHead className="text-left text-sm font-semibold text-muted-foreground">Data</TableHead>
            <TableHead className="text-left text-sm font-semibold text-muted-foreground">Valor</TableHead>
            <TableHead className="text-left text-sm font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="text-right text-sm font-semibold text-muted-foreground">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0 ? (
            orders.map((order) => (
              <TableRow key={order.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell className="py-3 px-4 text-sm">#{order.id}</TableCell>
                {showCustomer && (
                  <TableCell className="py-3 px-4 text-sm">{order.customer_name}</TableCell>
                )}
                <TableCell className="py-3 px-4 text-sm">{order.date}</TableCell>
                <TableCell className="py-3 px-4 text-sm">{formatCurrency(order.total)}</TableCell>
                <TableCell className="py-3 px-4">
                  <StatusBadge 
                    status={
                      order.payment_status === "pending" ? "pending" :
                      order.payment_status === "partial" ? "partial" :
                      order.status === "pending" ? "pending" :
                      order.status === "processing" ? "processing" :
                      order.status === "ready" ? "ready" :
                      order.status === "delivered" ? "delivered" :
                      order.status === "cancelled" ? "cancelled" :
                      "delivered"
                    } 
                  />
                </TableCell>
                <TableCell className="py-3 px-4 text-right">
                  {onView && (
                    <Button variant="ghost" size="icon" onClick={() => onView(order.id)} className="text-blue-600 hover:text-blue-800 mr-2 h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onEdit && isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => onEdit(order.id)} className="text-primary hover:text-primary/80 mr-2 h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onRepeat && !isAdmin && (
                    <Button variant="ghost" size="icon" onClick={() => onRepeat(order.id)} className="text-green-600 hover:text-green-800 mr-2 h-8 w-8">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onPayment && order.payment_status !== "paid" && (
                    <Button variant="ghost" size="icon" onClick={() => onPayment(order.id)} className="text-primary hover:text-primary/80 h-8 w-8">
                      <CreditCard className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showCustomer ? 6 : 5} className="text-center py-8 text-muted-foreground">
                Nenhum pedido encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
