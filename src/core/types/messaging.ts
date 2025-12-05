// src/core/types/messaging.ts

/**
 * @interface ConnectionStatus
 * @description Representa o estado da conexão com o provedor de mensagens (WhatsApp).
 */
export interface ConnectionStatus {
    instanceName: string;
    isConnected: boolean;
    // Base64 do QR Code. Só vem preenchido se isConnected = false e solicitarmos conexão.
    qrCode?: string; 
}

/**
 * @interface SendMessagePayload
 * @description DTO para envio de mensagens.
 */
export interface SendMessagePayload {
    to: string;
    content: string;
}