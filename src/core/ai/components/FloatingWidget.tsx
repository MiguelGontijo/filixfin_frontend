
'use client';

import React from 'react';
import { useFilixAI } from '../context/FilixAIContext';
import { ChatInterface } from './ChatInterface';

/**
 * @component FloatingWidget (Refatorado para Drawer / Painel Lateral)
 * @description Interface da IA. Transformada de "Bolinha Flutuante" para uma gaveta lateral.
 * * VANTAGENS:
 * 1. Zero cálculos de renderização (Fim do Maximum update depth exceeded).
 * 2. Posicionamento fixo, limpo e previsível.
 * 3. Mantém a tela de trabalho livre.
 */
export const FloatingWidget: React.FC = () => {
    // Agora consumimos apenas a intenção visual (Aberto/Fechado) do Cérebro
    const { mode, isEnabled, toggleVisibility } = useFilixAI();

    // Se o usuário desligou a IA (Kill Switch), o componente some do DOM
    if (!isEnabled) return null;

    const isExpanded = mode === 'EXPANDED';

    return (
        // --- O PAINEL LATERAL (DRAWER) ---
        // 'top-16' alinha perfeitamente abaixo do TopNavigation (que tem h-16 / 4rem)
        // 'h-[calc(100vh-4rem)]' garante que não passe do limite inferior da tela
        // 'translate-x-full' esconde a gaveta jogando-a para fora da tela pela direita
        <div 
            className={`
                fixed top-16 right-0 h-[calc(100vh-4rem)] w-[400px] max-w-[100vw]
                bg-gray-900 border-l border-gray-700 shadow-2xl
                transform transition-transform duration-300 ease-in-out z-40
                flex flex-col
                ${isExpanded ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
            {/* O Contêiner do Chat 
                Adicionamos um padding leve para o ChatInterface respirar dentro da gaveta.
                O 'overflow-hidden' aqui prepara o terreno para consertarmos a barra de rolagem no próximo passo.
            */}
            <div className="flex-1 w-full h-full p-4 overflow-hidden">
                <ChatInterface onClose={toggleVisibility} />
            </div>
        </div>
    );
};