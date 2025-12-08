// src/app/[tenantId]/dashboard/schedule/page.tsx

"use client";

import React from 'react';
import { SchedulerWidget } from '@/modules/scheduler/components/SchedulerWidget';

/**
 * @page SchedulePage
 * @description Página dedicada para a gestão completa de agenda (Visão Macro).
 */
export default function SchedulePage() {
    return (
        <div className="h-full p-2">
            <SchedulerWidget mode="FULL" />
        </div>
    );
}