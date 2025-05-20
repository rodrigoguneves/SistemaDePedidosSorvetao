import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Função para atualizar o estado com base no tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Definir o valor inicial
    checkMobile();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener("resize", checkMobile);

    // Cleanup do listener quando o componente é desmontado
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}