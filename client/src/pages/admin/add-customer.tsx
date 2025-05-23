
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
          const permissionRes = await fetch('/api/customer-category-permissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customer_id: customer.id,
              category_id: categoryId,
              allowed_sale_unit_ids: allowedUnits
            }),
          });

          if (!permissionRes.ok) {
            console.error(`Failed to set permissions for category ${categoryId}`);
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
        return [...prev, categoryId];
      }
    });
  };

  // Handle unit selection for a category
  const handleUnitSelection = (categoryId: number, unitId: number) => {
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
          {/* Informações do Cliente */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Informações Básicas</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    {...customerForm.register("company_name")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Nome Empresarial"
                  />
                  {customerForm.formState.errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.company_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Contato
                  </label>
                  <input
                    {...customerForm.register("contact_person")}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="Nome do Responsável"
                  />
                  {customerForm.formState.errors.contact_person && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.contact_person.message}
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
                      {customerForm.formState.errors.cnpj.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...customerForm.register("email")}
                    type="email"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="cliente@empresa.com"
                  />
                  {customerForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.email.message}
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
                      {customerForm.formState.errors.password.message}
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
                      {customerForm.formState.errors.phone.message}
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
                      {customerForm.formState.errors.street.message}
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
                      {customerForm.formState.errors.number.message}
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
                      {customerForm.formState.errors.neighborhood.message}
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
                    placeholder="Sala 101"
                  />
                  {customerForm.formState.errors.complement && (
                    <p className="mt-1 text-sm text-red-600">
                      {customerForm.formState.errors.complement.message}
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
                      {customerForm.formState.errors.city.message}
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
                      {customerForm.formState.errors.state.message}
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
                      {customerForm.formState.errors.postal_code.message}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      {...customerForm.register("enable_delivery")}
                      className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                    />
                    <span className="text-sm font-medium text-gray-700">Habilitar Entregas</span>
                  </label>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...customerForm.register("delivery_fee", { valueAsNumber: true })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="10.00"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mínimo do Pedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...customerForm.register("minimum_order_value", { valueAsNumber: true })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    placeholder="50.00"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dias Disponíveis para Entrega
                  </label>
                  <div className="flex space-x-2">
                    {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, index) => (
                      <label key={day} className="flex flex-col items-center">
                        <span className="text-xs text-gray-500 mb-1">{day.substring(0, 3)}</span>
                        <input
                          type="checkbox"
                          {...customerForm.register(`allowed_delivery_days.${index}`)}
                          className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categorias e Unidades de Venda */}
          <Card className="mb-4 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pink-100 p-2 rounded-full">
                  <TagsIcon className="h-5 w-5 text-[#E73664]" />
                </div>
                <h2 className="text-lg font-medium">Acesso ao Catálogo</h2>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecione as categorias e unidades de venda que este cliente poderá ver e comprar.
                </p>

                {productCategories.map((category: any) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
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

                    {selectedCategories.includes(category.id) && (
                      <div className="mt-3 pl-6 border-t pt-3">
                        <p className="text-sm text-gray-600 mb-2">Unidades de venda permitidas:</p>
                        <div className="flex flex-wrap gap-2">
                          {saleUnits.map((unit: any) => (
                            <label key={unit.id} className="flex items-center space-x-1 bg-gray-100 rounded-full px-3 py-1">
                              <input
                                type="checkbox"
                                checked={(categoryUnits[category.id] || []).includes(unit.id)}
                                onChange={() => handleUnitSelection(category.id, unit.id)}
                                className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664] h-4 w-4"
                              />
                              <span className="text-sm">{unit.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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
