// src/app/admin/plans/page.tsx (INTEGRAÇÃO DA TABELA)

import React from 'react';
import { PlanTable } from '@/features/admin/components/PlanTable'; // Importar o componente tabela

/**
 * @component AdminPlansPage
 * @description Página de Gerenciamento de Planos e Regras de ACL.
 */
export default function AdminPlansPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-white">
        Gerenciamento de Planos e Limites (ACL)
      </h1>
      
      <p className="text-gray-400">
        Visualize e administre todos os planos de assinatura do sistema.
      </p>
      
      {/* PORQUÊ: Renderizamos a tabela aqui, que automaticamente lida com o fetching (usePlans) 
        e exibe os dados do Backend.
      */}
      <PlanTable />
      
    </div>
  );
}