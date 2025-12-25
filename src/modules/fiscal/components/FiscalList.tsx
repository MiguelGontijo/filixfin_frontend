'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaPlus, FaBalanceScale } from 'react-icons/fa';

// Importação dos Hooks (serão criados nos próximos passos)
import { useFiscal } from '../hooks/useFiscal';
import { useFiscalMutation } from '../hooks/useFiscalMutation';

// Importação do Componente Visual
import { FiscalListGrid } from './FiscalListGrid';

/**
 * Container Principal da Listagem Fiscal.
 * * Tipo: Smart Component.
 * * Responsabilidade:
 * - Gerenciar o estado da tela (Loading, Erro).
 * - Chamar os Hooks de API (useFiscal, useFiscalMutation).
 * - Renderizar o Cabeçalho e passar dados para o Grid.
 */
export function FiscalList() {
    // 1. Contexto
    const params = useParams();
    const tenantId = params.tenantId as string;

    // 2. Hooks de Dados e Mutação
    const { fiscalGroups, isLoading, error, refreshFiscalGroups } = useFiscal();
    const { deleteFiscalGroup } = useFiscalMutation();

    // 3. Efeitos (Busca inicial)
    useEffect(() => {
        refreshFiscalGroups();
    }, [refreshFiscalGroups]);

    // 4. Handlers
    const handleDelete = async (id: string) => {
        // Confirmação nativa para evitar dependências extras
        if (!window.confirm('Tem certeza que deseja remover este grupo fiscal? Isso pode afetar produtos vinculados.')) return;
        
        const success = await deleteFiscalGroup(id);
        if (success) {
            await refreshFiscalGroups();
        }
    };

    return (
        <div className="w-full space-y-6 p-6 animate-fade-in">
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-metallic p-4 rounded-lg border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-800 rounded-lg text-accent-primary border border-gray-700">
                        <FaBalanceScale className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Grupos Fiscais
                        </h1>
                        <p className="text-sm text-gray-400">
                            Configure regras de tributação (NCM, ICMS) para seus produtos
                        </p>
                    </div>
                </div>

                {/* Botão de Criação (Navega para rota create) */}
                <Link href={`/${tenantId}/dashboard/fiscal/create`}>
                    <button className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-base-dark font-bold py-2.5 px-5 rounded-md transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <FaPlus />
                        <span>Novo Grupo Fiscal</span>
                    </button>
                </Link>
            </div>

            {/* Tratamento de Erro Visual */}
            {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm flex items-center gap-2">
                    <span>⚠️</span>
                    {error}
                </div>
            )}

            {/* Renderização do Grid (Pure Component) */}
            <FiscalListGrid
                fiscalGroups={fiscalGroups}
                isLoading={isLoading}
                onDelete={handleDelete}
                tenantId={tenantId}
            />
        </div>
    );
}