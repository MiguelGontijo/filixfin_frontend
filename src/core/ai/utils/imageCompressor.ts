/**
 * @file imageCompressor.ts
 * @description Utilitário puro para compressão de imagens no lado do cliente (Browser).
 * * OBJETIVO: Reduzir drásticamente o tamanho de imagens (fotos/prints) antes de enviá-las 
 * para a IA, economizando consumo de banda e cota de tokens (Redução de custos).
 */

interface CompressOptions {
    /** Largura máxima permitida (Mantém a proporção) @default 1024 */
    maxWidth?: number;
    /** Altura máxima permitida (Mantém a proporção) @default 1024 */
    maxHeight?: number;
    /** Qualidade do JPEG/WEBP final (0.1 a 1.0) @default 0.8 (80%) */
    quality?: number;
}

/**
 * Comprime uma imagem File para economizar tokens do LLM.
 * Se o arquivo não for uma imagem, ele é devolvido intacto.
 */
export const compressImage = async (file: File, options: CompressOptions = {}): Promise<File> => {
    // Se não for imagem (ex: PDF, DOCX), ignora a compressão e devolve o arquivo original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const { maxWidth = 1024, maxHeight = 1024, quality = 0.8 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                // 1. Calcula as novas dimensões mantendo a proporção exata (Aspect Ratio)
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                // 2. Cria um Canvas invisível em memória para desenhar a imagem menor
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Falha ao obter contexto 2D do Canvas'));
                    return;
                }

                // Desenha a imagem redimensionada no canvas
                ctx.drawImage(img, 0, 0, width, height);

                // 3. Extrai o arquivo final comprimido (Convertendo para JPEG para máximo ganho)
                // O tipo original é substituído por image/jpeg, que é mais leve que PNGs pesados de print de tela
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Reconstrói o objeto File do JavaScript
                            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            
                            // Log opcional para você ver a mágica acontecendo (Pode remover em prod)
                            // console.log(`Compressão: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
                            
                            resolve(compressedFile);
                        } else {
                            reject(new Error('Falha ao converter canvas para Blob'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = (err) => reject(err);
        };
        
        reader.onerror = (err) => reject(err);
    });
};