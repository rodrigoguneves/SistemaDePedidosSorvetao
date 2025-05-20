import { useState } from "react";
import { Link } from "wouter";
import styles from "@/styles/AdminPanel.module.css";
import { 
  LayoutGrid, 
  Package2, 
  Users, 
  FileStack, 
  DollarSign, 
  Settings, 
  Search, 
  Bell, 
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { user } = useAuth();
  
  return (
    <div className={styles.AdminPanel_1_2646}>
      <header className={styles.HeaderAdmin_1_2647}>
        <div className={styles.Div_1_4407}>
          <div className={styles.LogoSorvetao_2_1_4408}>
            <img src="/logo.png" alt="Sorvetão" height="50" />
          </div>
        </div>
        
        <div className={styles.Div_1_4422}>
          <Link href="/admin">
            <div className={styles.NavMenuItem_1_4423}>
              <div className={styles.IconContainer_1_4265}>
                <div className={styles.I_1_4266}>
                  <div className={styles.Svg_1_4267}>
                    <div className={styles.Frame_1_4268}>
                      <LayoutGrid color="white" size={21} />
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Painel_1_4270}>Painel</span>
            </div>
          </Link>
          
          <Link href="/admin/products">
            <div className={styles.NavMenuItem_1_4424}>
              <div className={styles.IconContainer_1_4381}>
                <div className={styles.I_1_4382}>
                  <div className={styles.Svg_1_4383}>
                    <div className={styles.I_1_4384}>
                      <div className={styles.Svg_1_4385}>
                        <div className={styles.Frame_1_4386}>
                          <Package2 color="#6b7280" size={21} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Produtos_1_4388}>Produtos</span>
            </div>
          </Link>
          
          <Link href="/admin/customers">
            <div className={styles.NavMenuItem_1_4425}>
              <div className={styles.IconContainer_1_4354}>
                <div className={styles.I_1_4355}>
                  <div className={styles.Svg_1_4356}>
                    <div className={styles.I_1_4357}>
                      <div className={styles.Svg_1_4358}>
                        <div className={styles.Frame_1_4359}>
                          <Users color="#6b7280" size={21} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Clientes_1_4361}>Clientes</span>
            </div>
          </Link>
          
          <Link href="/admin/orders">
            <div className={styles.NavMenuItem_1_4426}>
              <div className={styles.IconContainer_1_4327}>
                <div className={styles.I_1_4328}>
                  <div className={styles.Svg_1_4329}>
                    <div className={styles.Svg_1_4330}>
                      <div className={styles.Frame_1_4331}>
                        <FileStack color="#6b7280" size={21} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Pedidos_1_4333}>Pedidos</span>
            </div>
          </Link>
          
          <Link href="/admin/financial">
            <div className={styles.NavMenuItem_1_4427}>
              <div className={styles.IconContainer_1_4299}>
                <div className={styles.I_1_4300}>
                  <div className={styles.Svg_1_4301}>
                    <div className={styles.Svg_1_4302}>
                      <div className={styles.Frame_1_4303}>
                        <DollarSign color="#6b7280" size={21} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Financeiro_1_4305}>Financeiro</span>
            </div>
          </Link>
          
          <Link href="/admin/settings">
            <div className={styles.NavMenuItem_1_4428}>
              <div className={styles.IconContainer_1_4273}>
                <div className={styles.I_1_4274}>
                  <div className={styles.Svg_1_4275}>
                    <div className={styles.Svg_1_4276}>
                      <div className={styles.Frame_1_4277}>
                        <Settings color="#6b7280" size={21} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <span className={styles.Opções_1_4279}>Opções</span>
            </div>
          </Link>
        </div>
        
        <div className={styles.Div_1_4429}>
          <div className={styles.Div_1_4430}>
            <button aria-label="Pesquisar" className="p-2 rounded-full hover:bg-gray-100">
              <Search color="#6b7280" size={20} />
            </button>
            <button aria-label="Notificações" className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell color="#6b7280" size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button aria-label="Mensagens" className="p-2 rounded-full hover:bg-gray-100">
              <MessageSquare color="#6b7280" size={20} />
            </button>
            
            <div className="flex items-center gap-2 ml-2">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className={styles.mainContent}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Resumo de Vendas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Hoje</p>
                <p className="text-xl font-bold">R$ 3.452,50</p>
                <div className="flex items-center mt-1">
                  <span className="text-green-500 text-xs">+12%</span>
                  <span className="text-xs text-gray-500 ml-1">vs ontem</span>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Este mês</p>
                <p className="text-xl font-bold">R$ 38.245,75</p>
                <div className="flex items-center mt-1">
                  <span className="text-green-500 text-xs">+8%</span>
                  <span className="text-xs text-gray-500 ml-1">vs mês anterior</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Pedidos Recentes</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pedido #2358</p>
                  <p className="text-xs text-gray-500">Sorveteria Milano</p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Processando
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pedido #2357</p>
                  <p className="text-xs text-gray-500">Ice Cream Shop</p>
                </div>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Entregue
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Pedido #2356</p>
                  <p className="text-xs text-gray-500">Gelato Express</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Pronto
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Produtos Mais Vendidos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-pink-100"></div>
                  <p className="font-medium">Sorvete de Morango</p>
                </div>
                <p className="text-sm">348 unid.</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-yellow-100"></div>
                  <p className="font-medium">Sorvete de Abacaxi</p>
                </div>
                <p className="text-sm">285 unid.</p>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-purple-100"></div>
                  <p className="font-medium">Sorvete de Açaí</p>
                </div>
                <p className="text-sm">246 unid.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Gráfico de Vendas</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Gráfico de linha mostrando vendas dos últimos 30 dias</p>
            </div>
          </div>
          
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Distribuição de Vendas por Categoria</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Gráfico de pizza mostrando distribuição por categoria</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Clientes Recentes</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  SM
                </div>
                <div>
                  <p className="font-medium">Sorveteria Milano</p>
                  <p className="text-xs text-gray-500">Cadastrado hoje</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                  IC
                </div>
                <div>
                  <p className="font-medium">Ice Cream Shop</p>
                  <p className="text-xs text-gray-500">Cadastrado há 3 dias</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                  GE
                </div>
                <div>
                  <p className="font-medium">Gelato Express</p>
                  <p className="text-xs text-gray-500">Cadastrado há 7 dias</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Estoque Baixo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-medium">Sorvete de Chocolate</p>
                <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  5 unid.
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Sorvete de Baunilha</p>
                <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  8 unid.
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="font-medium">Sorvete de Limão</p>
                <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  12 unid.
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.adminBox}>
            <h3 className={styles.adminTitle}>Atividades Recentes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Novo pedido recebido</p>
                <p className="text-xs text-gray-500">Há 10 minutos</p>
              </div>
              <div>
                <p className="text-sm font-medium">Pagamento confirmado</p>
                <p className="text-xs text-gray-500">Há 25 minutos</p>
              </div>
              <div>
                <p className="text-sm font-medium">Nova reclamação</p>
                <p className="text-xs text-gray-500">Há 1 hora</p>
              </div>
              <div>
                <p className="text-sm font-medium">Pedido atualizado</p>
                <p className="text-xs text-gray-500">Há 3 horas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}