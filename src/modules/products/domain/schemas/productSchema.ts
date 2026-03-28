import { z } from 'zod';

// --- Inteligência de Domínio (Enums e Contratos) ---
import { ProductType } from '../types/enums';

// --- Importação dos Pilares Isolados (Sua Nova Estrutura) ---
import { SimpleProductSchema } from './simpleProductSchema';
import { VariableProductSchema } from './variableProductSchema';
import { ServiceProductSchema } from './serviceProductSchema';
import { KitProductSchema } from './kitProductSchema';

/**
 * ============================================================================
 * 🏛️ SCHEMA MESTRE: ProductFormSchema
 * @description O Grande Unificador do Ecossistema de Produtos.
 * Utiliza o padrão de União Discriminada (Discriminated Union) para rotear
 * a validação correta baseada no campo 'type'.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Architecture):
 * 1. Polymorphic Routing: Ativa schemas específicos em tempo real (Runtime).
 * 2. Type Inference: Exporta o contrato 'ProductFormInput' para o Registry.
 * 3. Payload Normalizer: Transforma a entrada da UI no DTO de variantes do Backend.
 * 4. DNA Injection: Centraliza a gravação do marcador 'domain' nos atributos.
 * ============================================================================
 */
export const ProductFormSchema = z.discriminatedUnion('type', [
    SimpleProductSchema,
    VariableProductSchema,
    ServiceProductSchema,
    KitProductSchema
]).transform((data: any) => {
    /**
     * 🪄 A MÁGICA DA TRANSFORMAÇÃO (Payload Builder)
     * Converte os diferentes formatos de entrada em um array padronizado 
     * de variantes esperado pelo Backend (Contract Sync).
     */
    let finalVariants: any[] = [];

    /**
     * 🧬 DNA INJECTION: Captura de Identidade
     * @description Capturamos o domainModel selecionado na UI para injetá-lo 
     * como 'domain' dentro do objeto de atributos. Isso garante que o dado 
     * seja autodescritivo para o brilho automático na leitura.
     */
    const activeDomain = data.domainModel;

    switch (data.type) {
        case ProductType.VARIABLE:
            // Modo Grade: Mapeia as variantes vindas da lista interna do schema
            finalVariants = data.variantsList.map((v: any) => ({
                ...v,
                name: v.name || `${data.name} - ${v.sku}`,
                // Sincroniza o DNA em cada item da grade
                attributes: { ...v.attributes, domain: activeDomain }
            }));
            break;

        case ProductType.KIT:
            // Modo Kit: Criamos uma variante única que representa o combo
            finalVariants = [{
                sku: data.sku,
                name: data.name,
                salePrice: data.salePrice,
                costPrice: data.costPrice,
                // Injeta o DNA no container de atributos do Kit
                attributes: { ...data.attributes, domain: activeDomain }
            }];
            break;

        case ProductType.SERVICE:
            // Modo Serviço: Encapsula dados de execução em uma variante lógica
            finalVariants = [{
                sku: data.sku,
                name: data.name,
                salePrice: data.salePrice,
                // Injeta o DNA no container de atributos do Serviço
                attributes: { ...data.attributes, domain: activeDomain }
            }];
            break;

        case ProductType.SIMPLE:
        default:
            // Modo Simples: Encapsula os dados achatados da raiz
            finalVariants = [{
                sku: data.sku,
                name: data.name,
                barcode: data.barcode,
                salePrice: data.salePrice,
                costPrice: data.costPrice,
                // Injeta o DNA no container de atributos do Produto Simples
                attributes: { ...data.attributes, domain: activeDomain }
            }];
            break;
    }

    // Retorna o DTO limpo e tipado para a API
    return {
        ...data,
        variants: finalVariants,
        // Removemos as listas e estados temporários de UI para não sujar o payload do backend
        // attributes: undefined,
        variantsList: undefined,
        componentsList: undefined
    };
});

/** * @type ProductFormInput
 * @description Exportação vital para a camada de Presentation (Registry/Config).
 * Representa o estado exato do formulário antes da transformação.
 */
export type ProductFormInput = z.input<typeof ProductFormSchema>;

/**
 * @type ProductFormOutput
 * @description Representa o dado pronto para ser enviado via POST/PUT para a API.
 */
export type ProductFormOutput = z.output<typeof ProductFormSchema>;