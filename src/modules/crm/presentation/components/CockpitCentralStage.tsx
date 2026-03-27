import React from 'react';

// --- Tipagens e Contratos ---
import { Client } from '@/core/client/types/client';
import { CRMDeal } from '../../types';
import { CrudConfig } from '@/core/components/crud/types';

// --- Componentes Filhos e Motores Injetáveis ---
import { CrudFormOrchestrator } from '@/core/components/crud/orchestrators/CrudFormOrchestrator'; 
import { ClientDashboard } from '../../components/client-dashboard/ClientDashboard'; // 👑 O Retorno do Rei (Memória de IA)

// --- Mutadores (CQRS - Padrão Command) ---
import { useDealMutation } from '../../hooks/useDealMutation';
import { useClientMutation } from '@/core/client/hooks/useClientMutation';

export type CockpitFormType = 'NONE' | 'CLIENT' | 'DEAL';

export interface CockpitCentralStageProps {
    client: Client | null; 
    activeForm: CockpitFormType;
    dealToEdit?: CRMDeal | null;
    
    dealConfig?: CrudConfig<CRMDeal, any>;
    clientConfig?: CrudConfig<Client, any>; 
    
    onCloseForm: () => void;
    onEditClientRequest: () => void;
    onUpdateSuccess: () => void;
}

/**
 * ============================================================================
 * 🎭 PILAR 2: COCKPIT CENTRAL STAGE (A Área Nobre)
 * @description Roteador visual inline. Delega a edição/criação para o Motor V4,
 * e a visualização rica (Memória de Curto/Médio Prazo) para o Dashboard de IA.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Domain-Driven Design (DDD): O Motor CRUD atua apenas como "ferramenta de entrada". 
 * A leitura estratégica e o processamento de IA continuam no coração do domínio CRM.
 * - Key Forcing (Reset Absoluto): Força o React a destruir e recriar o DOM
 * ao trocar de entidade, eliminando qualquer risco de vazamento de estado (Memory Leaks).
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
    
    const { createDeal, updateDeal } = useDealMutation();
    const { createClient, updateClient } = useClientMutation();

    // ========================================================================
    // 📝 RENDER STATE 1: MODO CRIAÇÃO / EDIÇÃO DE CLIENTE (O Motor V4 assume)
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
                <CrudFormOrchestrator<Client, any>
                    // 💡 KEY FORCING: Nasce um formulário 100% virgem a cada clique
                    key={`client-form-${client?.id || 'new'}`}
                    isOpen={true}
                    onClose={onCloseForm}
                    config={clientConfig}
                    initialData={client || undefined} 
                    presentationMode="inline" 
                    formMode="edit"
                    onSubmit={async (data) => {
                        try {
                            if (client) {
                                await updateClient(client.id, data);
                            } else {
                                await createClient(data); 
                            }
                            onUpdateSuccess();
                            onCloseForm();
                        } catch (err) {
                            console.error("Falha ao salvar Cliente:", err);
                            throw err; 
                        }
                    }}
                />
            </div>
        );
    }

    // ========================================================================
    // 💼 RENDER STATE 2: MODO CRIAÇÃO / EDIÇÃO DE DEAL
    // ========================================================================
    if (activeForm === 'DEAL') {
        
        if (!client) {
            return (
                <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-2xl border border-red-900/50 p-6 text-center">
                    <p className="text-red-400 font-bold mb-2">Erro de Consistência</p>
                    <p className="text-gray-400 text-sm">É necessário selecionar ou salvar um cliente antes de gerenciar oportunidades.</p>
                </div>
            );
        }

        if (!dealConfig) {
            return (
                <div className="flex-1 w-full h-full flex items-center justify-center bg-gray-900 rounded-2xl border border-red-900/50">
                    <p className="text-red-400 font-bold">Erro: Configuração da Oportunidade (dealConfig) não injetada.</p>
                </div>
            );
        }

        return (
            <div className="flex-1 w-full h-full bg-gray-900/80 rounded-2xl border border-gray-700/80 flex flex-col overflow-hidden animate-fade-in-up shadow-2xl relative">
                <CrudFormOrchestrator<CRMDeal, any>
                    // 💡 KEY FORCING ACOPLADO: Se mudar a deal ou o cliente, o form limpa
                    key={`deal-form-${dealToEdit?.id || 'new'}-${client.id}`}
                    isOpen={true}
                    onClose={onCloseForm}
                    config={dealConfig}
                    initialData={dealToEdit || undefined}
                    presentationMode="inline" 
                    formMode="edit"
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
    // 👁️ RENDER STATE 3: MODO LEITURA (Dashboard de IA & Timeline)
    // @description Se o activeForm for 'NONE' e houver um cliente, exibimos
    // o Cérebro de Relacionamento Master.
    // ========================================================================
    if (activeForm === 'NONE' && client) {
        return (
            <div className="flex-1 w-full h-full animate-fade-in">
                <ClientDashboard 
                    // 💡 KEY FORCING MÁXIMO: Ao clicar num novo cliente no menu lateral,
                    // a IA zera todo o estado interno, fecha websockets e refaz as queries.
                    key={`ai-dashboard-${client.id}`}
                    
                    client={client}
                    mode="VIEW" 
                    onModeChange={(mode) => {
                        // Delega a ação de edição solicitada internamente no Dashboard
                        // para o Maestro Central orquestrar a troca de tela.
                        if (mode === 'EDIT') {
                            onEditClientRequest();
                        }
                    }} 
                    onUpdateSuccess={onUpdateSuccess} 
                />
            </div>
        );
    }

    // Fallback: Se não for nenhum dos 3 estados (ex: NONE sem cliente), retorna vazio
    return null;
};