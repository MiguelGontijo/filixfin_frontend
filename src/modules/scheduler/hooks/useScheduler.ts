// src/modules/scheduler/hooks/useScheduler.ts

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/core/services/api';
import { Appointment, CalendarEvent, AppointmentType } from '../types';

export function useScheduler() {
    
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
            // TODO: Receber filtros de data (start/end)
            // Por enquanto, busca tudo (assumindo que o backend filtra por tenant)
            const response = await api.get('/scheduler/appointments'); // Precisamos criar essa rota GET depois
            
            // Mock temporário se a rota não existir ainda, para não quebrar a UI
            // const data = response.data || []; 
            const data: Appointment[] = []; 

            setEvents(data.map(mapToCalendarEvent));
        } catch (error) {
            console.error("Erro ao buscar agenda:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const syncGoogle = async () => {
        try {
            setIsSyncing(true);
            await api.post('/scheduler/sync');
            await fetchAppointments(); // Recarrega após sync
            alert("Agenda sincronizada com sucesso!");
        } catch (error) {
            console.error("Erro no sync:", error);
            alert("Falha ao sincronizar com Google.");
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
        refresh: fetchAppointments
    };
}