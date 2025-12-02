// src/app/admin/layout.tsx

import { AuthGuard } from '@/core/components/auth/AuthGuard';
import { AdminSidebar } from '@/core/ui/layout/AdminSidebar';
import { UserRole } from '@/core/types/user';

/**
 * @component AdminRootLayout
 * @description Layout principal para todas as rotas sob /admin.
 * Porquê: Aplica o sidebar e, crucialmente, o AuthGuard.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // Apenas o GLOBAL_ADMIN pode acessar as rotinas de configuração
  const allowedRoles: UserRole[] = ['GLOBAL_ADMIN']; 

  return (
    // O AuthGuard protege toda esta seção do aplicativo
    <AuthGuard allowedRoles={allowedRoles}>
      <div className="flex min-h-screen bg-base-dark">
        
        <AdminSidebar />
        
        {/* Conteúdo Principal */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}