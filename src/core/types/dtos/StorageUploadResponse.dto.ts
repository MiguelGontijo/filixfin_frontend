/**
 * @interface StorageUploadResponseDto
 * @description Contrato de rede para o retorno do upload de arquivos.
 * Espelho exato da resposta gerada pelo `StorageController` no Backend.
 */
export interface StorageUploadResponseDto {
    /** * O estado da transação HTTP no padrão da nossa API. 
     */
    status: 'success' | 'error';

    /** * Mensagem amigável retornada pelo servidor. 
     */
    message: string;

    /** * Array contendo as URLs seguras (Signed URLs) geradas pelo Cloud Storage.
     * Estará presente e preenchido quando o status for 'success'.
     */
    urls: string[];
}