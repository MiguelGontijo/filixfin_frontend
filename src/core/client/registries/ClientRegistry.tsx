'use client';

import React from 'react';

// --- Motor CRUD V4 ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudHooks } from '@/core/components/crud/types';

// --- Tipos do Domínio ---
import { Client } from '../types/client';
import { ClientFormInput } from '../schemas/clientSchema';

// --- Motores de Dados (CQRS) ---
import { useClients } from '../hooks/useClients';
import { useClientMutation } from '../hooks/useClientMutation';

// --- Configuração Injetável (O Manual de Instruções) ---
import { useClientConfig } from '../hooks/useClientConfig';

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: CLIENT REGISTRY
 * @description O Orquestrador da base de Clientes. 
 * Conecta o Motor V4 aos fluxos de leitura (useClients) e escrita (useClientMutation).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID & DRY):
 * 1. Separação de Preocupações: A configuração visual e as regras de schema foram
 * extraídas para o `useClientConfig`. Este arquivo agora é um orquestrador puro.
 * 2. Delegação Transparente: O CrudLayout assume 100% da responsabilidade pela 
 * renderização e transição de telas, consumindo as regras injetadas aqui.
 * ============================================================================
 */
export function ClientRegistry() {
    
    // 1. O Motor de Leitura (A Vitrine de Dados)
    const { clients, isLoading: loadingRead, error: readError, refreshData } = useClients();

    // 2. O Motor de Mutação (A Caneta de Escrita do Banco)
    const { createClient, updateClient, deleteClient, isLoading: writing, error: writeError } = useClientMutation();

    // 3. A Injeção de Dependência Visual (O Manual do Formulário e da Tabela)
    const config = useClientConfig();

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (Unindo Leitura e Escrita - CQRS)
    // =========================================================================
    const crudHooks: CrudHooks<Client, ClientFormInput> = {
        data: clients,
        isLoading: loadingRead || writing,
        error: readError || writeError,
        onCreate: createClient as any,
        onUpdate: updateClient as any,
        onDelete: deleteClient,
        onRefresh: refreshData
    };

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<Client, ClientFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}