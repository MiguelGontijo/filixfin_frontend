import { api } from '@/core/services/api';
import { StorageUploadResponseDto } from '../types/dtos/StorageUploadResponse.dto';

/**
 * @class StorageService
 * @description O Carteiro do Frontend.
 * Responsável por empacotar os arquivos (FormData) e enviá-los para a Alfândega do Backend.
 */
export class StorageService {
    
    /**
     * @method uploadFiles
     * @description Envia múltiplos arquivos para o Backend e retorna as URLs seguras.
     */
    static async uploadFiles(files: File[], folder?: string): Promise<string[]> {
        try {
            // 1. O Empacotamento (Form-Data é obrigatório para envio de binários)
            const formData = new FormData();
            
            files.forEach(file => {
                // O nome 'files' DEVE ser exatamente o mesmo que o Multer espera no Backend
                formData.append('files', file); 
            });

            if (folder) {
                formData.append('folder', folder);
            }

            console.log(`📦 [StorageService] Iniciando upload de ${files.length} arquivo(s)...`);

            // 2. O Envio Seguro (Usando o Axios configurado para a porta 8080)
            const { data } = await api.post<StorageUploadResponseDto>('/storage/upload', formData, {
                headers: {
                    // O Axios cuida do boundary do multipart automaticamente, 
                    // mas é boa prática sinalizar a intenção.
                    'Content-Type': 'multipart/form-data',
                },
            });

            // 3. O Recibo (Retornando as URLs geradas pelo Google Cloud)
            if (data.status === 'success') {
                console.log('✅ [StorageService] Upload concluído com sucesso!');
                return data.urls;
            } else {
                throw new Error(data.message || 'Erro desconhecido retornado pelo servidor.');
            }

        } catch (error: any) {
            console.error('❌ [StorageService] Falha crítica ao enviar arquivos:', error);
            
            // Tratamento de erro elegante para o UI
            if (error.response) {
                throw new Error(`Falha HTTP: ${error.response.status} - ${error.response.data?.message || 'Erro no servidor'}`);
            } else if (error.request) {
                throw new Error('Servidor inacessível. Verifique sua conexão ou se o Backend está rodando.');
            } else {
                throw new Error(`Erro de processamento: ${error.message}`);
            }
        }
    }
}