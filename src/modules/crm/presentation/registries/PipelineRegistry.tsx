'use client';

import React from 'react';

// --- Mundo 1: Motor CRUD V4 (Infraestrutura Universal) ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudHooks } from '@/core/components/crud/types';

// --- Mundo 2: Domínio & Aplicação (CRM) ---
import { IPipeline } from '../../domain/types/pipeline.types';
import { PipelineFormInput } from '../../domain/schemas/pipelineSchema';

// --- Motores de Dados (CQRS) ---
import { usePipelines } from '../../application/hooks/usePipelines';
import { usePipelineMutation } from '../../application/hooks/usePipelineMutation';

// --- Configuração & Inteligência Visual ---
import { usePipelineConfig } from '../../application/usePipelineConfig';

/**
 * ============================================================================
 * 🏭 COMPONENTE: PipelineRegistry
 * @description O Grande Orquestrador de Funis de Vendas. Atua como a interface 
 * de Master Data para a gestão estrutural dos processos comerciais.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID & High Decoupling):
 * 1. Single Responsibility Principle (SRP): O Registry não define campos nem 
 * injeta componentes; ele apenas conecta os ganchos de dados (Hooks) ao 
 * layout universal (CrudLayout).
 * 2. CQRS Pattern: Utiliza a separação estrita entre Query (usePipelines) 
 * e Command (usePipelineMutation) para persistência resiliente.
 * 3. Declarative Intelligence: Toda a regra de "como o pipeline se parece" 
 * reside agora no 'usePipelineConfig', mantendo este arquivo limpo e escalável.
 * ============================================================================
 */
export function PipelineRegistry() {
    
    // 📡 Mundo Application: Recuperação da lista global
    const { 
        pipelines, 
        isLoadingPipelines, 
        errorPipelines, 
        refreshPipelines 
    } = usePipelines();

    // 🛠️ Mundo Application: Operações de Escrita com tratamento de erro nativo
    const { 
        createPipeline, 
        updatePipeline, 
        isLoading: isMutating, 
        error: mutationError 
    } = usePipelineMutation();

    /** ⚙️ INJEÇÃO DO MANUAL DE INSTRUÇÕES:
     * Recupera as colunas, campos de formulário e injeções customizadas (DND).
     */
    const config = usePipelineConfig();

    /** 🔌 ADAPTADOR DE COMANDOS (CrudHooks):
     * Mapeia as intenções do Motor V4 para as ações reais da API Evolution.
     */
    const crudHooks: CrudHooks<IPipeline, PipelineFormInput> = {
        data: pipelines,
        isLoading: isLoadingPipelines || isMutating,
        // Consolida erros de leitura e escrita para o cockpit visual
        error: (mutationError || (errorPipelines ? String(errorPipelines) : null)),
        
        // 💡 CONFORMIDADE: O Zod (no config) garante a tipagem via transform()
        onCreate: async (data) => {
            return createPipeline(data as any);
        },
        
        onUpdate: async (id, data) => {
            return updatePipeline(id, data as any);
        },
        
        /** 🛡️ POLÍTICA DE SEGURANÇA: 
         * Bloqueia exclusão acidental via UI direta para proteger a integridade
         * referencial das Oportunidades (Deals) ativas.
         */
        onDelete: async () => {
            alert('⚠️ Operação bloqueada: A exclusão de funis requer desvinculação prévia de todos os negócios associados.');
        },
        
        onRefresh: refreshPipelines
    };

    return (
        <div className="h-full w-full animate-fade-in">
            {/* O CrudLayout assume o controle total da renderização baseado no config */}
            <CrudLayout<IPipeline, PipelineFormInput>
                config={config}
                hooks={crudHooks}
            />
        </div>
    );
}