import React from 'react';
// Importação relativa subindo até 'src' para acessar 'modules'
import { MovementForm } from '@/modules/inventory/components/forms/MovementForm';

interface Props {
    params: {
        tenantId: string;
    };
    searchParams: {
        variantId?: string; // Captura ?variantId=... da URL opcionalmente
    };
}

/**
 * Rota: /dashboard/inventory/movements/create
 * Responsabilidade: Página dedicada para registro manual de movimentações de estoque.
 * Funcionalidade Extra: Aceita 'variantId' via URL para pré-preencher o produto.
 */
export default function CreateMovementPage({ params, searchParams }: Props) {
    return (
        <main className="flex-1 w-full h-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb de Navegação */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <span>Inventário</span>
                    <span className="mx-2">/</span>
                    <span>Movimentações</span>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">Nova Transação</span>
                </div>

                {/* Renderiza o Formulário Inteligente.
                  Repassa o tenantId e o variantId (se existir na URL) para o componente.
                */}
                <MovementForm 
                    tenantId={params.tenantId} 
                    preSelectedVariantId={searchParams.variantId}
                />
            </div>
        </main>
    );
}