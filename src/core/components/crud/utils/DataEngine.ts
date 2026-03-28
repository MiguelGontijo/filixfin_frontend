/**
 * ============================================================================
 * 🧠 UTILS: DataEngine (Unidade de Inteligência de Dados)
 * @description O motor central de introspecção e transformação do Core CRUD.
 * Projetado para eliminar o atrito entre estruturas relacionais complexas 
 * e interfaces polimórficas de alta performance.
 * * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Google/Shopify Architecture):
 * 1. Deep Introspection: Varre o objeto identificando containers de metadados.
 * 2. Variant Delta Sync: Preserva IDs originais enquanto prioriza novos dados da UI.
 * 3. DNA Recognition: Detecta o marcador 'domain' nos atributos para ativação de UI.
 * 4. Null-to-Safe: Sanitiza valores nulos para evitar quebras em schemas estritos.
 * ============================================================================
 */

export class DataEngine {
    /**
     * 💧 INFLATE (API ➔ UI)
     * @description Prepara o dado bruto do backend para o consumo fluído da UI.
     * Realiza a promoção de variantes, normalização de atributos e detecção de DNA.
     */
    static inflate<T>(rawItem: T): any {
        if (!rawItem || typeof rawItem !== 'object') return rawItem;

        // Clonamos para evitar mutação indesejada no cache da query original
        const uiItem: any = { ...rawItem };

        /**
         * 🔄 REGRA 1: PROMOÇÃO DE VARIANTE MESTRA
         * Se houver um array de 'variants', extraímos a primeira unidade para a raiz.
         * Isso permite que 'sku', 'salePrice' e 'attributes' fiquem disponíveis globalmente.
         */
        const variants = (rawItem as any).variants;
        if (Array.isArray(variants) && variants.length > 0) {
            const masterVariant = variants[0];
            
            // Promove campos essenciais se estiverem ausentes na raiz
            const fieldsToPromote = ['sku', 'barcode', 'salePrice', 'costPrice', 'attributes', 'promotionalPrice'];
            
            fieldsToPromote.forEach(field => {
                if (masterVariant[field] !== undefined) {
                    uiItem[field] = masterVariant[field];
                }
            });
        }

        /**
         * 🧬 REGRA 2: DETECÇÃO DE DNA (Domain Model Auto-Discovery)
         * @description Detecta o marcador 'domain' nos atributos e promove para a raiz,
         * garantindo que o ProductOrchestrator ative a aba correta automaticamente.
         */
        if (uiItem.attributes && typeof uiItem.attributes === 'object') {
            const domainMarker = uiItem.attributes.domain;
            if (domainMarker) {
                uiItem.domainModel = domainMarker;
            }
        }

        return this.sanitize(uiItem);
    }

    /**
     * 🧪 DEFLATE (UI ➔ API)
     * @description O caminho inverso. Pega o estado da tela e remonta a estrutura 
     * original para persistência, respeitando a integridade do DTO e o Delta Sync.
     */
    static deflate(formData: any, originalItem: any): any {
        if (!formData) return formData;

        /**
         * 🛡️ REGRA 1: PRIORIDADE TOTAL AO FORMULÁRIO (Zod Output)
         * O formData já passou pela transformação do Schema (productSchema.ts), 
         * portanto já possui o array 'variants' devidamente montado e carimbado com DNA.
         */
        const apiPayload = { ...formData };

        /**
         * 📦 REGRA 2: DELTA SYNC E PRESERVAÇÃO DE IDENTIDADE
         * Se o item original possuir IDs de variantes, precisamos re-injetar esses IDs
         * no array gerado pelo formulário para que o Backend não crie novas variantes,
         * mas sim atualize as existentes.
         */
        if (originalItem?.variants && Array.isArray(originalItem.variants) && apiPayload.variants) {
            apiPayload.variants = apiPayload.variants.map((v: any, idx: number) => {
                const originalVariant = originalItem.variants[idx];
                
                // Se existe uma variante original na mesma posição, preservamos o ID
                if (originalVariant?.id) {
                    return { ...v, id: originalVariant.id };
                }
                return v;
            });
        }

        return apiPayload;
    }

    /**
     * 🛡️ PRIVATE HELPER: sanitize
     * Converte recursivamente nulls em strings vazias para compatibilidade com inputs.
     */
    private static sanitize(obj: any): any {
        if (obj === null) return "";
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.sanitize(item));

        const sanitizedObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (key === 'attributes' && value === null) {
                    sanitizedObj[key] = {};
                } else {
                    sanitizedObj[key] = this.sanitize(value);
                }
            }
        }
        return sanitizedObj;
    }
}