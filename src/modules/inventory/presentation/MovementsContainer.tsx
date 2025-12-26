// src/modules/inventory/presentation/MovementsContainer.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { MovementsList } from '../components/MovementsList';

/**
 * @component MovementsContainer
 * @description Container de Apresentação (Smart Component) para a tela de Movimentações.
 * Gerencia o layout, cabeçalhos e navegação.
 * ESTILO: Dark/Metallic (CRM Style).
 */
export const MovementsContainer: React.FC = () => {
    // Recupera o ID do tenant da URL para construir os links de navegação
    const params = useParams();
    const tenantId = params?.tenantId as string;

    return (
        // Alterado: bg-gray-50 -> bg-gray-900 (Dark Background)
        <div className="flex flex-col h-full bg-gray-900 p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto w-full space-y-6">
                
                {/* --- Header da Página --- */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-down">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link 
                                href={`/${tenantId}/dashboard/supply-chain`}
                                // Alterado: Cores do botão voltar para Dark Mode
                                className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
                                title="Voltar para Supply Chain"
                            >
                                <FaArrowLeft className="w-4 h-4" />
                            </Link>
                            {/* Alterado: text-gray-800 -> text-white */}
                            <h1 className="text-2xl font-bold text-white tracking-tight">
                                Movimentações de Estoque
                            </h1>
                        </div>
                        {/* Alterado: text-gray-500 -> text-gray-400 */}
                        <p className="text-gray-400 text-sm ml-9">
                            Visão global de entradas, saídas e auditoria (Kardex).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/${tenantId}/dashboard/inventory/movements/create`}
                            className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-accent-primary/20 hover:shadow-accent-primary/40 active:scale-95"
                        >
                            <FaPlus className="w-4 h-4" />
                            <span>Nova Movimentação</span>
                        </Link>
                    </div>
                </header>

                {/* --- Área Principal (Lista) --- */}
                {/* Alterado: Removido bg-white e border para evitar "caixa branca" atrás da tabela.
                    A tabela (MovementsList) já tem seu próprio card estilizado.
                    Tornamos este wrapper transparente.
                */}
                <section className="bg-transparent rounded-xl overflow-hidden animate-fade-in">
                    <MovementsList />
                </section>

            </div>
        </div>
    );
};