
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Users, TagsIcon, CheckCircle, User, Building, Phone, MapPin, KeyRound, Truck } from "lucide-react";
import { Customer, insertCustomerSchema } from "@shared/schema";
import { AdminLayout } from "@/layouts/admin-layout";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddCustomerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // State for product categories and sale units
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categoryUnits, setCategoryUnits] = useState<Record<number, number[]>>({});

  // Fetch product categories
  const { data: productCategories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    }
  });

  // Fetch sale units
  const { data: saleUnits = [] } = useQuery({
    queryKey: ['/api/sale-units'],
    queryFn: async () => {
      const res = await fetch('/api/sale-units');
      if (!res.ok) throw new Error('Failed to fetch sale units');
      return res.json();
    }
  });

  // Form setup with Zod validation
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      company_name: "",
      contact_person: "",
      email: "",
      password: "",
      phone: "",
      cnpj: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      postal_code: "",
      enable_delivery: false,
      delivery_fee: 0,
      minimum_order_value: 0,
      allowed_delivery_days: [false, false, false, false, false, false, false]
    }
  });

  // Watch enable_delivery to conditionally show delivery settings
  const enableDelivery = useWatch({
    control: customerForm.control,
    name: "enable_delivery",
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating customer with category settings:", {
        customerData: data,
        selectedCategories,
        categoryUnits
      });

      // First, create the customer
      const customerRes = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!customerRes.ok) {
        const errorData = await customerRes.json();
        throw new Error(errorData.message || 'Error creating customer');
      }

      const customer = await customerRes.json();

      // Now save the category permissions for this customer
      for (const categoryId of selectedCategories) {
        const allowedUnits = categoryUnits[categoryId] || [];
        
        if (allowedUnits.length > 0) {
          const permissionRes = await fetch(`/api/customers/${customer.id}/categories/${categoryId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          if (!permissionRes.ok) {
            console.error(`Failed to set category ${categoryId} for customer`);
          }

          // Add each allowed sale unit for this category
          for (const unitId of allowedUnits) {
            const unitRes = await fetch(`/api/customers/${customer.id}/categories/${categoryId}/sale-units/${unitId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });

            if (!unitRes.ok) {
              console.error(`Failed to set permission for category ${categoryId}, unit ${unitId}`);
            }
          }
        }
      }

      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Cliente criado com sucesso",
        description: "O novo cliente foi adicionado ao sistema.",
        variant: "default",
      });
      customerForm.reset();
      setLocation("/admin/customers");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = customerForm.handleSubmit((data) => {
    createCustomerMutation.mutate(data);
  });

  // Handle category selection toggle
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // If category is being deselected, remove its units too
        const newCategoryUnits = { ...categoryUnits };
        delete newCategoryUnits[categoryId];
        setCategoryUnits(newCategoryUnits);
        
        return prev.filter(id => id !== categoryId);
      } else {
        // Category selected - add default units based on category type
        const category = productCategories.find((c: any) => c.id === categoryId);
        
        // Single unit categories (only have "Unidade")
        const singleUnitCategories = ["Balde 10 Litros", "Pote 1 Litro", "Balde 5 Litros", 
                                    "Copo 250ml", "Copo 180ml", "Itens Avulsos", 
                                    "Pote 1.8 Litros"];
        const picolesFrutaLeiteCategories = ["Picolés de Fruta", "Picolés de Leite"];
        const picolesEspeciaisPremiumCategories = ["Picolés Especiais", "Picolés Premium"];
        const sorveteNoPalitoCategories = ["Sorvete no Palito"];
        
        if (category) {
          let unitIdsToAdd: number[] = [];
          
          if (singleUnitCategories.includes(category.name)) {
            // Find the "Unidade" sale unit
            const unitSaleUnit = saleUnits.find((unit: any) => unit.unit_name === "Unidade");
            if (unitSaleUnit) {
              unitIdsToAdd = [unitSaleUnit.sale_unit_id];
            }
          } 
          else if (picolesFrutaLeiteCategories.includes(category.name)) {
            // For "Picolés de Fruta" and "Picolés de Leite"
            unitIdsToAdd = saleUnits
              .filter((unit: any) => ["Unidade", "Caixa com 24 unidades", "Caixa com 12 unidades"].includes(unit.unit_name))
              .map((unit: any) => unit.sale_unit_id);
          }
          else if (picolesEspeciaisPremiumCategories.includes(category.name)) {
            // For "Picolés Especiais" and "Picolés Premium"
            unitIdsToAdd = saleUnits
              .filter((unit: any) => ["Unidade", "Caixa completa"].includes(unit.unit_name))
              .map((unit: any) => unit.sale_unit_id);
          }
          else if (sorveteNoPalitoCategories.includes(category.name)) {
            // For "Sorvete no Palito"
            unitIdsToAdd = saleUnits
              .filter((unit: any) => ["Unidade", "Caixa com 16 unidades", "Caixa com 8 unidades"].includes(unit.unit_name))
              .map((unit: any) => unit.sale_unit_id);
          }
          
          // Set the default unit IDs for this category
          if (unitIdsToAdd.length > 0) {
            setCategoryUnits(prevUnits => ({
              ...prevUnits,
              [categoryId]: unitIdsToAdd
            }));
          }
        }
        
        return [...prev, categoryId];
      }
    });
  };

  // Handle unit selection for a category
  const handleUnitSelection = (categoryId: number, unitId: number) => {
    console.log("Toggling unit selection:", { categoryId, unitId });
    setCategoryUnits(prev => {
      const currentUnits = prev[categoryId] || [];
      if (currentUnits.includes(unitId)) {
        return {
          ...prev,
          [categoryId]: currentUnits.filter(id => id !== unitId)
        };
      } else {
        return {
          ...prev,
          [categoryId]: [...currentUnits, unitId]
        };
      }
    });
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Adicionar Novo Cliente</h1>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Dados do Cliente</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa*
                  </label>
                  <input
                    {...customerForm.register("company_name")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Nome Empresarial"
                  />
                  {customerForm.formState.errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.company_name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CNPJ
                  </label>
                  <input
                    {...customerForm.register("cnpj")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="XX.XXX.XXX/0001-XX"
                  />
                  {customerForm.formState.errors.cnpj && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.cnpj.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Responsável
                  </label>
                  <input
                    {...customerForm.register("contact_person")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Nome do Responsável"
                  />
                  {customerForm.formState.errors.contact_person && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.contact_person.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    {...customerForm.register("email")}
                    type="email"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="cliente@empresa.com"
                  />
                  {customerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.email.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    {...customerForm.register("phone")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="(11) 99999-9999"
                  />
                  {customerForm.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.phone.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    {...customerForm.register("password")}
                    type="password"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                  />
                  {customerForm.formState.errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.password.message as string}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Endereço</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rua
                  </label>
                  <input
                    {...customerForm.register("street")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Av. Principal"
                  />
                  {customerForm.formState.errors.street && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.street.message as string}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    {...customerForm.register("number")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="123"
                  />
                  {customerForm.formState.errors.number && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.number.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Complemento
                  </label>
                  <input
                    {...customerForm.register("complement")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Sala, bloco, etc."
                  />
                  {customerForm.formState.errors.complement && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.complement.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro
                  </label>
                  <input
                    {...customerForm.register("neighborhood")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Centro"
                  />
                  {customerForm.formState.errors.neighborhood && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.neighborhood.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    {...customerForm.register("city")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="São Paulo"
                  />
                  {customerForm.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.city.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <input
                    {...customerForm.register("state")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="SP"
                  />
                  {customerForm.formState.errors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.state.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    {...customerForm.register("postal_code")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="00000-000"
                  />
                  {customerForm.formState.errors.postal_code && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.postal_code.message as string}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Entrega */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <Truck className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Configurações de Entrega</h2>
              </div>

              <div className="space-y-4">
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...customerForm.register("enable_delivery")}
                      className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                    />
                    <span className="text-sm font-medium text-gray-700">Habilitar entrega para este cliente</span>
                  </label>
                </div>

                {enableDelivery && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Taxa de Entrega (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            {...customerForm.register("delivery_fee", { 
                              valueAsNumber: true,
                              setValueAs: (v) => parseFloat((parseFloat(v) * 100).toFixed(0)) // Store in cents
                            })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664] pl-10"
                            placeholder="0,00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pedido Mínimo para Entrega (R$)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            R$
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            {...customerForm.register("minimum_order_value", { 
                              valueAsNumber: true,
                              setValueAs: (v) => parseFloat((parseFloat(v) * 100).toFixed(0)) // Store in cents
                            })}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664] pl-10"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dias Permitidos para Entrega
                      </label>
                      <div className="flex space-x-2">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                          <label key={day} className="flex items-center justify-center border p-2 rounded-md">
                            <input
                              type="checkbox"
                              {...customerForm.register(`allowed_delivery_days.${index}`)}
                              className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664] mr-1"
                            />
                            <span className="text-sm text-gray-700">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acesso a Produtos */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <TagsIcon className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Definir Acesso a Produtos para o Cliente</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selecione as categorias de produtos e unidades de venda específicas que o cliente poderá acessar:
                </p>

                <div className="space-y-3">
                  {productCategories.map((category: any) => {
                    // Determine category type based on name for proper sale unit display
                    const singleUnitCategories = ["Balde 10 Litros", "Pote 1 Litro", "Balde 5 Litros", "Copo 250ml", 
                        "Copo 180ml", "Itens Avulsos", "Pote 1.8 Litros"];
                    const picolesFrutaLeiteCategories = ["Picolés de Fruta", "Picolés de Leite"];
                    const picolesEspeciaisPremiumCategories = ["Picolés Especiais", "Picolés Premium"];
                    const sorveteNoPalitoCategories = ["Sorvete no Palito"];
                    
                    const categoryHasMultipleSaleUnits = !singleUnitCategories.includes(category.name);
                    
                    // Filter relevant sale units for this category
                    let relevantSaleUnits = [];
                    
                    if (picolesFrutaLeiteCategories.includes(category.name)) {
                        // Picolés de Fruta e Picolés de Leite: unidade, caixa com 24 unidades e caixa com 12 unidades
                        relevantSaleUnits = saleUnits.filter((unit: any) => 
                            ["Unidade", "Caixa com 24 unidades", "Caixa com 12 unidades"].includes(unit.unit_name)
                        );
                    } else if (picolesEspeciaisPremiumCategories.includes(category.name)) {
                        // Picolés Especiais e Picolés Premium: unidade e caixa completa
                        relevantSaleUnits = saleUnits.filter((unit: any) => 
                            ["Unidade", "Caixa completa"].includes(unit.unit_name)
                        );
                    } else if (sorveteNoPalitoCategories.includes(category.name)) {
                        // Sorvete no Palito: unidade, caixa com 16 unidades e caixa com 8 unidades
                        relevantSaleUnits = saleUnits.filter((unit: any) => 
                            ["Unidade", "Caixa com 16 unidades", "Caixa com 8 unidades"].includes(unit.unit_name)
                        );
                    } else if (categoryHasMultipleSaleUnits) {
                        // Para outras categorias com múltiplas unidades, filtramos apenas a unidade relevante
                        relevantSaleUnits = saleUnits.filter((unit: any) => unit.unit_name === "Unidade");
                    }
                    
                    // Para categorias com apenas uma unidade de venda (unidade), encontramos a unidade "Unidade"
                    const unitSaleUnit = saleUnits.find(unit => 
                      (unit.unit_name === "Unidade"));
                    
                    return (
                      <div key={category.id} className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(category.id)}
                              onChange={() => handleCategoryToggle(category.id)}
                              className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                            />
                            <span className="font-medium">{category.name}</span>
                          </label>
                        </div>
                        
                        {/* For categories with multiple sale units and the category is selected */}
                        {selectedCategories.includes(category.id) && categoryHasMultipleSaleUnits && (
                          <div className="mt-3 pl-6 pt-2 border-t">
                            <div className="space-y-1">
                              {relevantSaleUnits.map((unit: any) => (
                                <label key={unit.id || unit.sale_unit_id} className="flex items-center space-x-2 py-1">
                                  <input
                                    type="checkbox"
                                    checked={(categoryUnits[category.id] || []).includes(unit.id || unit.sale_unit_id)}
                                    onChange={() => handleUnitSelection(category.id, unit.id || unit.sale_unit_id)}
                                    className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                                  />
                                  <span className="text-sm">{unit.unit_name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* For categories with only "unit" as the sale unit and category is selected */}
                        {selectedCategories.includes(category.id) && !categoryHasMultipleSaleUnits && unitSaleUnit && (
                          <div className="mt-1 pl-6">
                            <p className="text-xs text-gray-500 italic mt-1">
                              Este cliente poderá comprar produtos desta categoria por unidade.
                            </p>
                            {/* Add the unit sale unit automatically */}
                            {!categoryUnits[category.id]?.includes(unitSaleUnit.id) && (
                              <span className="hidden">
                                {handleUnitSelection(category.id, unitSaleUnit.id)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setLocation("/admin/customers")}
              className="rounded-full px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#E73664] hover:bg-[#d82c59] rounded-full px-5"
              disabled={createCustomerMutation.isPending}
            >
              {createCustomerMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
