// src/app/[tenantId]/dashboard/crm/page.tsx

"use client";

import React from 'react';
import { CRMContainer } from '@/modules/crm/presentation/CRMContainer';

/**
 * @component CRMPage
 * @description Rota principal do módulo CRM.
 * Delega toda a lógica e apresentação para o Container do módulo (Clean Architecture).
 */
export default function CRMPage() {
    return <CRMContainer />;
}