'use client';

import React from 'react';

// --- Motor CRUD V4 (A Fundação Inabalável) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudHooks } from '@/core/components/crud/types';

// --- Tipos e Contratos de Domínio ---
import { Client } from '../../domain/types/client';
import { ClientFormInput } from '../../domain/schemas/clientSchema';

// --- Motores de Dados (Application Layer - CQRS) ---
import { useClients } from '../../application/hooks/useClients';
import { useClientMutation } from '../../application/hooks/useClientMutation';

// --- Blueprint de Configuração ---
import { useClientConfig } from '../../application/useClientConfig';

/**
 * ============================================================================
 * 🛡️ CONTRATO DE POLIMORFISMO E ESTADO
 * @description Define a versatilidade do Registry para atuar como Master Data
 * (Tela Cheia) ou como Widget Lateral (Detail) no Cockpit de Vendas.
 * ============================================================================
 */
export interface ClientRegistryProps {
    variant?: 'full' | 'compact';
    onSelectClient?: (client: Client | null) => void;
    onFormRequest?: (client?: Client | Partial<Client> | null) => void;
    selectedItemId?: string;
}

/**
 * ============================================================================
 * 🏭 COMPONENTE: ClientRegistry (Versão Purificada V4)
 * @description Orquestrador principal da base de Clientes e Prospects.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Zero-Adapter Architecture: Removemos o intermediário 'useCrudAdapter' para 
 * ganhar performance e clareza no fluxo de dados (Data Flow).
 * 2. Visual Soul: O ícone de identidade (FaUser) agora é injetado diretamente 
 * no Config, garantindo coerência visual no Header do CRUD.
 * 3. Intentional Routing: Separação estrita entre visualização (Dossiê/IA) e 
 * edição (Formulário), elevando a saúde da experiência do usuário (UX).
 * ============================================================================
 */
export function ClientRegistry({ 
    variant = 'full',
    onSelectClient,
    onFormRequest,
    selectedItemId 
}: ClientRegistryProps) {
    
    const isCompact = variant === 'compact';

    // 🔌 1. Injeção de Motores de Leitura (Vitrine de Dados)
    const { clients, isLoading: loadingRead, error: readError, refreshData } = useClients();

    // 🖋️ 2. Injeção de Motores de Escrita (Mutações de Banco)
    const { 
        createClient, 
        updateClient, 
        deleteClient, 
        isLoading: writing, 
        error: writeError 
    } = useClientMutation();

    // 📐 3. Recuperação do Blueprint (Manual de Instruções)
    const config = useClientConfig(isCompact);

    /**
     * 🔌 4. GANCHOS DE EXECUÇÃO (Data Bindings V4)
     * @description Conexão direta entre o CrudLayout e os serviços de API.
     * Implementa a interface CrudHooks sem a necessidade de adaptadores legados.
     */
    const crudHooks: CrudHooks<Client, ClientFormInput> = {
        data: clients || [],
        isLoading: loadingRead || writing,
        error: (readError || writeError) ? String(readError || writeError) : null,
        onCreate: async (data) => await createClient(data),
        onUpdate: async (id, data) => await updateClient(id, data),
        onDelete: async (id) => await deleteClient(id),
        onRefresh: refreshData
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO MONUMENTAL
    // =========================================================================
    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<Client, ClientFormInput>
                config={config}
                hooks={crudHooks}
                listMode={isCompact ? 'cards' : 'table'}
                selectedItemId={selectedItemId}
                onFormRequest={onFormRequest}
                
                /** 💡 O FIO DE VISUALIZAÇÃO (Saúde da Navegação)
                 * No clique simples, acionamos o Dashboard de IA/Dossiê.
                 * A edição fica reservada para o clique duplo ou botões específicos.
                 */
                onViewRequest={onSelectClient}
            />
        </div>
    );
}