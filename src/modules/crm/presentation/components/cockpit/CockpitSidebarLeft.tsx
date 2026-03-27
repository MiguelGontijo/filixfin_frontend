import React, { useState } from 'react';
import { FaRegHandshake, FaBoxOpen, FaInbox } from 'react-icons/fa';

// --- Tipagens ---
import { Client } from '@/core/client/types/client';
import { CRMDeal } from '../../../domain/types';

// --- Motores Visuais (V4) ---
import { ClientRegistry } from '@/core/client/registries/ClientRegistry';
import { DealRegistry } from '../../registries/DealRegistry';

/**
 * @type LeftTab
 * @description Define as abas ativas na metade inferior da barra lateral.
 */
type LeftTab = 'DEALS' | 'ORDERS';

/**
 * @interface CockpitSidebarLeftProps
 * @description Contrato estrito de comunicação entre a Barra Esquerda e o Maestro (CockpitView).
 * * 🏆 CLASSE OURO: Inversão de Controle (IoC). A barra lateral não abre modais nem
 * controla o palco central. Ela apenas emite "Intenções" (Requests) para o componente pai.
 * E agora atua como conduíte de estado de seleção (Prop Drilling) para iluminar os cards ativos.
 */
interface CockpitSidebarLeftProps {
    /** @description O cliente atualmente focado no CRM (Palco Central) */
    selectedClient: Client | null;
    
    /** @description 💡 A oportunidade (Deal) atualmente focada no CRM (Palco Central) */
    selectedDeal: CRMDeal | null;
    
    /** @description Ação: Usuário selecionou um cliente na lista */
    onSelectClient: (client: Client | null) => void;
    
    /** @description Ação: Usuário clicou em "Novo" na lista de clientes */
    onOpenNewClient: () => void;
    
    /** @description Ação: Usuário clicou no ícone de Lápis/Engrenagem na lista de clientes */
    onEditClientRequest: (client: Client | Partial<Client>) => void;
    
    /** @description Ação: Usuário clicou em "Novo Deal" ou "Editar Deal" na lista inferior */
    onDealFormRequest: (deal: CRMDeal | null) => void;
}

/**
 * ============================================================================
 * 🎛️ PILAR 1: COCKPIT SIDEBAR LEFT (O Centro de Comando)
 * @description Responsável por definir o "Contexto Global" do CRM. 
 * Metade superior: Lista de Clientes (Motor V4). 
 * Metade inferior: Registros vinculados ao cliente (Deals, Pedidos).
 * ============================================================================
 */
export const CockpitSidebarLeft: React.FC<CockpitSidebarLeftProps> = ({
    selectedClient,
    selectedDeal, // 💡 Recebemos a intenção de foco do Maestro
    onSelectClient,
    onOpenNewClient,
    onEditClientRequest,
    onDealFormRequest
}) => {
    // Estado local para controlar a aba inferior (Isolado, não afeta o resto do sistema)
    const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>('DEALS');

    return (
        <aside className="w-[340px] flex-shrink-0 flex flex-col h-full bg-gray-900 border-r border-gray-800 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
            
            {/* ================================================================
                METADE SUPERIOR: Motor de Busca e Lista de Clientes (V4)
            ================================================================ */}
            <div className="flex-1 min-h-0 flex flex-col border-b border-gray-800">
                <ClientRegistry 
                    variant="compact"
                    // 💡 O FIO CONDUTOR DO CLIENTE: Informa ao Registry qual ID destacar
                    selectedItemId={selectedClient?.id} 
                    
                    // Emite a intenção de seleção para o Maestro
                    onSelectClient={onSelectClient}
                    // Transforma o request unificado do Motor V4 nas ações específicas do Maestro
                    onFormRequest={(clientToEdit) => {
                        if (clientToEdit) {
                            onEditClientRequest(clientToEdit);
                        } else {
                            onOpenNewClient();
                        }
                    }}
                />
            </div>

            {/* ================================================================
                METADE INFERIOR: Dossiê Secundário (Deals & Pedidos do Cliente)
            ================================================================ */}
            <div className="flex-1 min-h-0 flex flex-col bg-gray-900/50">
                
                {/* Cabeçalho de Abas Inferiores */}
                <div className="flex border-b border-gray-800/80 flex-shrink-0 bg-gray-800/20">
                    <button 
                        onClick={() => setActiveLeftTab('DEALS')}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2 ${
                            activeLeftTab === 'DEALS' 
                                ? 'border-accent-primary text-accent-primary bg-accent-primary/5' 
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        <FaRegHandshake size={14} /> Deals
                    </button>
                    <button 
                        onClick={() => setActiveLeftTab('ORDERS')}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-2 ${
                            activeLeftTab === 'ORDERS' 
                                ? 'border-accent-primary text-accent-primary bg-accent-primary/5' 
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                        }`}
                    >
                        <FaBoxOpen size={14} /> Pedidos
                    </button>
                </div>

                {/* Área de Visualização do Dossiê Secundário */}
                <div className="flex-1 min-h-0 p-2 overflow-hidden relative">
                    {!selectedClient ? (
                        // ZERO STATE: Nenhum cliente selecionado no topo
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-40">
                            <FaInbox className="text-3xl mb-3 text-gray-500" />
                            <p className="text-xs text-gray-400 font-medium">Selecione um cliente acima para carregar as oportunidades.</p>
                        </div>
                    ) : (
                        // CONTEÚDO ATIVO
                        <>
                            {activeLeftTab === 'DEALS' && (
                                <DealRegistry 
                                    variant="compact" 
                                    clientId={selectedClient.id} 
                                    
                                    // 💡 O FIO CONDUTOR DO DEAL: Informa ao Registry qual ID destacar
                                    selectedItemId={selectedDeal?.id} 
                                    
                                    onFormRequest={onDealFormRequest} 
                                />
                            )}
                            {activeLeftTab === 'ORDERS' && (
                                <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-800 rounded-xl m-2 text-gray-600 text-xs">
                                    Módulo de Pedidos em breve.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
};