import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Filter, PlusCircle, Edit, Trash2, MapPin, List, Truck, Users } from "lucide-react";
import { Customer, insertCustomerSchema } from "@shared/schema";
import { AdminLayout } from "@/layouts/admin-layout";

export default function CustomersPage() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("list"); // "list" ou "map"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState("all");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  // Consulta para obter clientes
  const { 
    data: customers = [], 
    isLoading: customersLoading 
  } = useQuery({
    queryKey: ['/api/customers'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Erro ao carregar clientes');
        return res.json();
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        return [];
      }
    }
  });

  // Formulário para cadastro/edição de cliente
  const customerForm = useForm({
    resolver: zodResolver(insertCustomerSchema.extend({
      email: z.string().email("Email inválido"),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").optional(),
      user_id: z.number().optional(),
    })),
    defaultValues: {
      company_name: "",
      contact_person: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      latitude: null,
      longitude: null,
      enable_delivery: false,
      delivery_fee: 0,
      minimum_order_value: 0,
      allowed_delivery_days: [false, true, true, true, true, true, false],
      email: "",
      password: "",
    }
  });

  // Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao criar cliente');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Cliente criado com sucesso",
        description: "O novo cliente foi adicionado ao sistema.",
        variant: "default",
      });
      setShowAddCustomerModal(false);
      customerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/customers/${data.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      setShowAddCustomerModal(false);
      customerForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Funções para manipulação de clientes
  const handleAddCustomer = () => {
    setCurrentCustomer(null);
    customerForm.reset({
      company_name: "",
      contact_person: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postal_code: "",
      latitude: null,
      longitude: null,
      enable_delivery: false,
      delivery_fee: 0,
      minimum_order_value: 0,
      allowed_delivery_days: [false, true, true, true, true, true, false],
      email: "",
      password: "",
    });
    setShowAddCustomerModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    customerForm.reset({
      company_name: customer.company_name,
      contact_person: customer.contact_person,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      postal_code: customer.postal_code,
      latitude: customer.latitude,
      longitude: customer.longitude,
      enable_delivery: customer.enable_delivery,
      delivery_fee: customer.delivery_fee,
      minimum_order_value: customer.minimum_order_value,
      allowed_delivery_days: customer.allowed_delivery_days as boolean[],
      email: "",  // Não recebemos o email do modelo Customer, apenas do User relacionado
      password: "",  // Campo opcional para atualização
      user_id: customer.user_id
    });
    setShowAddCustomerModal(true);
  };

  // Mutation para excluir cliente
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao excluir cliente');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Cliente excluído com sucesso",
        description: "O cliente foi removido do sistema.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${customer.company_name}?`)) {
      deleteCustomerMutation.mutate(customer.id);
    }
  };

  // Mutation para alternar status de entrega
  const toggleDeliveryMutation = useMutation({
    mutationFn: async ({ id, enable_delivery }: { id: number, enable_delivery: boolean }) => {
      const res = await fetch(`/api/customers/${id}/delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_delivery }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erro ao atualizar status de entrega');
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      toast({
        title: "Status de entrega atualizado",
        description: "O status de entrega do cliente foi atualizado com sucesso.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar status de entrega",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleToggleDelivery = (customer: Customer) => {
    toggleDeliveryMutation.mutate({ 
      id: customer.id, 
      enable_delivery: !customer.enable_delivery 
    });
  };

  // Filtragem de clientes
  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = searchQuery
      ? customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCity = selectedCity === "all"
      ? true
      : customer.city === selectedCity;

    const matchesStatus = selectedStatus === "all"
      ? true
      : customer.active === (selectedStatus === "active");

    const matchesDelivery = selectedDelivery === "all"
      ? true
      : customer.delivery_enabled === (selectedDelivery === "enabled");

    return matchesSearch && matchesCity && matchesStatus && matchesDelivery;
  });

  // Simulação de marcadores do mapa (em uma aplicação real, seriam coordenadas reais)
  const mapMarkers = filteredCustomers.map((customer: Customer) => ({
    id: customer.id,
    name: customer.name,
    lat: Math.random() * 10 - 5 + (-15), // Simulando latitude no Brasil
    lng: Math.random() * 10 - 5 + (-50), // Simulando longitude no Brasil
    active: customer.active
  }));

  // Lista de cidades disponíveis (em uma aplicação real, viria do backend)
  const availableCities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre"];

  // Handler para submit do formulário
  const onSubmitCustomer = (data: any) => {
    if (currentCustomer) {
      updateCustomerMutation.mutate({
        ...data,
        id: currentCustomer.id
      });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Modal de Adicionar/Editar Cliente */}
        {showAddCustomerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full">
              <div className="flex items-center border-b p-4">
                <div className="bg-[#E73664]/10 p-3 rounded-full mr-3">
                  <Users className="h-5 w-5 text-[#E73664]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {currentCustomer ? "Editar Cliente" : "Novo Cliente"}
                  </h3>
                </div>
              </div>

              <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)}>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="font-medium text-lg mb-3">Informações do Cliente</h4>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa/Negócio
                    </label>
                    <input
                      {...customerForm.register("company_name")}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                    {customerForm.formState.errors.company_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.company_name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsável
                    </label>
                    <input
                      {...customerForm.register("contact_person")}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                    {customerForm.formState.errors.contact_person && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.contact_person.message}
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
                    />
                    {customerForm.formState.errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.phone.message}
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
                      disabled={currentCustomer !== null}
                    />
                    {customerForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha {currentCustomer && "(deixe em branco para não alterar)"}
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

                  <div className="col-span-2">
                    <h4 className="font-medium text-lg mt-4 mb-3">Endereço</h4>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço Completo
                    </label>
                    <input
                      {...customerForm.register("address")}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                    {customerForm.formState.errors.address && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.address.message}
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
                    />
                    {customerForm.formState.errors.postal_code && (
                      <p className="mt-1 text-sm text-red-600">
                        {customerForm.formState.errors.postal_code.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coordenadas (opcional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        {...customerForm.register("latitude", { valueAsNumber: true })}
                        placeholder="Latitude"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                      />
                      <input
                        {...customerForm.register("longitude", { valueAsNumber: true })}
                        placeholder="Longitude"
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <h4 className="font-medium text-lg mt-4 mb-3">Configurações de Entrega</h4>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_delivery"
                      {...customerForm.register("enable_delivery")}
                      className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                    />
                    <label htmlFor="enable_delivery" className="ml-2 text-sm font-medium">
                      Habilitar entrega para este cliente
                    </label>
                  </div>

                  <div></div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taxa de Entrega (em centavos)
                    </label>
                    <input
                      type="number"
                      {...customerForm.register("delivery_fee", { valueAsNumber: true })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pedido Mínimo para Entrega (em centavos)
                    </label>
                    <input
                      type="number"
                      {...customerForm.register("minimum_order_value", { valueAsNumber: true })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dias disponíveis para entrega
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
                </div>

                <div className="border-t p-4 flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                    onClick={() => setShowAddCustomerModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-[#E73664] hover:bg-[#d82c59] rounded-lg flex items-center"
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                  >
                    {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Cabeçalho da página */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {activeView === "map" ? "Mapa de Clientes" : "Clientes"}
            </h1>

            <button
              className="bg-[#E73664] hover:bg-[#d82c59] text-white font-medium px-4 py-2 rounded-full flex items-center"
              onClick={handleAddCustomer}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Cliente
            </button>
          </div>

          {/* Conteúdo principal */}
          <div className="bg-white rounded-lg p-6 shadow">
            {/* Abas de visualização */}
            <div className="mb-6">
              <div className="inline-flex bg-gray-100 rounded-full p-1">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                    activeView === "list" 
                      ? "bg-[#E73664] text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveView("list")}
                >
                  <List className="mr-2 h-4 w-4" />
                  Clientes
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                    activeView === "map" 
                      ? "bg-[#E73664] text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveView("map")}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Mapa
                </button>
              </div>
            </div>

            {/* Filtros e pesquisa */}
            {activeView === "map" && (
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/Região</label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="all">Todas</option>
                    {availableCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entrega Habilitada</label>
                  <select
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-[#E73664] focus:ring-[#E73664]"
                    value={selectedDelivery}
                    onChange={(e) => setSelectedDelivery(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="enabled">Habilitada</option>
                    <option value="disabled">Desabilitada</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    className="px-4 py-2 bg-[#E73664] text-white rounded-lg flex items-center"
                  >
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </button>
                </div>
              </div>
            )}

            {/* Visualização de Lista */}
            {activeView === "list" && (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#E73664]/10">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          Cliente
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          Responsável
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          E-mail
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          Entrega
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#E73664] uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Exemplo de dados */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Sorvetes Paraíso Ltda
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Ana Paula Lima
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ana.paula@sorvpara.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E73664]/10 text-[#E73664]">
                            Ativo
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Truck className="h-5 w-5 text-[#E73664]" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Delícias Geladas ME
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Carlos Silva
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          carlos@deliciasgeladas.com
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inativo
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Truck className="h-5 w-5 text-gray-300" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Mais itens de exemplo */}
                      {[1, 2, 3, 4, 5].map((index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            Sorvetes GelaTudo
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Beatriz Souza
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            beatriz@gela.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#E73664]/10 text-[#E73664]">
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Truck className="h-5 w-5 text-[#E73664]" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                              <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-[#E73664] hover:bg-[#E73664]/10 rounded-full">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Paginação */}
                <div className="flex justify-center mt-6">
                  <nav className="flex items-center gap-1">
                    <button className="p-2 rounded-md border hover:bg-gray-50">
                      &lt;
                    </button>
                    <button className="p-2 w-10 rounded-md border bg-[#E73664] text-white">
                      1
                    </button>
                    <button className="p-2 w-10 rounded-md border hover:bg-gray-50">
                      2
                    </button>
                    <button className="p-2 w-10 rounded-md border hover:bg-gray-50">
                      3
                    </button>
                    <button className="p-2 rounded-md border hover:bg-gray-50">
                      &gt;
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {/* Visualização de Mapa */}
            {activeView === "map" && (
              <div>
                <div className="bg-purple-100 rounded-lg h-[500px] p-4 relative overflow-hidden">
                  {/* Simulação de um mapa do Brasil */}
                  <div className="w-full h-full bg-amber-100 rounded-lg relative">
                    {/* Esta é uma simulação do mapa do Brasil - na implementação real, usaríamos uma biblioteca como react-leaflet */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img src="/brazil-map.png" alt="Mapa do Brasil" className="object-contain h-full" onError={(e) => {
                        // Fallback se a imagem não existir
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }} />
                    </div>

                    {/* Marcadores do mapa */}
                    {mapMarkers.map((marker) => (
                      <div 
                        key={marker.id}
                        className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center ${
                          marker.active ? 'bg-[#E73664]' : 'bg-gray-400'
                        }`}
                        style={{ 
                          left: `${(marker.lng + 70) * 1.5}%`, 
                          top: `${(marker.lat + 36) * 4}%` 
                        }}
                        title={marker.name}
                      >
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    ))}

                    {/* Controles de zoom */}
                    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md overflow-hidden">
                      <button className="p-1 hover:bg-gray-100">
                        <span className="block w-6 h-6 flex items-center justify-center font-bold">+</span>
                      </button>
                      <div className="h-px bg-gray-200"></div>
                      <button className="p-1 hover:bg-gray-100">
                        <span className="block w-6 h-6 flex items-center justify-center font-bold">−</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Rodapé */}
        <footer className="py-4 text-center text-sm text-gray-500">
          © 2025 Sorvetão. Todos os direitos reservados.
        </footer>
      </div>
    </AdminLayout>
  );
}