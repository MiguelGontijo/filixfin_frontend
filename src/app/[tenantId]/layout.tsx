// src/app/[tenantId]/layout.tsx

import React from 'react';
import { TenantGuard } from '@/core/components/auth/TenantGuard';

/**
 * @component TenantRootLayout
 * @description Layout raiz para a rota dinâmica /[tenantId].
 * PORQUÊ: Aplica o TenantGuard para garantir que qualquer sub-rota (dashboard, crm, etc.)
 * esteja protegida contra acesso cruzado de tenants.
 */
export default function TenantRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TenantGuard>
        {children}
    </TenantGuard>
  );
}