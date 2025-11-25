// src/app/page.tsx

import Link from 'next/link';

/**
 * @component LandingPage
 * @description Página inicial e hub de valor da aplicação.
 * Porquê: Deve ter alto impacto, comunicar a proposta de valor (ERP + IA) e guiar o usuário para o Login/Registro.
 */
export default function LandingPage() {
  return (
    // Usa a cor base do Design System (bg-base-dark) e garante tela cheia
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-dark text-base-text p-8">
      
      {/* Seção Principal (Hero) */}
      <section className="text-center space-y-8 max-w-4xl">
        
        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-linear-to-r from-accent-primary to-accent-secondary">
          Gestão de Excelência & Inteligência
        </h1>

        <p className="mt-4 text-xl text-gray-400">
          O poder de um ERP completo, projetado com uma arquitetura sênior e modular, integrado a sistemas de IA/RAG para automação e análise estratégica.
        </p>

        {/* Chamada para Ação (CTA) */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          
          <Link href="/login" legacyBehavior>
            <a 
              className="w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-xl text-base-dark bg-accent-primary hover:bg-orange-500 transition duration-150 shadow-lg transform hover:scale-105"
            >
              Acesso Admin / Login
            </a>
          </Link>
          
          {/* Futuro Link para Registro de Novo Tenant */}
          <Link href="/register" legacyBehavior>
            <a 
              className="w-full sm:w-auto px-12 py-4 text-lg font-medium rounded-xl text-accent-primary border-2 border-accent-secondary hover:bg-accent-secondary hover:text-white transition duration-150"
            >
              Crie sua Conta (Tenant)
            </a>
          </Link>
          
        </div>
      </section>

    </div>
  );
}