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
  Plus
} from "lucide-react";
import { 
  ProductCategory, 
  Product, 
  insertProductSchema, 
  insertProductCategorySchema, 
  insertBaseProductSchema,
  insertProductSaleVersionSchema,
  BaseProduct,
  ProductSaleVersion,
  SaleUnit
} from "@shared/schema";
import { AdminLayout } from "@/layouts/admin-layout";

// Product data structure for UI display
interface ProductWithUnit {
  baseProductId: number;
  productVersionId: number;
  name: string;
  category_id: number;
  description: string;
  unit_name: string;
  saleUnitId: number;
  price: number;
  allows_decimal_quantity: boolean;
}

export default function ProdutosPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithUnit | null>(null);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [saveAndContinue, setSaveAndContinue] = useState(false);

  // Updated schema for the new product form
  const productFormSchema = z.object({
    name: z.string().min(3, "Nome do produto deve ter no mínimo 3 caracteres"),
    category_id: z.number().nullable().refine(val => val !== null, {
      message: "Categoria é obrigatória"
    }),
    description: z.string().optional(),
    sale_unit_id: z.number({
      required_error: "Unidade de venda é obrigatória",
      invalid_type_error: "Selecione uma unidade de venda válida"
    }),
    price: z.coerce.number().positive("Preço deve ser maior que zero"),
    allows_decimal_quantity: z.boolean().default(false),
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
      description: "",
      sale_unit_id: 0,
      price: 0,
      allows_decimal_quantity: false,
    },
    mode: "onChange" // Validação em tempo real
  });

  const categoryForm = useForm({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  // Consultas para obter dados do servidor
  // Fetch base products and product versions
  const { 
    data: baseProducts = [], 
    isLoading: baseProductsLoading 
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
    data: productVersions = [], 
    isLoading: productVersionsLoading 
  } = useQuery({
    queryKey: ['/api/product-versions'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/product-versions');
        if (!res.ok) throw new Error('Erro ao carregar versões de produtos');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar versões de produtos:", error);
        return [];
      }
    }
  });

  // Fetch sale units
  const { 
    data: saleUnits = [], 
    isLoading: saleUnitsLoading 
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

  // Backward compatibility - still fetch products from old endpoint for transition
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

  // Create a merged list of products with their sale units
  const mergedProducts: ProductWithUnit[] = [];

  if (baseProducts.length > 0 && productVersions.length > 0 && saleUnits.length > 0) {
    baseProducts.forEach((baseProduct: BaseProduct) => {
      // Find all versions for this base product
      const versions = productVersions.filter(
        (version: ProductSaleVersion) => version.base_product_id === baseProduct.base_product_id
      );

      versions.forEach((version: ProductSaleVersion) => {
        const saleUnit = saleUnits.find(
          (unit: SaleUnit) => unit.sale_unit_id === version.sale_unit_id
        );

        if (saleUnit) {
          mergedProducts.push({
            baseProductId: baseProduct.base_product_id,
            productVersionId: version.product_version_id,
            name: baseProduct.base_product_name,
            category_id: baseProduct.product_category_id || 0,
            description: baseProduct.long_description || "",
            unit_name: saleUnit.unit_name,
            saleUnitId: saleUnit.sale_unit_id,
            price: version.price,
            allows_decimal_quantity: baseProduct.allows_decimal_quantity || false
          });
        }
      });
    });
  }

  // Mutations para operações CRUD
  const createProductMutation = useMutation({
    mutationFn: async ({ data, saveAndContinue }: { data: typeof productFormSchema._type, saveAndContinue: boolean }) => {
      console.log("Enviando dados para API:", data);

      if (!data.category_id) {
        throw new Error('Categoria é obrigatória');
      }

      // Step 1: Create base product
      const baseProductData = {
        product_category_id: data.category_id,
        base_product_name: data.name,
        long_description: data.description,
        is_active: true,
        allows_decimal_quantity: data.allows_decimal_quantity
      };

      const baseProductRes = await fetch('/api/base-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseProductData),
      });

      if (!baseProductRes.ok) {
        const errorData = await baseProductRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar produto base');
      }

      const baseProduct = await baseProductRes.json();

      // Step 2: Create product version with sale unit
      const productVersionData = {
        base_product_id: baseProduct.base_product_id,
        sale_unit_id: data.sale_unit_id,
        price: Math.round(parseFloat(data.price.toString()) * 100), // Convert to cents
        is_active: true
      };

      const productVersionRes = await fetch('/api/product-versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productVersionData),
      });

      if (!productVersionRes.ok) {
        const errorData = await productVersionRes.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao criar versão do produto');
      }

      const productVersion = await productVersionRes.json();

      return { 
        baseProduct, 
        productVersion, 
        saveAndContinue 
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
      toast({ title: "Produto criado com sucesso" });

      if (!data.saveAndContinue) {
        setShowAddProductModal(false);
        productForm.reset();
      } else {
        // Se "Salvar e continuar" estiver marcado, apenas limpe o nome do produto
        const currentValues = productForm.getValues();
        productForm.reset({
          ...currentValues,
          name: ""
        });
      }
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
    mutationFn: async (data: { baseProductId: number, productVersionId: number } & typeof productFormSchema._type) => {
      // Step 1: Update base product
      const baseProductData = {
        product_category_id: data.category_id,
        base_product_name: data.name,
        long_description: data.description,
        allows_decimal_quantity: data.allows_decimal_quantity
      };

      const baseProductRes = await fetch(`/api/base-products/${data.baseProductId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baseProductData),
      });

      if (!baseProductRes.ok) {
        throw new Error('Erro ao atualizar produto base');
      }

      // Step 2: Update product version
      const productVersionData = {
        sale_unit_id: data.sale_unit_id,
        price: Math.round(parseFloat(data.price.toString()) * 100), // Convert to cents
      };

      const productVersionRes = await fetch(`/api/product-versions/${data.productVersionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productVersionData),
      });

      if (!productVersionRes.ok) {
        throw new Error('Erro ao atualizar versão do produto');
      }

      return {
        baseProduct: await baseProductRes.json(),
        productVersion: await productVersionRes.json()
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
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
    mutationFn: async ({ baseProductId, productVersionId }: { baseProductId: number, productVersionId: number }) => {
      // First delete the product version
      const versionRes = await fetch(`/api/product-versions/${productVersionId}`, {
        method: 'DELETE',
      });

      if (!versionRes.ok) throw new Error('Erro ao excluir versão do produto');

      // Then delete the base product
      const baseRes = await fetch(`/api/base-products/${baseProductId}`, {
        method: 'DELETE',
      });

      if (!baseRes.ok) throw new Error('Erro ao excluir produto base');

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/base-products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/product-versions'] });
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
      description: "",
      sale_unit_id: 0,
      price: 0,
      allows_decimal_quantity: false,
    });
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: ProductWithUnit) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      category_id: product.category_id,
      description: product.description || "",
      sale_unit_id: product.saleUnitId,
      price: product.price / 100, // Convertendo centavos para reais para exibição
      allows_decimal_quantity: product.allows_decimal_quantity,
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = (product: ProductWithUnit) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      deleteProductMutation.mutate({
        baseProductId: product.baseProductId,
        productVersionId: product.productVersionId
      });
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
  const onSubmitProduct = (data: z.infer<typeof productFormSchema>) => {
    if (editingProduct) {
      // Make sure our IDs are numbers
      const baseProductId = typeof editingProduct.baseProductId === 'string' 
        ? parseInt(editingProduct.baseProductId) 
        : editingProduct.baseProductId;

      const productVersionId = typeof editingProduct.productVersionId === 'string' 
        ? parseInt(editingProduct.productVersionId) 
        : editingProduct.productVersionId;

      updateProductMutation.mutate({
        ...data,
        baseProductId,
        productVersionId,
      });
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
  const filteredProducts = mergedProducts.filter((product: ProductWithUnit) => {
    const matchesSearch = searchQuery 
      ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = selectedCategory === "all" 
      ? true 
      : product.category_id === parseInt(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  // Agrupamento de produtos por categoria para exibição
  const groupedProducts: { [key: string]: ProductWithUnit[] } = {};

  if (filteredProducts.length > 0) {
    filteredProducts.forEach((product: ProductWithUnit) => {
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
        {/* Cabeçalho da página */}

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Cabeçalho da página */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {activeTab === "products" ? "Produtos" : "Categorias"}
            </h1>

            <button
              className="bg-[#E73664] hover:bg-[#d82c59] text-white font-medium px-4 py-2 rounded-full flex items-center"
              onClick={activeTab === "products" ? handleAddProduct : handleAddCategory}
            >
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "products" ? "Novo Produto" : "Nova Categoria"}
            </button>
          </div>

          {/* Conteúdo principal */}
          <div className="bg-white rounded-lg p-6 shadow">
            {/* Tabs de navegação entre produtos e categorias */}
            <div className="mb-6">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === "products" 
                      ? "bg-[#E73664] text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  Produtos
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    activeTab === "categories" 
                      ? "bg-[#E73664] text-white" 
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
                    <input
                      type="search"
                      placeholder="Pesquisar Produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-60 p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="all">Todas as Categorias</option>
                    {categories.map((category: ProductCategory) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exibição de produtos */}
                {baseProductsLoading || productVersionsLoading || saleUnitsLoading ? (
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

                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead className="bg-pink-50 text-pink-500">
                              <tr>
                                <th className="p-3">Produto</th>
                                <th className="p-3">Categoria</th>
                                <th className="p-3">Unidade</th>
                                <th className="p-3">Preço</th>
                                <th className="p-3">Ações</th>
                              </tr>
                            </thead>

                            <tbody>
                              {groupedProducts[categoryName].map((product: ProductWithUnit) => (
                                <tr key={`${product.baseProductId}-${product.productVersionId}`} className="border-b">
                                  <td className="p-3">{product.name}</td>
                                  <td className="p-3">{getCategoryName(product.category_id)}</td>
                                  <td className="p-3">{product.unit_name}</td>
                                  <td className="p-3">{formatCurrency(product.price)}</td>
                                  <td className="p-3">
                                    <div className="flex space-x-2">
                                      <button
                                        className="p-1 text-pink-500 hover:bg-pink-50 rounded-full"
                                        onClick={() => handleEditProduct(product)}
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>

                                      <button
                                        className="p-1 text-pink-500 hover:bg-pink-50 rounded-full"
                                        onClick={() => handleDeleteProduct(product)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
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
                            <button
                              className="p-1 text-pink-500 hover:bg-pink-50 rounded-full"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              className="p-1 text-pink-500 hover:bg-pink-50 rounded-full"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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

        {/* Modal de adicionar/editar produto */}
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
              <div className="flex items-center border-b p-4">
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

              <div className="p-4">
                <form id="productForm" onSubmit={productForm.handleSubmit(onSubmitProduct)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block mb-1 font-medium">
                        Nome do Produto<span className="text-[#E73664]">*</span>
                      </label>
                      <input
                        id="name"
                        placeholder="ex: Picolé de Fruta Sabor Abacaxi - Caixa Completa 24un"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E73664] focus:border-[#E73664]"
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
                        Categoria<span className="text-[#E73664]">*</span>
                      </label>
                      <select
                        id="category_id"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        {...productForm.register("category_id", { valueAsNumber: true })}
                      >
                        <option value="">Selecionar Categoria</option>
                        {categories.map((category: ProductCategory) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                      <textarea
                        id="description"
                        placeholder="Descrição opcional do produto..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        {...productForm.register("description")}
                      />
                    </div>

                    <div>
                      <label htmlFor="price" className="block mb-1 font-medium">
                        Preço<span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="price"
                        placeholder="R$ 0,00"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        {...productForm.register("price")}
                      />
                      {productForm.formState.errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {productForm.formState.errors.price.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="sale_unit_id" className="block mb-1 font-medium">
                        Unidade de Venda<span className="text-[#E73664]">*</span>
                      </label>
<select
                        id="sale_unit_id"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#E73664] focus:border-[#E73664]"
                        {...productForm.register("sale_unit_id", { valueAsNumber: true })}
                      >
                        <option value="">Selecionar Unidade de Venda</option>
                        {saleUnits.map((unit: SaleUnit) => (
                          <option key={unit.sale_unit_id} value={unit.sale_unit_id}>
                            {unit.unit_name} {unit.short_description ? `(${unit.short_description})` : ''}
                          </option>
                        ))}
                      </select>
                      {productForm.formState.errors.sale_unit_id && (
                        <p className="text-red-500 text-sm mt-1">
                          {productForm.formState.errors.sale_unit_id.message as string}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allows_decimal_quantity"
                        className="w-4 h-4 text-[#E73664] border-gray-300 rounded focus:ring-[#E73664]"
                        {...productForm.register("allows_decimal_quantity")}
                      />
                      <label htmlFor="allows_decimal_quantity" className="text-sm font-medium">
                        Permitir quantidades decimais
                      </label>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex justify-between items-center p-4 border-t">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveAndContinue"
                    className="w-4 h-4 text-[#E73664] border-gray-300 rounded focus:ring-[#E73664]"
                    checked={saveAndContinue}
                    onChange={(e) => setSaveAndContinue(e.target.checked)}
                  />
                  <label htmlFor="saveAndContinue" className="ml-2 text-sm font-medium">
                    Salvar e continuar
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    onClick={() => setShowAddProductModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    className="px-4 py-2 text-white bg-[#E73664] hover:bg-[#d82c59] rounded-lg flex items-center"
                    onClick={productForm.handleSubmit(onSubmitProduct)}
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  >
                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>{editingProduct ? "Atualizar Produto" : "Criar Produto"}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de adicionar/editar categoria */}
        {showAddCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
              <div className="flex items-center border-b p-4">
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

              <div className="p-4">
                <form id="categoryForm" onSubmit={categoryForm.handleSubmit(onSubmitCategory)}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block mb-1 font-medium">
                        Nome da Categoria<span className="text-pink-500">*</span>
                      </label>
                      <input
                        id="name"
                        placeholder="ex: Picolés Premium, Embalagens"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
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
                      <textarea
                        id="description"
                        placeholder="Descrição opcional da categoria..."
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        {...categoryForm.register("description")}
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t">
                <button
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  onClick={() => setShowAddCategoryModal(false)}
                >
                  Cancelar
                </button>

                <button
                  className="px-4 py-2 text-white bg-pink-500 hover:bg-pink-600 rounded-lg flex items-center"
                  onClick={categoryForm.handleSubmit(onSubmitCategory)}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                >
                  {createCategoryMutation.isPending || updateCategoryMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>{editingCategory ? "Atualizar Categoria" : "Criar Categoria"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}