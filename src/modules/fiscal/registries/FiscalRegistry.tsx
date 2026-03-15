'use client';

import React from 'react';
import { CrudLayout } from '@/core/components/crud/CrudLayout';
import { CrudConfig } from '@/core/components/crud/types';
import { FaFileInvoiceDollar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Importação dos Contratos e Validações
import { ITaxGroup } from '../types';
import { UpdateFiscalGroupSchema, FiscalFormInput } from '../schemas/fiscalSchema';

// Importação dos Motores de Dados (Hooks)
import { useFiscal } from '../hooks/useFiscal';
import { useFiscalMutation } from '../hooks/useFiscalMutation';

// Importação do Inquilino Customizado (A Matriz Tributária)
import { TaxRuleManager } from '../components/TaxRuleManager';

/**
 * @component FiscalRegistry
 * @description O Ponto de Entrada (Entrypoint) do Módulo Fiscal.
 * Define como os dados serão exibidos no Grid e como o Formulário será montado.
 */
export function FiscalRegistry() {
    // 1. Instanciamos os motores de leitura e escrita
    const { taxGroups, isLoading: isReading, error: readError, refreshTaxGroups } = useFiscal();
    const { createTaxGroup, updateTaxGroup, deleteTaxGroup, isLoading: isWriting, error: writeError } = useFiscalMutation();

    // =========================================================================
    // ⚙️ CONFIGURAÇÃO CLASSE OURO (O Manual de Instruções do Motor V4)
    // =========================================================================
    const config: CrudConfig<ITaxGroup, FiscalFormInput> = {
        title: 'Grupos Fiscais',
        description: 'Gerencie os perfis de tributação e suas respectivas matrizes de regras estaduais (ICMS, PIS, COFINS).',
        
        // A Alfândega: Protege o envio de dados
        schema: UpdateFiscalGroupSchema,

        // --- COLUNAS DA TABELA (Visão Master) ---
        columns: [
            {
                header: 'Nome do Perfil',
                accessor: 'name'
            },
            {
                header: 'Qtd. de Regras',
                // Renderização Customizada Nível Ouro: Um badge mostrando quantas regras o grupo tem
                accessor: (item) => (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-800/50">
                        {item.rules?.length || 0} regra(s)
                    </span>
                )
            },
            {
                header: 'Status',
                // Renderização Customizada Visual para booleanos
                accessor: (item) => item.isActive ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <FaCheckCircle /> Ativo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <FaTimesCircle /> Inativo
                    </span>
                )
            }
        ],

        // --- CAMPOS DO FORMULÁRIO (A Impressora 3D) ---
        fields: [
            {
                name: 'name',
                label: 'Nome do Grupo Fiscal',
                type: 'text',
                placeholder: 'Ex: Revenda de Mercadorias (Simples Nacional)'
            },
            {
                name: 'description',
                label: 'Descrição / Observações',
                type: 'textarea',
                placeholder: 'Descreva em quais cenários este imposto deve ser aplicado...'
            },
            {
                name: 'isActive',
                label: 'Status do Grupo',
                type: 'boolean',
                trueLabel: 'Liberado para uso',
                falseLabel: 'Bloqueado (Inativo)'
            },
            // 💡 O PORTAL MÁGICO: A injeção da Matriz Tributária dentro do formulário linear
            {
                name: 'rules', // O nome exato que o Zod está esperando
                label: '', // Deixamos vazio pois o próprio Manager tem seu cabeçalho elegante
                type: 'custom',
                customRender: (formContext) => <TaxRuleManager formContext={formContext} />
            }
        ],

        // --- DADOS DE SISTEMA (Sanfona de Auditoria no final do form) ---
        systemFields: [
            { name: 'id', label: 'ID Único (UUID)', type: 'text' },
            { name: 'createdAt', label: 'Data de Criação', type: 'text' },
            { name: 'updatedAt', label: 'Última Atualização', type: 'text' }
        ]
    };

    // =========================================================================
    // 🔌 ROTEAMENTO DE AÇÕES (O Cabo de Rede)
    // =========================================================================
    return (
        <div className="h-full w-full animate-fade-in">
            <CrudLayout<ITaxGroup, FiscalFormInput>
                config={config}
                hooks={{
                    data: taxGroups,
                    // O loading geral é a união da leitura com a escrita
                    isLoading: isReading || isWriting,
                    // Exibe o erro de quem falhou primeiro
                    error: writeError || readError,
                    onCreate: async (data) => {
                        await createTaxGroup(data as any);
                    },
                    onUpdate: async (id, data) => {
                        await updateTaxGroup(id, data as any);
                    },
                    onDelete: async (id) => {
                        await deleteTaxGroup(id);
                    },
                    onRefresh: refreshTaxGroups
                }}
            />
        </div>
    );
}