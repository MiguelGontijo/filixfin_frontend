// src/modules/scheduler/components/SchedulerWidget.tsx

import React from 'react';
import { Calendar, View, Views } from 'react-big-calendar';
import { FaSync, FaCalendarAlt } from 'react-icons/fa';
import { localizer } from '../utils/calendarLocalizer'; // O arquivo que criamos no passo anterior
import { useScheduler } from '../hooks/useScheduler';
import { AppointmentType } from '../types';

// Importa o CSS customizado (Se Next.js reclamar, mova para globals.css)
import '../styles/calendar.css'; 

interface SchedulerWidgetProps {
    mode?: 'FULL' | 'COMPACT' | 'MINI';
    height?: number | string;
}

export const SchedulerWidget: React.FC<SchedulerWidgetProps> = ({ 
    mode = 'FULL',
    height = '100%' 
}) => {
    
    const { events, isLoading, isSyncing, syncGoogle } = useScheduler();

    // Configurações baseadas no Modo (Camaleão)
    const defaultView = mode === 'FULL' ? Views.MONTH : Views.AGENDA;
    const availableViews: View[] = mode === 'FULL' 
        ? [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]
        : [Views.AGENDA];
    
    const showToolbar = mode !== 'MINI';

    // Estilização condicional de eventos (Bloqueio vs Normal)
    const eventStyleGetter = (event: any) => {
        const isBlock = event.resource?.type === AppointmentType.BLOCK;
        const style = {
            backgroundColor: isBlock ? '#374151' : '#8B5CF6', // Gray-700 (Block) vs Violet (Service)
            borderRadius: '4px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    return (
        <div className="flex flex-col h-full bg-base-metallic rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            
            {/* Header / Toolbar Customizada */}
            {mode === 'FULL' && (
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                    <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-accent-primary" />
                        <h2 className="text-lg font-bold text-white">Agenda de Serviços</h2>
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

            <div className="flex-1 p-4" style={{ minHeight: 500 }}>
                {/* O Calendário Real */}
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    defaultView={defaultView}
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
            </div>
        </div>
    );
};