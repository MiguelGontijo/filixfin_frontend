'use client';

import React, { useMemo } from 'react';
import { FaUserTie, FaRobot, FaUser } from 'react-icons/fa';

// --- Tipagens do Motor V4 ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Tipos e Schemas do Domínio de Cliente ---
import { Client } from '../domain/types/client';
import { ClientFormSchema, ClientFormInput } from '../domain/schemas/clientSchema';

/**
 * ============================================================================
 * 📐 HOOK: useClientConfig (O Manual de Instruções do Cliente - V4 Ready)
 * @description Centraliza o dicionário de dados (Data-Driven UI) da entidade Cliente.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. SmartSwitch Integration: Define labels semânticas para ativação da UI cinética.
 * 2. Visual Identity: Injeta o ícone FaUser nativamente para coerência no Master Data.
 * 3. Polymorphic Efficiency: Otimizado via useMemo para sustentar o motor de 
 * busca profunda sem degradação de performance.
 * ============================================================================
 */
export function useClientConfig(isCompact: boolean = false): CrudConfig<Client, ClientFormInput> {
    
    return useMemo(() => ({
        // Identidade Visual e Títulos
        title: isCompact ? 'Clientes' : 'Carteira de Clientes',
        description: isCompact ? '' : 'Gerencie sua base de contatos, histórico e percepções de inteligência artificial.',
        icon: <FaUser className="text-accent-primary" />,
        
        // Guardião do Contrato de Dados
        schema: ClientFormSchema as any, 

        // ====================================================================
        // 👁️ VISÃO MASTER (A Vitrine de Clientes)
        // ====================================================================
        columns: [
            {
                header: 'Cliente / Contato Principal',
                accessor: (item) => (
                    <div className="flex items-center gap-3">
                        {/* <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-accent-primary/10 text-accent-primary flex-shrink-0">
                            <FaUserTie className="w-4 h-4" />
                        </div> */}
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

        // ====================================================================
        // 🃏 VISÃO COMPACTA (Cards para Barra Lateral)
        // ====================================================================
        cardConfig: {
            title: (item) => item.name,
            subtitle: (item) => (
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-gray-500 truncate">
                        {item.email || item.phone || 'Sem contato'}
                    </span>
                </div>
            ),
            avatar: () => (
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-accent-primary/10 text-accent-primary flex-shrink-0">
                    <FaUserTie className="w-3.5 h-3.5" />
                </div>
            ),
            badge: (item) => ({
                text: item.isActive ? 'Ativo' : 'Inativo',
                variant: item.isActive ? 'success' : 'danger'
            })
        },

        // ====================================================================
        // 📝 VISÃO DETAIL (O Mapa do Formulário CrudForm V4)
        // ====================================================================
        fields: [
            { name: 'name', label: 'Nome Completo / Razão Social', type: 'text', placeholder: 'Ex: Stark Industries' },
            { name: 'document', label: 'CPF / CNPJ', type: 'text', placeholder: 'Apenas números' },
            { name: 'email', label: 'E-mail Principal', type: 'text', placeholder: 'contato@empresa.com' },
            { name: 'phone', label: 'Telefone / WhatsApp', type: 'text', placeholder: '(11) 90000-0000' },
            { 
                name: 'userNotes', 
                label: 'Anotações Privadas (Opcional)', 
                type: 'textarea', 
                placeholder: 'Registre detalhes de negociação, preferências ou contexto do cliente...' 
            },

            /** 🔘 EVOLUÇÃO: Ativação do SmartSwitch 
             * Ao definir trueLabel e falseLabel, a CrudFieldFactory injetará 
             * automaticamente o componente cinético com as cores do sistema.
             */
            { 
                name: 'isActive', 
                label: 'Status do Cliente', 
                type: 'boolean', 
                trueLabel: 'Ativo', 
                falseLabel: 'Inativo' 
            }
        ],

        // ====================================================================
        // 🗄️ VISÃO DE AUDITORIA (Gaveta de Sistema)
        // ====================================================================
        systemFields: [
            { name: 'id', label: 'UUID do Cliente', type: 'text' },
            { name: 'aiSummary', label: 'Resumo da Inteligência Artificial', type: 'textarea' },
            { name: 'createdAt', label: 'Data de Cadastro', type: 'text' },
            { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
        ]

    }), [isCompact]);
}