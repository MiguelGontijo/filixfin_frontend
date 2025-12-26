// src/modules/products/components/tabs/OverviewTab.tsx
import React from 'react';

export function OverviewTab() {
    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- SEÇÃO 1: KPIs (Indicadores Chave) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Valuation (Valor em Estoque) */}
                <div className="bg-base-metallic p-6 rounded-lg shadow-lg border border-gray-700 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Valor Total em Estoque</p>
                        <h3 className="text-2xl font-bold text-base-text mt-1">R$ 142.350,00</h3>
                        <div className="flex items-center mt-2 text-sm">
                            <span className="text-emerald-400 font-medium flex items-center">
                                {/* Ícone de Seta pra Cima (SVG Inline) */}
                                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                +12.5%
                            </span>
                            <span className="text-gray-500 ml-2">vs. mês passado</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-full">
                        {/* Ícone Dollar/Money */}
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Card 2: Alertas de Estoque Baixo */}
                <div className="bg-base-metallic p-6 rounded-lg shadow-lg border border-gray-700 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Itens Abaixo do Mínimo</p>
                        <h3 className="text-2xl font-bold text-base-text mt-1">8 Produtos</h3>
                        <div className="flex items-center mt-2 text-sm">
                            <span className="text-rose-400 font-medium flex items-center">
                                Precisa de Reposição
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-rose-500/10 rounded-full">
                        {/* Ícone Alert */}
                        <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                {/* Card 3: Giro de Estoque (Movimentações Hoje) */}
                <div className="bg-base-metallic p-6 rounded-lg shadow-lg border border-gray-700 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-400">Movimentações Hoje</p>
                        <h3 className="text-2xl font-bold text-base-text mt-1">24 Transações</h3>
                        <div className="flex items-center mt-2 text-sm">
                            <span className="text-gray-400">
                                14 Entradas / 10 Saídas
                            </span>
                        </div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-full">
                        {/* Ícone Exchange */}
                        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* --- SEÇÃO 2: Gráficos e Listas --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Coluna Maior: Gráfico de Evolução */}
                <div className="lg:col-span-2 bg-base-metallic p-6 rounded-lg shadow-lg border border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="font-semibold text-base-text">Fluxo de Estoque (30 dias)</h4>
                        <select className="text-sm border-gray-600 bg-gray-900 rounded-md text-gray-300 shadow-sm focus:border-accent-primary focus:ring-accent-primary">
                            <option>Últimos 30 dias</option>
                            <option>Últimos 90 dias</option>
                        </select>
                    </div>
                    
                    {/* Placeholder do Gráfico */}
                    <div className="h-64 flex items-center justify-center bg-gray-900 rounded border border-dashed border-gray-700">
                        <div className="text-center text-gray-500">
                            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                            <span className="text-sm">Gráfico de Entradas vs. Saídas será renderizado aqui</span>
                        </div>
                    </div>
                </div>

                {/* Coluna Menor: Últimas Atividades ou Top Produtos */}
                <div className="bg-base-metallic p-6 rounded-lg shadow-lg border border-gray-700">
                    <h4 className="font-semibold text-base-text mb-4">Atenção Necessária</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-700 last:border-0">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center mr-3 border border-gray-600">
                                        <span className="text-xs font-bold text-gray-400">IMG</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-base-text">Coca-Cola 2L</p>
                                        <p className="text-xs text-rose-400 font-semibold">Estoque: 2 un</p>
                                    </div>
                                </div>
                                <button className="text-xs text-accent-primary hover:text-orange-400 font-medium">
                                    Repor
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-sm text-gray-300 border border-gray-600 rounded hover:bg-gray-700 transition-colors">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>
        </div>
    );
}