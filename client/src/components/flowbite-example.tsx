
import React from 'react';
import { Button, Card } from 'flowbite-react';

export function FlowbiteExample() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Exemplo do Flowbite</h1>
      <Card className="max-w-sm">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Flowbite instalado com sucesso!
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          Você pode usar todos os componentes do Flowbite em seu projeto agora.
        </p>
        <Button>
          Botão do Flowbite
        </Button>
      </Card>
    </div>
  );
}
