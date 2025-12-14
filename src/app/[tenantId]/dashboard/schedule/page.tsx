// src/app/[tenantId]/dashboard/schedule/page.tsx

"use client";

import React from 'react';
import { SchedulerWidget } from '@/modules/scheduler/components/SchedulerWidget';

/**
 * @page SchedulePage
 * @description Rota da Visão GLOBAL da Agenda (Acessada via Sidebar).
 * Exibe todos os agendamentos do Tenant, sem filtros de cliente.
 */
export default function SchedulePage() {
    return (
        <div className="h-full flex flex-col">
             <div className="mb-4 flex-shrink-0">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                    Agenda Global
                </h1>
                <p className="text-sm text-gray-400">
                    Visão completa de serviços, reuniões e bloqueios de toda a equipe.
                </p>
            </div>
            
            <div className="flex-1 min-h-0 bg-base-metallic rounded-xl border border-gray-700 shadow-lg p-2">
                <SchedulerWidget mode="FULL" />
            </div>
        </div>
    );
}