// src/modules/scheduler/hooks/useScheduler.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Appointment, CalendarEvent, AppointmentType } from '../types';

export interface UseSchedulerProps {
    clientId?: string;
    resourceId?: string;
}

// Interface para Criação
interface CreateAppointmentInput {
    title: string;
    description?: string;
    start: Date;
    end: Date;
}

// Interface para Edição (ID é obrigatório)
interface UpdateAppointmentInput {
    id: string;
    title: string;
    description?: string;
    start: Date;
    end: Date;
}

export function useScheduler({ clientId, resourceId }: UseSchedulerProps = {}) {
    
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Converte o DTO da API para o formato do Calendário
    const mapToCalendarEvent = (apt: Appointment): CalendarEvent => ({
        id: apt.id,
        title: apt.type === AppointmentType.BLOCK ? 'Bloqueio Externo (Google)' : apt.title,
        start: new Date(apt.startTime),
        end: new Date(apt.endTime),
        resource: apt,
        isBlock: apt.type === AppointmentType.BLOCK
    });

    const fetchAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            
            const params: Record<string, string> = {};
            if (clientId) params.clientId = clientId;
            if (resourceId) params.resourceId = resourceId;

            const response = await api.get('/scheduler/appointments', { params });
            const data = response.data as Appointment[];

            setEvents(data.map(mapToCalendarEvent));
        } catch (error) {
            console.error("Erro ao buscar agenda:", error);
            setEvents([]);
        } finally {
            setIsLoading(false);
        }
    }, [clientId, resourceId]);

    /**
     * Cria um novo agendamento.
     */
    const createAppointment = async (input: CreateAppointmentInput) => {
        try {
            await api.post('/scheduler/appointments', {
                title: input.title,
                description: input.description,
                startTime: input.start.toISOString(),
                endTime: input.end.toISOString(),
                clientId: clientId || undefined, 
                resourceId: resourceId || undefined
            });

            await fetchAppointments();
        } catch (error: any) {
            console.error("Erro ao criar agendamento:", error);
            throw error;
        }
    };

    /**
     * @method updateAppointment
     * @description Atualiza um agendamento existente via PATCH.
     */
    const updateAppointment = async (input: UpdateAppointmentInput) => {
        try {
            // Rota PATCH que criamos no Backend
            await api.patch(`/scheduler/appointments/${input.id}`, {
                title: input.title,
                description: input.description,
                startTime: input.start.toISOString(),
                endTime: input.end.toISOString(),
            });

            // Recarrega para refletir a mudança
            await fetchAppointments();

        } catch (error: any) {
            console.error("Erro ao atualizar agendamento:", error);
            throw error; // Lança para o componente tratar (ex: exibir erro de conflito)
        }
    };

    const syncGoogle = async () => {
        try {
            setIsSyncing(true);
            await api.post('/scheduler/sync');
            await fetchAppointments(); 
        } catch (error) {
            console.error("Erro no sync:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return {
        events,
        isLoading,
        isSyncing,
        syncGoogle,
        createAppointment,
        updateAppointment, // <--- Nova função exposta
        refresh: fetchAppointments
    };
}