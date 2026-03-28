import { z } from 'zod';
import { ProductType, BaseUOM, ProductDomainModel } from '../types/enums';

/**
 * ============================================================================
 * 📦 SCHEMA AUXILIAR: VariantItemSchema
 * @description Define as regras para cada unidade de venda (SKU) dentro de uma grade.
 * Utilizado primordialmente no modo VARIABLE (Grade/Shopify).
 * ============================================================================
 */
const VariantItemSchema = z.object({
    id: z.string().optional(),
    sku: z.string().trim().min(1, 'O SKU da variante é obrigatório'),
    name: z.string().optional(),
    barcode: z.string().optional(),
    salePrice: z.coerce.number({ error: 'Preço de venda inválido' }).min(0, 'O preço não pode ser negativo'),
    costPrice: z.coerce.number({ error: 'Preço de custo inválido' }).min(0).default(0),
    promotionalPrice: z.coerce.number().min(0).optional(),
    metadata: z.record(z.string(), z.any()).default({}), // JSONB específico da variante
});

/**
 * ============================================================================
 * 🏛️ SCHEMA MESTRE: ProductFormSchema
 * @description O Grande Tradutor do Módulo de Produtos.
 * Este schema gerencia a complexidade de transformar um formulário plano em uma 
 * estrutura de Variantes compatível com o Backend e Shopify.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Bimodal Logic: Gerencia automaticamente a criação de variante única para 
 * produtos SIMPLE e a validação de arrays para VARIABLE.
 * 2. Domain Binding: Vincula o modelo de domínio (Veículo, Food, etc) ao JSONB.
 * 3. Data Integrity: Garante que IDs de categorias e grupos fiscais sejam UUIDs válidos.
 * ============================================================================
 */
export const ProductFormSchema = z.object({
    // --- Dados do Produto (Pai) ---
    id: z.uuid().optional(),
    name: z.string().min(3, 'O nome do produto deve ter no mínimo 3 caracteres'),
    description: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    
    categoryId: z.uuid('Selecione uma categoria válida'),
    taxGroupId: z.uuid('Selecione uma regra fiscal válida'),
    
    type: z.enum(ProductType).default(ProductType.SIMPLE),
    domainModel: z.enum(ProductDomainModel).default(ProductDomainModel.PHYSICAL),
    baseUOM: z.enum(BaseUOM).default(BaseUOM.UN),
    
    images: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),

    // --- Dados para Modo SIMPLE (Campos achatados na raiz do form) ---
    variantId: z.string().optional(), // ID da variante principal
    sku: z.string().trim().optional(),
    barcode: z.string().optional(),
    salePrice: z.coerce.number().min(0).optional(),
    costPrice: z.coerce.number().min(0).optional(),

    // --- Dados para Modo VARIABLE (Grade) ---
    variantsList: z.array(VariantItemSchema).optional().default([]),

    // --- Metadados Polimórficos (JSONB) ---
    metadata: z.record(z.string(), z.any()).default({}),

}).transform((data) => {
    /**
     * 🪄 A MÁGICA DA TRANSFORMAÇÃO (Payload Builder)
     * Converte os dados capturados para o DTO esperado pelo Backend.
     */
    let finalVariants = [];

    if (data.type === ProductType.VARIABLE) {
        // Modo Grade: Mapeia as variantes da lista
        finalVariants = data.variantsList.map(v => ({
            ...v,
            name: v.name || `${data.name} - ${v.sku}`,
            metadata: v.metadata // No futuro, cada variante pode ter seu metadata
        }));
    } else {
        // Modo Simples/Service/Kit: Encapsula os dados da raiz em uma única variante
        finalVariants = [{
            id: data.variantId,
            sku: data.sku || undefined,
            name: data.name,
            barcode: data.barcode || undefined,
            salePrice: data.salePrice || 0,
            costPrice: data.costPrice || 0,
            metadata: data.metadata // Herda o metadata preenchido no sub-form (Veículo, Food, etc)
        }];
    }

    return {
        id: data.id,
        name: data.name,
        description: data.description,
        brand: data.brand,
        model: data.model,
        type: data.type,
        baseUOM: data.baseUOM,
        categoryId: data.categoryId,
        taxGroupId: data.taxGroupId,
        images: data.images,
        isActive: data.isActive,
        // O campo 'domainModel' é usado para a UI, mas enviamos apenas o resultado no JSONB
        variants: finalVariants
    };
});

/** * @type ProductFormInput
 * Define a tipagem de entrada para o React Hook Form baseada no Schema.
 */
export type ProductFormInput = z.input<typeof ProductFormSchema>;