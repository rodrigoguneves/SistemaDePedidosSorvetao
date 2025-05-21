
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
      <div className={styles.loginBody}>
        <div className={styles.loginContent}>
          <div className={styles.logoContainer}>
            {logoPath && (
              <img
                src={logoPath}
                alt="Logo Sorvetão"
                className={styles.logo}
              />
            )}
          </div>
          <div className={styles.cardContainer}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>Sistema de Pedidos</h1>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <div className={styles.inputContainer}>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="seu@email.com"
                    {...register("email")}
                  />
                  <div className={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 3.5C1.725 3.5 1.5 3.725 1.5 4V4.69063L6.89062 9.11563C7.5375 9.64688 8.46562 9.64688 9.1125 9.11563L14.5 4.69063V4C14.5 3.725 14.275 3.5 14 3.5H2ZM1.5 6.63125V12C1.5 12.275 1.725 12.5 2 12.5H14C14.275 12.5 14.5 12.275 14.5 12V6.63125L10.0625 10.275C8.8625 11.2594 7.13438 11.2594 5.9375 10.275L1.5 6.63125ZM0 4C0 2.89688 0.896875 2 2 2H14C15.1031 2 16 2.89688 16 4V12C16 13.1031 15.1031 14 14 14H2C0.896875 14 0 13.1031 0 12V4Z" fill="#9CA3AF" />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>
                  Senha
                </label>
                <div className={styles.inputContainer}>
                  <input
                    id="password"
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <div className={styles.inputIcon}>
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_1_2622)">
                        <path d="M4.5 4.5V6H9.5V4.5C9.5 3.11875 8.38125 2 7 2C5.61875 2 4.5 3.11875 4.5 4.5ZM2.5 6V4.5C2.5 2.01562 4.51562 0 7 0C9.48438 0 11.5 2.01562 11.5 4.5V6H12C13.1031 6 14 6.89687 14 8V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V8C0 6.89687 0.896875 6 2 6H2.5Z" fill="#9CA3AF" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_2622">
                          <path d="M0 0H14V16H0V0Z" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Logar"}
              </button>
            </form>
            <a href="#" className={styles.forgotPassword}>
              Esqueceu sua senha?
            </a>
          </div>
          <div className="w-full text-center mt-4">
            <p className={styles.infoText}>
              Para cadastramento no sistema procure nossa equipe
            </p>
            <a href="#" className={styles.supportLink}>
              <svg width="16" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_1_2642)">
                  <path d="M8.5 1.5C4.90938 1.5 2 4.40938 2 8V9.25C2 9.66562 1.66562 10 1.25 10C0.834375 10 0.5 9.66562 0.5 9.25V8C0.5 3.58125 4.08125 0 8.5 0C12.9187 0 16.5 3.58125 16.5 8V12.5031C16.5 14.0219 15.2688 15.2531 13.7469 15.2531L10.3 15.25C10.0406 15.6969 9.55625 16 9 16H8C7.17188 16 6.5 15.3281 6.5 14.5C6.5 13.6719 7.17188 13 8 13H9C9.55625 13 10.0406 13.3031 10.3 13.75L13.75 13.7531C14.4406 13.7531 15 13.1938 15 12.5031V8C15 4.40938 12.0906 1.5 8.5 1.5ZM5 6.5H5.5C6.05312 6.5 6.5 6.94688 6.5 7.5V11C6.5 11.5531 6.05312 12 5.5 12H5C3.89687 12 3 11.1031 3 10V8.5C3 7.39687 3.89687 6.5 5 6.5ZM12 6.5C13.1031 6.5 14 7.39687 14 8.5V10C14 11.1031 13.1031 12 12 12H11.5C10.9469 12 10.5 11.5531 10.5 11V7.5C10.5 6.94688 10.9469 6.5 11.5 6.5H12Z" fill="#6B7280" />
                </g>
                <defs>
                  <clipPath id="clip0_1_2642">
                    <path d="M0.5 0H16.5V16H0.5V0Z" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
