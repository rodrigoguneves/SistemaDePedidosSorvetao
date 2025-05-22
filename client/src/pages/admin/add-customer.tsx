
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { AdminLayout } from "@/layouts/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Building, MapPin, KeyRound, Truck, Package, Tag, TagsIcon, ShoppingBag } from "lucide-react";
import { insertCustomerSchema } from "@shared/schema";

type Category = {
  id: number;
  name: string;
  description?: string;
};

type SaleUnit = {
  sale_unit_id: number;
  unit_name: string;
  short_description?: string;
};

export default function AddCustomerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categorySaleUnits, setCategorySaleUnits] = useState<Record<number, number[]>>({});

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Erro ao carregar categorias');
      return res.json();
    }
  });

  // Fetch sale units
  const { data: saleUnits = [] } = useQuery({
    queryKey: ['/api/sale-units'],
    queryFn: async () => {
      const res = await fetch('/api/sale-units');
      if (!res.ok) throw new Error('Erro ao carregar unidades de venda');
      return res.json();
    }
  });

  // Formulário para cadastro de cliente
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema.extend({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      street: z.string().min(1, "Rua é obrigatória"),
      number: z.string().min(1, "Número é obrigatório"),
      complement: z.string().optional(),
      neighborhood: z.string().min(1, "Bairro é obrigatório"),
      cnpj: z.string().optional(),
      confirm_password: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
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
      email: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      cnpj: "",
      latitude: null,
      longitude: null,
      enable_delivery: false,
      delivery_fee: 0,
      minimum_order_value: 0,
      delivery_fee_reais: "0",
      minimum_order_value_reais: "0",
      allowed_delivery_days: [false, true, true, true, true, true, false],
      password: "",
      confirm_password: "",
    },
    mode: "onSubmit" // Use onSubmit validation mode to avoid premature validation
  });

  // Watch enable_delivery to conditionally show delivery settings
  const enableDelivery = useWatch({
    control: customerForm.control,
    name: "enable_delivery",
  });

  // Handle category selection
  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId]);
      // Initialize empty sale units array for this category
      setCategorySaleUnits(prev => ({
        ...prev,
        [categoryId]: []
      }));
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
      // Remove this category from sale units mapping
      setCategorySaleUnits(prev => {
        const newState = { ...prev };
        delete newState[categoryId];
        return newState;
      });
    }
  };

  // Handle sale unit selection for a category
  const handleSaleUnitChange = (categoryId: number, unitId: number, checked: boolean) => {
    if (checked) {
      setCategorySaleUnits(prev => ({
        ...prev,
        [categoryId]: [...(prev[categoryId] || []), unitId]
      }));
    } else {
      setCategorySaleUnits(prev => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter(id => id !== unitId)
      }));
    }
  };

  // Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        console.log("=== INÍCIO DO PROCESSO DE CRIAÇÃO DE CLIENTE ===");
        console.log("Dados para envio:", JSON.stringify(data, null, 2));

        // Step 1: Create the customer with simplified data
        console.log("Iniciando requisição POST para /api/customers");
        
        // Verificando autenticação para evitar erros de autorização
        try {
          const authCheck = await fetch('/api/user');
          const authData = await authCheck.json();
          console.log("Status de autenticação:", authCheck.ok, "Usuário:", authData);
        } catch (authError) {
          console.log("Erro ao verificar autenticação, continuando mesmo assim:", authError);
        }
        
        // Usando XMLHttpRequest para detecção mais precisa de erros
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.open('POST', '/api/customers', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.withCredentials = true;
          
          xhr.onload = function() {
            console.log("XHR resposta recebida:", xhr.status, xhr.statusText);
            console.log("Corpo da resposta:", xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const customer = JSON.parse(xhr.responseText);
                console.log("Cliente criado com sucesso:", customer);
                
                if (!customer || !customer.id) {
                  console.error("Resposta da API sem ID do cliente:", customer);
                  reject(new Error("Resposta da API não contém ID do cliente"));
                } else {
                  resolve(customer);
                }
              } catch (e) {
                console.error("Erro ao fazer parse da resposta:", e);
                reject(new Error("Erro ao processar resposta do servidor"));
              }
            } else {
              console.error("Erro na resposta:", xhr.status, xhr.responseText);
              
              // Tentar extrair mensagem de erro
              let errorMsg = `Erro ${xhr.status}`;
              try {
                const errorData = JSON.parse(xhr.responseText);
                if (errorData.message) {
                  errorMsg = errorData.message;
                }
                if (errorData.errors) {
                  console.error("Erros de validação detalhados:", errorData.errors);
                  errorMsg = `${errorMsg}: ${JSON.stringify(errorData.errors)}`;
                }
              } catch (e) {
                errorMsg = `${errorMsg}: ${xhr.responseText || "Sem detalhes disponíveis"}`;
              }
              
              reject(new Error(errorMsg));
            }
          };
          
          xhr.onerror = function() {
            console.error("Erro de rede na requisição XHR");
            reject(new Error("Erro de conexão com o servidor"));
          };
          
          xhr.send(JSON.stringify(data));
        });

        console.log("Cliente criado com sucesso:", customer);

        // Step 2: Set category access for the customer
        console.log("Adicionando categorias ao cliente:", selectedCategories);
        const categoryPromises = selectedCategories.map(async (categoryId) => {
          try {
            console.log(`Adicionando categoria ${categoryId} ao cliente ${customer.id}...`);
            const categoryRes = await fetch(`/api/customers/${customer.id}/categories/${categoryId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
            });
            
            const categorySuccess = categoryRes.ok;
            console.log(`Categoria ${categoryId}: ${categorySuccess ? 'Sucesso' : 'Falha'}`);
            
            if (categorySuccess) {
              // Step 3: Set sale unit access for each category
              const unitIds = categorySaleUnits[categoryId] || [];
              console.log(`Adicionando unidades de venda para categoria ${categoryId}:`, unitIds);
              
              const unitPromises = unitIds.map(async (unitId) => {
                try {
                  const unitRes = await fetch(`/api/customers/${customer.id}/categories/${categoryId}/units/${unitId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                  });
                  
                  const unitSuccess = unitRes.ok;
                  console.log(`Unidade ${unitId} para categoria ${categoryId}: ${unitSuccess ? 'Sucesso' : 'Falha'}`);
                  return unitSuccess;
                } catch (unitError) {
                  console.error(`Erro ao adicionar unidade ${unitId}:`, unitError);
                  return false;
                }
              });
              
              await Promise.all(unitPromises);
            }
            
            return categorySuccess;
          } catch (categoryError) {
            console.error(`Erro ao adicionar categoria ${categoryId}:`, categoryError);
            return false;
          }
        });
        
        await Promise.all(categoryPromises);
        console.log("Processo de adição de categorias e unidades concluído");

        return customer;
      } catch (error) {
        console.error("Erro na criação do cliente:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("=== CLIENTE CRIADO COM SUCESSO ===", data);
      
      // Invalidamos as queries para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
      toast({
        title: "Cliente criado com sucesso",
        description: "O novo cliente foi adicionado ao sistema.",
        variant: "default",
      });
      
      console.log("Redirecionando para página de clientes...");
      
      // Redirect with a direct approach first
      window.location.href = "/admin/customers";
    },
    onError: (error: Error) => {
      console.error("=== ERRO NA CRIAÇÃO DO CLIENTE ===");
      console.error("Detalhes do erro:", error);
      
      // Check if error message contains validation errors
      let errorDescription = error.message || "Ocorreu um erro ao criar o cliente.";
      
      // Try to parse error message for more detailed information
      try {
        if (error.message.includes('{')) {
          const errorJson = JSON.parse(error.message.substring(error.message.indexOf('{')));
          if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorDescription = `Erros de validação: ${errorJson.errors.map((e: any) => `${e.path}: ${e.message}`).join(', ')}`;
          }
        }
      } catch (parseError) {
        console.log("Não foi possível analisar detalhes do erro:", parseError);
      }
      
      toast({
        title: "Erro ao criar cliente",
        description: errorDescription,
        variant: "destructive",
      });
      
      // Log form validation errors if any
      const formErrors = customerForm.formState.errors;
      if (Object.keys(formErrors).length > 0) {
        console.error("Erros de validação do formulário:", formErrors);
      }
    }
  });

  // Validação de senhas iguais
  const validatePasswords = () => {
    const password = customerForm.getValues("password");
    const confirmPassword = customerForm.getValues("confirm_password");

    if (password !== confirmPassword) {
      customerForm.setError("confirm_password", {
        type: "validate",
        message: "As senhas não conferem"
      });
      return false;
    }

    return true;
  };

  // Handler para submit do formulário
  const onSubmitCustomer = async (data: any) => {
    console.log("=== INÍCIO DA VALIDAÇÃO DO FORMULÁRIO ===");
    console.log("Form data submitted:", JSON.stringify(data, null, 2));
    console.log("Categorias selecionadas:", selectedCategories);
    console.log("Unidades de venda por categoria:", categorySaleUnits);
    console.log("Form state (errors):", customerForm.formState.errors);
    
    // Check credentials first - make sure we're logged in
    try {
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) {
        console.error("Usuário não está autenticado");
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar um cliente. Por favor, faça login novamente.",
          variant: "destructive",
        });
        return;
      }
    } catch (authError) {
      console.error("Erro ao verificar autenticação:", authError);
    }
    
    // Validate that at least one category is selected if categories are available
    if (categories.length > 0 && selectedCategories.length === 0) {
      console.log("Erro: Nenhuma categoria selecionada");
      toast({
        title: "Erro na validação",
        description: "Selecione pelo menos uma categoria de produto.",
        variant: "destructive",
      });
      return;
    }
    
    // Check all selected categories have at least one sale unit selected
    for (const categoryId of selectedCategories) {
      if (!categorySaleUnits[categoryId] || categorySaleUnits[categoryId].length === 0) {
        console.log(`Erro: Categoria ${categoryId} não tem unidades de venda selecionadas`);
        toast({
          title: "Erro na validação",
          description: "Selecione pelo menos uma unidade de venda para cada categoria.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Ensure required fields are filled
    const requiredFields = ['company_name', 'email', 'password', 'confirm_password'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log("Campos obrigatórios faltando:", missingFields);
      toast({
        title: "Campos obrigatórios",
        description: `Por favor, preencha os seguintes campos obrigatórios: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    // Properly handle currency values (ensure they are numbers)
    let delivery_fee_reais = 0;
    let minimum_order_value_reais = 0;
    
    try {
      // Handle various input formats and convert to numbers
      if (typeof data.delivery_fee_reais === 'string') {
        // Normalize string by replacing comma with dot and handling multiple commas/dots
        const normalized = data.delivery_fee_reais.replace(/,/g, '.').trim();
        delivery_fee_reais = normalized === '' ? 0 : parseFloat(normalized);
        console.log("Convertendo delivery_fee_reais de string para número:", data.delivery_fee_reais, "→", delivery_fee_reais);
      } else if (typeof data.delivery_fee_reais === 'number') {
        delivery_fee_reais = data.delivery_fee_reais;
        console.log("delivery_fee_reais já é um número:", delivery_fee_reais);
      }
      
      if (typeof data.minimum_order_value_reais === 'string') {
        // Normalize string by replacing comma with dot and handling multiple commas/dots
        const normalized = data.minimum_order_value_reais.replace(/,/g, '.').trim();
        minimum_order_value_reais = normalized === '' ? 0 : parseFloat(normalized);
        console.log("Convertendo minimum_order_value_reais de string para número:", data.minimum_order_value_reais, "→", minimum_order_value_reais);
      } else if (typeof data.minimum_order_value_reais === 'number') {
        minimum_order_value_reais = data.minimum_order_value_reais;
        console.log("minimum_order_value_reais já é um número:", minimum_order_value_reais);
      }
    } catch (conversionError) {
      console.error("Erro na conversão dos valores monetários:", conversionError);
    }
    
    // Force to 0 if NaN or negative
    if (isNaN(delivery_fee_reais) || delivery_fee_reais < 0) {
      console.log("delivery_fee_reais é inválido, definindo como 0");
      delivery_fee_reais = 0;
    }
    
    if (isNaN(minimum_order_value_reais) || minimum_order_value_reais < 0) {
      console.log("minimum_order_value_reais é inválido, definindo como 0");
      minimum_order_value_reais = 0;
    }
    
    if (validatePasswords()) {
      console.log("Senhas validadas com sucesso");
      
      try {
        // Verificando campos de endereço obrigatórios
        if (!data.street || !data.number || !data.neighborhood) {
          console.log("Campos de endereço obrigatórios faltando");
          toast({
            title: "Campos de endereço obrigatórios",
            description: "Rua, número e bairro são campos obrigatórios.",
            variant: "destructive",
          });
          return;
        }
        
        // Combine address fields
        const address = `${data.street}, ${data.number}${data.complement ? `, ${data.complement}` : ''}, ${data.neighborhood}`;
        
        // Create a simplified object with only the fields the API expects
        const submissionData = {
          company_name: data.company_name.trim(),
          contact_person: (data.contact_person || "").trim(),
          phone: (data.phone || "").trim(),
          email: data.email.trim(),
          password: data.password,
          address: address.trim(),
          city: (data.city || "").trim(),
          state: (data.state || "").trim(),
          postal_code: (data.postal_code || "").trim(),
          // Make sure latitude and longitude are numeric or null
          latitude: data.latitude === "" || data.latitude === null ? null : 
                    typeof data.latitude === 'string' ? parseFloat(data.latitude) : data.latitude,
          longitude: data.longitude === "" || data.longitude === null ? null : 
                     typeof data.longitude === 'string' ? parseFloat(data.longitude) : data.longitude,
          enable_delivery: Boolean(data.enable_delivery),
          // Convert to cents (integer) for storage - ensure positive values
          delivery_fee: Math.max(0, Math.round(delivery_fee_reais * 100)),
          minimum_order_value: Math.max(0, Math.round(minimum_order_value_reais * 100)),
          allowed_delivery_days: data.allowed_delivery_days || [false, true, true, true, true, true, false],
        };
        
        console.log("Dados simplificados para envio:", JSON.stringify(submissionData, null, 2));
        console.log("Enviando requisição para criação de cliente...");
        createCustomerMutation.mutate(submissionData);
      } catch (error) {
        console.error("Erro ao preparar submissão do formulário:", error);
        toast({
          title: "Erro ao processar formulário",
          description: "Ocorreu um erro ao processar os dados do formulário.",
          variant: "destructive",
        });
      }
    } else {
      console.log("Validação de senhas falhou");
      toast({
        title: "Erro na validação",
        description: "As senhas não conferem. Por favor, verifique e tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen py-6">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Criar Novo Cliente</h1>
              <p className="text-gray-600">Adicione um novo cliente, preenchendo os dados no formulário.</p>
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
                      E-mail*
                    </label>
                    <input
                      {...customerForm.register("email")}
                      type="email"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                      placeholder="contato@empresa.com"
                    />
                    {customerForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.email.message}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha inicial
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
                      Confirme Senha
                    </label>
                    <input
                      {...customerForm.register("confirm_password")}
                      type="password"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                    {customerForm.formState.errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.confirm_password.message}
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
                    {categories.map((category: Category) => (
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
                      const category = categories.find((c: Category) => c.id === categoryId);
                      return (
                        <div key={categoryId} className="mb-5 p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-semibold mb-2 flex items-center">
                            <Tag className="h-4 w-4 mr-1 text-[#E73664]" />
                            {category?.name}
                          </h4>
                          <div className="ml-2 grid grid-cols-2 gap-2">
                            {saleUnits.map((unit: SaleUnit) => (
                              <div key={unit.sale_unit_id} className="flex items-center p-2">
                                <input
                                  type="checkbox"
                                  id={`unit-${categoryId}-${unit.sale_unit_id}`}
                                  checked={(categorySaleUnits[categoryId] || []).includes(unit.sale_unit_id)}
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
                disabled={createCustomerMutation.isPending}
                onClick={() => {
                  if (Object.keys(customerForm.formState.errors).length > 0) {
                    console.log("Form has errors:", customerForm.formState.errors);
                    toast({
                      title: "Erro no formulário",
                      description: "Por favor, corrija os erros no formulário antes de continuar.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {createCustomerMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Criar Cliente
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
