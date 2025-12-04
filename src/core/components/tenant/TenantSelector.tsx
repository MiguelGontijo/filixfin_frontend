"use client";

import React from 'react';
import { FaBuilding, FaChevronDown } from 'react-icons/fa';
import { useNavigation } from '@/core/hooks/useNavigation';

interface TenantSelectorProps {
    currentTenantId: string;
    // Opcional: Se já tivermos o nome carregado no layout, podemos passar aqui. 
    // Caso contrário, usamos um fallback ou o próprio ID.
    currentTenantName?: string; 
}

/**
 * @component TenantSelector
 * @description Dropdown para troca de contexto de Tenant.
 * @note Atualmente exibe apenas o Tenant da URL, mas está estruturado (Array)
 * para receber múltiplos tenants assim que o Backend implementar a relação N:N (User_Tenants).
 */
export const TenantSelector: React.FC<TenantSelectorProps> = ({ 
    currentTenantId, 
    currentTenantName 
}) => {
    const { toDashboard } = useNavigation();

    // --- TODO: INTEGRAÇÃO FUTURA (MULTI-TENANT) ---
    // Atualmente, montamos o array apenas com o tenant atual para manter a estrutura pronta.
    // No futuro, substituir por: const { availableTenants } = useAuth();
    const availableTenants = [
        { 
            id: currentTenantId, 
            name: currentTenantName || `Empresa Atual (${currentTenantId.substring(0, 8)}...)` 
        }
    ];
    // -----------------------------------------------

    const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        if (newId !== currentTenantId) {
            toDashboard(newId);
        }
    };

    return (
        <div className="relative group min-w-[220px]">
            <div className="flex items-center space-x-3 bg-gray-800 p-1.5 pr-3 rounded-lg border border-gray-700 hover:border-accent-primary/50 transition duration-200 cursor-pointer shadow-sm">
                
                {/* Ícone da Empresa */}
                <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-md shadow-inner text-accent-primary">
                    <FaBuilding className="w-4 h-4" />
                </div>
                
                {/* Select Estilizado */}
                <div className="flex-1 flex flex-col relative">
                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider leading-none mb-0.5">
                        Ambiente
                    </label>
                    
                    <select
                        value={currentTenantId}
                        onChange={handleSwitch}
                        // Se houver apenas 1 tenant, desabilitamos visualmente a "sensação" de troca, mas mantemos a UI
                        disabled={availableTenants.length <= 1}
                        className="bg-transparent text-sm font-bold text-white w-full focus:outline-none appearance-none cursor-pointer py-0.5 pr-4 z-10 disabled:cursor-default"
                    >
                        {availableTenants.map(t => (
                            <option key={t.id} value={t.id} className="bg-gray-800 text-gray-200 py-2">
                                {t.name}
                            </option>
                        ))}
                    </select>

                    {/* Seta (Só exibe se houver mais de 1 opção no futuro) */}
                    {availableTenants.length > 1 && (
                        <div className="absolute right-0 bottom-1 pointer-events-none text-gray-500 group-hover:text-white transition">
                            <FaChevronDown className="w-2.5 h-2.5" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};