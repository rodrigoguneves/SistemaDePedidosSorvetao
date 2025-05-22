
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Users } from "lucide-react";
import { Customer, insertCustomerSchema } from "@shared/schema";
import { AdminLayout } from "@/layouts/admin-layout";
import { useLocation, useRoute } from "wouter";

export default function EditCustomerPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/edit-customer/:id");
  const customerId = params ? parseInt(params.id) : null;

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

  // Update form with customer data when loaded
  useEffect(() => {
    if (customer) {
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
        allowed_delivery_days: customer.allowed_delivery_days,
        email: "",  // Email field is not editable for existing customers
        password: "",  // Optional for update
        user_id: customer.user_id
      });
    }
  }, [customer, customerForm]);

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
  const onSubmitCustomer = (data: any) => {
    console.log("Dados enviados para atualização:", data);
    updateCustomerMutation.mutate(data);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Cabeçalho da página */}
          <div className="flex items-center mb-6">
            <div className="bg-[#E73664]/10 p-3 rounded-full mr-3">
              <Users className="h-5 w-5 text-[#E73664]" />
            </div>
            <h1 className="text-2xl font-bold">Editar Cliente</h1>
          </div>

          {/* Formulário de edição de cliente */}
          <div className="bg-white rounded-lg shadow">
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
                    E-mail (não editável)
                  </label>
                  <input
                    {...customerForm.register("email")}
                    type="email"
                    disabled={true}
                    className="w-full rounded-lg border-gray-300 shadow-sm bg-gray-100 focus:border-[#E73664] focus:ring-[#E73664]"
                  />
                </div>

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
                  onClick={() => setLocation("/admin/customers")}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#E73664] hover:bg-[#d82c59] rounded-lg flex items-center"
                  disabled={updateCustomerMutation.isPending}
                >
                  {updateCustomerMutation.isPending ? (
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
        </main>
      </div>
    </AdminLayout>
  );
}
