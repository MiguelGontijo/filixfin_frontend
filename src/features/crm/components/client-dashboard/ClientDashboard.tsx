// src/features/crm/components/client-dashboard/ClientDashboard.tsx

import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaEdit, FaHistory, FaEnvelope, FaPhone, 
    FaMapMarkerAlt, FaIdCard, FaBrain, FaSave, FaTimes, 
    FaMagic
} from 'react-icons/fa';
import { Client, AddressType } from '@/core/types/client';
import { ClientForm } from './ClientForm';

interface ClientDashboardProps {
    client: Client | null;
    onUpdateSuccess: () => void;
}

type DashboardTab = 'OVERVIEW' | 'TIMELINE';

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ client, onUpdateSuccess }) => {
    
    const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
    const [isEditing, setIsEditing] = useState(false);

    // Resetar edição se trocar de cliente
    useEffect(() => {
        setIsEditing(false);
        setActiveTab('OVERVIEW');
    }, [client?.id]);

    // --- EMPTY STATE ---
    if (!client) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-base-metallic/50 rounded-xl border border-gray-700/50 border-dashed">
                <div className="p-4 bg-gray-800 rounded-full mb-4">
                    <FaUser className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400">Nenhum Cliente Selecionado</h3>
                <p className="text-sm mt-2 max-w-xs text-center opacity-70">
                    Selecione um cliente na lista à esquerda para visualizar seu dossiê.
                </p>
            </div>
        );
    }

    // Helper para endereço (Modo Leitura)
    const mainAddress = client.addresses?.find(a => a.type === AddressType.MAIN) || client.addresses?.[0];
    const addressText = mainAddress 
        ? `${mainAddress.street}, ${mainAddress.number} - ${mainAddress.district}, ${mainAddress.city}/${mainAddress.state}`
        : 'Sem endereço cadastrado';

    const handleFormSuccess = () => {
        setIsEditing(false);
        onUpdateSuccess();
    };

    return (
        <div className="bg-base-metallic rounded-xl border border-gray-700 flex flex-col h-full overflow-hidden shadow-2xl relative">
            
            {/* --- HEADER DO CLIENTE (FIXO) --- */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0">
                <div className="flex justify-between items-start">
                    
                    {/* Identidade */}
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-accent-primary/20 flex items-center justify-center border-2 border-accent-primary text-accent-primary shadow-lg">
                            <span className="text-2xl font-bold">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">{client.name}</h1>
                            <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                                {client.document ? (
                                    <span className="flex items-center"><FaIdCard className="mr-1.5 opacity-70" /> {client.document}</span>
                                ) : (
                                    <span className="flex items-center text-accent-secondary"><FaMagic className="mr-1.5" /> Lead</span>
                                )}
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${client.isActive ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                    {client.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Ações do Header (Controlam o Form lá embaixo) */}
                    <div className="flex space-x-3">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-xs font-bold border border-gray-600"
                                >
                                    <FaTimes className="mr-2" /> Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    form="client-edit-form" // Dispara o form que está renderizado no corpo
                                    className="flex items-center px-4 py-2 text-white bg-accent-secondary hover:bg-violet-600 rounded-lg transition text-xs font-bold shadow-lg border border-transparent"
                                >
                                    <FaSave className="mr-2" /> Salvar Alterações
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600"
                                title="Editar Dados"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- NAVEGAÇÃO (TABS) --- */}
            <div className="flex border-b border-gray-700 bg-gray-800/50 px-6 flex-shrink-0">
                <button 
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'OVERVIEW' ? 'border-accent-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Visão Geral & IA
                </button>
                <button 
                    onClick={() => setActiveTab('TIMELINE')}
                    className={`py-3 px-4 text-sm font-bold border-b-2 transition ${activeTab === 'TIMELINE' ? 'border-accent-primary text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Histórico de Interações
                </button>
            </div>

            {/* --- CORPO DO DASHBOARD --- */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* 1. BLOCO DE IA (Sempre visível) */}
                        <div className="bg-gray-800/50 rounded-xl border border-gray-600 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-secondary to-accent-primary"></div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-white flex items-center">
                                    <FaBrain className="mr-2 text-accent-primary" /> Dossiê Vivo (IA Memory)
                                </h3>
                            </div>
                            <div className="text-sm text-gray-300 leading-relaxed">
                                {client.aiSummary || <span className="text-gray-500 italic">Sem resumo de IA.</span>}
                            </div>
                        </div>

                        {/* 2. MÉTRICAS (Sempre visível) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                                <div className="text-xl font-bold text-white">R$ 0,00</div>
                                <div className="text-[10px] uppercase text-gray-500">LTV Total</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                                <div className="text-xl font-bold text-white">0</div>
                                <div className="text-[10px] uppercase text-gray-500">Negócios</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-center">
                                <div className="text-xl font-bold text-white">-</div>
                                <div className="text-[10px] uppercase text-gray-500">Última Compra</div>
                            </div>
                        </div>

                        {/* 3. ÁREA DINÂMICA: LEITURA ou EDIÇÃO */}
                        {isEditing ? (
                            // --- MODO EDIÇÃO (FORM) ---
                            <div className="pt-2 animate-fade-in-up">
                                <div className="flex items-center space-x-2 mb-4 text-accent-secondary border-b border-gray-700 pb-2">
                                    <FaEdit /> 
                                    <span className="text-xs font-bold uppercase">Editando Dados Cadastrais</span>
                                </div>
                                <ClientForm 
                                    client={client} 
                                    onSuccess={handleFormSuccess}
                                />
                            </div>
                        ) : (
                            // --- MODO LEITURA (CARDS) ---
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                {/* Contato */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Contato</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center text-sm text-gray-200">
                                            <FaEnvelope className="mr-3 text-gray-500" />
                                            <span className="truncate">{client.email || 'Não informado'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-200">
                                            <FaPhone className="mr-3 text-gray-500" />
                                            <span>{client.phone || 'Não informado'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Endereço */}
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Localização Principal</h4>
                                    <div className="flex items-start text-sm text-gray-200">
                                        <FaMapMarkerAlt className="mr-3 text-gray-500 mt-1 flex-shrink-0" />
                                        <span className="leading-relaxed">{addressText}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {activeTab === 'TIMELINE' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                        <FaHistory className="w-12 h-12 opacity-20" />
                        <p>Histórico de interações em breve...</p>
                    </div>
                )}

            </div>
        </div>
    );
};