// src/features/crm/components/client-dashboard/InteractionTimeline.tsx

import React, { useState } from 'react';
import { 
    FaStickyNote, FaMicrophone, FaEnvelope, FaHandshake, 
    FaClock, FaSmile, FaFrown, FaMeh, FaExclamationTriangle, FaSync,
    FaChevronDown, FaChevronUp 
} from 'react-icons/fa';
import { useClientTimeline } from '../../hooks/useClientTimeline';
import { InteractionType, CRMInteraction } from '../../types';

interface InteractionTimelineProps {
    clientId: string;
}

// --- SUB-COMPONENTE: ITEM INDIVIDUAL DA TIMELINE ---
// Extraído para gerenciar seu próprio estado de expansão
const TimelineItem: React.FC<{ item: CRMInteraction }> = ({ item }) => {
    
    const [isExpanded, setIsExpanded] = useState(false);

    // Helpers Visuais (Movidos para dentro ou mantidos fora se puros)
    const getIconByType = (type: InteractionType) => {
        switch (type) {
            case InteractionType.AUDIO: return <FaMicrophone className="text-blue-400" />;
            case InteractionType.EMAIL: return <FaEnvelope className="text-purple-400" />;
            case InteractionType.MEETING: return <FaHandshake className="text-orange-400" />;
            case InteractionType.NOTE: default: return <FaStickyNote className="text-gray-400" />;
        }
    };

    const getSentimentIcon = (sentiment?: string) => {
        switch (sentiment) {
            case 'POSITIVE': return <FaSmile className="text-green-500" title="Positivo" />;
            case 'NEGATIVE': return <FaFrown className="text-red-500" title="Negativo" />;
            case 'TENSE': return <FaExclamationTriangle className="text-orange-500" title="Tenso" />;
            case 'NEUTRAL': default: return <FaMeh className="text-gray-500" title="Neutro" />;
        }
    };

    const getSentimentBorder = (sentiment?: string) => {
        switch (sentiment) {
            case 'POSITIVE': return 'border-l-green-500';
            case 'NEGATIVE': return 'border-l-red-500';
            case 'TENSE': return 'border-l-orange-500';
            default: return 'border-l-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // PROTEÇÃO: Garante que content nunca seja null/undefined
    const safeContent = item.content || ""; 
    const isLongText = safeContent.length > 180 || safeContent.split('\n').length > 3;

    return (
        <div className="relative pl-6 group">
            
            {/* Bolinha da Linha do Tempo */}
            <div className="absolute left-0 top-1 w-4 h-4 bg-gray-800 border-2 border-gray-600 rounded-full group-hover:border-accent-primary group-hover:scale-110 transition-all z-10"></div>

            {/* Card da Interação (Clicável para expandir) */}
            <div 
                onClick={() => isLongText && setIsExpanded(!isExpanded)}
                className={`bg-gray-800/50 rounded-lg border border-gray-700/50 p-3 shadow-sm transition-all duration-300 border-l-4 ${getSentimentBorder(item.aiAnalysis?.sentiment)} ${isLongText ? 'cursor-pointer hover:bg-gray-800 hover:shadow-md' : ''}`}
            >
                
                {/* Header do Item */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-gray-700 rounded-md">
                            {getIconByType(item.type)}
                        </div>
                        <div>
                            <span className="text-xs font-bold text-white block uppercase tracking-wider">
                                {item.type}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                    </div>
                    
                    {/* Ícone de Sentimento */}
                    {item.aiAnalysis && (
                        <div className="bg-gray-900 p-1 rounded-full">
                            {getSentimentIcon(item.aiAnalysis.sentiment)}
                        </div>
                    )}
                </div>

                {/* Conteúdo com Clamp & Expand */}
                <div className="relative">
                    <p className={`text-sm text-gray-300 whitespace-pre-wrap leading-relaxed transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {item.content}
                    </p>
                    
                    {/* Botão Ler Mais (Só aparece se for longo e não estiver expandido) */}
                    {isLongText && !isExpanded && (
                        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-gray-800/90 to-transparent flex items-end justify-center pointer-events-none">
                            <span className="text-[10px] text-accent-primary font-bold flex items-center bg-gray-800/80 px-2 rounded">
                                Ler mais <FaChevronDown className="ml-1" />
                            </span>
                        </div>
                    )}
                </div>

                {/* Botão Ler Menos (Opcional, ou clicar no card para fechar) */}
                {isLongText && isExpanded && (
                    <div className="mt-2 flex justify-center border-t border-gray-700/30 pt-1">
                         <span className="text-[10px] text-gray-500 flex items-center hover:text-white transition">
                            <FaChevronUp className="mr-1" /> Recolher
                        </span>
                    </div>
                )}

                {/* Tags (Sempre visíveis se houver) */}
                {item.aiAnalysis?.tags && item.aiAnalysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-700/50">
                        {item.aiAnalysis.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-700 text-gray-400 text-[10px] rounded-full">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const InteractionTimeline: React.FC<InteractionTimelineProps> = ({ clientId }) => {
    
    const { interactions, isLoading, error, refreshTimeline } = useClientTimeline(clientId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                <FaSync className="animate-spin w-6 h-6 text-accent-secondary" />
                <span className="text-xs">Carregando histórico...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-xs text-red-400 bg-red-900/10 rounded-lg">
                <p>{error}</p>
                <button onClick={() => refreshTimeline()} className="mt-2 underline hover:text-white">Tentar novamente</button>
            </div>
        );
    }

    if (interactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-60">
                <FaClock className="w-10 h-10 mb-2" />
                <p className="text-sm">Nenhuma interação registrada.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-4 space-y-6 py-2 animate-fade-in custom-scrollbar pr-2">
            
            {/* Linha Vertical Conectora */}
            <div className="absolute left-2 top-4 bottom-4 w-0.5 bg-gray-700 pointer-events-none"></div>

            {interactions.map((item) => (
                <TimelineItem key={item.id} item={item} />
            ))}
            
            {/* Marcador de Fim */}
            <div className="relative pl-6 pt-2 opacity-50">
                <div className="absolute left-[3px] top-3 w-2 h-2 bg-gray-700 rounded-full"></div>
                <span className="text-[10px] text-gray-500">Início do relacionamento</span>
            </div>
        </div>
    );
};