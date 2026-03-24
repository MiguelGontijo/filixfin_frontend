'use client';

import React, { useMemo } from 'react';

// --- Motor CRUD V4 & Adaptador ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { useCrudAdapter } from '@/core/components/crud/hooks/useCrudAdapter';

// --- Contratos e Tipos ---
import { CRMDeal } from '../types';
import { DealFormInput } from '../schemas/dealSchema';

// --- Motores de Dados (CQRS) ---
import { useDeals } from '../hooks/useDeals';
import { usePipelines } from '../hooks/usePipelines';
import { useClients } from '@/core/client/hooks/useClients';
import { useDealMutation } from '../hooks/useDealMutation';

// --- Configuração Injetável (O Manual de Instruções) ---
import { useDealConfig } from '../hooks/useDealConfig';

/**
 * ============================================================================
 * 🛡️ CONTRATO DE POLIMORFISMO
 * @description Ensina o TypeScript que o DealRegistry pode atuar como Tela 
 * Cheia (Master) ou como Widget Lateral Compacto (Detail) no Cockpit.
 * ============================================================================
 */
export interface DealRegistryProps {
    variant?: 'full' | 'compact';
    clientId?: string;
    onFormRequest?: (deal: CRMDeal | null) => void;
}

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: DEAL REGISTRY (Orquestrador Puro)
 * @description A Visão "Master Data" das oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID & Clean Architecture):
 * 1. Single Responsibility: Este arquivo não sabe desenhar botões nem inputs. 
 * Ele apenas roteia os dados do Apollo/Axios para o Layout.
 * 2. Injeção de Dependências: Todo o layout reativo e colunas foram delegados 
 * ao hook `useDealConfig`.
 * 3. Sanitização: Delega o envio seguro (Data Scrubbing) ao `useCrudAdapter`.
 * ============================================================================
 */
export function DealRegistry({ 
    variant = 'full', 
    clientId, 
    onFormRequest 
}: DealRegistryProps) {
    
    // =========================================================================
    // 📡 CONEXÃO DE DADOS (Cross-Domain Fetching)
    // =========================================================================
    const { deals, isLoading: loadingDeals, error: errorDeals, refreshDeals } = useDeals();
    const { createDeal, updateDeal } = useDealMutation();
    const { clients, isLoading: loadingClients } = useClients();
    const { pipelines, isLoadingPipelines } = usePipelines();

    const isGlobalLoading = loadingDeals || loadingClients || isLoadingPipelines;
    const isCompact = variant === 'compact';

    // 🔍 FILTRO DE DOMÍNIO: Isola a lista de deals apenas para o cliente ativo (se solicitado pelo Cockpit)
    const filteredDeals = useMemo(() => {
        if (clientId) return deals.filter(d => d.clientId === clientId);
        return deals;
    }, [deals, clientId]);

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (Injeção Visual)
    // O hook extrai a complexidade do JSX e devolve apenas o objeto limpo.
    // =========================================================================
    const config = useDealConfig(clients, pipelines, isCompact);

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (O Adaptador Universal)
    // O Adapter assume o controle da submissão: remove os System Fields e 
    // gerencia o loading unificado, preservando a regra de não excluir (allowDelete: false).
    // =========================================================================
    const crudHooks = useCrudAdapter<CRMDeal, DealFormInput>({
        query: {
            data: filteredDeals, 
            isLoading: isGlobalLoading,
            error: errorDeals,
            refetch: refreshDeals
        },
        mutation: {
            isLoading: false, // Absorvido silenciosamente pelo Adapter central
            error: null,
            createFn: createDeal as any,
            updateFn: updateDeal as any,
            deleteFn: undefined // Segurança Nível 1: Não expõe método de delete
        },
        options: {
            entityName: 'Oportunidade (Deal)',
            allowDelete: false 
        }
    });

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<CRMDeal, DealFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}