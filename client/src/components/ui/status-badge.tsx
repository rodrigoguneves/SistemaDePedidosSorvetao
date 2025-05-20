import { cn } from "@/lib/utils";

type StatusType = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled' | 'paid' | 'partial';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      label: "Aguardando"
    },
    processing: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      label: "Em Processamento"
    },
    ready: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Pronto"
    },
    delivered: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Entregue"
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-800",
      label: "Cancelado"
    },
    paid: {
      bg: "bg-green-100",
      text: "text-green-800",
      label: "Pago"
    },
    partial: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      label: "Pagamento Parcial"
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn(
      "px-2 py-1 text-xs rounded-lg inline-block",
      config.bg,
      config.text,
      className
    )}>
      {config.label}
    </span>
  );
}
