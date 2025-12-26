// src/app/[tenantId]/dashboard/supply-chain/page.tsx

import React from 'react';
import { ProductContainer } from '@/modules/products/presentation/ProductContainer';

/**
 * @page SupplyChainPage
 * @description Rota estratégica para o Hub de Gestão de Produtos e Supply Chain.
 * Atua como um Wrapper (Dumb Component), delegando a renderização para o Container do módulo
 * e forçando a visualização inicial para o modo de Visão Geral (Overview).
 */
export default function SupplyChainPage() {
    // Inicializa o Container focando na visão estratégica (Dashboard/Hub)
    // ao invés da lista de cadastro padrão.
    return (
        <ProductContainer initialView="OVERVIEW" />
    );
}