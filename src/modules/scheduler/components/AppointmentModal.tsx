// src/modules/scheduler/components/AppointmentModal.tsx

import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarPlus, FaClock, FaAlignLeft, FaTag, FaSave } from 'react-icons/fa';
import { format } from 'date-fns';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    /**
     * Datas pré-selecionadas ao clicar no calendário (Slot)
     */
    initialSlot?: { start: Date; end: Date };
    currentAppointment?: any; // Recebe o objeto do evento clicado (modo edição)
    /**
     * Callback para salvar (será conectado ao hook no próximo passo)
     */
    onConfirm: (data: { title: string; description: string; start: Date; end: Date }) => Promise<void>;
}

/**
 * @component AppointmentModal
 * @description Modal compacto e elegante para criação rápida de agendamentos.
 * Usa backdrop-blur para não perder o contexto do fundo.
 */
export const AppointmentModal: React.FC<AppointmentModalProps> = ({ 
    isOpen, 
    onClose, 
    initialSlot,
    currentAppointment,
    onConfirm 
}) => {
    
    // --- ESTADOS DO FORMULÁRIO ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    
    // Armazenamos como string para o input type="datetime-local"
    const [startStr, setStartStr] = useState('');
    const [endStr, setEndStr] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);

    // Sincroniza o formulário quando o slot inicial muda
    useEffect(() => {
        if (isOpen) {
            if (currentAppointment) {
                // MODO EDIÇÃO: Preenche com dados do agendamento existente
                setTitle(currentAppointment.title);
                setDescription(currentAppointment.description || '');
                
                // Converte as datas (que podem vir como string ISO do banco) para objeto Date
                const startDate = new Date(currentAppointment.startTime);
                const endDate = new Date(currentAppointment.endTime);

                setStartStr(format(startDate, "yyyy-MM-dd'T'HH:mm"));
                setEndStr(format(endDate, "yyyy-MM-dd'T'HH:mm"));
            } 
            else if (initialSlot) {
                // MODO CRIAÇÃO: Preenche com o slot clicado (vazio)
                setStartStr(format(initialSlot.start, "yyyy-MM-dd'T'HH:mm"));
                setEndStr(format(initialSlot.end, "yyyy-MM-dd'T'HH:mm"));
                setTitle('');
                setDescription('');
            }
        }
    }, [isOpen, initialSlot, currentAppointment]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !startStr || !endStr) return;

        setIsSaving(true);
        try {
            await onConfirm({
                title,
                description,
                start: new Date(startStr),
                end: new Date(endStr)
            });
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            // O tratamento de erro ideal seria um toast/alert aqui
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        // OVERLAY: Fundo escuro translúcido com Blur (Suave)
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-all duration-300">
            
            {/* CONTAINER: Compacto, Sombra Suave, Bordas Arredondadas */}
            <div 
                className="bg-base-metallic w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 transform scale-100 transition-all flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* HEADER: Minimalista */}
                <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-secondary/20 text-accent-secondary rounded-lg">
                            <FaCalendarPlus className="w-4 h-4" />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            {currentAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-700/50 p-2 rounded-full transition"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* BODY: Formulário Clean */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Título */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <FaTag className="text-xs" />
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título do compromisso (Ex: Reunião de Alinhamento)"
                            className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary placeholder-gray-600 transition-all"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Datas (Grid Lado a Lado) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center">
                                <FaClock className="mr-1.5" /> Início
                            </label>
                            <input
                                type="datetime-local"
                                value={startStr}
                                onChange={(e) => setStartStr(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center">
                                <FaClock className="mr-1.5" /> Fim
                            </label>
                            <input
                                type="datetime-local"
                                value={endStr}
                                onChange={(e) => setEndStr(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-600 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-accent-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center">
                            <FaAlignLeft className="mr-1.5" /> Detalhes (Opcional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-accent-primary resize-none placeholder-gray-600 scrollbar-thin scrollbar-thumb-gray-700"
                            placeholder="Adicione notas, pauta ou observações..."
                        />
                    </div>

                    {/* FOOTER: Botões de Ação */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent hover:border-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-base-dark bg-accent-secondary hover:bg-violet-500 shadow-lg shadow-violet-900/20 transition transform active:scale-95 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                'Salvando...'
                            ) : (
                                <>
                                    <FaSave className="mr-2" /> 
                                    {currentAppointment ? 'Salvar Alterações' : 'Agendar'}
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};