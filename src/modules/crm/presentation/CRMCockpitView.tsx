'use client';

import React, { useState, useEffect } from 'react';
import { FaBrain } from 'react-icons/fa';

// --- Contratos e Tipos ---
import { Client } from '@/core/client/types/client';
import { CRMDeal } from '../types';

// --- Os 3 Pilares da Arquitetura V4 (Inversão de Controle) ---
import { CockpitSidebarLeft } from './components/CockpitSidebarLeft';
import { CockpitCentralStage } from './components/CockpitCentralStage';
import { CockpitSidebarRight } from './components/CockpitSidebarRight';

// ⚠️ Nota: Mantive a chamada para a sua configuração do CrudForm com base no legado.
// Caso você ainda não tenha isolado o 'useDealConfig' num hook próprio, 
// basta importar a sua `const config = ...` do DealRegistry aqui.
// import { useDealConfig } from '../hooks/useDealConfig';

export interface CRMCockpitViewProps {
    selectedClient: Client | null;
    onSelectClient: (client: Client | null) => void;
    onOpenNewClient: () => void;
}

/**
 * @type FormState
 * @description Mantém o histórico de qual tela (Leitura, Cliente ou Deal) 
 * deve ser projetada no Palco Central.
 */
type FormState = 
    | { type: 'NONE' }
    | { type: 'CLIENT'; data: Client }
    | { type: 'DEAL'; data: CRMDeal | null };

/**
 * ============================================================================
 * 🏗️ ROTEADOR ESTRUTURAL: CRMCockpitView (O Maestro do CRM V4)
 * @description A planta baixa definitiva da nova Workstation. 
 * Implementa o padrão "Holy Grail Layout" com painéis independentes.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Separação Absoluta de Preocupações (SoC).
 * - Zero Modais: Experiência de aplicativo nativo (Inline Routing).
 * ============================================================================
 */
export function CRMCockpitView({ 
    selectedClient, 
    onSelectClient, 
    onOpenNewClient
}: CRMCockpitViewProps) {
    
    // =========================================================================
    // 🧠 ESTADOS DA MÁQUINA DE NAVEGAÇÃO
    // =========================================================================
    const [formState, setFormState] = useState<FormState>({ type: 'NONE' });

    /**
     * 🛡️ PREVENÇÃO DE FORMULÁRIO ZUMBI (Life-cycle hook)
     * @description Se o usuário trocar de cliente na barra esquerda enquanto 
     * edita uma Deal, o sistema aborta a edição instantaneamente para prevenir
     * o salvamento de dados no cliente errado.
     */
    useEffect(() => {
        setFormState({ type: 'NONE' });
    }, [selectedClient?.id]);

    // O "Manual de Instruções" da Oportunidade para a Impressora 3D (CrudForm).
    // @ts-ignore - Bypass de segurança caso o hook ainda esteja sendo construído
    const dealConfig = typeof useDealConfig === 'function' ? useDealConfig('standard', selectedClient?.id) : undefined;

    // =========================================================================
    // ⚙️ HANDLERS (Interceptadores de Intenção)
    // =========================================================================
    
    const handleEditClientRequest = (clientToEdit?: Client) => {
        const targetClient = clientToEdit || selectedClient;
        if (targetClient) {
            // Garante que a barra esquerda e o contexto global estejam sincronizados
            if (targetClient.id !== selectedClient?.id) {
                onSelectClient(targetClient);
            }
            
            // O setTimeout joga a montagem do form para o fim da fila de renderização (60FPS)
            setTimeout(() => {
                setFormState({ type: 'CLIENT', data: targetClient });
            }, 0);
        }
    };

    const handleDealFormRequest = (deal: CRMDeal | null) => {
        setFormState({ type: 'DEAL', data: deal });
    };

    const handleCloseForm = () => {
        setFormState({ type: 'NONE' });
    };

    // =========================================================================
    // 🖼️ RENDERIZAÇÃO DO ESQUELETO (O Quebra-Cabeça Montado)
    // =========================================================================
    return (
        <div className="flex flex-row h-full w-full bg-base-dark text-base-text overflow-hidden animate-fade-in font-sans">
            
            {/* ================================================================
                🎛️ PILAR 1: PAINEL DE CONTROLE (Esquerda)
            ================================================================ */}
            <CockpitSidebarLeft 
                selectedClient={selectedClient}
                onSelectClient={onSelectClient}
                onOpenNewClient={onOpenNewClient}
                onEditClientRequest={handleEditClientRequest}
                onDealFormRequest={handleDealFormRequest}
            />

            {/* ================================================================
                🎭 PILAR 2: PALCO CENTRAL (Área Nobre)
            ================================================================ */}
            {/* Adicionado padding (p-4) para o palco não grudar nas barras laterais */}
            <main className="flex-1 min-w-0 h-full bg-base-metallic/5 relative flex flex-col p-4">
                
                {selectedClient ? (
                    // O Roteador Visual Inline entra em ação
                    <CockpitCentralStage 
                        client={selectedClient}
                        activeForm={formState.type}
                        dealToEdit={formState.type === 'DEAL' ? formState.data : null}
                        dealConfig={dealConfig}
                        onCloseForm={handleCloseForm}
                        onEditClientRequest={() => handleEditClientRequest()}
                        onUpdateSuccess={() => {
                            // A Oportunidade foi salva com sucesso!
                            // Se o seu useDeals ou React Query usar eventos globais, 
                            // as listas na barra lateral já se atualizarão sozinhas.
                        }}
                    />
                ) : (
                    // ZERO STATE: Nenhum cliente focado
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 animate-pulse">
                        <FaBrain className="text-6xl mx-auto mb-4 text-gray-600" />
                        <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest">Palco Central</h2>
                        <p className="text-sm text-gray-600 mt-2 max-w-sm mx-auto">
                            Selecione um cliente na lista à esquerda para ativar a Inteligência Artificial e carregar os Dossiês de Venda.
                        </p>
                    </div>
                )}
            </main>

            {/* ================================================================
                💬 PILAR 3: PAINEL OMNICHANNEL (Direita)
            ================================================================ */}
            <CockpitSidebarRight client={selectedClient} />

        </div>
    );
}