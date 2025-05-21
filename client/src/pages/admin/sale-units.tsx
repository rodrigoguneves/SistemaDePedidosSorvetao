import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Package2,
  Users,
  FileStack,
  DollarSign,
  Settings,
  LayoutGrid,
  Search,
  Pencil,
  Trash2,
  Plus,
  Tags,
  RulerSquare
} from "lucide-react";

// Importando componentes do Flowbite
import { 
  Button, 
  TextInput, 
  Textarea, 
  Select, 
  Table, 
  Modal,
  Checkbox,
  Badge
} from "flowbite-react";

export default function SaleUnitsPage() {
  const { toast } = useToast();
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Schema para validação de formulário
  const saleUnitFormSchema = z.object({
    unit_name: z.string().min(2, "Nome da unidade deve ter no mínimo 2 caracteres"),
    short_description: z.string().optional(),
    base_equivalent_quantity: z.coerce.number().min(1, "Quantidade equivalente deve ser maior que zero"),
    applicable_product_type_tags: z.array(z.string()).min(1, "Selecione pelo menos um tipo de produto aplicável"),
  });

  // Configuração do formulário com react-hook-form
  const unitForm = useForm({
    resolver: zodResolver(saleUnitFormSchema),
    defaultValues: {
      unit_name: "",
      short_description: "",
      base_equivalent_quantity: 1,
      applicable_product_type_tags: ["ALL"],
    }
  });

  // Tags de tipo de produto disponíveis
  const availableProductTypeTags = [
    { id: "ALL", name: "Todos os tipos", color: "blue" },
    { id: "POPSICLE_FRUIT_MILK", name: "Picolés", color: "purple" },
    { id: "STICK_ICE_CREAM", name: "Sorvetes em palito", color: "pink" },
    { id: "PREMIUM_ICE_CREAM", name: "Sorvetes Premium", color: "indigo" },
    { id: "BULK_ICE_CREAM", name: "Sorvetes a granel", color: "green" },
  ];

  // Consulta para obter unidades de venda do servidor
  const { 
    data: saleUnits = [], 
    isLoading: unitsLoading 
  } = useQuery({
    queryKey: ['/api/sale-units'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/sale-units');
        if (!res.ok) throw new Error('Erro ao carregar unidades de venda');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar unidades de venda:", error);
        return [];
      }
    }
  });

  // Mutations para operações CRUD
  const createSaleUnitMutation = useMutation({
    mutationFn: async (data: typeof saleUnitFormSchema._type) => {
      const res = await fetch('/api/sale-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao criar unidade de venda');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sale-units'] });
      toast({ title: "Unidade de venda criada com sucesso" });
      setShowAddUnitModal(false);
      unitForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar unidade de venda", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateSaleUnitMutation = useMutation({
    mutationFn: async (data: { sale_unit_id: number } & typeof saleUnitFormSchema._type) => {
      const res = await fetch(`/api/sale-units/${data.sale_unit_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar unidade de venda');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sale-units'] });
      toast({ title: "Unidade de venda atualizada com sucesso" });
      setShowAddUnitModal(false);
      setEditingUnit(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar unidade de venda", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteSaleUnitMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/sale-units/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir unidade de venda');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sale-units'] });
      toast({ title: "Unidade de venda excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao excluir unidade de venda", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Funções para manipulação do modal
  const handleAddUnit = () => {
    setEditingUnit(null);
    unitForm.reset({
      unit_name: "",
      short_description: "",
      base_equivalent_quantity: 1,
      applicable_product_type_tags: ["ALL"],
    });
    setShowAddUnitModal(true);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit(unit);
    unitForm.reset({
      unit_name: unit.unit_name,
      short_description: unit.short_description || "",
      base_equivalent_quantity: unit.base_equivalent_quantity || 1,
      applicable_product_type_tags: unit.applicable_product_type_tags || ["ALL"],
    });
    setShowAddUnitModal(true);
  };

  const handleDeleteUnit = (unit: any) => {
    if (confirm(`Tem certeza que deseja excluir a unidade de venda "${unit.unit_name}"?`)) {
      deleteSaleUnitMutation.mutate(unit.sale_unit_id);
    }
  };

  // Função para submissão do formulário
  const onSubmitUnit = (data: typeof saleUnitFormSchema._type) => {
    if (editingUnit) {
      updateSaleUnitMutation.mutate({ sale_unit_id: editingUnit.sale_unit_id, ...data });
    } else {
      createSaleUnitMutation.mutate(data);
    }
  };

  // Filtragem de unidades de venda
  const filteredUnits = saleUnits.filter((unit: any) => {
    return searchQuery 
      ? unit.unit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (unit.short_description && unit.short_description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
  });

  // Função para obter cor da badge baseada no ID do tipo
  const getTagColor = (tagId: string) => {
    const tag = availableProductTypeTags.find(t => t.id === tagId);
    return tag ? tag.color : "gray";
  };

  // Função para obter nome da tag baseada no ID
  const getTagName = (tagId: string) => {
    const tag = availableProductTypeTags.find(t => t.id === tagId);
    return tag ? tag.name : tagId;
  };

  // Gerenciamento de tipos de produto selecionados
  const [selectedTags, setSelectedTags] = useState<string[]>(["ALL"]);
  
  const handleTagToggle = (tagId: string) => {
    let newSelectedTags = [...selectedTags];
    
    // Se "ALL" está sendo selecionado
    if (tagId === "ALL") {
      if (!newSelectedTags.includes("ALL")) {
        newSelectedTags = ["ALL"];
      }
    } else {
      // Se uma tag específica está sendo selecionada
      if (newSelectedTags.includes("ALL")) {
        // Remove "ALL" se outra tag estiver sendo adicionada
        newSelectedTags = newSelectedTags.filter(t => t !== "ALL");
      }
      
      if (newSelectedTags.includes(tagId)) {
        // Remove a tag se já estiver selecionada
        newSelectedTags = newSelectedTags.filter(t => t !== tagId);
        // Se todas as tags forem removidas, seleciona "ALL"
        if (newSelectedTags.length === 0) {
          newSelectedTags = ["ALL"];
        }
      } else {
        // Adiciona a tag
        newSelectedTags.push(tagId);
      }
    }
    
    setSelectedTags(newSelectedTags);
    unitForm.setValue("applicable_product_type_tags", newSelectedTags);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header com logo e navegação */}
      <header className="bg-white p-4 flex justify-between items-center shadow-sm">
        <Link href="/">
          <div className="cursor-pointer">
            <img src="/assets/logo.png" alt="Sorvetão" className="h-10" />
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <Link href="/admin">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <LayoutGrid className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Painel</span>
            </div>
          </Link>

          <Link href="/admin/products">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Package2 className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Produtos</span>
            </div>
          </Link>

          <Link href="/admin/sale-units">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                <RulerSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs mt-1 text-pink-500 font-bold">Unidades</span>
            </div>
          </Link>

          <Link href="/admin/customers">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Clientes</span>
            </div>
          </Link>

          <Link href="/admin/orders">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <FileStack className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Pedidos</span>
            </div>
          </Link>

          <Link href="/admin/financial">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Financeiro</span>
            </div>
          </Link>

          <Link href="/admin/settings">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Opções</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">João Administrador</span>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Usuário" className="w-8 h-8 rounded-full" />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Cabeçalho da página */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Unidades de Venda</h1>

          <Button
            color="failure"
            pill
            onClick={handleAddUnit}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Unidade
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg p-6 shadow">
          {/* Filtro de busca */}
          <div className="mb-6 flex">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <TextInput
                type="search"
                placeholder="Buscar unidades de venda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de unidades de venda */}
          <Table>
            <Table.Head>
              <Table.HeadCell>Unidade</Table.HeadCell>
              <Table.HeadCell>Descrição</Table.HeadCell>
              <Table.HeadCell>Quantidade Equivalente</Table.HeadCell>
              <Table.HeadCell>Tipos de Produto Aplicáveis</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {unitsLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    Carregando unidades de venda...
                  </Table.Cell>
                </Table.Row>
              ) : filteredUnits.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    {searchQuery 
                      ? "Nenhuma unidade encontrada com esses termos de busca." 
                      : "Nenhuma unidade de venda cadastrada."}
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredUnits.map((unit: any) => (
                  <Table.Row key={unit.sale_unit_id} className="bg-white hover:bg-gray-50">
                    <Table.Cell className="font-medium">
                      {unit.unit_name}
                    </Table.Cell>
                    <Table.Cell>
                      {unit.short_description || "-"}
                    </Table.Cell>
                    <Table.Cell>
                      {unit.base_equivalent_quantity || 1}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-wrap gap-1">
                        {(unit.applicable_product_type_tags || ["ALL"]).map((tag: string) => (
                          <Badge key={tag} color={getTagColor(tag)} className="mr-1">
                            {getTagName(tag)}
                          </Badge>
                        ))}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Button
                          color="light"
                          size="xs"
                          onClick={() => handleEditUnit(unit)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleDeleteUnit(unit)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>
      </main>

      {/* Modal para adicionar/editar unidade de venda */}
      {showAddUnitModal && (
        <Modal
          show={showAddUnitModal}
          onClose={() => setShowAddUnitModal(false)}
          size="lg"
        >
          <Modal.Header>
            <div className="flex items-center">
              <div className="bg-[#E73664]/10 p-3 rounded-full mr-3">
                <RulerSquare className="h-5 w-5 text-[#E73664]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingUnit ? "Editar Unidade de Venda" : "Adicionar Nova Unidade de Venda"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingUnit ? "Atualize as informações da unidade de venda" : "Preencha as informações da nova unidade de venda"}
                </p>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={unitForm.handleSubmit(onSubmitUnit)} className="space-y-5">
              <div>
                <label htmlFor="unit_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Unidade*
                </label>
                <TextInput
                  id="unit_name"
                  placeholder="Ex: Caixa 24 unidades"
                  {...unitForm.register("unit_name")}
                />
                {unitForm.formState.errors.unit_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {unitForm.formState.errors.unit_name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Curta
                </label>
                <Textarea
                  id="short_description"
                  placeholder="Breve descrição sobre esta unidade de venda"
                  rows={3}
                  {...unitForm.register("short_description")}
                />
              </div>

              <div>
                <label htmlFor="base_equivalent_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade Equivalente*
                </label>
                <TextInput
                  id="base_equivalent_quantity"
                  type="number"
                  placeholder="1"
                  {...unitForm.register("base_equivalent_quantity")}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Informe a quantidade equivalente em unidades base (ex: Uma caixa com 24 unidades = 24)
                </p>
                {unitForm.formState.errors.base_equivalent_quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {unitForm.formState.errors.base_equivalent_quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipos de Produto Aplicáveis*
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableProductTypeTags.map((tag) => (
                    <div
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`
                        cursor-pointer px-3 py-2 rounded-md text-sm font-medium
                        ${selectedTags.includes(tag.id) 
                          ? `bg-${tag.color}-100 text-${tag.color}-700 border border-${tag.color}-300` 
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}
                      `}
                    >
                      {tag.name}
                    </div>
                  ))}
                </div>
                {unitForm.formState.errors.applicable_product_type_tags && (
                  <p className="mt-1 text-sm text-red-600">
                    {unitForm.formState.errors.applicable_product_type_tags.message}
                  </p>
                )}
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              <Button
                color="light"
                onClick={() => setShowAddUnitModal(false)}
              >
                Cancelar
              </Button>
              <Button
                color="failure"
                onClick={unitForm.handleSubmit(onSubmitUnit)}
                isProcessing={createSaleUnitMutation.isPending || updateSaleUnitMutation.isPending}
              >
                {editingUnit ? "Atualizar Unidade" : "Adicionar Unidade"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}