// src/features/crm/presentation/CRMWorkstation.tsx

import React from 'react';
import { FaWhatsapp, FaTelegram, FaPaperPlane } from 'react-icons/fa';

// --- COMPONENTES ---
import { ClientListWidget } from '@/features/crm/components/client-widget/ClientListWidget';
import { AIInputWidget } from '@/features/crm/components/ai-widget/AIInputWidget';
import { AnalysisActionCard } from '@/features/crm/components/AnalysisActionCard';
import { ClientDashboard, DashboardMode } from '@/features/crm/components/client-dashboard/ClientDashboard';
import { WhatsAppWidget } from '@/features/crm/components/communication/WhatsAppWidget';

// --- TIPOS ---
import { Client } from '@/core/types/client';
import { InteractionAnalysis } from '@/features/crm/types';

/**
 * Interface de Props: Tudo que a View precisa para renderizar
 */
interface CRMWorkstationProps {
    // Estados de Dados
    contextClient: Client | null;
    dashboardMode: DashboardMode;
    refreshListTrigger: number;
    
    // Estados de IA
    aiInputText: string;
    isAnalyzing: boolean;
    analysisResult: InteractionAnalysis | null;
    aiError: string | null;
    originalText: string;

    // Estados de UI
    activeChatTab: 'WA' | 'TG';

    // Handlers (Ações)
    onAiInputChange: (text: string) => void;
    onAnalyzeRequest: (text: string) => void;
    onClearAnalysis: () => void;
    onAnalysisSuccess: () => void;
    
    onSelectClient: (client: Client | null) => void;
    onOpenNewClient: () => void;
    onOpenEditClient: (client: Client) => void;
    onModeChange: (mode: DashboardMode) => void;
    onUpdateSuccess: () => void;
    
    onTabChange: (tab: 'WA' | 'TG') => void;
}

export const CRMWorkstation: React.FC<CRMWorkstationProps> = ({
    // Desestruturação das props para uso no JSX
    contextClient, dashboardMode, refreshListTrigger,
    aiInputText, isAnalyzing, analysisResult, aiError, originalText,
    activeChatTab,
    onAiInputChange, onAnalyzeRequest, onClearAnalysis, onAnalysisSuccess,
    onSelectClient, onOpenNewClient, onOpenEditClient, onModeChange, onUpdateSuccess,
    onTabChange
}) => {
    return (
        <div className="h-full w-full">
            
            <div className="grid grid-cols-12 gap-2 h-full">
                {/* ================================================================
                  COLUNA 1 (ESQUERDA): GESTÃO & INPUT
                  Span: 3
                  ================================================================*/}
                <div className="col-span-3 flex flex-col gap-1 h-full">
                    
                    {/* 1.1 Lista de Clientes */}
                    <div className="flex-1 min-h-0 overflow-hidden rounded-xl shadow-lg border border-gray-700 bg-base-metallic">
                        <ClientListWidget 
                            onSelectClient={onSelectClient} 
                            refreshTrigger={refreshListTrigger}
                            onNewClient={onOpenNewClient}
                            onEditClient={onOpenEditClient}
                        />
                    </div>

                    {/* 1.2 Console de IA */}
                    <div className="h-64 flex-shrink-0 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
                        <AIInputWidget 
                            value={aiInputText}
                            onChange={onAiInputChange}
                            onAnalyze={onAnalyzeRequest}
                            isAnalyzing={isAnalyzing}
                        />
                    </div>
                </div>

                {/* ================================================================
                  COLUNA 2 (CENTRO): O PALCO (DASHBOARD UNIFICADO)
                  Span: 6
                  ================================================================*/}
                <div className="col-span-6 h-full flex flex-col gap-4">
                    
                    {/* ÁREA DE ERRO (GLOBAL DA IA) */}
                    {aiError && (
                        <div className="bg-red-900/40 border border-red-500/50 p-3 rounded-lg text-sm text-red-200 flex items-center justify-between animate-fade-in">
                            <span><strong>Erro na IA:</strong> {aiError}</span>
                            <button onClick={onClearAnalysis} className="text-xs underline hover:text-white">Fechar</button>
                        </div>
                    )}

                    {/* CONTEÚDO DINÂMICO */}
                    {analysisResult ? (
                        // MODO AÇÃO IA
                        <div className="flex-1 overflow-y-auto pr-1">
                            <AnalysisActionCard 
                                analysis={analysisResult}
                                content={originalText}
                                contextClient={contextClient}
                                onSuccess={onAnalysisSuccess}
                            />
                        </div>
                    ) : (
                        // MODO DASHBOARD
                        <div className="flex-1 h-full">
                            <ClientDashboard 
                                client={contextClient}
                                mode={dashboardMode} 
                                onModeChange={onModeChange} 
                                onUpdateSuccess={onUpdateSuccess} 
                            />
                        </div>
                    )}
                </div>

                {/* ================================================================
                  COLUNA 3 (DIREITA): COMUNICAÇÃO (OMNICHANNEL)
                  Span: 3
                  ================================================================*/}
                <div className="col-span-3 bg-base-metallic rounded-xl border border-gray-700 flex flex-col overflow-hidden shadow-lg h-full">
                    
                    {/* Header de Abas */}
                    <div className="flex border-b border-gray-700 bg-gray-800">
                        <button 
                            onClick={() => onTabChange('WA')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'WA' ? 'bg-green-900/20 text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'}`}
                        >
                            <FaWhatsapp className="w-4 h-4" /> <span>WhatsApp</span>
                        </button>
                        <button 
                            onClick={() => onTabChange('TG')}
                            className={`flex-1 py-3 text-xs font-bold flex items-center justify-center space-x-2 transition ${activeChatTab === 'TG' ? 'bg-blue-900/20 text-blue-400 border-b-2 border-blue-400' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'}`}
                        >
                            <FaTelegram className="w-4 h-4" /> <span>Telegram</span>
                        </button>
                    </div>

                    {/* Área de Chat */}
                    <div className="flex-1 overflow-hidden relative bg-gray-900/50">
                        {activeChatTab === 'WA' ? (
                            <WhatsAppWidget />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-60 p-4">
                                <FaTelegram className="w-12 h-12 mb-3" />
                                <p className="text-xs text-center">Integração com Telegram em desenvolvimento.</p>
                            </div>
                        )}
                    </div>

                    {/* Input de Chat */}
                    <div className="p-3 border-t border-gray-700 bg-gray-800">
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" 
                                placeholder={contextClient ? `Mensagem para ${contextClient.name.split(' ')[0]}...` : "Selecione um cliente..."}
                                className="flex-1 bg-gray-900 text-xs text-white px-3 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 disabled:opacity-50"
                                disabled={!contextClient}
                            />
                            <button className="p-2.5 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed hover:bg-gray-600 disabled:opacity-50">
                                <FaPaperPlane className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};