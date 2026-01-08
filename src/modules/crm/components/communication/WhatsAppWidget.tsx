// src/modules/crm/components/communication/WhatsAppWidget.tsx

import React, { useEffect } from 'react';
import { FaWhatsapp, FaQrcode, FaUnlink, FaCheckCircle, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useMessaging } from '@/core/hooks/useMessaging';

/**
 * @component WhatsAppWidget
 * @description Gerencia a conexão com a instância do WhatsApp (Evolution API).
 * Exibe QR Code para pareamento ou Status de Conectado.
 */
export const WhatsAppWidget: React.FC = () => {
    
    const { 
        connectionStatus, 
        isLoading, 
        error, 
        checkStatus, 
        connectSession, 
        disconnectSession 
    } = useMessaging();

    // Verifica o status ao montar o componente
    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    // --- HANDLERS ---
    
    const handleConnect = () => {
        connectSession();
    };

    const handleDisconnect = () => {
        if (confirm("Tem certeza que deseja desconectar o WhatsApp deste Tenant?")) {
            disconnectSession();
        }
    };

    // --- RENDERIZAÇÃO DE ESTADOS ---

    // 1. Loading
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 p-6">
                <FaSync className="w-8 h-8 animate-spin text-accent-primary" />
                <span className="text-xs uppercase tracking-wider font-bold">Comunicando com o Servidor...</span>
            </div>
        );
    }

    // 2. Erro
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-400 space-y-3 p-6 text-center">
                <FaExclamationTriangle className="w-8 h-8" />
                <span className="text-xs font-bold">{error}</span>
                <button 
                    onClick={() => checkStatus()} 
                    className="text-xs underline hover:text-white"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    // 3. Conectado (Sucesso)
    if (connectionStatus?.isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-6 bg-green-900/10 rounded-lg border border-green-900/30">
                <div className="relative">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/50">
                        <FaWhatsapp className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 border-2 border-base-metallic rounded-full"></div>
                </div>
                
                <div className="text-center">
                    <h3 className="text-white font-bold text-lg">WhatsApp Conectado</h3>
                    <p className="text-green-400 text-xs uppercase tracking-wide mt-1">
                        Instância: {connectionStatus.instanceName}
                    </p>
                </div>

                <button 
                    onClick={handleDisconnect}
                    className="flex items-center px-4 py-2 bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 rounded-lg text-xs font-bold transition border border-gray-700 hover:border-red-800"
                >
                    <FaUnlink className="mr-2" /> Desconectar
                </button>
            </div>
        );
    }

    // 4. Desconectado (Com ou Sem QR Code)
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
            
            {/* Se tiver QR Code, mostra ele. Senão, mostra o ícone genérico */}
            {connectionStatus?.qrCode ? (
                <div className="bg-white p-2 rounded-lg shadow-xl animate-fade-in">
                    {/* Renderiza a string Base64 como imagem */}
                    <img 
                        src={connectionStatus.qrCode} 
                        alt="QR Code WhatsApp" 
                        className="w-48 h-48 object-contain" 
                    />
                </div>
            ) : (
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600 text-gray-500">
                    <FaQrcode className="w-8 h-8" />
                </div>
            )}

            <div className="text-center max-w-xs">
                <h3 className="text-white font-bold mb-1">
                    {connectionStatus?.qrCode ? 'Escaneie o QR Code' : 'WhatsApp Desconectado'}
                </h3>
                <p className="text-gray-400 text-xs">
                    {connectionStatus?.qrCode 
                        ? 'Abra o WhatsApp no seu celular e escaneie o código acima para conectar.' 
                        : 'Integre seu número para enviar mensagens diretamente pelo CRM.'}
                </p>
            </div>

            {!connectionStatus?.qrCode && (
                <button 
                    onClick={handleConnect}
                    className="flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 transition transform active:scale-95 text-sm"
                >
                    <FaWhatsapp className="mr-2 w-5 h-5" />
                    Gerar QR Code
                </button>
            )}
        </div>
    );
};