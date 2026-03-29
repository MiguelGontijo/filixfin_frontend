'use client';

import React from 'react';

/**
 * @interface SmartSwitchProps
 * @description Contrato de alta fidelidade para o seletor binário polimórfico.
 */
interface SmartSwitchProps<T extends string | number | boolean> {
    value: T;
    onChange: (value: T) => void;
    options: [
        { label: string; value: T; activeColor?: 'primary' | 'secondary' },
        { label: string; value: T; activeColor?: 'primary' | 'secondary' }
    ];
    disabled?: boolean;
    label?: string;
}

/**
 * ============================================================================
 * 💠 COMPONENTE: SmartSwitch (O Seletor de Estado Classe Ouro)
 * @description Um componente de UI monumental que redefine a alternância de estados.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Aesthetics):
 * 1. Polymorphic Data: Suporta qualquer tipo primitivo como valor de troca.
 * 2. Cyber-Metallic Design: Acabamento em gradiente escuro com profundidade (Z-index layering).
 * 3. Kinetic Feedback: Animação de deslizamento suave via Framer Motion ou Tailwind Transitions.
 * 4. High-Contrast Focus: Brilho sutil (Bloom effect) na opção selecionada.
 * ============================================================================
 */
export function SmartSwitch<T extends string | number | boolean>({
    value,
    onChange,
    options,
    disabled = false,
    label
}: SmartSwitchProps<T>) {
    
    // Identificamos o índice ativo para a orquestração da pílula de fundo
    const activeIndex = options.findIndex(opt => opt.value === value);
    const activeOption = options[activeIndex === -1 ? 0 : activeIndex];

    // Mapeamento de cores baseado no seu Design System
    const getAccentColor = (type?: 'primary' | 'secondary') => {
        if (type === 'secondary') return 'bg-accent-secondary shadow-[0_0_15px_rgba(139,92,246,0.3)]'; // Violeta
        return 'bg-accent-primary shadow-[0_0_15px_rgba(255,94,26,0.3)]'; // Laranja
    };

    return (
        <div className={`flex flex-col space-y-2 ${disabled ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            {label && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
                    {label}
                </span>
            )}

            <div className="relative flex items-center p-1 bg-black/40 border border-gray-800 rounded-xl w-full max-w-[300px] h-[48px] overflow-hidden backdrop-blur-md shadow-inner">
                
                {/* 🛝 A PÍLULA CINÉTICA (O fundo que desliza) */}
                <div 
                    className={`
                        absolute h-[38px] w-[calc(50%-6px)] rounded-lg transition-all duration-300 ease-out
                        ${getAccentColor(activeOption.activeColor)}
                    `}
                    style={{
                        transform: `translateX(${activeIndex === 1 ? '100%' : '0%'})`,
                        left: activeIndex === 1 ? '4px' : '4px'
                    }}
                />

                {/* 🔘 BOTÕES DE OPÇÃO */}
                {options.map((option, idx) => {
                    const isActive = idx === activeIndex;
                    
                    return (
                        <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`
                                relative z-10 flex-1 h-full flex items-center justify-center text-[11px] font-bold uppercase tracking-widest transition-colors duration-300
                                ${isActive ? 'text-base-dark' : 'text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}