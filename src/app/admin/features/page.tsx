// src/app/admin/features/page.tsx (INTEGRAÇÃO DA TABELA)

import React from 'react';
import { FeatureTable } from '@/components/admin/FeatureTable'; // Importar o componente tabela

/**
 * @component AdminFeaturesPage
 * @description Página de Gerenciamento de Features (Catálogo de Permissões).
 */
export default function AdminFeaturesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-white">
        Gerenciamento de Features e Permissões
      </h1>
      
      <p className="text-gray-400">
        Visualize e administre o catálogo de permissões e os tipos de controle (Booleano/Quantitativo).
      </p>
      
      {/* PORQUÊ: Renderizamos a tabela que automaticamente lida com o fetching (useFeatures) 
          e exibe os dados do Backend.
      */}
      <FeatureTable />
      
    </div>
  );
}