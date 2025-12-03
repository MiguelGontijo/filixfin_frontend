// src/app/page.tsx

import Link from 'next/link';

/**
 * @component LandingPage
 * @description Página inicial pública. Ponto de entrada para Login ou Registro.
 * PORQUÊ: Deve ser acessível sem autenticação.
 */
export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-dark text-base-text p-8 relative overflow-hidden">
      
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Conteúdo Principal */}
      <section className="text-center space-y-8 max-w-5xl z-10">
        
        <div className="space-y-2">
            <h2 className="text-accent-secondary font-bold tracking-wide uppercase text-sm">
                Plataforma Enterprise
            </h2>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white">
              Filix<span className="text-accent-primary">Fin</span>
            </h1>
        </div>

        <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Gestão completa integrada com <strong>Inteligência Artificial</strong>. 
          Transforme conversas em dados, automatize processos e escale seu negócio.
        </p>

        {/* Botões de Ação (CTAs) */}
        <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          
          {/* Botão de Login */}
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-xl text-white bg-gray-800 border border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition duration-200 shadow-lg"
          >
            Já tenho conta
          </Link>
          
          {/* Botão de Registro (Destaque) */}
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-12 py-4 text-lg font-bold rounded-xl text-base-dark bg-accent-primary hover:bg-orange-500 transition duration-200 shadow-xl transform hover:scale-105"
          >
            Começar Agora
          </Link>
          
        </div>
      </section>

    </div>
  );
}