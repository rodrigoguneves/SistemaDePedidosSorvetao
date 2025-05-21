import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Search, 
  Plus,
  Grid3X3,
  List
} from "lucide-react";
import { AdminLayout } from "@/layouts/admin-layout";
import { ProductCategory, Product, insertProductSchema, insertProductCategorySchema } from "@shared/schema";

// Importando componentes do Flowbite
import { 
  Button, 
  TextInput, 
  Textarea, 
  Select, 
  Tabs, 
  Table, 
  Modal
} from "flowbite-react";

export default function ProductsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Schemas para validação de formulários
  const productFormSchema = insertProductSchema.extend({
    name: z.string().min(3, "Nome do produto deve ter no mínimo 3 caracteres"),
    unit_of_sale: z.string().min(1, "Unidade de venda é obrigatória"),
    price: z.coerce.number().positive("Preço deve ser maior que zero"),
  });

  const categoryFormSchema = insertProductCategorySchema.extend({
    name: z.string().min(3, "Nome da categoria deve ter no mínimo 3 caracteres"),
  });

  // Configuração dos formulários com react-hook-form
  const productForm = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      category_id: null as number | null,
      sku: "",
      description: "",
      unit_of_sale: "",
      price: 0,
      allow_decimal_quantities: false,
    }
  });

  const categoryForm = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  // Consultas para obter dados do servidor
  const { 
    data: products = [], 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['/api/products'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Erro ao carregar produtos');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
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
  const createProductMutation = useMutation({
    mutationFn: async (data: typeof productFormSchema._type) => {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price.toString()) * 100), // Convertendo para centavos
        }),
      });
      if (!res.ok) throw new Error('Erro ao criar produto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto criado com sucesso" });
      setShowAddProductModal(false);
      productForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: number } & typeof productFormSchema._type) => {
      const res = await fetch(`/api/products/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          price: Math.round(parseFloat(data.price.toString()) * 100), // Convertendo para centavos
        }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar produto');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto atualizado com sucesso" });
      setShowAddProductModal(false);
      setEditingProduct(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir produto');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({ title: "Produto excluído com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao excluir produto", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: typeof categoryFormSchema._type) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao criar categoria');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Categoria criada com sucesso" });
      setShowAddCategoryModal(false);
      categoryForm.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar categoria", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { id: number } & typeof categoryFormSchema._type) => {
      const res = await fetch(`/api/categories/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar categoria');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Categoria atualizada com sucesso" });
      setShowAddCategoryModal(false);
      setEditingCategory(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao atualizar categoria", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao excluir categoria');
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      toast({ title: "Categoria excluída com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao excluir categoria", 
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

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return "Sem categoria";
    const category = categories.find((c: ProductCategory) => c.id === categoryId);
    return category ? category.name : "Categoria desconhecida";
  };

  // Funções para manipulação dos modais
  const handleAddProduct = () => {
    setEditingProduct(null);
    productForm.reset({
      name: "",
      category_id: null,
      sku: "",
      description: "",
      unit_of_sale: "",
      price: 0,
      allow_decimal_quantities: false,
    });
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      ...product,
      price: product.price / 100, // Convertendo centavos para reais para exibição
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.reset({
      name: "",
      description: "",
    });
    setShowAddCategoryModal(true);
  };

  const handleEditCategory = (category: ProductCategory) => {
    setEditingCategory(category);
    categoryForm.reset({
      ...category,
    });
    setShowAddCategoryModal(true);
  };

  const handleDeleteCategory = (category: ProductCategory) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  // Funções para submissão dos formulários
  const onSubmitProduct = (data: typeof productFormSchema._type) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const onSubmitCategory = (data: typeof categoryFormSchema._type) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Filtragem de produtos
  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === "all" 
      ? true 
      : product.category_id === parseInt(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Agrupamento de produtos por categoria para exibição
  const groupedProducts: { [key: string]: Product[] } = {};

  if (filteredProducts.length > 0) {
    filteredProducts.forEach((product: Product) => {
      const categoryName = getCategoryName(product.category_id);
      if (!groupedProducts[categoryName]) {
        groupedProducts[categoryName] = [];
      }
      groupedProducts[categoryName].push(product);
    });
  }

  return (
    
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Cabeçalho da página */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {activeTab === "products" ? "Produtos" : "Categorias"}
          </h1>

          <Button
            color="failure"
            onClick={activeTab === "products" ? handleAddProduct : handleAddCategory}
          >
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "products" ? "Novo Produto" : "Nova Categoria"}
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg p-6 shadow">
          {/* Tabs de navegação entre produtos e categorias */}
          <div className="mb-6">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeTab === "products" 
                    ? "bg-pink-500 text-white" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("products")}
              >
                Produtos
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeTab === "categories" 
                    ? "bg-pink-500 text-white" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                Categorias
              </button>
            </div>
          </div>

          {activeTab === "products" ? (
            <>
              {/* Barra de pesquisa e filtro */}
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-72">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-500" />
                  </div>
                  <TextInput
                    type="search"
                    placeholder="Pesquisar Produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-60"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map((category: ProductCategory) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Exibição de produtos */}
              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-pink-500 rounded-full border-t-transparent"></div>
                </div>
              ) : Object.keys(groupedProducts).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhum produto encontrado.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.keys(groupedProducts).map((categoryName) => (
                    <div key={categoryName} className="mb-6">
                      <div className="bg-blue-100 p-2 rounded-t-lg text-center font-medium">
                        {categoryName}
                      </div>

                      <Table>
                        <Table.Head className="bg-pink-50">
                          <Table.HeadCell className="text-pink-500">Produto</Table.HeadCell>
                          <Table.HeadCell className="text-pink-500">Categoria</Table.HeadCell>
                          <Table.HeadCell className="text-pink-500">Unidade</Table.HeadCell>
                          <Table.HeadCell className="text-pink-500">Preço</Table.HeadCell>
                          <Table.HeadCell className="text-pink-500">Ações</Table.HeadCell>
                        </Table.Head>

                        <Table.Body>
                          {groupedProducts[categoryName].map((product: Product) => (
                            <Table.Row key={product.id}>
                              <Table.Cell>{product.name}</Table.Cell>
                              <Table.Cell>{getCategoryName(product.category_id)}</Table.Cell>
                              <Table.Cell>{product.unit_of_sale}</Table.Cell>
                              <Table.Cell>{formatCurrency(product.price)}</Table.Cell>
                              <Table.Cell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="xs"
                                    color="light"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Pencil className="h-4 w-4 text-pink-500" />
                                  </Button>

                                  <Button
                                    size="xs"
                                    color="light"
                                    onClick={() => handleDeleteProduct(product)}
                                  >
                                    <Trash2 className="h-4 w-4 text-pink-500" />
                                  </Button>
                                </div>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Exibição de categorias */}
              {categoriesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-pink-500 rounded-full border-t-transparent"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Nenhuma categoria encontrada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {categories.map((category: ProductCategory) => (
                    <div 
                      key={category.id} 
                      className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100"
                    >
                      <div className="flex items-center p-4">
                        <div className="bg-pink-100 p-3 rounded-full mr-3">
                          <Package2 className="h-5 w-5 text-pink-500" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {category.description || "Sorvete em massa"}
                          </p>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            color="light"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Pencil className="h-4 w-4 text-pink-500" />
                          </Button>

                          <Button
                            size="xs"
                            color="light"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4 text-pink-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showAddProductModal && (
        <Modal
          show={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          size="lg"
        >
          <Modal.Header>
            <div className="flex items-center">
              <div className="bg-pink-100 p-3 rounded-full mr-3">
                <Plus className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingProduct ? "Editar os detalhes do produto" : "Criar novo Produto"}
                </p>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form id="productForm" onSubmit={productForm.handleSubmit(onSubmitProduct)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">
                    Nome do Produto<span className="text-pink-500">*</span>
                  </label>
                  <TextInput
                    id="name"
                    placeholder="ex: Picolé de Fruta Sabor Abacaxi - Caixa Completa 24un"
                    {...productForm.register("name")}
                  />
                  {productForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="category_id" className="block mb-1 font-medium">
                    Categoria<span className="text-pink-500">*</span>
                  </label>
                  <Select
                    id="category_id"
                    {...productForm.register("category_id", { valueAsNumber: true })}
                  >
                    <option value="">Selecionar Categoria</option>
                    {categories.map((category: ProductCategory) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  {productForm.formState.errors.category_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.category_id.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block mb-1 font-medium">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Descrição opcional do produto..."
                    rows={3}
                    {...productForm.register("description")}
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block mb-1 font-medium">
                    Preço<span className="text-pink-500">*</span>
                  </label>
                  <TextInput
                    id="price"
                    placeholder="R$ 0,00"
                    {...productForm.register("price")}
                  />
                  {productForm.formState.errors.price && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.price.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="unit_of_sale" className="block mb-1 font-medium">
                    Unidade de Venda<span className="text-pink-500">*</span>
                  </label>
                  <TextInput
                    id="unit_of_sale"
                    placeholder="ex: Caixa de 24un, caixa de 12un, kg, Unidade"
                    {...productForm.register("unit_of_sale")}
                  />
                  {productForm.formState.errors.unit_of_sale && (
                    <p className="text-red-500 text-sm mt-1">
                      {productForm.formState.errors.unit_of_sale.message as string}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              <Button
                color="gray"
                onClick={() => setShowAddProductModal(false)}
              >
                Cancelar
              </Button>

              <Button
                color="failure"
                type="submit"
                form="productForm"
                isProcessing={createProductMutation.isPending || updateProductMutation.isPending}
              >
                {editingProduct ? "Atualizar Produto" : "Criar Produto"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}

      {showAddCategoryModal && (
        <Modal
          show={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          size="lg"
        >
          <Modal.Header>
            <div className="flex items-center">
              <div className="bg-pink-100 p-3 rounded-full mr-3">
                <Plus className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {editingCategory ? "Editar Categoria" : "Adicionar Nova Categoria"}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingCategory ? "Atualizar detalhes da categoria" : "Criar Nova Categoria de Produto"}
                </p>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body>
            <form id="categoryForm" onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block mb-1 font-medium">
                    Nome da Categoria<span className="text-pink-500">*</span>
                  </label>
                  <TextInput
                    id="name"
                    placeholder="ex: Picolés Premium, Embalagens"
                    {...categoryForm.register("name")}
                  />
                  {categoryForm.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {categoryForm.formState.errors.name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block mb-1 font-medium">
                    Descrição
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Descrição opcional da categoria..."
                    rows={3}
                    {...categoryForm.register("description")}
                  />
                </div>
              </div>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <div className="flex justify-end gap-2 w-full">
              <Button
                color="gray"
                onClick={() => setShowAddCategoryModal(false)}
              >
                Cancelar
              </Button>

              <Button
                color="failure"
                type="submit"
                form="categoryForm"
                isProcessing={createCategoryMutation.isPending || updateCategoryMutation.isPending}
              >
                {editingCategory ? "Atualizar Categoria" : "Criar Categoria"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
    </AdminLayout>
  );
}