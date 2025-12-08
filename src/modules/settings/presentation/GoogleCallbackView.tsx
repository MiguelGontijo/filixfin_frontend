// src/modules/settings/presentation/GoogleCallbackView.tsx

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/core/services/api';
import { FaSync, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
// CORREÇÃO: Importar o AuthContext para saber o tenantId
import { useAuth } from '@/contexts/AuthContext'; 

export const GoogleCallbackView: React.FC = () => {
    
    const searchParams = useSearchParams();
    const { user } = useAuth(); // Pegamos o usuário logado
    
    const [status, setStatus] = useState<'LOADING' | 'SUCCESS' | 'ERROR'>('LOADING');
    const [message, setMessage] = useState('Processando autorização do Google...');
    
    const processedRef = useRef(false);

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Evita processamento duplo (React Strict Mode)
        if (processedRef.current) return;
        
        if (error) {
            processedRef.current = true;
            setStatus('ERROR');
            setMessage('O acesso foi negado pelo usuário ou ocorreu um erro no Google.');
            return;
        }

        if (!code) {
            processedRef.current = true;
            setStatus('ERROR');
            setMessage('Código de autorização não encontrado na URL.');
            return;
        }

        // Se o user ainda não carregou, esperamos (o useEffect rodará de novo quando user mudar)
        // Isso evita redirecionar para 'undefined/dashboard'
        if (!user) return; 

        // Agora sim, marcamos como processado para não rodar 2x
        processedRef.current = true;

        const connectGoogle = async () => {
            try {
                await api.post('/scheduler/google/callback', { code });
                
                setStatus('SUCCESS');
                setMessage('Agenda conectada com sucesso! Redirecionando...');
                
                setTimeout(() => {
                    // CORREÇÃO: Redireciona para o contexto do Tenant correto
                    if (user.tenantId) {
                        window.location.href = `/${user.tenantId}/dashboard/settings`;
                    } else {
                        // Fallback de segurança
                        window.location.href = '/dashboard'; 
                    }
                }, 2000);

            } catch (err: any) {
                console.error("Erro no callback Google:", err);
                setStatus('ERROR');
                const msg = err.response?.data?.message || 'Falha ao trocar credenciais com o servidor.';
                setMessage(msg);
            }
        };

        connectGoogle();

    }, [searchParams, user]); // Adicionamos user nas dependências

    return (
        <div className="min-h-screen bg-base-dark flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-base-metallic p-8 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full">
                
                {status === 'LOADING' && (
                    <div className="flex flex-col items-center space-y-4">
                        <FaSync className="w-12 h-12 text-accent-primary animate-spin" />
                        <h2 className="text-xl font-bold text-white">Conectando...</h2>
                        <p className="text-gray-400 text-sm">{message}</p>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                        <FaCheckCircle className="w-12 h-12 text-green-500" />
                        <h2 className="text-xl font-bold text-white">Sucesso!</h2>
                        <p className="text-green-400 text-sm">{message}</p>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="flex flex-col items-center space-y-4 animate-fade-in">
                        <FaExclamationTriangle className="w-12 h-12 text-red-500" />
                        <h2 className="text-xl font-bold text-white">Ops, algo deu errado.</h2>
                        <p className="text-red-400 text-sm">{message}</p>
                        <button 
                            onClick={() => window.location.href = user?.tenantId ? `/${user.tenantId}/dashboard` : '/login'}
                            className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}