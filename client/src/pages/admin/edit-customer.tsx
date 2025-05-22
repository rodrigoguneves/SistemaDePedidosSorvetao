
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

export default function EditCustomerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/edit-customer/:id");
  const customerId = params ? parseInt(params.id) : null;
  
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

  // Fetch customer categories
  const { data: customerCategories = [] } = useQuery({
    queryKey: [`/api/customers/${customerId}/categories`],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/customers/${customerId}/categories`);
      if (!res.ok) throw new Error('Failed to fetch customer categories');
      return res.json();
    },
    enabled: !!customerId
  });

  // Fetch customer category sale units
  const { data: customerSaleUnits = [] } = useQuery({
    queryKey: [`/api/customers/${customerId}/allowed-sale-units`],
    queryFn: async () => {
      if (!customerId) return [];
      const res = await fetch(`/api/customers/${customerId}/allowed-sale-units`);
      if (!res.ok) throw new Error('Failed to fetch customer allowed sale units');
      return res.json();
    },
    enabled: !!customerId
  });

  // Fetch customer data
  const { 
    data: customer,
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    queryFn: async () => {
      if (!customerId) return null;
      const res = await fetch(`/api/customers/${customerId}`);
      if (!res.ok) throw new Error('Erro ao carregar cliente');
      return res.json();
    },
    enabled: !!customerId
  });

  // Formulário para edição de cliente
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema.extend({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(),
      user_id: z.number().optional(),
      street: z.string().min(1, "Rua é obrigatória").optional(),
      number: z.string().min(1, "Número é obrigatório").optional(),
      complement: z.string().optional(),
      neighborhood: z.string().min(1, "Bairro é obrigatório").optional(),
      cnpj: z.string().optional(),
      // Allow either string or number for currency values to handle both formats
      delivery_fee_reais: z.union([
        z.string(),
        z.number().min(0, "Taxa não pode ser negativa")
      ]).optional().default("0"),
      minimum_order_value_reais: z.union([
        z.string(),
        z.number().min(0, "Valor mínimo não pode ser negativo")
      ]).optional().default("0"),
    })),
    defaultValues: {
      company_name: "",
      contact_person: "",
      phone: "",
      cnpj: "",
      email: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      latitude: null,
      longitude: null,
      enable_delivery: false,
      delivery_fee: 0,
      delivery_fee_reais: "0",
      minimum_order_value: 0,
      minimum_order_value_reais: "0",
      allowed_delivery_days: [false, true, true, true, true, true, false],
      password: "",
    }
  });

  // Watch enable_delivery to conditionally show delivery settings
  const enableDelivery = useWatch({
    control: customerForm.control,
    name: "enable_delivery",
  });

  // Initialize selected categories and sale units when data is loaded
  useEffect(() => {
    if (customerCategories && customerCategories.length > 0) {
      console.log("Loading customer categories:", customerCategories);
      const categoryIds = customerCategories.map((cat: any) => cat.id);
      setSelectedCategories(prev => {
        // Only update if there's a change to avoid re-renders
        if (JSON.stringify(prev.sort()) !== JSON.stringify(categoryIds.sort())) {
          return categoryIds;
        }
        return prev;
      });
    }
  }, [customerCategories]);

  // Initialize category sale units when data is loaded
  useEffect(() => {
    if (customerSaleUnits && customerSaleUnits.length > 0) {
      console.log("Loading customer sale units:", customerSaleUnits);
      const unitsByCat: Record<number, number[]> = {};
      
      customerSaleUnits.forEach((item: any) => {
        if (!unitsByCat[item.product_category_id]) {
          unitsByCat[item.product_category_id] = [];
        }
        unitsByCat[item.product_category_id].push(item.sale_unit_id);
      });
      
      setCategoryUnits(prev => {
        // Compare new values with existing to avoid unnecessary updates
        if (JSON.stringify(prev) !== JSON.stringify(unitsByCat)) {
          return unitsByCat;
        }
        return prev;
      });
    }
  }, [customerSaleUnits]);
  
  // Force refresh of categories and sale units when customer ID changes
  useEffect(() => {
    if (customerId) {
      // Manually trigger refetch
      queryClient.invalidateQueries([`/api/customers/${customerId}/categories`]);
      queryClient.invalidateQueries([`/api/customers/${customerId}/allowed-sale-units`]);
    }
  }, [customerId, queryClient]);
  
  // Debug loading state
  useEffect(() => {
    if (customer) {
      console.log("Customer data loaded:", customer);
    }
    if (customerCategories && customerCategories.length > 0) {
      console.log("Customer categories loaded:", customerCategories);
    }
    if (customerSaleUnits && customerSaleUnits.length > 0) {
      console.log("Customer sale units loaded:", customerSaleUnits);
    }
  }, [customer, customerCategories, customerSaleUnits]);

  // Debug loading state
  useEffect(() => {
    if (customer) {
      console.log("Customer data loaded:", customer);
    }
  }, [customer]);

  // Update form with customer data when loaded
  useEffect(() => {
    if (customer) {
      // Extract address components from address field if possible
      let street = "";
      let number = "";
      let neighborhood = "";
      let complement = "";

      try {
        const addressParts = customer.address.split(',');
        if (addressParts.length >= 3) {
          street = addressParts[0].trim();
          number = addressParts[1].trim();
          neighborhood = addressParts[2].trim();
          if (addressParts.length > 3) {
            complement = addressParts.slice(3).join(',').trim();
          }
        }
      } catch (e) {
        console.log("Error parsing address:", e);
      }

      // Fetch user email if not available in customer data
      const fetchUserEmail = async () => {
        if (customer.user_id) {
          try {
            const res = await fetch(`/api/users/${customer.user_id}`);
            if (res.ok) {
              const userData = await res.json();
              console.log("User data loaded:", userData);
              return userData.email || "";
            }
          } catch (error) {
            console.error("Error fetching user email:", error);
          }
        }
        return "";
      };

      // Set form values
      const setFormValues = async () => {
        const email = await fetchUserEmail();
        
        customerForm.reset({
          company_name: customer.company_name,
          contact_person: customer.contact_person || "",
          phone: customer.phone || "",
          address: customer.address,
          city: customer.city || "",
          state: customer.state || "",
          postal_code: customer.postal_code || "",
          street,
          number,
          neighborhood,
          complement,
          cnpj: customer.cnpj || "",
          latitude: customer.latitude,
          longitude: customer.longitude,
          enable_delivery: customer.enable_delivery,
          delivery_fee: customer.delivery_fee,
          delivery_fee_reais: (customer.delivery_fee / 100).toFixed(2),
          minimum_order_value: customer.minimum_order_value,
          minimum_order_value_reais: (customer.minimum_order_value / 100).toFixed(2),
          allowed_delivery_days: customer.allowed_delivery_days,
          email,  // Email field is not editable for existing customers
          password: "",  // Optional for update
          user_id: customer.user_id
        });
      };

      setFormValues();
    }
  }, [customer, customerForm]);

  // Handlers for category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
      
      // Define default sale units based on category
      let defaultUnits: number[] = [];
      
      // Balde 10 Litros, Balde 5 Litros, Copo 180ml, Copo 250ml, Itens Avulsos, Pote 1 Litro e Pote 1.8 Litros
      if ([1, 2, 5, 6, 7, 8, 9].includes(categoryId)) {
        // Find "unidade" sale unit
        const unitId = saleUnits.find((unit: any) => unit.unit_name === "Unidade")?.sale_unit_id;
        if (unitId) defaultUnits = [unitId];
      } 
      // Picolés de Fruta e Picolés de Leite
      else if ([3, 4].includes(categoryId)) {
        defaultUnits = saleUnits
          .filter((unit: any) => ["Caixa Completa 24un", "Meia Caixa 12un", "Unidade"].includes(unit.unit_name))
          .map((unit: any) => unit.sale_unit_id);
      }
      // Sorvete no Palito
      else if (categoryId === 11) {
        defaultUnits = saleUnits
          .filter((unit: any) => ["Caixa Completa 16un", "Meia Caixa 8un", "Unidade"].includes(unit.unit_name))
          .map((unit: any) => unit.sale_unit_id);
      }
      // Other categories get all sale units by default
      else {
        defaultUnits = saleUnits.map((unit: any) => unit.sale_unit_id);
      }
      
      setCategoryUnits(prevUnits => ({
        ...prevUnits,
        [categoryId]: defaultUnits
      }));
    } else {
      // If removing category, also remove its sale units
      setCategoryUnits(prevUnits => {
        const newUnits = { ...prevUnits };
        delete newUnits[categoryId];
        return newUnits;
      });
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // Handler for sale unit selection
  const handleSaleUnitChange = (categoryId: number, unitId: number, checked: boolean) => {
    if (checked) {
      setCategoryUnits(prev => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), unitId]
      }));
    } else {
      setCategoryUnits(prev => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter(id => id !== unitId)
      }));
    }
  };

  // Mutation to update category access
  const updateCategoryAccessMutation = useMutation({
    mutationFn: async ({ categoryId, add }: { categoryId: number, add: boolean }) => {
      const method = add ? 'POST' : 'DELETE';
      const res = await fetch(`/api/customers/${customerId}/categories/${categoryId}`, {
        method
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error updating category access');
      }
      
      return await res.json();
    }
  });

  // Mutation to update sale unit access
  const updateSaleUnitAccessMutation = useMutation({
    mutationFn: async ({ categoryId, unitId, add }: { categoryId: number, unitId: number, add: boolean }) => {
      const method = add ? 'POST' : 'DELETE';
      const res = await fetch(`/api/customers/${customerId}/categories/${categoryId}/sale-units/${unitId}`, {
        method
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error updating sale unit access');
      }
      
      return await res.json();
    }
  });

  // Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          id: customerId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao atualizar cliente');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Cliente atualizado com sucesso",
        description: "Os dados do cliente foram atualizados.",
        variant: "default",
      });
      // Navigate back to customers page
      setLocation("/admin/customers");
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handler for form submission
  const onSubmitCustomer = async (data: any) => {
    try {
      // Handle address combining
      const address = `${data.street}, ${data.number}${data.complement ? `, ${data.complement}` : ''}, ${data.neighborhood}`;
      
      // Convert currency values from BRL to cents
      let delivery_fee_reais = 0;
      let minimum_order_value_reais = 0;
      
      try {
        if (typeof data.delivery_fee_reais === 'string') {
          const normalized = data.delivery_fee_reais.replace(/,/g, '.').trim();
          delivery_fee_reais = normalized === '' ? 0 : parseFloat(normalized);
        } else if (typeof data.delivery_fee_reais === 'number') {
          delivery_fee_reais = data.delivery_fee_reais;
        }
        
        if (typeof data.minimum_order_value_reais === 'string') {
          const normalized = data.minimum_order_value_reais.replace(/,/g, '.').trim();
          minimum_order_value_reais = normalized === '' ? 0 : parseFloat(normalized);
        } else if (typeof data.minimum_order_value_reais === 'number') {
          minimum_order_value_reais = data.minimum_order_value_reais;
        }
      } catch (e) {
        console.error("Error converting currency values:", e);
      }
      
      // Force values to 0 if NaN or negative
      if (isNaN(delivery_fee_reais) || delivery_fee_reais < 0) {
        delivery_fee_reais = 0;
      }
      
      if (isNaN(minimum_order_value_reais) || minimum_order_value_reais < 0) {
        minimum_order_value_reais = 0;
      }
      
      // Prepare submission data
      const submissionData = {
        company_name: data.company_name.trim(),
        contact_person: (data.contact_person || "").trim(),
        phone: (data.phone || "").trim(),
        address,
        city: (data.city || "").trim(),
        state: (data.state || "").trim(),
        postal_code: (data.postal_code || "").trim(),
        cnpj: (data.cnpj || "").trim(),
        // Make sure latitude and longitude are numeric or null
        latitude: data.latitude === "" || data.latitude === null ? null : 
                  typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude,
        longitude: data.longitude === "" || data.longitude === null ? null : 
                   typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude,
        enable_delivery: Boolean(data.enable_delivery),
        // Convert to cents (integer) for storage
        delivery_fee: Math.max(0, Math.round(delivery_fee_reais * 100)),
        minimum_order_value: Math.max(0, Math.round(minimum_order_value_reais * 100)),
        allowed_delivery_days: data.allowed_delivery_days || [false, true, true, true, true, true, false],
        // Only include password if it's not empty
        password: data.password ? data.password : undefined,
      };
      
      console.log("Submission data:", submissionData);
      
      // First update the customer basic info
      await updateCustomerMutation.mutateAsync(submissionData);
      
      // Fetch current customer categories
      const currentCategoriesRes = await fetch(`/api/customers/${customerId}/categories`);
      if (!currentCategoriesRes.ok) throw new Error('Failed to fetch current categories');
      const currentCategories = await currentCategoriesRes.json();
      
      // Add/remove categories
      const currentCategoryIds = currentCategories.map((cat: any) => cat.id);
      const categoriesToAdd = selectedCategories.filter(id => !currentCategoryIds.includes(id));
      const categoriesToRemove = currentCategoryIds.filter(id => !selectedCategories.includes(id));
      
      // Process category additions
      for (const categoryId of categoriesToAdd) {
        await updateCategoryAccessMutation.mutateAsync({ categoryId, add: true });
      }
      
      // Process category removals
      for (const categoryId of categoriesToRemove) {
        await updateCategoryAccessMutation.mutateAsync({ categoryId, add: false });
      }
      
      // Fetch current sale units access
      const currentUnitsRes = await fetch(`/api/customers/${customerId}/allowed-sale-units`);
      if (!currentUnitsRes.ok) throw new Error('Failed to fetch current sale units');
      const currentUnits = await currentUnitsRes.json();
      
      // Group current units by category
      const currentUnitsByCategory: Record<number, number[]> = {};
      currentUnits.forEach((item: any) => {
        if (!currentUnitsByCategory[item.product_category_id]) {
          currentUnitsByCategory[item.product_category_id] = [];
        }
        currentUnitsByCategory[item.product_category_id].push(item.sale_unit_id);
      });
      
      // Update sale units for each category
      for (const categoryId of selectedCategories) {
        const current = currentUnitsByCategory[categoryId] || [];
        const desired = categoryUnits[categoryId] || [];
        
        // Units to add
        for (const unitId of desired) {
          if (!current.includes(unitId)) {
            await updateSaleUnitAccessMutation.mutateAsync({ categoryId, unitId, add: true });
          }
        }
        
        // Units to remove
        for (const unitId of current) {
          if (!desired.includes(unitId)) {
            await updateSaleUnitAccessMutation.mutateAsync({ categoryId, unitId, add: false });
          }
        }
      }
      
      toast({
        title: "Cliente atualizado com sucesso",
        description: "Todas as informações e acessos foram atualizados.",
        variant: "default",
      });
      
      // Navigate back to customers page
      setLocation("/admin/customers");
      
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || "Ocorreu um erro ao atualizar o cliente",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#E73664] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="ml-2">Carregando dados do cliente...</p>
        </div>
      </AdminLayout>
    );
  }

  if (isError || !customerId) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-red-600 mb-4">Erro ao carregar os dados do cliente.</p>
          <button
            className="bg-[#E73664] hover:bg-[#d82c59] text-white font-medium px-4 py-2 rounded-full"
            onClick={() => setLocation("/admin/customers")}
          >
            Voltar para Lista de Clientes
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Editar Cliente</h1>
              <p className="text-gray-600">Atualize os dados do cliente no formulário.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setLocation("/admin/customers")}
              className="rounded-full px-5"
            >
              Voltar
            </Button>
          </div>

          <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)}>
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
                      placeholder="Ex: Sorveteria do João Ltda"
                    />
                    {customerForm.formState.errors.company_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.company_name.message}
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
                      placeholder="00.000.000/0001-00"
                    />
                    {customerForm.formState.errors.cnpj && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.cnpj.message}
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
                      placeholder="Nome do contato principal"
                    />
                    {customerForm.formState.errors.contact_person && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.contact_person.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail (não editável)
                    </label>
                    <input
                      type="email"
                      disabled={true}
                      className="w-full rounded-lg border-gray-300 shadow-sm bg-gray-100 focus:border-[#E73664] focus:ring-[#E73664]"
                      placeholder="contato@empresa.com"
                      value={customer?.email || ""}
                    />
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                      defaultValue="Ativo"
                    >
                      <option>Ativo</option>
                      <option>Inativo</option>
                    </select>
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
                      placeholder="1234"
                    />
                    {customerForm.formState.errors.number && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.number.message}
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

            {/* Informações de Login */}
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <KeyRound className="h-5 w-5 text-[#E73664]" />
                  </div>
                  <h2 className="text-lg font-medium">Informações de Login</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha (deixe em branco para não alterar)
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
                  <h2 className="text-lg font-medium">Acesso a Produtos</h2>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Selecione as categorias de produtos que o cliente pode acessar:</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {productCategories.map((category: any) => (
                      <div key={category.id} className="flex items-center p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 font-medium">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedCategories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Selecione as unidades de venda para cada categoria:</h3>
                    
                    {selectedCategories.map(categoryId => {
                      const category = productCategories.find((c: any) => c.id === categoryId);
                      const autoAssociatedCategories = [
                        "Balde 10 Litros", "Balde 5 Litros", "Copo 180ml", 
                        "Copo 250ml", "Itens Avulsos", "Pote 1 Litro", "Pote 1.8 Litros"
                      ];
                      
                      // Check if this category should be auto-associated with "unidade"
                      const isAutoAssociated = autoAssociatedCategories.includes(category?.name || "");
                      
                      // Find the "unidade" sale unit
                      const unidadeSaleUnit = saleUnits.find((unit:any) => unit.unit_name === "Unidade");
                      
                      // Auto-associate if needed
                      if (isAutoAssociated && unidadeSaleUnit) {
                        // Make sure "unidade" is selected for this category
                        if (!categoryUnits[categoryId] || 
                            !categoryUnits[categoryId].includes(unidadeSaleUnit.sale_unit_id)) {
                          handleSaleUnitChange(categoryId, unidadeSaleUnit.sale_unit_id, true);
                        }
                      }
                      
                      return (
                        <div key={categoryId} className="mb-5 p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <TagsIcon className="h-4 w-4 mr-1 text-[#E73664]" />
                            {category?.name}
                          </h4>
                          
                          {isAutoAssociated && unidadeSaleUnit ? (
                            <div className="ml-2 p-2">
                              <p className="text-sm text-gray-700 italic">
                                Esta categoria é automaticamente associada à unidade de venda "<strong>{unidadeSaleUnit.unit_name}</strong>"
                              </p>
                            </div>
                          ) : (
                            <div className="ml-2 grid grid-cols-2 gap-2">
                              {(() => {
                                // Filtra as unidades de venda com base na categoria
                                const isPicklesCategory = ["Picolés de Fruta", "Picolés de Leite"].includes(category?.name || "");
                                const isIceCreamStickCategory = category?.name === "Sorvete no Palito";
                                
                                let filteredUnits = [...saleUnits];
                                
                                if (isPicklesCategory) {
                                  // Apenas "Caixa Completa 24un", "Meia Caixa 12un" e "Unidade"
                                  filteredUnits = saleUnits.filter((unit:any) => 
                                    ["Caixa Completa 24un", "Meia Caixa 12un", "Unidade"].includes(unit.unit_name)
                                  );
                                  
                                  return (
                                    <div className="w-full">
                                      <p className="text-sm text-gray-700 italic mb-3">
                                        Para Picolés, as seguintes unidades de venda são pré-selecionadas:
                                      </p>
                                      {filteredUnits.map((unit: any) => (
                                        <div key={unit.sale_unit_id} className="flex items-center p-2">
                                          <input
                                            type="checkbox"
                                            id={`unit-${categoryId}-${unit.sale_unit_id}`}
                                            checked={(categoryUnits[categoryId] || []).includes(unit.sale_unit_id)}
                                            onChange={(e) => handleSaleUnitChange(categoryId, unit.sale_unit_id, e.target.checked)}
                                            className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                                          />
                                          <label htmlFor={`unit-${categoryId}-${unit.sale_unit_id}`} className="ml-2">
                                            <span className="text-sm font-medium">{unit.unit_name}</span>
                                            {unit.short_description && (
                                              <span className="text-xs text-gray-500 block">
                                                {unit.short_description}
                                              </span>
                                            )}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } else if (isIceCreamStickCategory) {
                                  // Apenas "Caixa Completa 16un", "Meia Caixa 8un" e "Unidade"
                                  filteredUnits = saleUnits.filter((unit:any) => 
                                    ["Caixa Completa 16un", "Meia Caixa 8un", "Unidade"].includes(unit.unit_name)
                                  );
                                  
                                  return (
                                    <div className="w-full">
                                      <p className="text-sm text-gray-700 italic mb-3">
                                        Para Sorvete no Palito, as seguintes unidades de venda são pré-selecionadas:
                                      </p>
                                      {filteredUnits.map((unit: any) => (
                                        <div key={unit.sale_unit_id} className="flex items-center p-2">
                                          <input
                                            type="checkbox"
                                            id={`unit-${categoryId}-${unit.sale_unit_id}`}
                                            checked={(categoryUnits[categoryId] || []).includes(unit.sale_unit_id)}
                                            onChange={(e) => handleSaleUnitChange(categoryId, unit.sale_unit_id, e.target.checked)}
                                            className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                                          />
                                          <label htmlFor={`unit-${categoryId}-${unit.sale_unit_id}`} className="ml-2">
                                            <span className="text-sm font-medium">{unit.unit_name}</span>
                                            {unit.short_description && (
                                              <span className="text-xs text-gray-500 block">
                                                {unit.short_description}
                                              </span>
                                            )}
                                          </label>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                } else {
                                  // Para outras categorias, mostra todas as unidades
                                  return saleUnits.map((unit: any) => (
                                    <div key={unit.sale_unit_id} className="flex items-center p-2">
                                      <input
                                        type="checkbox"
                                        id={`unit-${categoryId}-${unit.sale_unit_id}`}
                                        checked={(categoryUnits[categoryId] || []).includes(unit.sale_unit_id)}
                                        onChange={(e) => handleSaleUnitChange(categoryId, unit.sale_unit_id, e.target.checked)}
                                        className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                                      />
                                      <label htmlFor={`unit-${categoryId}-${unit.sale_unit_id}`} className="ml-2">
                                        <span className="text-sm font-medium">{unit.unit_name}</span>
                                        {unit.short_description && (
                                          <span className="text-xs text-gray-500 block">
                                            {unit.short_description}
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  ));
                                }
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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

                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enable_delivery"
                      {...customerForm.register("enable_delivery")}
                      className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                    />
                    <label htmlFor="enable_delivery" className="text-sm font-medium text-gray-700">
                      Habilitar entrega para este cliente
                    </label>
                  </div>
                </div>

                {enableDelivery && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taxa de Entrega (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...customerForm.register("delivery_fee_reais")}
                          className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                          placeholder="0.00"
                        />
                      </div>
                      {customerForm.formState.errors.delivery_fee_reais && (
                        <p className="mt-1 text-sm text-red-600">
                          {customerForm.formState.errors.delivery_fee_reais.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pedido Mínimo para Entrega (R$)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...customerForm.register("minimum_order_value_reais")}
                          className="w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                          placeholder="0.00"
                        />
                      </div>
                      {customerForm.formState.errors.minimum_order_value_reais && (
                        <p className="mt-1 text-sm text-red-600">
                          {customerForm.formState.errors.minimum_order_value_reais.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {enableDelivery && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias Permitidos para Entrega
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                        <label key={day} className="flex items-center p-2 border rounded-lg">
                          <input
                            type="checkbox"
                            {...customerForm.register(`allowed_delivery_days.${index}`)}
                            className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                          />
                          <span className="ml-2">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 mt-6">
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
                disabled={updateCustomerMutation.isPending}
              >
                {updateCustomerMutation.isPending ? (
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
      </div>
    </AdminLayout>
  );
}
