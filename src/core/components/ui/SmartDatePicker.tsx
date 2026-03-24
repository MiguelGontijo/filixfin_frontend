import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export interface SmartDatePickerProps {
    value?: string | null; // Espera formato 'YYYY-MM-DD'
    onChange: (dateString: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

/**
 * ============================================================================
 * 📅 SMART DATE PICKER (Componente Agóstico de UI)
 * @description Calendário customizado de alta fidelidade visual.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Preparo para Google/MS Agenda):
 * 1. Data Pura (String-in / String-out): Isola o componente de problemas de
 * Timezone do navegador, traficando estritamente strings 'YYYY-MM-DD'.
 * 2. Click-Outside: Fecha o popover automaticamente se o usuário clicar fora.
 * 3. Zero Dependências: Grade de calendário gerada com matemática nativa.
 * ============================================================================
 */
export const SmartDatePicker: React.FC<SmartDatePickerProps> = ({
    value,
    onChange,
    placeholder = 'Selecione uma data',
    disabled = false
}) => {
    // Estados do Popover e Navegação
    const [isOpen, setIsOpen] = useState(false);
    const [currentViewDate, setCurrentViewDate] = useState(() => {
        if (value) {
            const [year, month, day] = value.split('-');
            return new Date(Number(year), Number(month) - 1, Number(day));
        }
        return new Date();
    });

    const popoverRef = useRef<HTMLDivElement>(null);

    // 🛡️ CLICK-OUTSIDE HOOK: Fecha o calendário ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // ========================================================================
    // 🧮 MOTOR MATEMÁTICO DO CALENDÁRIO
    // ========================================================================
    const currentYear = currentViewDate.getFullYear();
    const currentMonth = currentViewDate.getMonth();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // Gera o array de dias para preencher a grade (incluindo espaços vazios iniciais)
    const calendarDays = Array.from({ length: firstDayOfMonth + daysInMonth }, (_, i) => {
        if (i < firstDayOfMonth) return null; // Espaços vazios antes do dia 1
        return i - firstDayOfMonth + 1; // Dias reais do mês
    });

    // ========================================================================
    // ⚙️ HANDLERS DE NAVEGAÇÃO E SELEÇÃO
    // ========================================================================
    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentViewDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentViewDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const handleSelectDate = (day: number) => {
        // Formata para 'YYYY-MM-DD' garantindo o zero à esquerda (ex: 2026-05-09)
        const formattedMonth = String(currentMonth + 1).padStart(2, '0');
        const formattedDay = String(day).padStart(2, '0');
        const selectedIsoDate = `${currentYear}-${formattedMonth}-${formattedDay}`;
        
        onChange(selectedIsoDate);
        setIsOpen(false);
    };

    // Formatação amigável para exibir no input (DD/MM/YYYY)
    const displayValue = useMemo(() => {
        if (!value) return '';
        const [year, month, day] = value.split('-');
        if (!year || !month || !day) return '';
        return `${day}/${month}/${year}`;
    }, [value]);

    return (
        <div className="relative w-full" ref={popoverRef}>
            
            {/* O INPUT FALSO (Botão Gatilho) */}
            <div 
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
                    w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white 
                    flex items-center justify-between transition-all
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-accent-primary focus-within:border-accent-primary focus-within:ring-1 focus-within:ring-accent-primary'}
                `}
            >
                <span className={displayValue ? 'text-white font-medium' : 'text-gray-500'}>
                    {displayValue || placeholder}
                </span>
                <FaCalendarAlt className={`transition-colors ${isOpen ? 'text-accent-primary' : 'text-gray-500'}`} />
            </div>

            {/* O POPOVER DO CALENDÁRIO */}
            {isOpen && !disabled && (
                <div className="absolute z-[9999] mt-2 top-full left-0 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-4 animate-fade-in-up">
                    
                    {/* Header: Navegação de Mêses */}
                    <div className="flex items-center justify-between mb-4">
                        <button 
                            type="button" 
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <FaChevronLeft size={12} />
                        </button>
                        <div className="text-sm font-bold text-white uppercase tracking-wider">
                            {monthNames[currentMonth]} {currentYear}
                        </div>
                        <button 
                            type="button" 
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>

                    {/* Header: Dias da Semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grade de Dias */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                            if (day === null) {
                                return <div key={`empty-${index}`} className="h-8 w-8" />;
                            }

                            // Verifica se este dia é o dia atualmente selecionado
                            const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            // Verifica se é o dia de hoje real
                            const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, day).toDateString();

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelectDate(day)}
                                    className={`
                                        h-8 w-full flex items-center justify-center rounded-lg text-xs font-medium transition-all
                                        ${isSelected 
                                            ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/30' 
                                            : isToday 
                                                ? 'bg-gray-700/50 text-accent-primary border border-accent-primary/30 hover:bg-gray-700' 
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                </div>
            )}
        </div>
    );
};