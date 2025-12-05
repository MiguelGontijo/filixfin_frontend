// src/core/hooks/useMessaging.ts

import { useState, useCallback } from 'react';
import { api } from '@/core/services/api';
import { ConnectionStatus, SendMessagePayload } from '@/core/types/messaging';

/**
 * @hook useMessaging
 * @description Gerencia a integração com o provedor de mensageria (WhatsApp/Evolution API).
 * Lida com estados de conexão, exibição de QR Code e envio de mensagens.
 */
export function useMessaging() {
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Estado da Conexão (QRCode, Status, Nome da Instância)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);

    /**
     * @method checkStatus
     * @description Verifica se a instância do Tenant já está conectada.
     */
    const checkStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get('/messaging/status');
            setConnectionStatus(response.data as ConnectionStatus);
        } catch (err: any) {
            // Se der 404 ou erro, assumimos desconectado ou erro de serviço
            console.error("Erro ao checar status:", err);
            setError("Não foi possível verificar o status da conexão.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * @method connectSession
     * @description Solicita a criação/conexão da instância. 
     * Se não estiver conectada, o Backend retornará o QR Code neste payload.
     */
    const connectSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/messaging/connect');
            setConnectionStatus(response.data as ConnectionStatus);
            return response.data as ConnectionStatus;
        } catch (err: any) {
            const msg = err.response?.data?.message || "Falha ao iniciar sessão do WhatsApp.";
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * @method disconnectSession
     * @description Encerra a sessão e apaga a instância no provedor.
     */
    const disconnectSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await api.post('/messaging/logout');
            setConnectionStatus(null); // Limpa estado local
        } catch (err: any) {
            const msg = err.response?.data?.message || "Falha ao desconectar.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * @method sendMessage
     * @description Envia mensagem de texto.
     */
    const sendMessage = useCallback(async (payload: SendMessagePayload) => {
        // Não setamos isLoading global aqui para não travar a UI inteira, 
        // mas poderia ser um state 'isSending'.
        try {
            await api.post('/messaging/send', payload);
        } catch (err: any) {
            console.error("Erro ao enviar mensagem:", err);
            throw new Error("Falha no envio da mensagem via WhatsApp.");
        }
    }, []);

    return {
        connectionStatus,
        isLoading,
        error,
        checkStatus,
        connectSession,
        disconnectSession,
        sendMessage
    };
}