// src/app/register/page.tsx

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/useRegister';
import { useNavigation } from '@/hooks/useNavigation';

/**
 * @component RegisterPage
 * @description Formulário de Registro e Criação do Novo Tenant (Empresa).
 * Porquê: Coleta dados de Pessoa Jurídica/Física e cria o Admin Global no Backend.
 */
export default function RegisterPage() {
    
    // MODIFICAÇÃO: Usa o hook useNavigation.
    const { toLogin } = useNavigation();
    
    // --- NOVO: Uso do hook de registro ---
    const { registerTenant, isLoading, error: apiError } = useRegister();
    const [formData, setFormData] = useState({
        cnpjCpf: '',
        razaoSocial: '',
        nomeFantasia: '',
        emailContato: '',
        password: '', // Senha do Admin Global (User Nível Zero)
        planoId: '00000000-0000-0000-0000-000000000001', // Plano Básico Padrão (Hardcoded para simplificar)
    });
    
    // Usamos o erro do hook para exibir mensagens
    const [localError, setLocalError] = useState<string | null>(null);
    
    // Removido o estado de isLoading e error locais, usaremos os do hook.
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        // Não precisamos de setIsLoading(true) aqui, o hook já faz.
        // Validação Front-end Básica 
        if (!formData.emailContato || !formData.password || !formData.cnpjCpf) {
            setLocalError("Por favor, preencha os campos obrigatórios (CNPJ/CPF, E-mail, Senha).");
            return;
        }

        try {
            // --- MODIFICAÇÃO: Chamada REAL à API via Hook ---
            await registerTenant(formData);
            // Sucesso: Redirecionar para a página de Login
            alert("Registro Bem-sucedido! O administrador da sua conta foi criado. Faça seu login.");
            toLogin(); // MODIFICAÇÃO: Usa o método centralizado toLogin (R1).

        } catch (err) {
            // O erro já foi capturado e setado em apiError pelo hook (useRegister),
            // mas podemos adicionar uma mensagem genérica de fallback se o apiError estiver vazio.
            if (!apiError) {
                setLocalError("Falha no registro do Tenant. Tente novamente.");
            }
            console.error("Registro API Error:", err);
        }
    };

    // Combina erros locais com erros vindos da API
    const displayError = localError || apiError;

    return (
        // Centraliza o conteúdo na tela, usando o fundo do AppContainer
        <div className="flex flex-col items-center justify-start py-12 min-h-screen">
            
            <div className="w-full max-w-2xl p-8 space-y-6 bg-base-metallic rounded-xl shadow-2xl">
                
                <h1 className="text-3xl font-extrabold text-accent-primary text-center">
                    Crie sua Plataforma de Gestão
                </h1>
                <p className="text-sm text-gray-400 text-center">
                    Será criado o seu Tenant (Empresa) e seu acesso de Admin Global.
                </p>
                
                {/* --- EXIBIÇÃO DO ERRO (MODIFICADO PARA USAR displayError) --- */}
                {displayError && (
                    <div className="p-3 text-sm font-medium text-danger bg-red-900/50 rounded-md">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* --- Dados do Tenant --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="cnpjCpf" className="block text-sm font-medium text-gray-300">CNPJ / CPF *</label>
                            <input type="text" id="cnpjCpf" name="cnpjCpf" required
                                value={formData.cnpjCpf} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="00.000.000/0001-00" />
                        </div>
                        <div>
                            <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-300">Razão Social / Nome Completo *</label>
                            <input type="text" id="razaoSocial" name="razaoSocial" required
                                value={formData.razaoSocial} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="Sua Empresa de Gestão S/A" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-300">Nome Fantasia (Opcional)</label>
                            <input type="text" id="nomeFantasia" name="nomeFantasia"
                                value={formData.nomeFantasia} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="Seu App" />
                        </div>
                    </div>
                  
                    {/* --- Dados do Admin Global --- */}
                    <h2 className="pt-4 text-xl font-bold text-base-text">Acesso Admin</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="emailContato" className="block text-sm font-medium text-gray-300">E-mail (Seu Login) *</label>
                            <input type="email" id="emailContato" name="emailContato" required
                                value={formData.emailContato} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="admin@seusite.com" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Senha * (Mín.8 caracteres)</label>
                            <input type="password" id="password" name="password" required
                                value={formData.password} onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white"
                                placeholder="••••••••" />
                        </div>
                    </div>
                    <button
                        type="submit"
                        // --- MODIFICAÇÃO: Usar o isLoading do hook ---
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-base-dark bg-accent-primary hover:bg-orange-500 transition duration-150 disabled:bg-gray-500 mt-6"
                    >
                        {/* --- MODIFICAÇÃO: Texto dinâmico de carregamento --- */}
                        {isLoading ? 'Criando Conta e Tenant...' : 'Criar Conta Agora'}
                    </button>
                </form>
                
                <div className="text-center text-sm text-gray-400 pt-4">
                    Já tem uma conta? <Link href="/login" className="text-accent-secondary hover:text-violet-400">Faça Login</Link>
                </div>

            </div>
        </div>
    );
}