import { db } from "./db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Verificar se o usuário já existe
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@sorvetao.com")
    });

    if (existingUser) {
      console.log("Usuário administrador já existe!");
      process.exit(0);
    }

    // Criar usuário administrador
    const hashedPassword = await hashPassword("admin123");
    
    const [adminUser] = await db.insert(users).values({
      email: "admin@sorvetao.com",
      password: hashedPassword,
      name: "Administrador",
      role: "admin"
    }).returning();

    console.log("Usuário administrador criado com sucesso!");
    console.log("Email: admin@sorvetao.com");
    console.log("Senha: admin123");
    
    process.exit(0);
  } catch (error) {
    console.error("Erro ao criar usuário administrador:", error);
    process.exit(1);
  }
}

createAdminUser();