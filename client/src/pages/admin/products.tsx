import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash, Tag, AlertCircle } from "lucide-react";
import { Product, ProductCategory } from "@shared/schema";

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const filteredProducts = products
    ? products.filter((product: Product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    try {
      // Soft delete by default
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error("Failed to delete product");
      
      setIsDeleteDialogOpen(false);
      // Refresh products data
      // queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return "Sem categoria";
    const category = categories.find((cat: ProductCategory) => cat.id === categoryId);
    return category ? category.name : "Categoria desconhecida";
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Gerenciamento de Produtos"
        description="Gerencie o catálogo de produtos e categorias."
        actions={
          <Button className="rounded-xl flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Produto</span>
          </Button>
        }
      />

      <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-10 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-left">SKU</TableHead>
                      <TableHead className="text-left">Categoria</TableHead>
                      <TableHead className="text-left">Unidade</TableHead>
                      <TableHead className="text-left">Preço</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando produtos...
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product: Product) => (
                        <TableRow key={product.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{getCategoryName(product.category_id)}</TableCell>
                          <TableCell>{product.unit_of_sale}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-800 h-8 w-8"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "Nenhum produto corresponde à sua busca" : "Nenhum produto cadastrado"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar categorias..."
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Button className="rounded-xl flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Nova Categoria</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-left">Descrição</TableHead>
                      <TableHead className="text-left">Produtos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Carregando categorias...
                        </TableCell>
                      </TableRow>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category: ProductCategory) => (
                        <TableRow key={category.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium flex items-center gap-2">
                            <Tag className="h-4 w-4 text-primary" />
                            {category.name}
                          </TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>
                            {products
                              ? products.filter((p: Product) => p.category_id === category.id).length
                              : 0}{" "}
                            produtos
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800 h-8 w-8">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Nenhuma categoria cadastrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Você está prestes a excluir o produto <span className="font-semibold">{selectedProduct?.name}</span>. 
              Esta ação irá marcar o produto como excluído, mas os dados serão preservados no sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteProduct}
            >
              Excluir Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
