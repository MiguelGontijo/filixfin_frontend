'use client';

import React from 'react';
import { 
    FaChartLine, 
    FaHandshake, 
    FaUserSlash, 
    FaPercentage, 
    FaMoneyBillWave,
    FaSyncAlt,
    FaRocket
} from 'react-icons/fa';

// --- Mundo 2: Aplicação (Hooks de Elite) ---
import { useCRMSummary } from '../../application/hooks/useCRMSummary';

/**
 * ============================================================================
 * 📊 VIEW: CRMDashboardView (The Sales Control Tower)
 * @description Interface de Business Intelligence para monitoramento de KPIs 
 * globais do CRM. Consome o hook useCRMSummary para renderização reativa.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Visual Hierarchy: Prioriza os KPIs financeiros (VGV) no topo, seguidos 
 * pela eficiência operacional (Conversão e Ticket Médio).
 * 2. Skeleton States: Implementa estados de carregamento elegantes que 
 * respeitam o layout, evitando saltos de interface (Layout Shift).
 * 3. Atomic Consistency: Utiliza sub-componentes internos (AnalyticCard) para 
 * manter a uniformidade estética e facilitar futuras manutenções.
 * ============================================================================
 */
export const CRMDashboardView: React.FC = () => {
    
    const { summary, isLoading, error, refreshSummary } = useCRMSummary();

    // Formatador de Moeda Padrão Brasileiro (BRL)
    const formatBRL = (val: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // ========================================================================
    // 🛡️ ESTADO DE ERRO: Blindagem de UI
    // ========================================================================
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-500/5 rounded-3xl border border-red-500/20 animate-fade-in">
                <span className="text-red-400 font-bold text-sm">{error}</span>
                <button 
                    onClick={refreshSummary}
                    className="mt-4 text-xs font-black uppercase tracking-widest text-white bg-red-500/20 px-4 py-2 rounded-lg hover:bg-red-500/40 transition-all"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-8 animate-fade-in h-full overflow-y-auto no-scrollbar pb-10">
            
            {/* --- CABEÇALHO DA VIEW (Ações de Refresh) --- */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-gray-400 uppercase tracking-[0.2em]">
                    Performance Analytics
                </h2>
                <button 
                    onClick={refreshSummary}
                    disabled={isLoading}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-gray-800 text-gray-500 hover:text-white hover:border-gray-600 transition-all ${isLoading ? 'animate-pulse' : ''}`}
                >
                    <FaSyncAlt className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Sincronizando...' : 'Atualizar Dados'}
                </button>
            </div>

            {/* --- GRID DE KPIS (O Coração do Dashboard) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. PIPELINE (Dinheiro na Mesa) */}
                <AnalyticCard 
                    title="Pipeline Aberto"
                    value={formatBRL(summary?.pipeline.totalValue || 0)}
                    subtitle={`${summary?.pipeline.count || 0} Oportunidades Ativas`}
                    icon={<FaChartLine />}
                    color="text-accent-secondary"
                    isLoading={isLoading}
                />

                {/* 2. CONVERTIDO (Faturamento Real) */}
                <AnalyticCard 
                    title="Vgv Convertido"
                    value={formatBRL(summary?.won.totalValue || 0)}
                    subtitle={`${summary?.won.count || 0} Deals Ganhas`}
                    icon={<FaHandshake />}
                    color="text-emerald-400"
                    isLoading={isLoading}
                />

                {/* 3. TAXA DE CONVERSÃO (Eficiência) */}
                <AnalyticCard 
                    title="Taxa de Conversão"
                    value={`${summary?.kpis.conversionRatePercentage || 0}%`}
                    subtitle={`Perda: ${summary?.lost.count || 0} Negócios`}
                    icon={<FaPercentage />}
                    color="text-blue-400"
                    isLoading={isLoading}
                />

                {/* 4. TICKET MÉDIO (Qualidade do Deal) */}
                <AnalyticCard 
                    title="Ticket Médio"
                    value={formatBRL(summary?.kpis.averageTicketValue || 0)}
                    subtitle="Média por Contrato"
                    icon={<FaMoneyBillWave />}
                    color="text-amber-400"
                    isLoading={isLoading}
                />

            </div>

            {/* 💡 ESPAÇO PARA GRÁFICOS E IA (Futuras Implementações) */}
            <div className="flex-1 min-h-[300px] flex items-center justify-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
                <div className="text-center opacity-30 group cursor-default">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform duration-500">
                        <FaRocket className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">
                        Work in Progress: Gráficos de Evolução
                    </span>
                </div>
            </div>

        </div>
    );
};

/**
 * ============================================================================
 * 🧊 SUB-COMPONENTE: AnalyticCard
 * @description Card de métrica padronizado com suporte a Skeleton.
 * ============================================================================
 */
const AnalyticCard: React.FC<{
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    isLoading: boolean;
}> = ({ title, value, subtitle, icon, color, isLoading }) => (
    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-[2rem] hover:border-gray-700 transition-all group relative overflow-hidden shadow-2xl">
        {/* Glow Effect (Sutil) */}
        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 transition-opacity group-hover:opacity-20 ${color.replace('text', 'bg')}`} />
        
        <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-none">
                {title}
            </span>
            <div className={`text-lg opacity-50 group-hover:opacity-100 transition-opacity ${color}`}>
                {icon}
            </div>
        </div>

        {isLoading ? (
            <div className="space-y-3">
                <div className="h-8 w-2/3 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-800/50 rounded animate-pulse" />
            </div>
        ) : (
            <div className="flex flex-col">
                <span className="text-2xl font-black text-white tracking-tight">
                    {value}
                </span>
                <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-tight">
                    {subtitle}
                </span>
            </div>
        )}
    </div>
);