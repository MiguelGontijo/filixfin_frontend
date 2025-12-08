// src/modules/settings/components/IntegrationCard.tsx

import React from 'react';
import { FaCheckCircle, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';

interface IntegrationCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    isConnected: boolean;
    isLoading?: boolean;
    onConnect: () => void;
    onConfigure?: () => void; // Futuro: Para configurar opções da integração
    colorClass?: string; // Ex: text-blue-500
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
    title,
    description,
    icon: Icon,
    isConnected,
    isLoading,
    onConnect,
    colorClass = "text-white"
}) => {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-gray-600 transition-all group">
            
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg bg-gray-900 shadow-inner ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                    {isConnected ? (
                        <span className="flex items-center text-[10px] uppercase font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded-full border border-green-900/50">
                            <FaCheckCircle className="mr-1.5" /> Ativo
                        </span>
                    ) : (
                        <span className="flex items-center text-[10px] uppercase font-bold text-gray-500 bg-gray-900/50 px-2 py-1 rounded-full border border-gray-700">
                            <FaExclamationCircle className="mr-1.5" /> Desconectado
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {description}
                </p>
            </div>

            <button
                onClick={onConnect}
                disabled={isLoading || isConnected}
                className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all ${
                    isConnected 
                    ? 'bg-gray-700 text-gray-400 cursor-default'
                    : 'bg-accent-secondary hover:bg-violet-600 text-white shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
                {isLoading ? (
                    <span className="animate-pulse">Processando...</span>
                ) : isConnected ? (
                    'Configurado'
                ) : (
                    <>Conectar Agora <FaArrowRight className="ml-2" /></>
                )}
            </button>
        </div>
    );
};