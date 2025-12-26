// src/modules/products/components/tabs/CatalogTab.tsx
import React from 'react';

export function CatalogTab() {
  return (
    // Alterado: bg-white -> bg-base-metallic | border-gray-200 -> border-gray-700
    <div className="p-4 bg-base-metallic rounded-lg border border-gray-700">
      {/* Alterado: text-gray-900 -> text-base-text */}
      <h3 className="text-lg font-medium text-base-text">Catálogo de Produtos</h3>
      {/* Alterado: text-gray-500 -> text-gray-400 */}
      <p className="text-sm text-gray-400 mt-1">
        A lista de produtos será refatorada para cá em breve.
      </p>
    </div>
  );
}