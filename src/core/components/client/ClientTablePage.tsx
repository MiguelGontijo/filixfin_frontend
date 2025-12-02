// src/modules/client/pages/ClientTablePage.tsx
"use client";

import React from 'react';
import { ClientTable } from '@/core/components/client/ClientTable';
// Tabela de Clientes

/**
 * @component ClientTablePage
 * @description Página que renderiza o Gerenciamento e a Tabela de Clientes.
 * PORQUÊ: Antigo conteúdo da rota /clients, movido para ser um módulo de página puro.
 */
export const ClientTablePage: React.FC = () => {
    
    // NOTE: O AuthGuard e a verificação de roles agora estão no clients/layout.tsx
    
    return (
        <div className="space-y-6">
            
            <h1 className="text-3xl font-extrabold text-white">
                Gerenciamento de Clientes
            </h1>
            
            <p className="text-gray-400">
                Cadastre e visualize todos os clientes vinculados à sua conta (Tenant).
            </p>
            
            {/* Renderiza o componente que busca e exibe os dados (Listagem e Criação) */}
            <ClientTable />
            
        </div>
    );
}