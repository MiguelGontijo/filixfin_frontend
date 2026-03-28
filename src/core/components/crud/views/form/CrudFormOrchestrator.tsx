import React from 'react';
import { FieldValues } from 'react-hook-form';

// --- Tipagens e Contratos ---
import { CrudFormProps, FormMode } from '../../types';

// --- Operários Especializados (Views) ---
import { CrudForm } from './CrudFormEdit';
// import { CrudFormView } from '../views/CrudFormView'; // 👈 Será injetado na Fase 4

/**
 * ============================================================================
 * 🔀 ORQUESTRADOR: CrudForm (O Roteador Lógico do Palco Central)
 * @description Aplicação do Princípio Aberto/Fechado (SOLID) e Strategy Pattern.
 * Este componente é o "Maestro Burro" do palco central. Ele lê a propriedade
 * `formMode` e decide se a tela deve ser um formulário de edição (com inputs)
 * ou um Dossiê de leitura visual (read-only).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO:
 * - Garante que a tela de visualização (Read-Only) nunca sofra overhead de
 * bibliotecas de formulário (React Hook Form/Zod), otimizando a performance.
 * - Desacopla o Layout principal de saber "como" os dados são renderizados.
 * ============================================================================
 */
export function CrudFormOrchestrator<T, FormData extends FieldValues = any>(
    props: CrudFormProps<T, FormData>
) {
    // Extrai o modo de visão (padrão: 'edit') e repassa o restante das props intactas
    const { formMode = FormMode.EDIT, ...restProps } = props;

    // ========================================================================
    // 👁️ ESTRATÉGIA 1: MODO LEITURA (Dossiê / Dashboard)
    // ========================================================================
    if (formMode === 'readonly') {
        // 🛡️ Oculta o componente se ele não estiver "aberto", preservando a
        // lógica de montagem/desmontagem do CrudLayout.
        if (!props.isOpen) return null;

        // Placeholder Defensivo: Garante que a compilação não quebre
        // enquanto o operário de visualização não for construído na Fase 4.
        return (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-base-dark text-gray-500 animate-fade-in">
                <div className="bg-gray-900/80 p-8 rounded-2xl border border-dashed border-gray-700/50 flex flex-col items-center max-w-md text-center shadow-2xl">
                    <p className="text-xs font-bold uppercase tracking-widest text-accent-primary mb-3">
                        Dossiê Read-Only em Construção
                    </p>
                    <p className="text-sm opacity-70 leading-relaxed text-gray-300">
                        O operário especializado (CrudFormView) assumirá este espaço na Fase 4,
                        renderizando os dados em formato de painel, sem inputs ou dependência do Zod.
                    </p>
                    <button 
                        type="button"
                        onClick={props.onClose}
                        className="mt-8 px-8 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    // ========================================================================
    // 📝 ESTRATÉGIA 2: MODO EDIÇÃO / CRIAÇÃO (Impressora 3D V4 Atual)
    // ========================================================================
    // Renderiza o nosso motor atual com Zod, React Hook Form e sanitização.
    // Ele repassa o formMode para frente, caso o CrudForm precise saber seu contexto.
    return <CrudForm<T, FormData> {...restProps} formMode={formMode} />;
}