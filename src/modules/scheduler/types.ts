// src/modules/scheduler/types.ts

export enum AppointmentType {
    MEETING = 'MEETING',
    SERVICE = 'SERVICE',
    BLOCK = 'BLOCK' // Bloqueio do Google
}

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    CONFIRMED = 'CONFIRMED',
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED'
}

export interface Appointment {
    id: string;
    resourceId: string; // ID do Técnico/User
    googleEventId: string | null;
    title: string;
    description: string | null;
    startTime: string; // ISO Date
    endTime: string;   // ISO Date
    type: AppointmentType;
    status: AppointmentStatus;
    // Futuro: color?: string;
}

// Interface para o Evento compatível com react-big-calendar
export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: any; // Dados originais do Appointment
    isBlock: boolean; // Helper visual
}