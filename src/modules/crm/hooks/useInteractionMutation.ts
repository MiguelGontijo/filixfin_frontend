// src/features/crm/hooks/useInteractionMutation.ts

import { useState } from 'react';
import { api } from '@/core/services/api';
import { InteractionAnalysis } from '../types';
// IMPORTAÇÃO CORRETA: Reuso do tipo central
import { CreateClientDto } from '@/core/types/client';

export enum ClientActionType {
    LINK_EXISTING = 'LINK_EXISTING',
    CREATE_NEW = 'CREATE_NEW'
}

// Interface do Payload específico desta rota
export interface RegisterInteractionPayload {
    type: 'NOTE' | 'AUDIO' | 'EMAIL' | 'MEETING';
    content: string;
    aiAnalysis?: InteractionAnalysis;
    action: ClientActionType;
    clientId?: string;       
    // USO CORRETO: Referência ao DTO global
    newClientData?: CreateClientDto; 
}

export function useInteractionMutation() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const registerInteraction = async (payload: RegisterInteractionPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await api.post('/crm/interaction', payload);
            setSuccess(true);
            return response.data;
        } catch (err: any) {
            console.error("Erro ao registrar interação:", err);
            const msg = err.response?.data?.message || "Falha ao salvar interação e dados do cliente.";
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        registerInteraction,
        isLoading,
        error,
        success,
        resetState: () => {
            setError(null);
            setSuccess(false);
        }
    };
}