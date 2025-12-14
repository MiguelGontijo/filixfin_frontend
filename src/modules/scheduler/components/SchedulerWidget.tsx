// src/modules/scheduler/components/SchedulerWidget.tsx

import React, { useState, useCallback } from 'react';
import { Calendar, View, Views, SlotInfo } from 'react-big-calendar';
import { FaSync, FaCalendarAlt } from 'react-icons/fa';
import { localizer } from '../utils/calendarLocalizer';
import { useScheduler } from '../hooks/useScheduler';
import { AppointmentType } from '../types';
import { AppointmentModal } from './AppointmentModal'; // <--- Importação do Modal

import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css'; 

interface SchedulerWidgetProps {
    mode?: 'FULL' | 'COMPACT' | 'MINI';
    height?: number | string;
    clientId?: string; 
}

export const SchedulerWidget: React.FC<SchedulerWidgetProps> = ({ 
    mode = 'FULL',
    height = '100%',
    clientId
}) => {
    
    // Agora desestruturamos também o createAppointment do hook
    const { events, isLoading, isSyncing, syncGoogle, createAppointment, updateAppointment } = useScheduler({ clientId });
    const [appointmentToEdit, setAppointmentToEdit] = useState<any | undefined>(undefined);

    // --- ESTADOS DE CONTROLE ---
    const [view, setView] = useState<View>(mode === 'FULL' ? Views.MONTH : Views.AGENDA);
    const [date, setDate] = useState(new Date());

    // --- ESTADOS DO MODAL (NOVO) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | undefined>(undefined);

    const availableViews: View[] = mode === 'FULL' 
        ? [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]
        : [Views.AGENDA];
    
    const showToolbar = mode !== 'MINI';

    // --- HANDLERS ---

    const handleNavigate = useCallback((newDate: Date) => {
        setDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setView(newView);
    }, []);

    // ADICIONE ESTA FUNÇÃO:
    const handleDoubleClickEvent = useCallback((calendarEvent: any) => {
        // O 'resource' contém o objeto Appointment original que veio da API
        const originalAppointment = calendarEvent.resource;
        
        setAppointmentToEdit(originalAppointment); // Guarda os dados para o form
        setIsModalOpen(true); // Abre o mesmo modal de criação
    }, []);

    // AJUSTE NO HANDLE DO MODAL (Para limpar o estado ao fechar):
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setAppointmentToEdit(undefined); // Limpa para não abrir "sujo" na próxima
        setSelectedSlot(undefined);
    };

    /**
     * Disparado quando o usuário clica ou arrasta em um espaço vazio da agenda.
     */
    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setAppointmentToEdit(null); // <--- GARANTIA: Garante que não é edição
        setSelectedSlot({ start, end });
        setIsModalOpen(true);
    };

    /**
     * Callback de sucesso do Modal.
     * Chama o hook para persistir no backend.
     */
    const handleSaveAppointment = async (data: { title: string; description: string; start: Date; end: Date }) => {
    try {
        if (appointmentToEdit) {
            // MODO EDIÇÃO
            await updateAppointment({
                id: appointmentToEdit.id,
                title: data.title,
                description: data.description,
                start: data.start,
                end: data.end
            });
        } else {
            // MODO CRIAÇÃO
            await createAppointment({
                title: data.title,
                description: data.description,
                start: data.start,
                end: data.end
            });
        }
        // O modal fecha sozinho após o sucesso (via props do modal) ou você fecha manualmente aqui se preferir
        handleCloseModal();
    } catch (error: any) {
        const msg = error.response?.data?.message || 'Erro ao salvar agendamento.';
        alert(msg);
        throw error;
    }
};

    const eventStyleGetter = (event: any) => {
        const isBlock = event.resource?.type === AppointmentType.BLOCK;
        const style = {
            backgroundColor: isBlock ? '#374151' : '#8B5CF6', 
            borderRadius: '4px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="flex flex-col h-full bg-base-metallic rounded-xl border border-gray-700 shadow-lg overflow-hidden relative">
            
            {mode === 'FULL' && (
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                    <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-accent-primary" />
                        <h2 className="text-lg font-bold text-white">
                            {clientId ? 'Agenda do Cliente' : 'Agenda de Serviços'}
                        </h2>
                    </div>
                    
                    <button 
                        onClick={syncGoogle}
                        disabled={isSyncing}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold rounded transition border border-gray-600"
                    >
                        <FaSync className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Google'}</span>
                    </button>
                </div>
            )}

            <div className="flex-1 p-4 bg-gray-900" style={{ minHeight: mode === 'MINI' ? 200 : 500 }}>
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        <FaSync className="animate-spin mr-2" /> Carregando agenda...
                    </div>
                ) : (
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        
                        view={view}
                        date={date}
                        onView={handleViewChange}
                        onNavigate={handleNavigate}
                        onDoubleClickEvent={handleDoubleClickEvent}
                        
                        // --- INTERATIVIDADE ---
                        selectable={true} // Habilita seleção
                        onSelectSlot={handleSelectSlot} // Handler do clique
                        scrollToTime={new Date(1970, 1, 1, 8)} // Rola para 08:00
                        longPressThreshold={10} // Melhor resposta no mobile
                        
                        views={availableViews}
                        toolbar={showToolbar}
                        eventPropGetter={eventStyleGetter}
                        messages={{
                            today: 'Hoje',
                            previous: 'Anterior',
                            next: 'Próximo',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia',
                            agenda: 'Lista',
                            date: 'Data',
                            time: 'Hora',
                            event: 'Evento',
                            noEventsInRange: 'Nenhum agendamento neste período.'
                        }}
                    />
                )}
            </div>

            {/* --- RENDERIZAÇÃO DO MODAL --- */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialSlot={selectedSlot}
                currentAppointment={appointmentToEdit}
                onConfirm={handleSaveAppointment}
            />
        </div>
    );
};