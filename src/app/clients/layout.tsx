// src/app/clients/layout.tsx

import { AuthGuard } from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/user';
// MODIFICAÇÃO: Importa o novo componente ClientSidebar (R3).
import { ClientSidebar } from '@/components/layout/ClientSidebar'; 

/**
 * @component ClientRootLayout
 * @description Layout principal para todas as rotas sob /clients (Área de Negócio do Tenant).
 * Porquê: Aplica o AuthGuard, verifica as roles e configura o layout com a sidebar de navegação.
 */
export default function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // O GLOBAL_ADMIN NÃO deve acessar rotinas de Tenant por aqui, apenas por /admin.
  const allowedRoles: UserRole[] = [UserRole.TENANT_ADMIN, UserRole.MEMBER];

  return (
    // O AuthGuard protege toda esta seção do aplicativo
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-base-dark">
        
        {/* MODIFICAÇÃO: Renderiza o ClientSidebar. */}
        <ClientSidebar /> 
        
        {/* Conteúdo Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}