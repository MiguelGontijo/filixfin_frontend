'use client';

import React, { useMemo } from 'react';
import { FaUserTie, FaRobot, FaStickyNote } from 'react-icons/fa';

// --- Motor CRUD V4 ---
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig, CrudHooks } from '@/core/components/crud/types';

// --- Tipos e Schemas do Domínio ---
import { Client } from '../types/client';
import { ClientFormSchema, ClientFormInput } from '../schemas/clientSchema';

// --- Motores de Dados (CQRS) ---
import { useClients } from '../hooks/useClients';
import { useClientMutation } from '../hooks/useClientMutation';

/**
 * ============================================================================
 * 🏭 COMPONENTE PRINCIPAL: CLIENT REGISTRY
 * @description O Orquestrador da base de Clientes. 
 * Conecta o Motor V4 aos fluxos de leitura (useClients) e escrita (useClientMutation).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. UX Imersiva: Renderização de colunas ricas combinando dados (Nome + Contato).
 * 2. IA Native: Exposição visual do 'aiSummary' mostrando o DNA tecnológico do CRM.
 * 3. Delegação Transparente: O CrudLayout cuida da transição de telas, este 
 * componente cuida apenas das regras de negócio.
 * ============================================================================
 */
export function ClientRegistry() {
    
    // 1. O Motor de Leitura (Vitrine)
    const { clients, isLoading: loadingRead, error: readError, refreshData } = useClients();

    // 2. O Motor de Mutação (A Caneta)
    const { createClient, updateClient, deleteClient, isLoading: writing, error: writeError } = useClientMutation();

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (O Manual do CrudLayout)
    // =========================================================================
    const config: CrudConfig<Client, ClientFormInput> = useMemo(() => ({
        title: 'Carteira de Clientes',
        description: 'Gerencie a sua base de contatos, histórico e percepções de inteligência artificial.',
        schema: ClientFormSchema as any, // Zod para blindagem de payload

        // --- VISÃO MASTER (GRID DE CLIENTES) ---
        columns: [
            {
                header: 'Cliente / Contato Principal',
                accessor: (item) => (
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex-shrink-0">
                            <FaUserTie className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white tracking-tight">
                                {item.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                                {item.email || item.phone || 'Sem contato cadastrado'}
                            </span>
                        </div>
                    </div>
                )
            },
            {
                header: 'Documento',
                accessor: (item) => (
                    <span className="text-sm text-gray-400 font-mono">
                        {item.document || '-'}
                    </span>
                )
            },
            {
                header: 'Inteligência AI',
                accessor: (item) => (
                    item.aiSummary ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20" title="Perfil analisado pela IA">
                            <FaRobot /> Analisado
                        </span>
                    ) : (
                        <span className="text-[10px] text-gray-600 uppercase tracking-widest">Pendente</span>
                    )
                )
            },
            {
                header: 'Status',
                accessor: (item) => (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        item.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                        {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                )
            }
        ],

        // --- VISÃO DETAIL (O FORMULÁRIO DE CADASTRO/EDIÇÃO) ---
        fields: [
            // Agrupamento: Dados Principais
            { name: 'name', label: 'Nome Completo / Razão Social', type: 'text', placeholder: 'Ex: Stark Industries' },
            { name: 'document', label: 'CPF / CNPJ', type: 'text', placeholder: 'Apenas números' },
            
            // Agrupamento: Contato
            { name: 'email', label: 'E-mail Principal', type: 'text', placeholder: 'contato@empresa.com' },
            { name: 'phone', label: 'Telefone / WhatsApp', type: 'text', placeholder: '(11) 90000-0000' },
            
            // Agrupamento: Observações Humanas (HITL)
            { 
                name: 'userNotes', 
                label: 'Anotações Privadas (Opcional)', 
                type: 'textarea', 
                placeholder: 'Registre detalhes de negociação, preferências ou contexto do cliente...' 
            },

            // Controle de Acesso
            { name: 'isActive', label: 'Cliente Ativo (Permite Vendas)', type: 'boolean', trueLabel: 'Ativo', falseLabel: 'Inativo' }
        ],

        // --- VISÃO DE AUDITORIA (Gaveta Oculta no Fundo do Form) ---
        systemFields: [
            { name: 'id', label: 'UUID do Cliente', type: 'text' },
            // O Resumo da IA é readonly aqui. Só o motor de IA ou o backend alteram isso.
            { name: 'aiSummary', label: 'Resumo da Inteligência Artificial', type: 'textarea' },
            { name: 'createdAt', label: 'Data de Cadastro', type: 'text' },
            { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
        ]

    }), []);

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (Unindo Leitura e Escrita CQRS)
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