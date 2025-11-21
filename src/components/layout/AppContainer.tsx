// src/components/layout/AppContainer.tsx

import React from 'react';

interface AppContainerProps {
  children: React.ReactNode;
}

/**
 * @component AppContainer
 * @description Contêiner principal que define o layout visual e o tema da aplicação.
 * Porquê: Centraliza o design system (cores, fontes, tamanhos) para manter a coerência visual.
 */
export const AppContainer: React.FC<AppContainerProps> = ({ children }) => {
  return (
    // Define a tela cheia, fundo escuro (tailor-made para o seu projeto) e o texto em branco
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Ocupa 100% da largura, centralizando o conteúdo se necessário */}
      <main className="mx-auto h-full w-full max-w-full">
        {children}
      </main>
    </div>
  );
};