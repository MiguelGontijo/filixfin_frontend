// ===== FILE: src/modules/timeline/components/TimelineSkeleton.tsx =====

import React from 'react';

/**
 * @component TimelineSkeleton
 * @description Estado de carregamento visual (Placeholder).
 * Mimetiza a estrutura do TimelineCard para evitar Cumulative Layout Shift (CLS).
 */
export const TimelineSkeleton: React.FC = () => {
    return (
        <div className="flex gap-3 w-full animate-pulse select-none">
            
            {/* COLUNA ESQUERDA: Avatar Fake */}
            <div className="flex flex-col items-center">
                {/* O Círculo do Avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-800 shrink-0" />
                
                {/* A Linha Conectora (sutilmente sugerida) */}
                <div className="w-px h-full bg-gray-800/30 mt-2 mb-2"></div>
            </div>

            {/* COLUNA DIREITA: Card Fake */}
            <div className="flex-1 pb-4">
                <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
                    
                    {/* Header Fake (Autor + Badge + Hora) */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            {/* Nome do Autor */}
                            <div className="h-3 w-24 bg-gray-800 rounded" />
                            
                            {/* Badge de Tipo */}
                            <div className="h-3 w-12 bg-gray-800 rounded opacity-60" />
                        </div>

                        {/* Hora */}
                        <div className="h-2 w-8 bg-gray-800 rounded opacity-40" />
                    </div>

                    {/* Corpo de Texto Fake (Linhas de tamanho variado) */}
                    <div className="space-y-2">
                        <div className="h-2.5 w-full bg-gray-800 rounded opacity-70" />
                        <div className="h-2.5 w-[85%] bg-gray-800 rounded opacity-70" />
                        <div className="h-2.5 w-[60%] bg-gray-800 rounded opacity-70" />
                    </div>

                    {/* Footer/Tags Fake (Opcional, para dar volume) */}
                    <div className="mt-3 flex gap-2">
                        <div className="h-4 w-16 bg-gray-800 rounded-md opacity-50" />
                    </div>

                </div>
            </div>
        </div>
    );
};