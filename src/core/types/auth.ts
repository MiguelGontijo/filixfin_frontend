
import { UserRole } from "./user";

// Reúsa o DTO do Backend
export interface LoginDto {
    email: string;
    password: string;
}

// --- NOVO: Tipagem da Resposta do Backend de Login ---
// Porquê: Garante que o TypeScript saiba que o objeto retornado contém 'token' e 'user'.
export interface LoginResponse {
    token: string;
    // O objeto user retornado pela API (simplificado)
    user: {
        id: string;
        email: string;
        role: UserRole;
        tenantId: string | null;
    };
    message: string; // Mensagem de sucesso
}