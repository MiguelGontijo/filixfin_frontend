// src/app/[tenantId]/dashboard/products/page.tsx

"use client";

import React from 'react';
import { ProductContainer } from '@/modules/products/presentation/ProductContainer';

/**
 * @component ProductsPage
 * @description Rota principal do módulo de Produtos (Wrapper).
 * Delega a lógica para o ProductContainer (Smart Component) que gerencia as abas.
 */
export default function ProductsPage() {
    return <ProductContainer />;
}