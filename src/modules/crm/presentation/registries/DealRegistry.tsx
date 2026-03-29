'use client';

import React, { useMemo } from 'react';
import { FaHandshake } from 'react-icons/fa';

// --- Motor CRUD V4 & Adaptador (RESTAURADO) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { useCrudAdapter } from '@/core/components/crud/hooks/useCrudAdapter';

// --- Contratos e Tipos ---
import { CRMDeal } from '../../domain/types';
import { DealFormInput } from '../../domain/schemas/dealSchema';

// --- Motores de Dados (CQRS) ---
import { useDeals } from '../../application/hooks/useDeals';
import { usePipelines } from '../../application/hooks/usePipelines';
import { useClients } from '@/core/client/application/hooks/useClients';
import { useDealMutation } from '../../application/hooks/useDealMutation';

// --- Configuração Injetável ---
import { useDealConfig } from '../../application/useDealConfig';

export interface DealRegistryProps {
    variant?: 'full' | 'compact';
    clientId?: string;
    onFormRequest?: (deal?: CRMDeal | Partial<CRMDeal> | null) => void;
    selectedItemId?: string;
}

export function DealRegistry({ 
    variant = 'full', 
    clientId, 
    onFormRequest,
    selectedItemId 
}: DealRegistryProps) {
    
    // 📡 1. Conexão de Dados Original
    const { deals, isLoading: loadingDeals, error: errorDeals, refreshDeals } = useDeals();
    const { createDeal, updateDeal } = useDealMutation();
    const { clients, isLoading: loadingClients } = useClients();
    const { pipelines, isLoadingPipelines } = usePipelines(); // Mantido nome original

    const isGlobalLoading = loadingDeals || loadingClients || isLoadingPipelines;
    const isCompact = variant === 'compact';

    // 🔍 2. Filtro de Domínio Original
    const filteredDeals = useMemo(() => {
        if (clientId) return deals.filter(d => d.clientId === clientId);
        return deals;
    }, [deals, clientId]);

    // 📐 3. Configuração
    const config = useDealConfig(clients, pipelines, isCompact);
    
    /** 👑 Identidade Visual V4 (Mantendo apenas o ganho estético) */
    config.title = "Deals"; 
    config.icon = <FaHandshake className="text-accent-primary" />;

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (RESTAURADO: O Adaptador que funciona)
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
                baseInjectData={clientId ? { clientId } : undefined}
                selectedItemId={selectedItemId}
                onFormRequest={onFormRequest}
            />
        </div>
    );
}