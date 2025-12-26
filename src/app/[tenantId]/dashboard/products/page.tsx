'use client';

import React from 'react';
import { ProductCatalogue } from '@/modules/products/presentation/ProductCatalogue';

export default function ProductsPage() {
    return (
        <main className="h-full w-full overflow-hidden p-6">
            <ProductCatalogue />
        </main>
    );
}