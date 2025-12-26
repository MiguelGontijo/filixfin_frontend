// src/app/[tenantId]/dashboard/inventory/movements/page.tsx

import React from 'react';
import { MovementsContainer } from '@/modules/inventory/presentation/MovementsContainer';

/**
 * @page MovementsPage
 * @description Rota para o histórico de movimentações.
 * Implementa o padrão "Dumb Page", delegando toda a UI para o Container do módulo.
 */
export default function MovementsPage() {
    return <MovementsContainer />;
}