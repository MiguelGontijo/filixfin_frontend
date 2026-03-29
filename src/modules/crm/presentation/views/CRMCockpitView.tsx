'use client';

import React, { useState } from 'react';
import { FaBrain } from 'react-icons/fa';

// --- Contratos e Tipos ---
import { Client } from '@/core/client/domain/types/client';
import { CRMDeal } from '../../domain/types';

// --- Motores Injetáveis (Os Manuais de Instrução V4) ---
import { useClientConfig } from '@/core/client/application/useClientConfig';
import { useDealConfig } from '../../application/useDealConfig';

// --- Motores de Dados (CQRS) ---
import { useClients } from '@/core/client/application/hooks/useClients';
import { usePipelines } from '../../application/hooks/usePipelines';

// --- Os 3 Pilares da Arquitetura V4 (Inversão de Controle) ---
import { CockpitSidebarLeft } from '../components/cockpit/CockpitSidebarLeft';
import { CockpitCentralStage } from '../components/cockpit/CockpitCentralStage';
import { CockpitSidebarRight } from '../components/cockpit/CockpitSidebarRight';

export interface CRMCockpitViewProps {
    selectedClient: Client | null;
    onSelectClient: (client: Client | null) => void;
    onOpenNewClient: () => void;
}

/**
 * @type FormState
 * @description Mantém o histórico de qual tela (Leitura, Cliente ou Deal) 
 * deve ser projetada no Palco Central.
 * 💡 FIX: O tipo de 'CLIENT' agora permite 'null', habilitando o Modo de Criação.
 */
type FormState = 
    | { type: 'NONE' }
    | { type: 'CLIENT'; data: Client | null }
    | { type: 'DEAL'; data: CRMDeal | null };

/**
 * ============================================================================
 * 🏗️ ROTEADOR ESTRUTURAL: CRMCockpitView (O Maestro do CRM V4)
 * @description A planta baixa definitiva da nova Workstation. 
 * Implementa o padrão "Holy Grail Layout" com painéis independentes.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Substituição do 'useEffect' cego por 'Interceptadores Proativos', 
 * garantindo que a máquina de estados (formState) só resete quando for 
 * uma intenção real do usuário (clicar em outro cliente), e não um side-effect.
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

    // =========================================================================
    // 📡 DADOS GLOBAIS PARA INJEÇÃO
    // Buscamos as listas necessárias para os selects dinâmicos do DealConfig
    // =========================================================================
    const { clients } = useClients();
    const { pipelines } = usePipelines();

    // =========================================================================
    // 🖨️ OS MANUAIS DE INSTRUÇÃO (Para a Impressora 3D V4)
    // Instanciamos as regras de negócio visuais de Cliente e Deal.
    // =========================================================================
    const clientConfig = useClientConfig();
    const dealConfig = useDealConfig(clients, pipelines, false);

    // =========================================================================
    // ⚙️ HANDLERS (Interceptadores de Intenção)
    // =========================================================================
    
    /**
     * @method handleSelectClientInterceptor
     * @description O Guardião do Contexto. Se o usuário clicar em um cliente
     * diferente na lista esquerda, abortamos qualquer form que esteja aberto
     * no centro, para evitar que ele salve dados no cliente errado.
     */
    const handleSelectClientInterceptor = (client: Client | null) => {
        if (client?.id !== selectedClient?.id) {
            setFormState({ type: 'NONE' });
        }
        onSelectClient(client);
    };

    /**
     * @method handleNewClientRequest
     * @description Resolve o "Buraco Negro". Avisa a máquina de estados que
     * o palco central DEVE ficar ativo, no modo CLIENT, e sem dados (Criação).
     */
    const handleNewClientRequest = () => {
        onOpenNewClient(); // Avisa o topo (CRMContainer) para soltar o cliente atual
        setFormState({ type: 'CLIENT', data: null }); // Arma a impressora em modo branco
    };

    const handleEditClientRequest = (clientToEdit?: Client | Partial<Client>) => {
        const targetClient = clientToEdit || selectedClient;
        if (targetClient) {
            // Se for um rascunho (sem ID), tratamos como criação no palco central
            setFormState({ type: 'CLIENT', data: targetClient as Client });
        }
    };

    const handleDealFormRequest = (deal?: CRMDeal | Partial<CRMDeal> | null) => {
        // Se o deal vier undefined, a máquina de estados entende como um 'Novo Registro'
        setFormState({ type: 'DEAL', data: (deal as CRMDeal) || null });
    };

    const handleCloseForm = () => {
        setFormState({ type: 'NONE' });
        // Se o usuário cancelar a criação de um "Novo Cliente", 
        // o palco ficará vazio e voltará a mostrar o Cérebro da IA graciosamente.
    };

    // =========================================================================
    // 🖼️ LÓGICA DE ATIVAÇÃO DO PALCO
    // O Palco não morre se selectedClient for null, desde que a intenção
    // do usuário seja criar um novo cliente (formState.type === 'CLIENT').
    // =========================================================================
    const isCentralStageActive = selectedClient !== null || formState.type === 'CLIENT';

    return (
        <div className="flex flex-row h-full w-full bg-base-dark text-base-text overflow-hidden animate-fade-in font-sans">
            
            {/* ================================================================
                🎛️ PILAR 1: PAINEL DE CONTROLE (Esquerda)
            ================================================================ */}
            <CockpitSidebarLeft 
                selectedClient={selectedClient}
                
                // 💡 O FIO CONDUTOR: Extrai o Deal ativo do formState e repassa
                selectedDeal={formState.type === 'DEAL' ? formState.data : null}
                
                onSelectClient={handleSelectClientInterceptor}
                onOpenNewClient={handleNewClientRequest}
                onEditClientRequest={handleEditClientRequest}
                onDealFormRequest={handleDealFormRequest}
            />

            {/* ================================================================
                🎭 PILAR 2: PALCO CENTRAL (Área Nobre)
            ================================================================ */}
            <main className="flex-1 min-w-0 h-full bg-base-metallic/5 relative flex flex-col p-4">
                
                {isCentralStageActive ? (
                    <CockpitCentralStage 
                        // O "as Client" aqui é um bypass seguro para a tipagem, pois 
                        // resolveremos a capacidade do palco aceitar "null" no próximo arquivo.
                        client={selectedClient as Client} 
                        activeForm={formState.type}
                        dealToEdit={formState.type === 'DEAL' ? formState.data : null}
                        
                        dealConfig={dealConfig}
                        clientConfig={clientConfig}
                        
                        onCloseForm={handleCloseForm}
                        onEditClientRequest={() => handleEditClientRequest()}
                        onUpdateSuccess={() => {
                            // A transação foi salva com sucesso. Listas reagem sozinhas.
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