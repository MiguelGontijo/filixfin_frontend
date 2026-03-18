import React from 'react';

// --- Tipagens e Contratos ---
import { Client } from '@/core/client/types/client';
import { CRMDeal } from '../../types';
import { CrudConfig } from '@/core/components/crud/types';

// --- Componentes Filhos e Motores Injetáveis ---
import { ClientDashboard } from '../../components/client-dashboard/ClientDashboard';
import { CrudForm } from '@/core/components/crud/forms/CrudForm'; // 👈 Apenas a nossa Impressora 3D V4

// --- Mutadores (CQRS) ---
import { useDealMutation } from '../../hooks/useDealMutation';
import { useClientMutation } from '@/core/client/hooks/useClientMutation'; // 👈 Hook de mutação do cliente

export type CockpitFormType = 'NONE' | 'CLIENT' | 'DEAL';

export interface CockpitCentralStageProps {
    client: Client;
    activeForm: CockpitFormType;
    dealToEdit?: CRMDeal | null;
    
    // 💡 INJEÇÃO DE DEPENDÊNCIA: Manuais de instrução para o Motor V4
    dealConfig?: CrudConfig<CRMDeal, any>;
    clientConfig?: CrudConfig<Client, any>; // 👈 Novo contrato exigido do Maestro
    
    onCloseForm: () => void;
    onEditClientRequest: () => void;
    onUpdateSuccess: () => void;
}

/**
 * ============================================================================
 * 🎭 PILAR 2: COCKPIT CENTRAL STAGE (A Área Nobre)
 * @description Roteador visual inline. Renderiza Dashboards ou delega a 
 * criação de formulários (Cliente/Deal) para o Motor V4 (CrudForm).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Zero acoplamento com formulários legados. 
 * - Reutilização de 100% do Motor V4 para qualquer entidade.
 * ============================================================================
 */
export const CockpitCentralStage: React.FC<CockpitCentralStageProps> = ({
    client,
    activeForm,
    dealToEdit,
    dealConfig,
    clientConfig,
    onCloseForm,
    onEditClientRequest,
    onUpdateSuccess
}) => {
    
    // Braços de escrita (Mutations)
    const { createDeal, updateDeal } = useDealMutation();
    const { updateClient } = useClientMutation();

    // ========================================================================
    // RENDER STATE 1: MODO EDIÇÃO DE CLIENTE (Agora usando o Motor V4)
    // ========================================================================
    if (activeForm === 'CLIENT') {
        
        if (!clientConfig) {
            return (
                <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl border border-red-900/50">
                    <p className="text-red-400 font-bold">Erro: Configuração do Cliente (clientConfig) não injetada pelo Maestro.</p>
                </div>
            );
        }

        return (
            <div className="flex-1 w-full h-full bg-gray-900/80 rounded-2xl border border-gray-700/80 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl relative">
                <CrudForm<Client, any>
                    isOpen={true}
                    onClose={onCloseForm}
                    config={clientConfig}
                    initialData={client}
                    presentationMode="inline" 
                    onSubmit={async (data) => {
                        try {
                            await updateClient(client.id, data);
                            onUpdateSuccess();
                            onCloseForm();
                        } catch (err) {
                            console.error("Falha ao atualizar Cliente:", err);
                            throw err;
                        }
                    }}
                />
            </div>
        );
    }

    // ========================================================================
    // RENDER STATE 2: MODO EDIÇÃO/CRIAÇÃO DE DEAL (Motor V4)
    // ========================================================================
    if (activeForm === 'DEAL') {
        
        if (!dealConfig) {
            return (
                <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl border border-red-900/50">
                    <p className="text-red-400 font-bold">Erro: Configuração da Oportunidade (dealConfig) não injetada pelo Maestro.</p>
                </div>
            );
        }

        return (
            <div className="flex-1 w-full h-full bg-gray-900/80 rounded-2xl border border-gray-700/80 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl relative">
                <CrudForm<CRMDeal, any>
                    isOpen={true}
                    onClose={onCloseForm}
                    config={dealConfig}
                    initialData={dealToEdit || undefined}
                    presentationMode="inline" 
                    onSubmit={async (data) => {
                        try {
                            if (dealToEdit) {
                                await updateDeal(dealToEdit.id, data);
                            } else {
                                await createDeal({ ...data, clientId: client.id });
                            }
                            onUpdateSuccess();
                            onCloseForm();
                        } catch (err) {
                            console.error("Falha na transação da Oportunidade:", err);
                            throw err;
                        }
                    }}
                />
            </div>
        );
    }

    // ========================================================================
    // RENDER STATE 3: MODO LEITURA (Dossiê IA e Timeline)
    // ========================================================================
    return (
        <div className="flex-1 w-full h-full animate-fade-in">
            <ClientDashboard 
                client={client}
                mode="VIEW" 
                onModeChange={(mode) => {
                    if (mode === 'EDIT') {
                        onEditClientRequest();
                    }
                }} 
                onUpdateSuccess={onUpdateSuccess} 
            />
        </div>
    );
};