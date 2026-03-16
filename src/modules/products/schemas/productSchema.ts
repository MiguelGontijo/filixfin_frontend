import { z } from 'zod';
import { BaseUOM, ProductType } from '../types/enums';

/**
 * 📦 Schema Auxiliar para os itens da Grade (Variáveis)
 * Dita as regras de cada linha da tabela de variações que vamos criar na tela.
 */
const VariantItemSchema = z.object({
    id: z.string().optional(),
    sku: z.string().trim().min(1, 'O SKU é obrigatório na variação'),
    name: z.string().optional(),
    barcode: z.string().optional(),
    salePrice: z.coerce.number({ error: 'Preço inválido' }).min(0, 'Preço negativo'),
    costPrice: z.coerce.number({ error: 'Custo inválido' }).min(0).default(0),
    attributes: z.record(z.string(),z.any()).optional().default({}) // O JSONB (Cor, Tamanho, etc)
});

/**
 * @schema ProductFormSchema
 * @description O Tradutor Bimodal (Simples vs Variável).
 */
export const ProductFormSchema = z.object({
    // =========================================================================
    // 📦 DADOS DO PAI (Produto)
    // =========================================================================
    id: z.string().optional(),
    name: z.string().min(3, 'O nome do produto deve ter no mínimo 3 caracteres'),
    
    // Forçamos que seja uma string válida. Se for vazio (""), o .min(1) barra com a mensagem correta.
    // Se tiver conteúdo, o .uuid() garante que é um ID válido do banco de dados.
    categoryId: z.string({ error: 'Selecione uma categoria' })
        .min(1, 'A categoria é obrigatória')
        .uuid('ID de categoria inválido'),
        
    taxGroupId: z.string({ error: 'Selecione uma regra fiscal' })
        .min(1, 'A regra fiscal (imposto) é obrigatória')
        .uuid('ID de regra fiscal inválido'),
    
    type: z.enum(ProductType, { error: 'Tipo de produto inválido' }).default(ProductType.SIMPLE),
    baseUOM: z.enum(BaseUOM, { error: 'Unidade inválida' }).default(BaseUOM.UN),
    
    isActive: z.boolean().default(true),

    // =========================================================================
    // 🏷️ MODO SIMPLES: Dados do Filho Único
    // (Tornamos os preços opcionais aqui na raiz, pois no modo variável eles não serão usados)
    // =========================================================================
    variantId: z.string().optional(),
    sku: z.string().trim().optional(),
    barcode: z.string().optional(),
    salePrice: z.coerce.number({ error: 'Digite um preço válido' }).min(0).optional(),
    costPrice: z.coerce.number({ error: 'Digite um custo válido' }).min(0).optional(),

    // =========================================================================
    // 📊 MODO SHOPIFY: O Array da Grade de Variações
    // =========================================================================
    variantsList: z.array(VariantItemSchema).optional().default([]),

    // =========================================================================
    // 🛡️ AUDITORIA
    // =========================================================================
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),

}).transform((data) => {
    // 🪄 A MÁGICA DO ROTEAMENTO DE DADOS (O que vai para a API)
    let finalVariants = [];

    // ROTEADOR: O produto tem grade ou é simples?
    if (data.type === ProductType.VARIABLE) {
        // MODO SHOPIFY: Mapeia a grade preenchida na tela
        finalVariants = data.variantsList.map(v => ({
            id: v.id,
            // Nome Inteligente: Se não tiver nome próprio, herda o nome do Pai + SKU (Ex: "Camiseta - Azul-M")
            name: v.name || `${data.name} - ${v.sku}`, 
            sku: v.sku,
            barcode: v.barcode === '' ? undefined : v.barcode,
            salePrice: v.salePrice,
            costPrice: v.costPrice,
            attributes: v.attributes
        }));
    } else {
        // MODO CLÁSSICO: Produto Simples ou Serviço (Empacota os dados da raiz)
        finalVariants = [
            {
                id: data.variantId, 
                name: data.name, 
                salePrice: data.salePrice || 0,
                costPrice: data.costPrice || 0,
                sku: data.sku === '' ? undefined : data.sku,
                barcode: data.barcode === '' ? undefined : data.barcode,
                attributes: {}
            }
        ];
    }

    return {
        // Envia o payload final limpo e blindado para o Backend
        id: data.id,
        name: data.name,
        type: data.type,
        baseUOM: data.baseUOM,
        isActive: data.isActive,
        categoryId: data.categoryId === '' ? undefined : data.categoryId,
        taxGroupId: data.taxGroupId === '' ? undefined : data.taxGroupId,
        
        // A matriz de Variantes perfeitamente formatada, independentemente do tipo escolhido
        variants: finalVariants
    };
});

export type ProductFormInput = z.input<typeof ProductFormSchema>;