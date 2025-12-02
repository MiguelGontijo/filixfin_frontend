
import { useState } from 'react';
import { api } from '@/core/services/api';
// Usamos o tipo do formulário de registro que está na página /register
interface RegisterFormData {
    cnpjCpf: string;
    razaoSocial: string;
    nomeFantasia: string;
    emailContato: string;
    password: string; 
    planoId: string;
}

/**
 * @function useRegister
 * @description Hook customizado para gerenciar a lógica de envio do formulário de registro (Tenant).
 * Porquê: Centraliza o POST para a API de Registro, tratamento de loading e erros.
 */
export function useRegister() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const registerTenant = async (formData: RegisterFormData) => {
        setIsLoading(true);
        setError(null);
        // Os campos do DTO de Tenant (Backend) são: cnpjCpf, razaoSocial, nomeFantasia, emailContato, planoId.
        // O campo 'password' não existe no DTO de Tenant, mas será usado no Backend para criar o User.
        // O Backend precisa de um payload unificado. Vamos enviar todos os campos do formulário.
        try {
            // --- MODIFICAÇÃO: Chamada REAL à API de Registro ---
            // POST para o endpoint de Registro de Tenant (que agora cria o User Admin Global)
            const response = await api.post('/tenant/register', formData);
            
            if (response.status === 201) {
                // Sucesso na criação do Tenant e do User
                // PORQUÊ: O hook retorna os dados de sucesso para o componente de UI tratar o redirecionamento.
                return response.data;
            }
        } catch (err: any) {
            // Captura erros específicos do Backend (409 Conflito, 404 Plano não encontrado, etc.)
            if (err.response && err.response.data && err.response.data.message) {
                // Se o erro vier do AppError do Backend, exibimos a mensagem de negócio
                setError(err.response.data.message);
            } else {
                setError("Erro desconhecido ao tentar registrar. Verifique o console.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { registerTenant, isLoading, error };
}