import React, { useState, useEffect } from 'react';
import { 
    FaUser, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt, 
    FaIdCard, FaBrain, FaSave, FaTimes, 
    FaMagic, FaPlusCircle, FaStickyNote, 
    FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { Client, AddressType } from '@/core/client/domain/types/client';

// --- AQUI ESTÁ A MUDANÇA: Importamos o Módulo Soberano ---
import { TimelineModule } from '@/modules/timeline/TimelineModule';
import { AppModules } from '@/core/ai/types/enums/AIEnums';
import { ClientForm } from './ClientForm';

export type DashboardMode = 'VIEW' | 'EDIT' | 'CREATE';

interface ClientDashboardProps {
    client: Client | null;
    mode: DashboardMode;
    onModeChange: (mode: DashboardMode) => void;
    onUpdateSuccess: () => void;
}

type DashboardTab = 'OVERVIEW' | 'TIMELINE';

// --- SUB-COMPONENTE: CARD EXPANSÍVEL (Mantido igual) ---
const ExpandableInfoCard: React.FC<{ 
    title: string; 
    icon: React.ElementType; 
    content: string | null; 
    placeholder: string;
}> = ({ title, icon: Icon, content, placeholder }) => {
    
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldCollapse = content && content.length > 200;

    return (
        <div className="bg-gray-800/50 rounded-xl border border-gray-600 p-4 relative overflow-hidden group transition-all hover:border-gray-500">
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
 * @update Integrado com o novo TimelineModule V8.
 */
export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
    client, 
    mode, 
    onModeChange, 
    onUpdateSuccess 
}) => {
    
    const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');

    // Reset da tab quando muda o cliente
    useEffect(() => {
        if (mode !== 'CREATE') {
            setActiveTab('OVERVIEW');
        }
    }, [client?.id, mode]);

    // Tela de "Nenhum Cliente Selecionado"
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

    // Objeto de fallback seguro para renderização
    const displayClient = client || {
        name: 'Novo Cliente',
        document: '',
        email: '',
        phone: '',
        isActive: true,
        aiSummary: null,
        userNotes: null,
        addresses: []
    } as unknown as Client;

    const mainAddress = displayClient.addresses?.find(a => a.type === AddressType.MAIN) || displayClient.addresses?.[0];
    const addressText = mainAddress 
        ? `${mainAddress.street}, ${mainAddress.number} - ${mainAddress.district}, ${mainAddress.city}/${mainAddress.state}`
        : 'Sem endereço cadastrado';

    return (
        <div className="bg-base-metallic rounded-xl border border-gray-700 flex flex-col h-full overflow-hidden shadow-2xl relative">
            
            {/* --- HEADER (Fixo) --- */}
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

            {/* --- NAVEGAÇÃO (Abas) --- */}
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
                        Timeline (Histórico)
                    </button>
                </div>
            )}

            {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- 
                Lógica de Scroll Inteligente:
                - Se for OVERVIEW ou FORM: Usa overflow-y-auto (scroll da página)
                - Se for TIMELINE: Usa overflow-hidden (o scroll é interno do módulo timeline)
            */}
            <div className={`
                flex-1 
                ${activeTab === 'TIMELINE' && !isFormOpen ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar p-6'}
            `}>
                
                {isFormOpen ? (
                    // --- MODO FORMULÁRIO (EDIT/CREATE) ---
                    <div className="space-y-6 animate-fade-in pb-6">
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
                                onSuccess={onUpdateSuccess}
                                showSubmitButton={false}
                            />
                        </div>
                    </div>
                ) : (
                    // --- MODO VISUALIZAÇÃO ---
                    <>
                        {activeTab === 'OVERVIEW' && (
                            <div className="space-y-6 animate-fade-in">
                                <ExpandableInfoCard 
                                    title="Dossiê Vivo (IA Memory)"
                                    icon={FaBrain}
                                    content={displayClient.aiSummary}
                                    placeholder="Ainda não há um resumo gerado pela Inteligência Artificial."
                                />
                                <ExpandableInfoCard 
                                    title="Notas Pessoais"
                                    icon={FaStickyNote}
                                    content={displayClient.userNotes}
                                    placeholder="Nenhuma nota privada adicionada. Clique em editar para adicionar."
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            /* MÓDULO SOBERANO TIMELINE 
                                - Ocupa 100% da altura disponível (h-full)
                                - entityId pode ser undefined se o cliente for null (embora o 'if' lá em cima proteja)
                            */
                            <div className="h-full w-full animate-fade-in">
                                <TimelineModule 
                                    entityId={displayClient.id} 
                                    module={AppModules.CLIENTE}
                                    className="h-full" // Garante que o scroll interno funcione
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};