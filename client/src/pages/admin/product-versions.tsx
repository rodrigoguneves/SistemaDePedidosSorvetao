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
  Layers,
  Tag
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

export default function ProductVersionsPage() {
  const { toast } = useToast();
  const [showAddVersionModal, setShowAddVersionModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [selectedSaleUnit, setSelectedSaleUnit] = useState<string>("all");

  // Schema para validação de formulário
  const versionFormSchema = z.object({
    base_product_id: z.coerce.number().min(1, "Produto base é obrigatório"),
    sale_unit_id: z.coerce.number().min(1, "Unidade de venda é obrigatória"),
    price: z.coerce.number().min(1, "Preço deve ser maior que zero"),
    is_active: z.boolean().default(true),
  });

  // Configuração do formulário com react-hook-form
  const versionForm = useForm({
    resolver: zodResolver(versionFormSchema),
    defaultValues: {
      base_product_id: 0,
      sale_unit_id: 0,
      price: 0,
      is_active: true,
    }
  });

  // Consultas para obter dados do servidor
  const { 
    data: productVersions = [], 
    isLoading: versionsLoading 
  } = useQuery({
    queryKey: ['/api/product-versions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/product-versions');
        if (!res.ok) throw new Error('Erro ao carregar versões de produto');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar versões de produto:", error);
        return [];
      }
    }
  });

  const { 
    data: baseProducts = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['/api/base-products'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/base-products');
        if (!res.ok) throw new Error('Erro ao carregar produtos base');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar produtos base:", error);
        return [];
      }
    }
  });

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
  const createVersionMutation = useMutation({
    mutationFn: async (data: typeof versionFormSchema._type) => {
      const res = await fetch('/api/product-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price.toString()) * 100), // Convertendo para centavos
        }),
      });
      if (!res.ok) throw new Error('Erro ao criar versão de produto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
      toast({ title: "Versão de produto criada com sucesso" });
      setShowAddVersionModal(false);
      versionForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar versão de produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateVersionMutation = useMutation({
    mutationFn: async (data: { product_version_id: number } & typeof versionFormSchema._type) => {
      const res = await fetch(`/api/product-versions/${data.product_version_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price.toString()) * 100), // Convertendo para centavos
        }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar versão de produto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
      toast({ title: "Versão de produto atualizada com sucesso" });
      setShowAddVersionModal(false);
      setEditingVersion(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar versão de produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteVersionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/product-versions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir versão de produto');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
      toast({ title: "Versão de produto excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao excluir versão de produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const getProductName = (productId: number) => {
    if (!baseProducts || !productId) return "Produto desconhecido";
    const product = baseProducts.find((p: any) => p.base_product_id === productId);
    return product ? product.base_product_name : "Produto desconhecido";
  };

  const getUnitName = (unitId: number) => {
    if (!saleUnits || !unitId) return "Unidade desconhecida";
    const unit = saleUnits.find((u: any) => u.sale_unit_id === unitId);
    return unit ? unit.unit_name : "Unidade desconhecida";
  };

  // Funções para manipulação dos modais
  const handleAddVersion = () => {
    setEditingVersion(null);
    versionForm.reset({
      base_product_id: 0,
      sale_unit_id: 0,
      price: 0,
      is_active: true,
    });
    setShowAddVersionModal(true);
  };

  const handleEditVersion = (version: any) => {
    setEditingVersion(version);
    versionForm.reset({
      base_product_id: version.base_product_id,
      sale_unit_id: version.sale_unit_id,
      price: version.price / 100, // Convertendo centavos para reais para exibição
      is_active: version.is_active !== false,
    });
    setShowAddVersionModal(true);
  };

  const handleDeleteVersion = (version: any) => {
    const productName = getProductName(version.base_product_id);
    const unitName = getUnitName(version.sale_unit_id);
    
    if (confirm(`Tem certeza que deseja excluir a versão de "${productName}" em "${unitName}"?`)) {
      deleteVersionMutation.mutate(version.product_version_id);
    }
  };

  // Função para submissão do formulário
  const onSubmitVersion = (data: typeof versionFormSchema._type) => {
    // Verifica se já existe uma versão com a mesma combinação de produto e unidade
    const existingVersion = productVersions.find((v: any) => 
      v.base_product_id === parseInt(data.base_product_id.toString()) && 
      v.sale_unit_id === parseInt(data.sale_unit_id.toString()) &&
      (!editingVersion || v.product_version_id !== editingVersion.product_version_id)
    );

    if (existingVersion && !editingVersion) {
      toast({ 
        title: "Combinação já existe", 
        description: "Já existe uma versão deste produto com esta unidade de venda.",
        variant: "destructive" 
      });
      return;
    }

    if (editingVersion) {
      updateVersionMutation.mutate({ product_version_id: editingVersion.product_version_id, ...data });
    } else {
      createVersionMutation.mutate(data);
    }
  };

  // Filtragem de versões de produto
  const filteredVersions = productVersions.filter((version: any) => {
    const productName = getProductName(version.base_product_id).toLowerCase();
    const unitName = getUnitName(version.sale_unit_id).toLowerCase();
    
    const matchesSearch = searchQuery 
      ? productName.includes(searchQuery.toLowerCase()) || unitName.includes(searchQuery.toLowerCase())
      : true;

    const matchesProduct = selectedProduct === "all" 
      ? true 
      : version.base_product_id === parseInt(selectedProduct);

    const matchesUnit = selectedSaleUnit === "all" 
      ? true 
      : version.sale_unit_id === parseInt(selectedSaleUnit);

    return matchesSearch && matchesProduct && matchesUnit;
  });

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

          <Link href="/admin/base-products">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Layers className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Produtos Base</span>
            </div>
          </Link>

          <Link href="/admin/product-versions">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                <Tag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs mt-1 text-pink-500 font-bold">Versões</span>
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
          <div>
            <h1 className="text-2xl font-bold">Versões de Produtos</h1>
            <p className="text-gray-600 text-sm">Gerencie as versões de venda e preços para cada produto base</p>
          </div>

          <Button
            color="failure"
            pill
            onClick={handleAddVersion}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Versão
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg p-6 shadow">
          {/* Filtros de busca */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative w-full sm:w-1/3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <TextInput
                type="search"
                placeholder="Buscar versões de produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-full sm:w-1/3">
              <Select
                id="product-filter"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                <option value="all">Todos os produtos</option>
                {baseProducts.map((product: any) => (
                  <option key={product.base_product_id} value={product.base_product_id}>
                    {product.base_product_name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-full sm:w-1/3">
              <Select
                id="unit-filter"
                value={selectedSaleUnit}
                onChange={(e) => setSelectedSaleUnit(e.target.value)}
              >
                <option value="all">Todas as unidades</option>
                {saleUnits.map((unit: any) => (
                  <option key={unit.sale_unit_id} value={unit.sale_unit_id}>
                    {unit.unit_name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Tabela de versões de produto */}
          <Table>
            <Table.Head>
              <Table.HeadCell>Produto</Table.HeadCell>
              <Table.HeadCell>Unidade de Venda</Table.HeadCell>
              <Table.HeadCell>Preço</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {versionsLoading || productsLoading || unitsLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    Carregando versões de produto...
                  </Table.Cell>
                </Table.Row>
              ) : filteredVersions.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    {searchQuery || selectedProduct !== "all" || selectedSaleUnit !== "all"
                      ? "Nenhuma versão encontrada com esses filtros."
                      : "Nenhuma versão de produto cadastrada."}
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredVersions.map((version: any) => (
                  <Table.Row key={version.product_version_id} className="bg-white hover:bg-gray-50">
                    <Table.Cell className="font-medium">
                      {getProductName(version.base_product_id)}
                    </Table.Cell>
                    <Table.Cell>
                      {getUnitName(version.sale_unit_id)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatCurrency(version.price)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={version.is_active ? "success" : "gray"}
                        className="px-2 py-1"
                      >
                        {version.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Button
                          color="light"
                          size="xs"
                          onClick={() => handleEditVersion(version)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleDeleteVersion(version)}
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

        {/* Grid visual de produtos e suas versões */}
        {!versionsLoading && !productsLoading && !unitsLoading && baseProducts.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6">
            {baseProducts
              .filter((product: any) => 
                selectedProduct === "all" || product.base_product_id === parseInt(selectedProduct)
              )
              .map((product: any) => {
                // Filtra as versões para este produto
                const productVersionsList = productVersions.filter(
                  (v: any) => v.base_product_id === product.base_product_id &&
                  (selectedSaleUnit === "all" || v.sale_unit_id === parseInt(selectedSaleUnit))
                );
                
                if (productVersionsList.length === 0 && selectedSaleUnit !== "all") {
                  return null;
                }
                
                return (
                  <div key={product.base_product_id} className="bg-white rounded-lg p-5 shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{product.base_product_name}</h3>
                        <p className="text-sm text-gray-500">
                          {product.internal_base_code || "Sem código"}
                        </p>
                      </div>
                      <Button
                        color="failure"
                        size="xs"
                        pill
                        onClick={() => {
                          versionForm.setValue("base_product_id", product.base_product_id);
                          handleAddVersion();
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Adicionar Versão
                      </Button>
                    </div>
                    
                    {productVersionsList.length === 0 ? (
                      <div className="bg-gray-50 rounded p-4 text-center text-gray-500">
                        Nenhuma versão de venda disponível para este produto.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {productVersionsList.map((version: any) => (
                          <div
                            key={version.product_version_id}
                            className={`border rounded-md p-3 ${
                              version.is_active
                                ? "border-green-200 bg-green-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-medium">{getUnitName(version.sale_unit_id)}</span>
                                <div className="text-lg font-bold">{formatCurrency(version.price)}</div>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  color="light"
                                  size="xs"
                                  onClick={() => handleEditVersion(version)}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  color="failure"
                                  size="xs"
                                  onClick={() => handleDeleteVersion(version)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </main>

      {/* Modal para adicionar/editar versão de produto */}
      {showAddVersionModal && (
        <Modal
          show={showAddVersionModal}
          onClose={() => setShowAddVersionModal(false)}
          size="lg"
        >
          <Modal.Header>
            <div className="flex items-center">
              <div className="bg-[#E73664]/10 p-3 rounded-full mr-3">
                <Tag className="h-5 w-5 text-[#E73664]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingVersion ? "Editar Versão de Produto" : "Adicionar Nova Versão de Produto"}
                </h3>
                <p className="text-sm text-gray-500">
                  Configure preço e unidade de venda para este produto
                </p>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={versionForm.handleSubmit(onSubmitVersion)} className="space-y-5">
              <div>
                <label htmlFor="base_product_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Produto Base*
                </label>
                <Select
                  id="base_product_id"
                  {...versionForm.register("base_product_id")}
                  disabled={!!editingVersion}
                >
                  <option value="">Selecione um produto</option>
                  {baseProducts.map((product: any) => (
                    <option key={product.base_product_id} value={product.base_product_id}>
                      {product.base_product_name}
                    </option>
                  ))}
                </Select>
                {versionForm.formState.errors.base_product_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {versionForm.formState.errors.base_product_id.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="sale_unit_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Unidade de Venda*
                </label>
                <Select
                  id="sale_unit_id"
                  {...versionForm.register("sale_unit_id")}
                  disabled={!!editingVersion}
                >
                  <option value="">Selecione uma unidade</option>
                  {saleUnits.map((unit: any) => (
                    <option key={unit.sale_unit_id} value={unit.sale_unit_id}>
                      {unit.unit_name}
                    </option>
                  ))}
                </Select>
                {versionForm.formState.errors.sale_unit_id && (
                  <p className="mt-1 text-sm text-red-600">
                    {versionForm.formState.errors.sale_unit_id.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Preço*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <TextInput
                    id="price"
                    type="number"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    className="pl-10"
                    {...versionForm.register("price")}
                  />
                </div>
                {versionForm.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {versionForm.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <Checkbox
                  id="is_active"
                  {...versionForm.register("is_active")}
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                  Versão Ativa
                </label>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              <Button
                color="light"
                onClick={() => setShowAddVersionModal(false)}
              >
                Cancelar
              </Button>
              <Button
                color="failure"
                onClick={versionForm.handleSubmit(onSubmitVersion)}
                isProcessing={createVersionMutation.isPending || updateVersionMutation.isPending}
              >
                {editingVersion ? "Atualizar Versão" : "Adicionar Versão"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}