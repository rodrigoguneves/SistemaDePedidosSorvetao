import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CustomerLayout } from "@/layouts/customer-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Minus, ShoppingCart, Calendar as CalendarIcon, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CustomerNewOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [orderNotes, setOrderNotes] = useState("");
  
  // Cart state
  const [cart, setCart] = useState<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    category: string;
  }[]>([]);

  // Fetch product categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/product-categories"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        { id: 1, name: "Tradicionais" },
        { id: 2, name: "Especiais" },
        { id: 3, name: "Premium" },
        { id: 4, name: "Linha Zero" },
      ];
    },
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For now, returning mock data
      return [
        {
          id: 1,
          name: "Sorvete de Chocolate",
          price: 180.00,
          category_id: 1,
          category: "Tradicionais",
          description: "Sorvete cremoso de chocolate belga",
          image: "/images/products/chocolate.jpg",
        },
        {
          id: 2,
          name: "Sorvete de Morango",
          price: 180.00,
          category_id: 1,
          category: "Tradicionais",
          description: "Sorvete de morango com pedaços da fruta",
          image: "/images/products/strawberry.jpg",
        },
        {
          id: 3,
          name: "Sorvete de Baunilha",
          price: 170.00,
          category_id: 1,
          category: "Tradicionais",
          description: "Clássico sorvete de baunilha cremoso",
          image: "/images/products/vanilla.jpg",
        },
        {
          id: 4,
          name: "Sorvete de Pistache",
          price: 220.00,
          category_id: 3,
          category: "Premium",
          description: "Sorvete premium com pistache importado",
          image: "/images/products/pistachio.jpg",
        },
        {
          id: 5,
          name: "Sorvete de Cookies",
          price: 200.00,
          category_id: 2,
          category: "Especiais",
          description: "Sorvete de baunilha com pedaços de cookies",
          image: "/images/products/cookies.jpg",
        },
        {
          id: 6,
          name: "Sorvete de Frutas Vermelhas Zero",
          price: 210.00,
          category_id: 4,
          category: "Linha Zero",
          description: "Sorvete zero açúcar com mix de frutas vermelhas",
          image: "/images/products/berries.jpg",
        },
      ];
    },
  });

  // Filter products based on search and active tab
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || product.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  // Add to cart
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Update quantity
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove from cart
  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Calculate total
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Place order
  const placeOrder = () => {
    // In a real app, this would send a request to the API
    console.log({
      items: cart,
      date: selectedDate,
      deliveryType,
      notes: orderNotes,
      total: cartTotal,
    });
    // After successful order, redirect to order confirmation page
    // For now, just alert
    alert("Pedido realizado com sucesso!");
    // Clear cart
    setCart([]);
  };

  return (
    <CustomerLayout>
      <PageHeader
        title="Novo Pedido"
        description="Selecione os produtos e quantidades para fazer um novo pedido."
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-10" 
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="hidden md:block">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      {categories?.map((category) => (
                        <TabsTrigger key={category.id} value={category.name}>
                          {category.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="md:hidden mb-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">Todos</TabsTrigger>
                    {categories?.map((category) => (
                      <TabsTrigger key={category.id} value={category.name} className="flex-1">
                        {category.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {isLoadingProducts ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <p>Carregando produtos...</p>
                </div>
              ) : filteredProducts && filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:border-primary transition-colors"
                    >
                      <div className="h-32 mb-2 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {/* Placeholder for product image */}
                        <div className="w-full h-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/10"></div>
                      </div>
                      <h4 className="font-medium line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-3">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-sm">
                          {formatCurrency(product.price)} <span className="text-xs text-muted-foreground">/ kg</span>
                        </p>
                        <Button 
                          size="sm" 
                          className="rounded-xl"
                          onClick={() => addToCart(product)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          <span>Adicionar</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center min-h-[300px]">
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/3">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Seu Pedido</h3>
                <div className="p-2 bg-primary/10 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>

              {cart.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-2">Seu carrinho está vazio</p>
                  <p className="text-xs text-muted-foreground">
                    Adicione produtos para realizar um pedido
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} / kg</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-600 hover:text-red-800" 
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">{formatCurrency(cartTotal)}</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Data de Entrega</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            format(selectedDate, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label>Tipo de Entrega</Label>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Retirada na Fábrica</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Entrega (sujeito a taxa)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-1">
                    <Label>Observações</Label>
                    <Textarea 
                      placeholder="Instruções especiais para seu pedido" 
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                disabled={cart.length === 0} 
                onClick={placeOrder}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Finalizar Pedido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}