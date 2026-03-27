'use client';

import React from 'react';
import { FaUser } from 'react-icons/fa'; // 💡 Identidade visual do módulo

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
 * 🛡️ CONTRATO DE POLIMORFISMO E ESTADO
 * @description Ensina o TypeScript que o ClientRegistry pode atuar como Tela 
 * Cheia (Master) ou como Widget Lateral Compacto (Detail) no Cockpit.
 * ============================================================================
 */
export interface ClientRegistryProps {
    variant?: 'full' | 'compact';
    onSelectClient?: (client: Client | null) => void;
    
    // 🛡️ Alinhamento com o Motor V4 para aceitar rascunhos de injeção (Partial).
    onFormRequest?: (client?: Client | Partial<Client> | null) => void;
    
    /** * @property selectedItemId 
     * @description O ID do cliente atualmente em foco no Palco Central. 
     * Usado para realce visual na listagem. 
     */
    selectedItemId?: string;
}

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: CLIENT REGISTRY
 * @description O Orquestrador da base de Clientes. 
 * Conecta o Motor V4 aos fluxos de leitura (useClients) e escrita (useClientMutation).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID, DRY & Adapter Pattern):
 * 1. Identidade de Módulo: Injeta o ícone FaUser na configuração para dar vida
 * ao cabeçalho, conforme a hierarquia visual aprovada.
 * 2. Injeção do Adaptador Central: Delega a responsabilidade de sanitização 
 * de payload e tratamento de erros globais.
 * 3. Roteamento de Fios: Conecta perfeitamente o onViewRequest ao onSelectClient,
 * separando a visualização (Dashboard de IA) da edição (Formulário).
 * ============================================================================
 */
export function ClientRegistry({ 
    variant = 'full',
    onSelectClient,
    onFormRequest,
    selectedItemId 
}: ClientRegistryProps) {
    
    const isCompact = variant === 'compact';

    // 1. O Motor de Leitura (A Vitrine de Dados)
    const { clients, isLoading: loadingRead, error: readError, refreshData } = useClients();

    // 2. O Motor de Mutação (A Caneta de Escrita do Banco)
    const { createClient, updateClient, deleteClient, isLoading: writing, error: writeError } = useClientMutation();

    // 3. A Injeção de Dependência Visual
    // 💡 Recuperamos a config e injetamos a "Alma" do módulo (Ícone) nela
    const config = useClientConfig(isCompact);
    config.icon = <FaUser />; // 👑 Vida ao cabeçalho de Clientes

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (O Adaptador Universal de Domínio)
    // =========================================================================
    const crudHooks = useCrudAdapter<Client, ClientFormInput>({
        query: {
            data: clients,
            isLoading: loadingRead,
            error: readError,
            refetch: refreshData
        },
        mutation: {
            isLoading: writing,
            error: writeError,
            createFn: createClient,
            updateFn: updateClient,
            deleteFn: deleteClient
        },
        options: {
            entityName: 'Cliente',
            allowDelete: true, 
        }
    });

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<Client, ClientFormInput>
                config={config}
                hooks={crudHooks}
                listMode={isCompact ? 'cards' : 'table'}
                selectedItemId={selectedItemId}
                onFormRequest={onFormRequest}
                
                // 💡 O FIO DE VISUALIZAÇÃO: Conecta ao Dashboard de IA
                onViewRequest={onSelectClient}
            />
        </div>
    );
}