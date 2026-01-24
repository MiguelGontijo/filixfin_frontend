'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaBrain, FaBoxes, FaUserTie, FaFileInvoiceDollar } from 'react-icons/fa';
import { useFilixAI } from '../context/FilixAIContext';
import { AIContextScope } from '../types/AITypes';
import { ChatInterface } from './ChatInterface';

/**
 * @component FloatingWidget
 * @description Interface flutuante da IA.
 * Gerencia o estado de Drag-and-Drop e alterna entre modo Minificado (Ícone) e Expandido (Chat).
 * Implementa proteção contra "Falso Clique" ao arrastar.
 */
export const FloatingWidget: React.FC = () => {
    // Acesso ao Cérebro (Contexto Global)
    const { 
        position, 
        updatePosition, 
        mode, 
        toggleVisibility, 
        contextScope,
        isEnabled 
    } = useFilixAI();

    // Estado local para controle do arraste
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    // Refs para lógica de diferenciação (Click vs Drag)
    const widgetRef = useRef<HTMLDivElement>(null);
    const dragStartPosRef = useRef({ x: 0, y: 0 });
    const hasMovedSignificantlyRef = useRef(false);

    // Se o usuário desligou a IA no Header, o componente não renderiza
    if (!isEnabled) return null;

    // --- Lógica Visual baseada no Contexto ---
    const getContextVisuals = (scope: AIContextScope) => {
        switch (scope) {
            case 'SUPPLY_CHAIN':
                return { color: 'bg-orange-500', shadow: 'shadow-orange-500/50', icon: FaBoxes };
            case 'CRM':
                return { color: 'bg-blue-500', shadow: 'shadow-blue-500/50', icon: FaUserTie };
            case 'FISCAL':
                return { color: 'bg-emerald-500', shadow: 'shadow-emerald-500/50', icon: FaFileInvoiceDollar };
            default:
                return { color: 'bg-purple-600', shadow: 'shadow-purple-600/50', icon: FaBrain };
        }
    };

    const visuals = getContextVisuals(contextScope);
    const Icon = visuals.icon;

    // --- Handlers de Drag-and-Drop ---

    const handleMouseDown = (e: React.MouseEvent) => {
        // Apenas botão esquerdo
        if (e.button !== 0) return;

        // Regra de Ouro:
        // Se estiver EXPANDIDO (Chat aberto), só permite arrastar se clicar no Header (classe .handle-drag).
        if (mode === 'EXPANDED') {
            const target = e.target as HTMLElement;
            if (!target.closest('.handle-drag')) return;
        }

        // 1. Inicializa Estado de Drag
        setIsDragging(true);
        
        // 2. Reseta flag de movimento (assume que é um clique até provar o contrário)
        hasMovedSignificantlyRef.current = false;
        dragStartPosRef.current = { x: e.clientX, y: e.clientY };

        // 3. Calcula offset para manter o mouse "preso" no mesmo ponto do elemento
        const rect = widgetRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    // Handler de Clique Inteligente
    const handleSmartClick = (e: React.MouseEvent) => {
        // Se houve movimento significativo durante o "clique", foi um arraste.
        // Bloqueamos a abertura do chat.
        if (hasMovedSignificantlyRef.current) {
            e.stopPropagation();
            return;
        }

        // Se foi um clique estático, abrimos/fechamos
        toggleVisibility();
    };

    // Listeners globais para garantir fluidez no arraste
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            e.preventDefault(); 

            // Calcula distância percorrida desde o início do clique
            const moveDistance = Math.hypot(
                e.clientX - dragStartPosRef.current.x,
                e.clientY - dragStartPosRef.current.y
            );

            // Se moveu mais de 5 pixels, marca como ARRASTE (não é clique)
            if (moveDistance > 5) {
                hasMovedSignificantlyRef.current = true;
            }

            // Atualiza posição visual
            updatePosition({
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y
            });
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, updatePosition]);

    // Lógica de Posicionamento CSS
    const hasSavedPosition = position.x !== 0 || position.y !== 0;
    
    const style: React.CSSProperties = hasSavedPosition ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        right: 'auto',
        bottom: 'auto'
    } : {};

    return (
        <div 
            ref={widgetRef}
            style={style}
            className={`
                z-[9999] transition-transform 
                ${!hasSavedPosition ? 'fixed bottom-8 right-8' : ''}
            `}
            onMouseDown={handleMouseDown}
        >
            {mode === 'MINIMIZED' ? (
                // --- MODO BOLINHA (Minimizado) ---
                <div 
                    onClick={handleSmartClick} // Usa o handler inteligente em vez de toggle direto
                    className={`
                        cursor-grab active:cursor-grabbing hover:scale-105 transition-transform
                        relative w-14 h-14 rounded-full flex items-center justify-center text-white
                        ${visuals.color} ${visuals.shadow} shadow-lg backdrop-blur-md
                        border border-white/20
                    `}
                    title="Filix IA (Clique para abrir, Arraste para mover)"
                >
                    {/* Animação de Pulso (Ping) */}
                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${visuals.color}`}></div>
                    
                    {/* Ícone Contextual */}
                    <Icon className="w-6 h-6 relative z-10" />
                    
                    {/* Indicador de Status Online */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full z-20"></div>
                </div>
            ) : (
                // --- MODO CHAT (Expandido) ---
                // O ChatInterface não precisa de onClick wrapper, pois tem seus próprios botões
                <ChatInterface onClose={toggleVisibility} />
            )}
        </div>
    );
};