// src/modules/settings/presentation/SettingsContainer.tsx

"use client";

import React, { useState } from 'react';
import { FaUserCog, FaPlug, FaBuilding } from 'react-icons/fa';
import { IntegrationsTab } from './IntegrationsTab';

type SettingsTab = 'PROFILE' | 'INTEGRATIONS' | 'TENANT' | 'BILLING';

export const SettingsContainer: React.FC = () => {
    
    const [activeTab, setActiveTab] = useState<SettingsTab>('INTEGRATIONS');

    const menuItems = [
        { id: 'PROFILE', label: 'Meu Perfil', icon: FaUserCog },
        { id: 'INTEGRATIONS', label: 'Integrações', icon: FaPlug },
        { id: 'TENANT', label: 'Dados da Empresa', icon: FaBuilding },
    ];

    return (
        <div className="flex h-full gap-6">
            
            {/* CORREÇÃO: bg-gray-900 para fundo sólido */}
            <aside className="w-64 flex-shrink-0 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col shadow-lg">
                <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <h2 className="text-lg font-bold text-white">Configurações</h2>
                    <p className="text-xs text-gray-500">Gerencie sua conta.</p>
                </div>
                
                <nav className="flex-1 p-2 space-y-1">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as SettingsTab)}
                            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                activeTab === item.id 
                                ? 'bg-accent-primary text-base-dark shadow-md font-bold' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <item.icon className={activeTab === item.id ? 'text-base-dark' : 'text-gray-500'} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Área de Conteúdo */}
            <main className="flex-1 bg-base-metallic rounded-xl border border-gray-700 p-8 overflow-y-auto custom-scrollbar shadow-xl relative">
                <div className="animate-fade-in">
                    {activeTab === 'PROFILE' && (
                        <div className="text-gray-500">Componente de Perfil em construção...</div>
                    )}
                    
                    {activeTab === 'INTEGRATIONS' && (
                        <IntegrationsTab />
                    )}

                    {activeTab === 'TENANT' && (
                        <div className="text-gray-500">Componente de Dados da Empresa em construção...</div>
                    )}
                </div>
            </main>
        </div>
    );
};