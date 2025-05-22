import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BotaoCriarClienteProps {
  isPending: boolean;
}

// Componente dedicado para o botão "Criar Cliente"
// Este componente garante que o botão funcione corretamente
export function BotaoCriarCliente({ isPending }: BotaoCriarClienteProps) {
  return (
    <Button 
      type="submit" 
      className="bg-[#E73664] hover:bg-[#d82c59] rounded-full px-5"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Processando...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Criar Cliente
        </>
      )}
    </Button>
  );
}