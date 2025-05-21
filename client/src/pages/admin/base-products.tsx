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
  Badge,
  Tabs
} from "flowbite-react";

export default function BaseProductsPage() {
  const { toast } = useToast();
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Schema para validação de formulário
  const baseProductFormSchema = z.object({
    base_product_name: z.string().min(3, "Nome do produto deve ter no mínimo 3 caracteres"),
    product_category_id: z.coerce.number().optional().nullable(),
    long_description: z.string().optional(),
    is_active: z.boolean().default(true),
    allows_decimal_quantity: z.boolean().default(false),
  });

  // Configuração do formulário com react-hook-form
  const productForm = useForm({
    resolver: zodResolver(baseProductFormSchema),
    defaultValues: {
      base_product_name: "",
      product_category_id: null,
      long_description: "",
      is_active: true,
      allows_decimal_quantity: false,
    }
  });

  // Consultas para obter dados do servidor
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
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Erro ao carregar categorias');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
      }
    }
  });

  // Mutations para operações CRUD
  const createBaseProductMutation = useMutation({
    mutationFn: async (data: typeof baseProductFormSchema._type) => {
      const res = await fetch('/api/base-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao criar produto base');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      toast({ title: "Produto base criado com sucesso" });
      setShowAddProductModal(false);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar produto base", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateBaseProductMutation = useMutation({
    mutationFn: async (data: { base_product_id: number } & typeof baseProductFormSchema._type) => {
      const res = await fetch(`/api/base-products/${data.base_product_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar produto base');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      toast({ title: "Produto base atualizado com sucesso" });
      setShowAddProductModal(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar produto base", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteBaseProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/base-products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir produto base');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      toast({ title: "Produto base excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao excluir produto base", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Funções auxiliares
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return "Sem categoria";
    const category = categories.find((c: any) => c.id === categoryId);
    return category ? category.name : "Categoria desconhecida";
  };

  // Funções para manipulação dos modais
  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      base_product_name: "",
      product_category_id: null,
      long_description: "",
      is_active: true,
      allows_decimal_quantity: false,
    });
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      base_product_name: product.base_product_name,
      product_category_id: product.product_category_id,
      long_description: product.long_description || "",
      is_active: product.is_active !== false,
      allows_decimal_quantity: product.allows_decimal_quantity === true,
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (product: any) => {
    if (confirm(`Tem certeza que deseja excluir o produto base "${product.base_product_name}"?`)) {
      deleteBaseProductMutation.mutate(product.base_product_id);
    }
  };

  // Função para submissão do formulário
  const onSubmitProduct = (data: typeof baseProductFormSchema._type) => {
    if (editingProduct) {
      updateBaseProductMutation.mutate({ base_product_id: editingProduct.base_product_id, ...data });
    } else {
      createBaseProductMutation.mutate(data);
    }
  };

  // Filtragem de produtos base
  const filteredProducts = baseProducts.filter((product: any) => {
    const matchesSearch = searchQuery 
      ? product.base_product_name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === "all" 
      ? true 
      : product.product_category_id === parseInt(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Agrupamento de produtos por categoria para exibição
  const groupedProducts: { [key: string]: any[] } = {};

  if (filteredProducts.length > 0) {
    filteredProducts.forEach((product: any) => {
      const categoryName = getCategoryName(product.product_category_id);
      if (!groupedProducts[categoryName]) {
        groupedProducts[categoryName] = [];
      }
      groupedProducts[categoryName].push(product);
    });
  }

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
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs mt-1 text-pink-500 font-bold">Produtos Base</span>
            </div>
          </Link>

          <Link href="/admin/sale-units">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <RulerSquare className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xs mt-1">Unidades</span>
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
          <h1 className="text-2xl font-bold">Produtos Base</h1>

          <Button
            color="failure"
            pill
            onClick={handleAddProduct}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto Base
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg p-6 shadow">
          {/* Filtros de busca e categoria */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="relative w-full sm:w-1/2 lg:w-1/3">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <TextInput
                type="search"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-full sm:w-1/3 lg:w-1/4">
              <Select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Tabela de produtos base */}
          <Table>
            <Table.Head>
              <Table.HeadCell>Nome do Produto</Table.HeadCell>
              <Table.HeadCell>Categoria</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Ações</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {productsLoading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    Carregando produtos base...
                  </Table.Cell>
                </Table.Row>
              ) : filteredProducts.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-10">
                    {searchQuery || selectedCategory !== "all"
                      ? "Nenhum produto encontrado com esses filtros."
                      : "Nenhum produto base cadastrado."}
                  </Table.Cell>
                </Table.Row>
              ) : (
                filteredProducts.map((product: any) => (
                  <Table.Row key={product.base_product_id} className="bg-white hover:bg-gray-50">
                    <Table.Cell className="font-medium">
                      {product.base_product_name}
                    </Table.Cell>
                    <Table.Cell>
                      {getCategoryName(product.product_category_id)}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        color={product.is_active ? "success" : "gray"}
                        className="px-2 py-1"
                      >
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center space-x-2">
                        <Button
                          color="light"
                          size="xs"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          color="failure"
                          size="xs"
                          onClick={() => handleDeleteProduct(product)}
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

        {/* Exibição agrupada por categoria */}
        {!searchQuery && selectedCategory === "all" && Object.keys(groupedProducts).length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-4">Produtos por categoria</h2>
            <Tabs>
              {Object.keys(groupedProducts).map((categoryName) => (
                <Tabs.Item key={categoryName} title={categoryName}>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {groupedProducts[categoryName].map((product: any) => (
                      <div 
                        key={product.base_product_id} 
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-bold">{product.base_product_name}</h3>
                        <div className="mt-3 flex justify-between items-center">
                          <Badge
                            color={product.is_active ? "success" : "gray"}
                            className="px-2 py-1"
                          >
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Button
                              color="light"
                              size="xs"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              color="failure"
                              size="xs"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs.Item>
              ))}
            </Tabs>
          </div>
        )}
      </main>

      {/* Modal para adicionar/editar produto base */}
      {showAddProductModal && (
        <Modal
          show={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          size="lg"
        >
          <Modal.Header>
            <div className="flex items-center">
              <div className="bg-[#E73664]/10 p-3 rounded-full mr-3">
                <Layers className="h-5 w-5 text-[#E73664]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingProduct ? "Editar Produto Base" : "Adicionar Novo Produto Base"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingProduct 
                    ? "Atualize as informações do produto base" 
                    : "Preencha as informações para criar um produto base"}
                </p>
              </div>
            </div>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-5">
              <div>
                <label htmlFor="base_product_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto*
                </label>
                <TextInput
                  id="base_product_name"
                  placeholder="Ex: Sorvete de Morango"
                  {...productForm.register("base_product_name")}
                />
                {productForm.formState.errors.base_product_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {productForm.formState.errors.base_product_name.message}
                  </p>
                )}
              </div>

              

              <div>
                <label htmlFor="product_category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <Select
                  id="product_category_id"
                  {...productForm.register("product_category_id")}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="long_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Detalhada
                </label>
                <Textarea
                  id="long_description"
                  placeholder="Descreva o produto em detalhes..."
                  rows={3}
                  {...productForm.register("long_description")}
                />
              </div>

              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="flex items-center">
                  <Checkbox
                    id="is_active"
                    {...productForm.register("is_active")}
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                    Produto Ativo
                  </label>
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="allows_decimal_quantity"
                    {...productForm.register("allows_decimal_quantity")}
                  />
                  <label htmlFor="allows_decimal_quantity" className="ml-2 text-sm font-medium text-gray-700">
                    Permite Quantidade Decimal
                  </label>
                </div>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              <Button
                color="light"
                onClick={() => setShowAddProductModal(false)}
              >
                Cancelar
              </Button>
              <Button
                color="failure"
                onClick={productForm.handleSubmit(onSubmitProduct)}
                isProcessing={createBaseProductMutation.isPending || updateBaseProductMutation.isPending}
              >
                {editingProduct ? "Atualizar Produto" : "Adicionar Produto"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}