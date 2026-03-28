import React, { useMemo } from 'react';
import { FaChartLine, FaCoins, FaBullseye } from 'react-icons/fa';

// --- Mundo 2: Domínio (CRM) ---
import { CRMDeal } from '../../../domain/types';

/**
 * @interface KanbanFooterProps
 * @description Contrato de propriedades para o painel de métricas financeiras do Kanban.
 */
interface KanbanFooterProps {
    /** Lista de todas as oportunidades visíveis no funil atual */
    deals: CRMDeal[];
}

/**
 * ============================================================================
 * 📊 COMPONENTE: KanbanFooter
 * @description Painel de inteligência financeira ancorado na base do Kanban. 
 * Realiza cálculos agregados em tempo real sobre o pipeline ativo.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * 1. Computational Efficiency: Utiliza 'useMemo' para garantir que os cálculos 
 * matemáticos de soma e ponderação não onerem o ciclo de renderização do board.
 * 2. Financial Precision: Implementa o cálculo de 'Valor Ponderado' (Previsão Real), 
 * multiplicando o valor de cada deal por sua probabilidade de fechamento.
 * 3. Visual Gravity: Mantém um design sóbrio e informativo, utilizando a 
 * paleta metálica para não distrair o usuário da operação principal.
 * ============================================================================
 */
export const KanbanFooter: React.FC<KanbanFooterProps> = ({ deals }) => {
    
    // Motor Matemático: Calcula os totais do Pipeline
    const stats = useMemo(() => {
        return deals.reduce((acc, deal) => {
            const val = Number(deal.value) || 0;
            const prob = (deal.probability || 0) / 100;
            
            return {
                totalValue: acc.totalValue + val,
                weightedValue: acc.weightedValue + (val * prob),
                count: acc.count + 1
            };
        }, { totalValue: 0, weightedValue: 0, count: 0 });
    }, [deals]);

    // Formatador de Moeda Padrão Brasileiro (BRL)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            notation: value > 1000000 ? 'compact' : 'standard'
        }).format(value);
    };

    return (
        <div className="mt-auto border-t border-gray-800 bg-gray-900/80 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-6 animate-fade-in-up">
            
            {/* --- MÉTRICA 1: VALOR TOTAL BRUTO (Pipeline VGV) --- */}
            <div className="flex items-center gap-3 group">
                <div className="p-2.5 bg-gray-800 rounded-xl border border-gray-700 text-green-500 shadow-inner group-hover:border-green-500/30 transition-all">
                    <FaCoins className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">VGV Total</span>
                    <span className="text-sm font-black text-gray-200 mt-1">
                        {formatCurrency(stats.totalValue)}
                    </span>
                </div>
            </div>

            {/* --- MÉTRICA 2: VALOR PONDERADO (Previsão Realista) --- */}
            <div className="flex items-center gap-3 group">
                <div className="p-2.5 bg-gray-800 rounded-xl border border-gray-700 text-accent-secondary shadow-inner group-hover:border-accent-secondary/30 transition-all">
                    <FaBullseye className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Previsão Realista</span>
                    <span className="text-sm font-black text-accent-secondary mt-1">
                        {formatCurrency(stats.weightedValue)}
                    </span>
                </div>
            </div>

            {/* --- MÉTRICA 3: PERFORMANCE DO FUNIL --- */}
            <div className="flex items-center gap-3 group ml-auto">
                <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Densidade</span>
                    <span className="text-xs font-bold text-gray-400 mt-1">
                        {stats.count} Negócios Ativos
                    </span>
                </div>
                <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary">
                    <FaChartLine className="w-4 h-4" />
                </div>
            </div>

        </div>
    );
};