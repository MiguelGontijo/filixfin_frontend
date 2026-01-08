// src/modules/crm/components/client-dashboard/ClientDashboard.tsx

import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, 
    FaIdCard, FaBrain, FaSave, FaTimes, 
    FaMagic, FaPlusCircle, FaStickyNote, 
    FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { Client, AddressType } from '@/core/types/client';
import { ClientForm } from '@/core/components/client/ClientForm';
import { InteractionTimeline } from './InteractionTimeline';

export type DashboardMode = 'VIEW' | 'EDIT' | 'CREATE';

interface ClientDashboardProps {
    client: Client | null;
    mode: DashboardMode;
    onModeChange: (mode: DashboardMode) => void;
    onUpdateSuccess: () => void;
}

type DashboardTab = 'OVERVIEW' | 'TIMELINE';

// --- SUB-COMPONENTE REUTILIZÁVEL: CARD EXPANSÍVEL ---
// Garante que IA e Notas tenham exatamente o mesmo comportamento e visual
const ExpandableInfoCard: React.FC<{ 
    title: string; 
    icon: React.ElementType; 
    content: string | null; 
    placeholder: string;
}> = ({ title, icon: Icon, content, placeholder }) => {
    
    const [isExpanded, setIsExpanded] = useState(false);
    // Define um limite de caracteres para ativar o collapse (ex: 200 chars)
    const shouldCollapse = content && content.length > 200;

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-600 p-4 relative overflow-hidden group transition-all hover:border-gray-500">
            {/* Barra lateral gradiente (Estilo unificado) */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-secondary to-accent-primary"></div>
            
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white flex items-center">
                    <Icon className="mr-2 text-accent-primary" /> {title}
                </h3>
            </div>
            
            <div className="relative">
                <div className={`text-sm text-gray-300 leading-relaxed whitespace-pre-wrap ${!isExpanded && shouldCollapse ? 'line-clamp-3' : ''}`}>
                    {content || <span className="text-gray-500 italic">{placeholder}</span>}
                </div>

                {/* Botão de Toggle (Só aparece se o texto for longo) */}
                {shouldCollapse && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 text-[10px] uppercase font-bold text-accent-secondary hover:text-white flex items-center transition focus:outline-none"
                    >
                        {isExpanded ? (
                            <>Recolher <FaChevronUp className="ml-1" /></>
                        ) : (
                            <>Ler mais <FaChevronDown className="ml-1" /></>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * @component ClientDashboard
 * @description Painel Central Unificado.
 * @update Adicionado suporte a Collapse/Expand e novo card de Notas do Usuário.
 */
export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
    client, 
    mode, 
    onModeChange, 
    onUpdateSuccess 
}) => {
    
    const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');

    useEffect(() => {
        if (mode !== 'CREATE') {
            setActiveTab('OVERVIEW');
        }
    }, [client?.id, mode]);

    if (!client && mode !== 'CREATE') {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-base-metallic/50 rounded-xl border border-gray-700/50 border-dashed">
                <div className="p-4 bg-gray-800 rounded-full mb-4">
                    <FaUser className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-400">Nenhum Cliente Selecionado</h3>
                <p className="text-sm mt-2 max-w-xs text-center opacity-70">
                    Selecione um cliente na lista à esquerda ou clique em "Novo" para cadastrar.
                </p>
            </div>
        );
    }

    const isCreating = mode === 'CREATE';
    const isFormOpen = mode === 'CREATE' || mode === 'EDIT';

    const displayClient = client || {
        name: 'Novo Cliente',
        document: '',
        email: '',
        phone: '',
        isActive: true,
        aiSummary: null,
        userNotes: null, // Placeholder para criação
        addresses: []
    } as unknown as Client;

    const mainAddress = displayClient.addresses?.find(a => a.type === AddressType.MAIN) || displayClient.addresses?.[0];
    const addressText = mainAddress 
        ? `${mainAddress.street}, ${mainAddress.number} - ${mainAddress.district}, ${mainAddress.city}/${mainAddress.state}`
        : 'Sem endereço cadastrado';

    const handleFormSuccess = () => {
        onUpdateSuccess();
    };

    return (
        <div className="bg-base-metallic rounded-xl border border-gray-700 flex flex-col h-full overflow-hidden shadow-2xl relative">
            
            {/* --- HEADER --- */}
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center border-2 shadow-lg ${isCreating ? 'bg-gray-700 border-gray-500 text-gray-400' : 'bg-accent-primary/20 border-accent-primary text-accent-primary'}`}>
                            {isCreating ? (
                                <FaPlusCircle className="text-2xl" />
                            ) : (
                                <span className="text-2xl font-bold">{displayClient.name.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        
                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                {isCreating ? 'Cadastrando Novo Cliente' : displayClient.name}
                            </h1>
                            
                            {!isCreating && (
                                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-400">
                                    {displayClient.document ? (
                                        <span className="flex items-center"><FaIdCard className="mr-1.5 opacity-70" /> {displayClient.document}</span>
                                    ) : (
                                        <span className="flex items-center text-accent-secondary"><FaMagic className="mr-1.5" /> Lead (Em prospecção)</span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${displayClient.isActive ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                                        {displayClient.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {isFormOpen ? (
                            <>
                                <button 
                                    onClick={() => onModeChange('VIEW')}
                                    className="flex items-center px-3 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-xs font-bold border border-gray-600"
                                >
                                    <FaTimes className="mr-1" /> Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    form="client-edit-form"
                                    className="flex items-center px-3 py-2 text-white bg-accent-secondary hover:bg-violet-600 rounded-lg transition text-xs font-bold shadow-lg"
                                >
                                    <FaSave className="mr-1" /> {isCreating ? 'Cadastrar' : 'Salvar'}
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => onModeChange('EDIT')}
                                className="p-2 text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition border border-gray-600"
                                title="Editar Dados"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- NAVEGAÇÃO --- */}
            {!isFormOpen && (
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
            )}

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                
                {isFormOpen ? (
                    // --- MODO FORMULÁRIO ---
                    <div className="space-y-6 animate-fade-in">
                        
                        {/* Exibição dos Cards em modo "Read-Only/Disabled" visual durante a criação para manter layout */}
                        <div className="opacity-60 grayscale cursor-not-allowed">
                            <ExpandableInfoCard 
                                title="Dossiê Vivo (IA Memory)"
                                icon={FaBrain}
                                content={displayClient.aiSummary}
                                placeholder="O dossiê será gerado automaticamente."
                            />
                        </div>

                        <div className="pt-2 border-t border-gray-700">
                            <h4 className="text-xs font-bold text-accent-secondary uppercase mb-4">
                                {isCreating ? 'Preencha os dados do novo cliente' : 'Editando Dados Cadastrais'}
                            </h4>
                            <ClientForm 
                                client={isCreating ? undefined : client!} 
                                onSuccess={handleFormSuccess}
                                showSubmitButton={false}
                            />
                        </div>
                    </div>
                ) : (
                    // --- MODO VISUALIZAÇÃO ---
                    <>
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6 animate-fade-in">
                                
                                {/* 1. Dossiê da IA */}
                                <ExpandableInfoCard 
                                    title="Dossiê Vivo (IA Memory)"
                                    icon={FaBrain}
                                    content={displayClient.aiSummary}
                                    placeholder="Ainda não há um resumo gerado pela Inteligência Artificial."
                                />

                                {/* 2. Notas do Usuário (NOVO) */}
                                <ExpandableInfoCard 
                                    title="Notas Pessoais"
                                    icon={FaStickyNote}
                                    content={displayClient.userNotes}
                                    placeholder="Nenhuma nota privada adicionada. Clique em editar para adicionar."
                                />

                                {/* 3. Dados Cadastrais */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Contato */}
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Contato</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-200">
                                                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-3 text-gray-400"><FaEnvelope /></div>
                                                <span className="truncate">{displayClient.email || 'Não informado'}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-200">
                                                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-3 text-gray-400"><FaPhone /></div>
                                                <span>{displayClient.phone || 'Não informado'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Endereço */}
                                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Localização Principal</h4>
                                        <div className="flex items-start text-sm text-gray-200">
                                            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-3 text-gray-400 flex-shrink-0"><FaMapMarkerAlt /></div>
                                            <span className="leading-relaxed">{addressText}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'TIMELINE' && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                                <InteractionTimeline clientId={displayClient.id} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};