import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/layouts/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, User, Building, MapPin, KeyRound, Truck, Package } from "lucide-react";
import { insertCustomerSchema } from "@shared/schema";

export default function AddCustomerPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      allowed_delivery_days: [false, true, true, true, true, true, false],
      password: "",
      confirm_password: "",
    }
  });

  // Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      // Combina os campos de endereço antes de enviar
      const formattedData = {
        ...data,
        address: `${data.street}, ${data.number}${data.complement ? `, ${data.complement}` : ''}, ${data.neighborhood}`,
      };

      delete formattedData.street;
      delete formattedData.number;
      delete formattedData.complement;
      delete formattedData.neighborhood;
      delete formattedData.confirm_password;

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
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
  const onSubmitCustomer = (data: any) => {
    console.log("Form data submitted:", data);
    if (validatePasswords()) {
      console.log("Passwords validated, submitting form");
      createCustomerMutation.mutate(data);
    } else {
      console.log("Password validation failed");
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
              </CardContent>
            </Card>

            {/* Catálogo de Produtos Permitidos */}
            <Card className="mb-4 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-pink-100 p-2 rounded-full">
                    <Package className="h-5 w-5 text-[#E73664]" />
                  </div>
                  <h2 className="text-lg font-medium">Catálogo de Produtos Permitidos</h2>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorias de Produtos Permitidas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Potes e Copos', 'Picolés', 'Sorvetes Especiais', 'Sabores Tradicionais', 'Toppings'].map((category) => (
                      <label key={category} className="flex items-center p-2 border rounded-lg">
                        <input
                          type="checkbox"
                          name={`category_${category}`}
                          className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                        />
                        <span className="ml-2">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Produtos/SKUs Permitidos
                  </label>
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {['Pote 2L Chocolate', 'Pote 2L Morango', 'Pote 2L Creme', 'Pote 1L Chocolate', 'Pote 1L Morango', 'Picolé Chocolate', 'Picolé Morango'].map((product) => (
                        <label key={product} className="flex items-center p-2 border rounded-lg">
                          <input
                            type="checkbox"
                            name={`product_${product}`}
                            className="rounded border-gray-300 text-[#E73664] focus:ring-[#E73664]"
                          />
                          <span className="ml-2">{product}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
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