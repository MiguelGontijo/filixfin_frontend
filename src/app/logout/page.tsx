// src/app/logout/page.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @component LogoutPage
 * @description Rota dedicada para limpar a sessão do usuário.
 * Porquê: Garante que o estado global (AuthContext) e o localStorage sejam limpos,
 * e o usuário seja redirecionado para a tela de login.
 */
export default function LogoutPage() {
    const { logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Limpa o estado e o localStorage
        logout(); 
        
        // Redireciona para a tela de Login
        router.push('/login');
    }, [logout, router]);

    // Retorna um placeholder simples durante o redirecionamento
    return (
        <div className="flex items-center justify-center min-h-screen bg-base-dark text-white">
            Encerrando sessão...
        </div>
    );
}