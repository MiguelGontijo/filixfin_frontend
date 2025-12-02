// src/app/clients/page.tsx
"use client";

import React from 'react';
// Importação do novo componente modularizado
import { ClientTablePage } from '@/core/components/client/ClientTablePage'; 

/**
 * @component ClientsPage
 * @description Rota de entrada para a Tabela de Clientes.
 * PORQUÊ: Simplifica a rota e usa o componente Page modularizado.
 */
export default function ClientsPage() {
    
    // NOTE: O AuthGuard é aplicado no clients/layout.tsx
    
    return (
        <ClientTablePage />
    );
}