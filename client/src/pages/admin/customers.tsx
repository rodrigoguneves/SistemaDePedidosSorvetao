import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/admin-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Eye, Edit, Trash, MapPin } from "lucide-react";
import { Customer } from "@shared/schema";

export default function AdminCustomers() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: async () => {
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Failed to fetch customers");
      return response.json();
    },
  });

  const filteredCustomers = customers
    ? customers.filter((customer: Customer) =>
        customer.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.state.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    
    try {
      // Soft delete by default
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error("Failed to delete customer");
      
      setIsDeleteDialogOpen(false);
      // Refresh customers data
      // queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Gerenciamento de Clientes"
        description="Visualize, adicione e gerencie os clientes revendedores."
        actions={
          <Button className="rounded-xl flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Novo Cliente</span>
          </Button>
        }
      />

      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">Clientes</TabsTrigger>
          <TabsTrigger value="map">Mapa de Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar clientes..."
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
                      <TableHead className="text-left">Empresa</TableHead>
                      <TableHead className="text-left">Contato</TableHead>
                      <TableHead className="text-left">Telefone</TableHead>
                      <TableHead className="text-left">Cidade/Estado</TableHead>
                      <TableHead className="text-left">Entrega</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando clientes...
                        </TableCell>
                      </TableRow>
                    ) : filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer: Customer) => (
                        <TableRow key={customer.id} className="border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <TableCell className="font-medium">{customer.company_name}</TableCell>
                          <TableCell>{customer.contact_person}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>{customer.city}/{customer.state}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-lg ${customer.enable_delivery ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {customer.enable_delivery ? "Habilitada" : "Somente Retirada"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800 h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600 hover:text-red-800 h-8 w-8"
                              onClick={() => handleDeleteCustomer(customer)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery ? "Nenhum cliente corresponde à sua busca" : "Nenhum cliente cadastrado"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-semibold">Mapa de Clientes</p>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2">
                    Aqui será exibido um mapa interativo mostrando a localização de todos os seus clientes. Adicione clientes com endereços para visualizá-los no mapa.
                  </p>
                </div>
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
              Você está prestes a excluir o cliente <span className="font-semibold">{selectedCustomer?.company_name}</span>. 
              Esta ação irá marcar o cliente como excluído, mas os dados serão preservados no sistema.
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
              onClick={confirmDeleteCustomer}
            >
              Excluir Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
