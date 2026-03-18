import React, { useMemo } from 'react';
import { FaUserTie, FaRobot } from 'react-icons/fa';

// --- Tipagens do Motor V4 ---
import { CrudConfig } from '@/core/components/crud/types';

// --- Tipos e Schemas do Domínio de Cliente ---
import { Client } from '../types/client';
import { ClientFormSchema, ClientFormInput } from '../schemas/clientSchema';

/**
 * ============================================================================
 * 📐 HOOK: useClientConfig (O Manual de Instruções do Cliente)
 * @description Centraliza o dicionário de dados (Data-Driven UI) da entidade Cliente.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (SOLID e DRY):
 * - Ao isolar o Config em um Hook, permitimos que a mesma estrutura visual seja
 * consumida pela Tela de Listagem (ClientRegistry) e pelo Cockpit V4 Avançado,
 * sem duplicar uma única linha de código.
 * ============================================================================
 */
export function useClientConfig(): CrudConfig<Client, ClientFormInput> {
    
    // O useMemo previne que o objeto de configuração seja recriado a cada renderização,
    // garantindo performance máxima de 60FPS no motor CrudForm.
    return useMemo(() => ({
        title: 'Carteira de Clientes',
        description: 'Gerencie a sua base de contatos, histórico e percepções de inteligência artificial.',
        
        // Zod atuando como o Guardião do Payload
        schema: ClientFormSchema as any, 

        // ====================================================================
        // 👁️ VISÃO MASTER (Colunas para Tabelas e Grids)
        // ====================================================================
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

        // ====================================================================
        // 📝 VISÃO DETAIL (O Mapa do Formulário CrudForm V4)
        // ====================================================================
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

        // ====================================================================
        // 🗄️ VISÃO DE AUDITORIA (Gaveta Oculta de Sistema)
        // ====================================================================
        systemFields: [
            { name: 'id', label: 'UUID do Cliente', type: 'text' },
            // O Resumo da IA é readonly visualmente via Motor V4
            { name: 'aiSummary', label: 'Resumo da Inteligência Artificial', type: 'textarea' },
            { name: 'createdAt', label: 'Data de Cadastro', type: 'text' },
            { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
        ]

    }), []); // Array de dependências vazio, pois a estrutura do cliente não depende de listas externas
}