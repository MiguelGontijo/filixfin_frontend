import React from 'react';
import { TimelineEntryType } from './types/TimelineTypes';
import { useTimeline } from './hooks/useTimeline';
import { TimelineFeed } from './components/TimelineFeed';
import { TimelineInput } from './components/TimelineInput';
import { AppModule } from '@/core/ai/types/enums/AIEnums';

export interface TimelineModuleProps {
    /**
     * O ID da entidade dona desta timeline.
     * Pode ser undefined durante a criação de um novo registro (ex: Novo Cliente).
     */
    entityId?: string;
    
    /**
     * O contexto da timeline (Tabela polimórfica).
     */
    module: AppModule;

    /**
     * Modo somente leitura (esconde o input).
     * Útil para usuários sem permissão ou registros arquivados.
     */
    readOnly?: boolean;

    /**
     * Classes CSS para customização do container externo.
     */
    className?: string;
}

/**
 * @component TimelineModule
 * @description O Módulo Soberano de Timeline.
 * Encapsula toda a lógica de busca, exibição e criação de eventos.
 * * @usage
 * <TimelineModule entityId={client.id} module="CLIENT" className="h-[600px]" />
 */
export const TimelineModule: React.FC<TimelineModuleProps> = ({ 
    entityId, 
    module, 
    readOnly = false,
    className = ''
}) => {
    
    // --- 1. Hook de Inteligência (Lógica) ---
    const { 
        items, 
        isLoading, 
        isSubmitting, 
        error, 
        addEntry, 
        togglePin, 
        removeEntry 
    } = useTimeline(module, entityId);

    // --- 2. Handlers de Integração ---

    /**
     * Conecta o Input Visual à Lógica do Hook.
     */
    const handleSubmit = async (content: string, type: TimelineEntryType) => {
        if (!entityId) return; // Segurança extra
        await addEntry(type, content);
    };

    // --- 3. Renderização ---

    return (
        <div className={`flex flex-col h-full bg-base-dark/50 rounded-xl overflow-hidden ${className}`}>
            
            {/* ÁREA DE FEED (Expansível) */}
            <div className="flex-1 min-h-0 relative">
                {/* min-h-0 é crucial no Flexbox para que o scroll interno funcione 
                   dentro de um container pai com altura definida.
                */}
                <TimelineFeed 
                    items={items}
                    isLoading={isLoading}
                    error={error}
                    onTogglePin={togglePin}
                    onDelete={removeEntry}
                    className="h-full" // Passa a altura total para o feed gerenciar o scroll
                />
            </div>

            {/* ÁREA DE INPUT (Fixa no rodapé) */}
            {!readOnly && (
                <div className="flex-shrink-0 p-4 bg-gray-900/30 border-t border-gray-800 backdrop-blur-sm z-20">
                    {entityId ? (
                        <TimelineInput 
                            onSubmit={handleSubmit}
                            isSubmitting={isSubmitting}
                            placeholder="Adicione uma nota, observação ou anexo..."
                        />
                    ) : (
                        // Estado: "Aguardando salvar pai"
                        <div className="p-3 text-center border border-dashed border-gray-700 rounded-lg bg-gray-800/50">
                            <p className="text-sm text-gray-500">
                                Salve o registro para iniciar a timeline.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};