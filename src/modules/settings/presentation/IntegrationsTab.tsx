// src/modules/settings/presentation/IntegrationsTab.tsx

import React, { useEffect } from 'react';
import { FaGoogle, FaWhatsapp } from 'react-icons/fa';
import { IntegrationCard } from '../components/IntegrationCard';
import { useIntegrations } from '../hooks/useIntegrations';
import { useMessaging } from '@/core/hooks/useMessaging'; // Import do Hook Real

export const IntegrationsTab: React.FC = () => {
    
    // Hook do Google
    const { connectGoogleCalendar, isLoading: googleLoading } = useIntegrations();
    
    // Hook do WhatsApp (Real)
    const { connectionStatus, checkStatus, isLoading: waLoading } = useMessaging();

    // Carrega status ao montar
    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    return (
        <div className="animate-fade-in space-y-6">
            
            <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-white">Central de Integrações</h2>
                <p className="text-sm text-gray-400 mt-1">
                    Conecte suas ferramentas favoritas para automatizar agendamentos e comunicação.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* 1. Google Calendar */}
                <IntegrationCard 
                    title="Google Calendar"
                    description="Sincronize sua agenda pessoal para evitar conflitos. O sistema bloqueará horários ocupados automaticamente."
                    icon={FaGoogle}
                    colorClass="text-blue-500"
                    isConnected={false} // TODO: Implementar check de status do Google (v2)
                    isLoading={googleLoading}
                    onConnect={connectGoogleCalendar}
                />

                {/* 2. WhatsApp (Evolution) - Status Real */}
                <IntegrationCard 
                    title="WhatsApp Business"
                    description="Envie notificações automáticas e converse com clientes diretamente pelo CRM."
                    icon={FaWhatsapp}
                    colorClass="text-green-500"
                    isConnected={!!connectionStatus?.isConnected} // Estado REAL
                    isLoading={waLoading}
                    onConnect={() => {
                        // Redireciona para o CRM onde está o Widget completo com QR Code
                        window.location.href = window.location.pathname.replace('/settings', '/crm');
                    }}
                />

            </div>
        </div>
    );
};