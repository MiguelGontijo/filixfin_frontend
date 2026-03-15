import { useState } from 'react';
import { api } from '@/core/services/api';
import { Category } from '../types';

/**
 * @hook useCategoryMutation
 * @description Hook de Mutação (Write Operations) para Categorias.
 * * PADRÃO DE QUALIDADE (Enterprise Grade):
 * 1. Fail-Fast: Lança erros imediatamente para que o CrudForm saiba que não deve fechar o Modal.
 * 2. Error Extraction: Captura mensagens padronizadas do NestJS (HttpException) e expõe para a UI.
 * 3. Restful Alignment: Uso estrito de POST, PATCH e DELETE.
 */
export function useCategoryMutation() {
    const [isLoading, setIsLoading] = useState(false);
    
    // Estado que o CrudLayout consome para exibir tarjas vermelhas de erro
    const [error, setError] = useState<string | null>(null);

    /**
     * @helper extractError
     * @description Extrai a mensagem real de erro enviada pelo NestJS, 
     * lidando com as diferentes camadas do Axios.
     */
    const extractError = (err: any, fallbackMessage: string): string => {
        console.error(`❌ [useCategoryMutation] Erro:`, err);
        // O NestJS envia erros no formato { message: '...', statusCode: 400 }
        const backendMessage = err.response?.data?.message;
        
        // Se a mensagem for um array (erros do class-validator), pegamos o primeiro
        if (Array.isArray(backendMessage)) {
            return backendMessage[0];
        }
        return backendMessage || fallbackMessage;
    };

    /**
     * @method createCategory
     * @description Envia o payload do Zod para criar uma nova Categoria Raiz ou Filha.
     */
    const createCategory = async (data: Partial<Category>): Promise<Category> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post<Category>('/categories', data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha de conexão ao tentar criar a categoria.');
            setError(msg);
            throw err; // Re-lançamos o erro para o CrudForm parar o "isSubmitting" e não fechar a tela
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method updateCategory
     * @description Atualiza parcialmente a entidade.
     * Importante: Usamos PATCH pois o DTO no backend permite atualização parcial.
     */
    const updateCategory = async (id: string, data: Partial<Category>): Promise<Category> => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Nota: Se o seu backend estiver configurado com PUT em vez de PATCH, altere aqui.
            // Mas o padrão Restful para atualizações parciais de formulário é PATCH.
            const response = await api.patch<Category>(`/categories/${id}`, data);
            return response.data;
        } catch (err: any) {
            const msg = extractError(err, 'Falha ao atualizar a categoria.');
            setError(msg);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * @method deleteCategory
     * @description Exclusão lógica (Soft Delete) da categoria.
     * Caso a categoria tenha filhos, o backend retornará 400 e este hook repassará a string amigável.
     */
    const deleteCategory = async (id: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await api.delete(`/categories/${id}`);
            return true;
        } catch (err: any) {
            const msg = extractError(err, 'Não foi possível remover a categoria. Verifique sua conexão.');
            setError(msg);
            throw err; 
            // Para deleção na tabela, podemos lançar o erro, ou retornar false.
            // Retornando erro para o layout global poder capturar e pintar a tarja vermelha na tabela.
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        isLoading,
        error // O Motor CrudLayout escuta esta variável!
    };
}