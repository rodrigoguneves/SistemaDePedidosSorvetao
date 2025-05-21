
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import styles from "../styles/Login.module.css";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Verifica se o usuário já está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin/dashboard");
    }
    
    // Tenta carregar o logo de diferentes fontes possíveis
    const possiblePaths = [
      '/logo.png',
      './logo.png',
      '../attached_assets/logo.png',
      '/attached_assets/logo.png',
      './attached_assets/logo.png'
    ];
    
    console.log("Tentando encontrar a imagem do logo nos seguintes caminhos:");
    
    // Para cada caminho possível, tenta carregar a imagem
    possiblePaths.forEach(path => {
      const img = new Image();
      img.onload = () => {
        console.log(`Imagem carregou com sucesso em: ${path}`);
        setLogoPath(path);
      };
      img.onerror = () => {
        console.log(`Imagem falhou ao carregar em: ${path}`);
      };
      img.src = path;
    });
  }, [isAuthenticated, setLocation]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para o painel",
      });
      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Verifique seu e-mail e senha",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          {logoPath && (
            <img
              src={logoPath}
              alt="Logo Sorvetão"
              className={styles.logo}
            />
          )}
          <h1 className={styles.title}>Pedidos Sorvetão</h1>
          <p className={styles.subtitle}>Plataforma B2B de Gestão de Pedidos</p>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.formTitle}>Acesse sua conta</h2>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email.message}</p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={styles.input}
                placeholder="********"
                {...register("password")}
              />
              {errors.password && (
                <p className={styles.errorText}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? (
                <span>Processando...</span>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
