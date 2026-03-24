'use client';

import React from 'react';

// --- Motor CRUD V4 & Adaptadores ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { useCrudAdapter } from '@/core/components/crud/hooks/useCrudAdapter';

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
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID, DRY & Adapter Pattern):
 * 1. Separação de Preocupações: A configuração visual e as regras de schema foram
 * extraídas para o `useClientConfig`. Este arquivo agora é um orquestrador puro.
 * 2. Injeção do Adaptador Central (`useCrudAdapter`): Delega a responsabilidade 
 * de sanitização de payload (Data Scrubbing) e tratamento de erros globais, 
 * eliminando a necessidade de gerenciar `as any` ou lógica de exclusão na mão.
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
    // 🔌 ROTEAMENTO DE AÇÕES (O Adaptador Universal de Domínio)
    // O Adapter assume o controle: esfrega os dados antes do Update, 
    // gerencia o loading unificado e aplica os alertas do Design System.
    // =========================================================================
    const crudHooks = useCrudAdapter<Client, ClientFormInput>({
        // Contexto de Leitura
        query: {
            data: clients,
            isLoading: loadingRead,
            error: readError,
            refetch: refreshData
        },
        // Contexto de Escrita (Mutação)
        mutation: {
            isLoading: writing,
            error: writeError,
            createFn: createClient,
            updateFn: updateClient,
            deleteFn: deleteClient
        },
        // Configurações e Regras de Negócio do Adaptador
        options: {
            entityName: 'Cliente',
            allowDelete: true, // Permite a exclusão através da lixeira com confirmação padronizada
            // Caso o schema de cliente tenha algum campo extra que precise ser limpo no update,
            // poderíamos adicioná-lo aqui em omitKeysOnUpdate: ['campoTemporario']
        }
    });

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<Client, ClientFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}