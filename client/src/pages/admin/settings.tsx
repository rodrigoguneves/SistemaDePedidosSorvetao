import { useState } from "react";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Upload, Download, Settings, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("management");
  const { user } = useAuth();

  // Mock system users
  const systemUsers = [
    {
      id: 1,
      name: "Admin Principal",
      email: "admin@sorvetao.com",
      role: "admin",
      lastLogin: "2023-07-15 08:32",
    },
    {
      id: 2,
      name: "Gerente de Vendas",
      email: "gerente@sorvetao.com",
      role: "manager",
      lastLogin: "2023-07-14 16:45",
    },
  ];

  return (
    <AdminLayout>
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie usuários administrativos, dados e design da plataforma."
      />

      <Tabs defaultValue="management" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="management">Gerência</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Usuários do Sistema</h3>
                <Button className="rounded-xl flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Novo Usuário</span>
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-left">Nome</TableHead>
                      <TableHead className="text-left">Email</TableHead>
                      <TableHead className="text-left">Função</TableHead>
                      <TableHead className="text-left">Último Acesso</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemUsers.map((user) => (
                      <TableRow key={user.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-lg ${
                              user.role === "admin"
                                ? "bg-primary/10 text-primary"
                                : user.role === "manager"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }`}
                          >
                            {user.role === "admin" ? "Administrador" : "Gerente"}
                          </span>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-800 h-8 w-8"
                            disabled={user.role === "admin" && systemUsers.filter(u => u.role === "admin").length === 1}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Backup de Dados</h3>
                  <p className="text-muted-foreground">
                    Crie backups manuais ou agende backups automáticos dos dados do sistema.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button className="justify-start rounded-xl">
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Backup Completo
                    </Button>
                    <Button variant="outline" className="justify-start rounded-xl">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar Backups Automáticos
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Importar Dados</h3>
                  <p className="text-muted-foreground">
                    Importe dados históricos de planilhas para o sistema.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button className="justify-start rounded-xl">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Transações Financeiras
                    </Button>
                    <Button variant="outline" className="justify-start rounded-xl">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Histórico de Pedidos
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Logotipo da Empresa</h3>
                  <p className="text-muted-foreground">
                    Personalize o logotipo exibido em toda a plataforma.
                  </p>
                  <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center justify-center">
                    <div className="w-48 h-24 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                      <span className="text-gray-500 dark:text-gray-400 font-bold">Sorvetão Logo</span>
                    </div>
                    <Button className="rounded-xl">
                      <Upload className="h-4 w-4 mr-2" />
                      Alterar Logotipo
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Tema do Sistema</h3>
                  <p className="text-muted-foreground">
                    Escolha entre o tema claro e escuro para a interface administrativa.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-xl p-4 flex flex-col items-center">
                      <div className="w-full h-24 bg-white mb-2 rounded-lg shadow-sm border flex items-center justify-center">
                        <div className="w-16 h-8 bg-primary rounded-lg"></div>
                      </div>
                      <span className="text-sm font-medium">Tema Claro</span>
                    </div>
                    <div className="border rounded-xl p-4 flex flex-col items-center">
                      <div className="w-full h-24 bg-gray-900 mb-2 rounded-lg shadow-sm border border-gray-800 flex items-center justify-center">
                        <div className="w-16 h-8 bg-primary rounded-lg"></div>
                      </div>
                      <span className="text-sm font-medium">Tema Escuro</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}