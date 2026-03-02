// ===== FILE: src/modules/timeline/components/TimelineFeed.tsx =====

import React, { useMemo } from 'react';
import { FaInbox, FaExclamationTriangle } from 'react-icons/fa';
import { TimelineEvent } from '../types/TimelineTypes';
import { TimelineCard } from './TimelineCard'; // (Vamos criar a seguir)
import { TimelineSkeleton } from './TimelineSkeleton'; // (Vamos criar depois)

interface TimelineFeedProps {
    items: TimelineEvent[];
    isLoading: boolean;
    error: string | null;
    
    // Ações que serão repassadas para os Cards
    onTogglePin: (id: string) => void;
    onDelete: (id: string) => void;
    
    // Classe opcional para customização externa (margin, padding)
    className?: string;
}

/**
 * @component TimelineFeed
 * @description O Container de Rolagem da Timeline.
 * * RESPONSABILIDADE:
 * - Renderizar a lista de eventos.
 * - Agrupar eventos visualmente por data (Hoje, Ontem, Data Completa).
 * - Gerenciar estados de Loading, Vazio e Erro.
 */
export const TimelineFeed: React.FC<TimelineFeedProps> = ({ 
    items, 
    isLoading, 
    error, 
    onTogglePin, 
    onDelete,
    className = ''
}) => {

    // --- 1. Lógica de Agrupamento de Datas ---
    
    /**
     * Helper para formatar o cabeçalho de data.
     * Retorna "Hoje", "Ontem" ou "dd de MMMM de yyyy".
     */
    const getDateLabel = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const isSameDay = (d1: Date, d2: Date) => 
            d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();

        if (isSameDay(date, today)) return 'Hoje';
        if (isSameDay(date, yesterday)) return 'Ontem';

        return new Intl.DateTimeFormat('pt-BR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        }).format(date);
    };

    /**
     * Processa a lista linear e insere marcadores de data virtualmente.
     * Usamos useMemo para não recalcular em todo render se os items não mudarem.
     */
    const renderContent = useMemo(() => {
        const elements: React.ReactNode[] = [];
        let lastDateLabel = '';

        items.forEach((item) => {
            const currentLabel = getDateLabel(item.occurredAt);

            // Se a data mudou, insere um Separador
            if (currentLabel !== lastDateLabel) {
                elements.push(
                    <div key={`date-${currentLabel}`} className="sticky top-0 z-10 flex justify-center py-4 pointer-events-none">
                        <span className="bg-gray-800/90 backdrop-blur-sm text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-700 shadow-sm">
                            {currentLabel}
                        </span>
                    </div>
                );
                lastDateLabel = currentLabel;
            }

            // Insere o Card do Evento
            elements.push(
                <TimelineCard 
                    key={item.id} 
                    event={item} 
                    onTogglePin={onTogglePin}
                    onDelete={onDelete}
                />
            );
        });

        return elements;
    }, [items, onTogglePin, onDelete]);


    // --- 2. Renderização de Estados ---

    // Estado de Carregamento (Skeleton)
    if (isLoading && items.length === 0) {
        return (
            <div className={`flex flex-col space-y-4 p-4 ${className}`}>
                <TimelineSkeleton />
                <TimelineSkeleton />
                <TimelineSkeleton />
            </div>
        );
    }

    // Estado de Erro
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-80">
                <div className="bg-red-500/10 p-4 rounded-full mb-3 text-red-500">
                    <FaExclamationTriangle size={24} />
                </div>
                <p className="text-gray-300 font-medium">Falha ao carregar timeline.</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
        );
    }

    // Estado Vazio (Zero Data)
    if (items.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center h-full p-8 text-center opacity-50 ${className}`}>
                <div className="bg-gray-800 p-6 rounded-full mb-4 border border-gray-700">
                    <FaInbox size={32} className="text-gray-500" />
                </div>
                <h3 className="text-gray-300 font-medium">Nenhuma atividade registrada</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                    Use o campo abaixo para criar a primeira nota ou registro.
                </p>
            </div>
        );
    }

    // --- 3. Renderização Principal (Lista) ---
    
    return (
        <div className={`
            flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 
            ${className}
        `}>
            {/* Renderiza a lista processada com headers de data.
               A classe 'space-y-2' dá o espaçamento vertical entre os cards.
            */}
            {renderContent}
        </div>
    );
};