import React from 'react';

// --- Tipagens e Contratos ---
import { CrudConfig, ListMode } from '../../types';

// --- Operários Especializados (Views) ---
import { CrudTable } from '../list/components/CrudTable';
import { CrudCardList } from '../list/components/CrudCardList'; 

/**
 * @interface CrudListOrchestratorProps
 * @description Contrato de dados que o Maestro exige para poder distribuir o trabalho.
 * * 🏆 PADRÃO CLASSE OURO: Tipagem estrita que garante a injeção do contexto 
 * de seleção (selectedItemId) para repasse aos componentes visuais fluidos.
 */
export interface CrudListOrchestratorProps<T extends { id: string }> {
    /** Define qual Operário Visual será chamado ('table' ou 'cards') */
    listMode?: ListMode;
    data: T[];
    config: CrudConfig<T, any>;
    isLoading?: boolean;
    onEdit: (item: T) => void;
    onDelete: (id: string) => void;
    
    // 💡 O FIO CONDUTOR DE ESTADO: Recebe a intenção de foco passivo da camada superior
    selectedItemId?: string;
    
    // 💡 O FIO CONDUTOR DE AÇÃO (NOVO): Repassa a intenção de abrir o Dossiê/Dashboard
    onViewRequest?: (item: T) => void;
}

/**
 * ============================================================================
 * 🔀 ORQUESTRADOR: CrudList (O Roteador Visual da Vitrine)
 * @description Aplicação do Princípio Aberto/Fechado (SOLID) e Strategy Pattern.
 * Este componente é intencionalmente "burro" (Dumb Component). Ele não contém
 * HTML de layout próprio, apenas lê a propriedade `listMode` e delega a 
 * renderização para o componente especializado correto.
 * ============================================================================
 */
export function CrudListOrchestrator<T extends { id: string }>({
    listMode = 'table', // O padrão do sistema continua sendo a Tabela Master Data
    data,
    config,
    isLoading,
    onEdit,
    onDelete,
    selectedItemId, // 💡 Extrai a prop para o repasse de estado
    onViewRequest   // 💡 Extrai a prop para o repasse do evento de clique
}: CrudListOrchestratorProps<T>) {
    
    // ========================================================================
    // 🃏 ESTRATÉGIA 1: MODO CARDS (Barra Lateral / Mobile)
    // ========================================================================
    if (listMode === 'cards') {
        return (
            <div className="h-full flex flex-col overflow-hidden animate-fade-in">
                <CrudCardList<T>
                    data={data}
                    config={config}
                    isLoading={isLoading}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    // 💡 A ENTREGA FINAL DE ESTADO: Qual item destacar
                    selectedItemId={selectedItemId} 
                    // 💡 A ENTREGA FINAL DE AÇÃO: O que fazer ao clicar no fundo do card
                    onViewRequest={onViewRequest}
                />
            </div>
        );
    }

    // ========================================================================
    // 📊 ESTRATÉGIA 2: MODO TABELA (Visão Master Data Padrão)
    // ========================================================================
    return (
        <div className="h-full flex flex-col overflow-hidden animate-fade-in">
            <CrudTable<T>
                data={data}
                columns={config.columns} // O operário de Tabela usa as colunas do Manual
                isLoading={isLoading}
                onEdit={onEdit}
                onDelete={onDelete}
                // Nota Arquitetural: A tabela Master Data não consome selectedItemId 
                // nesta arquitetura, pois o destaque ocorre na navegação de detalhes.
                
                // 💡 PLUGANDO O FIO NA TABELA: Garantimos que se amanhã quisermos que a 
                // tabela abra o Dossiê ao invés do Form, a infraestrutura já existe.
                onViewRequest={onViewRequest}
            />
        </div>
    );
}