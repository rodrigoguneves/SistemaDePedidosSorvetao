import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail, Lock, HelpCircle, LogIn } from "lucide-react";
import styles from "../styles/Login.module.css";

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, {
    message: "A senha deve conter pelo menos 6 caracteres",
  }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, loginMutation } = useAuth();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    // Convertendo para o formato esperado pela API
    const loginData = {
      email: data.email,
      password: data.password
    };

    loginMutation.mutate(loginData, {
      onSuccess: (user) => {
        // Redirecionar para o dashboard com base no papel do usuário
        const path = user.role === 'admin' ? '/admin' : '/customer/dashboard';
        navigate(path);
      },
      onError: (err) => {
        setError("Credenciais inválidas. Tente novamente.");
      }
    });
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBody}>
        <div className={styles.loginContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoText}>
              <h1>sorvetão</h1>
              <p>desde 1990</p>
            </div>
          </div>

          <div className={styles.cardContainer}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>Sistema de Pedidos</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <div className={styles.inputContainer}>
                  <Mail className={styles.inputIcon} size={16} />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className={styles.input}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Senha</label>
                <div className={styles.inputContainer}>
                  <Lock className={styles.inputIcon} size={16} />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={styles.input}
                    {...register("password")}
                  />
                </div>
                {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {error && (
                <div className="w-full p-3 rounded-md bg-red-50 text-red-500 text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                className={styles.loginButton}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Entrando..." : "Logar"} 
                <LogIn className={styles.loginButtonIcon} size={16} />
              </button>

              <div className={styles.forgotPasswordContainer}>
                <a href="#" className={styles.forgotPassword}>
                  Esqueceu sua Senha?
                </a>
              </div>
            </form>
          </div>

          <p className={styles.infoText}>
            Para Cadastramento no sistema procure nossa Equipe
          </p>

          <a href="#" className={styles.supportLink}>
            <HelpCircle size={16} />
            <span>Suporte</span>
          </a>
        </div>
      </div>
    </div>
  );
}