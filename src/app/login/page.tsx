// src/app/login/page.tsx

"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LoginDto } from '@/core/types/auth';
import React, { useState } from 'react';
import Link from 'next/link';
import { GoogleAuthButton } from '@/core/ui/auth/GoogleAuthButton';

export default function LoginPage() {
    
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!email || !password) {
            setError("Por favor, preencha todos os campos.");
            setIsLoading(false);
            return;
        }

        try {
            const credentials: LoginDto = { email, password };
            await auth.login(credentials); 
        } catch (err) {
            setError("Falha na autenticação. Verifique suas credenciais.");
            console.error("Login API Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-dark">
            
            <div className="w-full max-w-md p-8 space-y-6 bg-base-metallic rounded-xl shadow-2xl border border-gray-700">
                
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-white">
                        Acesso FilixFin
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Entre para gerenciar seu negócio
                    </p>
                </div>
                
                {error && (
                    <div className="p-3 text-sm font-medium text-red-400 bg-red-900/30 border border-red-800 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                E-mail
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username" // Ajuda o navegador
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-gray-800 text-white transition-all"
                                placeholder="seu@email.com"
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
                                autoComplete="current-password" // Ajuda o navegador
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-gray-600 rounded-lg shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent bg-gray-800 text-white transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-accent-primary hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                    >
                        {isLoading ? 'Acessando...' : 'Entrar na Plataforma'}
                    </button>
                </form>

                {/* Divisor */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-base-metallic text-gray-400">Ou continue com</span>
                    </div>
                </div>

                {/* Botão Google Centralizado */}
                <GoogleAuthButton />

                <div className="pt-4 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-400">
                        Ainda não tem uma conta?{' '}
                        <Link 
                            href="/register" 
                            className="font-medium text-accent-secondary hover:text-violet-400 transition-colors"
                        >
                            Crie sua conta grátis
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}