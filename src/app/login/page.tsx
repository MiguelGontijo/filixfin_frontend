// src/app/login/page.tsx

"use client"; // Necessário para usar hooks como useState

import { useAuth } from '@/contexts/AuthContext';
import { LoginDto } from '@/core/types/auth';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@/core/hooks/useNavigation';

/**
 * @component LoginPage
 * @description Interface de Login para o User Global Admin.
 * Porquê: A página deve ser simples, segura e focada na coleta de credenciais.
 */
export default function LoginPage() {
    
    // MODIFICAÇÃO: Obtemos a função de navegação, mas não precisamos dela aqui,
    // pois o AuthContext agora lida com o redirecionamento pós-login.
    // const router = useRouter();
    const router = useNavigation(); // MODIFICAÇÃO: Mantemos a variável para evitar erro, mas usamos a função para isReady

    const auth = useAuth();
    // Usar o contexto de autenticação
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        // Lógica de Validação Front-end Básica
        if (!email || !password) {
            setError("Por favor, preencha todos os campos.");
            setIsLoading(false);
            return;
        }

        try {
            
            const credentials: LoginDto = { email, password };
            // 1. CHAMADA AO CONTEXTO DE LOGIN
            // O Contexto (AuthProvider) fará a chamada à API do Backend
            // e atualizará o estado global (token, user).
            await auth.login(credentials); 
            

        } catch (err) {
            setError("Falha na autenticação. Verifique suas credenciais.");
            console.error("Login API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Centraliza o conteúdo na tela
        <div className="flex flex-col items-center justify-center min-h-screen">
            
            <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl">
                
                <h1 className="text-3xl font-extrabold text-white text-center">
                    Acesso Mestre
                </h1>
                
                {error && (
                    <div className="p-3 text-sm font-medium text-red-400 bg-red-900 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
      
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            E-mail
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            placeholder="admin@dominio.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-base-dark bg-accent-primary hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:bg-gray-500"                    >
                        {isLoading ? 'Acessando...' : 'Acessar'}
                    </button>
                </form>

            </div>
        </div>
    );
}