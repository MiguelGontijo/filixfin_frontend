'use client';

import React, { useMemo } from 'react';
import { FaHandshake } from 'react-icons/fa'; // 💡 Identidade visual: O aperto de mão do fechamento

// --- Motor CRUD V4 & Adaptador ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { useCrudAdapter } from '@/core/components/crud/hooks/useCrudAdapter';

// --- Contratos e Tipos ---
import { CRMDeal } from '../../domain/types';
import { DealFormInput } from '../../domain/schemas/dealSchema';

// --- Motores de Dados (CQRS) ---
import { useDeals } from '../../application/hooks/useDeals';
import { usePipelines } from '../../application/hooks/usePipelines';
import { useClients } from '@/core/client/hooks/useClients';
import { useDealMutation } from '../../application/hooks/useDealMutation';

// --- Configuração Injetável (O Manual de Instruções) ---
import { useDealConfig } from '../../application/hooks/useDealConfig';

/**
 * ============================================================================
 * 🛡️ CONTRATO DE POLIMORFISMO E ESTADO
 * @description Ensina o TypeScript que o DealRegistry pode atuar como Tela 
 * Cheia (Master) ou como Widget Lateral Compacto (Detail) no Cockpit.
 * ============================================================================
 */
export interface DealRegistryProps {
    variant?: 'full' | 'compact';
    clientId?: string;
    
    /** 🛡️ FIX CLASSE OURO: Alinhamento de tipagem com o Motor V4.
     * Agora aceita rascunhos (Partial) para suportar a injeção de clientId.
     */
    onFormRequest?: (deal?: CRMDeal | Partial<CRMDeal> | null) => void;
    
    /**
     * @property selectedItemId
     * @description O ID da oportunidade (Deal) atualmente em foco no Palco Central.
     * Injetado pelo Maestro para roteamento visual do card ativo.
     */
    selectedItemId?: string;
}

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: DEAL REGISTRY (Orquestrador Puro)
 * @description A Visão "Master Data" das oportunidades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID & Clean Architecture):
 * 1. Identidade de Módulo: Renomeia a entidade para "Deals" e injeta o ícone 
 * FaHandshake, garantindo semântica e vida ao cabeçalho.
 * 2. Injeção de Dependências: Todo o layout reativo e colunas foram delegados 
 * ao hook `useDealConfig`.
 * 3. Roteamento Dinâmico: Comunica ao CrudLayout qual a "roupa" correta 
 * (listMode) baseando-se na variante solicitada pelo componente pai.
 * 4. Segurança de Tipagem: Resolve o conflito de assinaturas entre o domínio
 * e o motor genérico (Partial consistency).
 * ============================================================================
 */
export function DealRegistry({ 
    variant = 'full', 
    clientId, 
    onFormRequest,
    selectedItemId 
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

    // 🔍 FILTRO DE DOMÍNIO: Isola a lista de deals apenas para o cliente ativo
    const filteredDeals = useMemo(() => {
        if (clientId) return deals.filter(d => d.clientId === clientId);
        return deals;
    }, [deals, clientId]);

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (Injeção Visual)
    // =========================================================================
    const config = useDealConfig(clients, pipelines, isCompact);
    
    // 👑 AJUSTES DE IDENTIDADE (Setas 1 e 3 da sua análise)
    config.title = "Deals"; // Nome curto, forte e executivo
    config.icon = <FaHandshake />; // Ícone dinâmico injetado no cabeçalho

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (O Adaptador Universal)
    // =========================================================================
    const crudHooks = useCrudAdapter<CRMDeal, DealFormInput>({
        query: {
            data: filteredDeals, 
            isLoading: isGlobalLoading,
            error: errorDeals,
            refetch: refreshDeals
        },
        mutation: {
            isLoading: false, 
            error: null,
            createFn: createDeal as any,
            updateFn: updateDeal as any,
            deleteFn: undefined 
        },
        options: {
            entityName: 'Deal',
            allowDelete: false 
        }
    });

    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<CRMDeal, DealFormInput>
                config={config}
                hooks={crudHooks}
                listMode={isCompact ? 'cards' : 'table'}
                
                // 💡 INVERSÃO DE CONTROLE: Injeta o clientId automaticamente em novas Deals
                baseInjectData={clientId ? { clientId } : undefined}
                
                selectedItemId={selectedItemId}
                onFormRequest={onFormRequest}
            />
        </div>
    );
}