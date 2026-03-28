import { z } from 'zod';
import { BaseUOM } from '../types/enums';

/**
 * ============================================================================
 * 🧬 SCHEMA ATÔMICO: BaseProductSchema
 * @description Define as propriedades imutáveis e universais de um Produto.
 * Este schema serve como a base genética para todos os tipos comerciais 
 * (SIMPLE, VARIABLE, SERVICE, KIT).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Architecture):
 * 1. Data Integrity: Validações rigorosas de UUID para chaves estrangeiras.
 * 2. Strict Typing: Uso de Enums nativos para garantir paridade com o Backend.
 * 3. UX Driven: Mensagens de erro amigáveis para feedback imediato na UI.
 * ============================================================================
 */
export const BaseProductSchema = z.object({
    /** 🔑 Identificador único do produto (opcional na criação, obrigatório na edição) */
    id: z.uuid('ID inválido').optional(),
    
    /** 🏷️ Nome descritivo do item para exibição comercial */
    name: z.string()
        .min(3, 'O nome deve ter no mínimo 3 caracteres')
        .max(255, 'O nome excedeu o limite de caracteres'),
    
    /** 📝 Descrição detalhada técnica ou comercial */
    description: z.string().optional(),
    
    /** 🏷️ Marca do fabricante */
    brand: z.string().optional(),
    
    /** 🏷️ Modelo específico do item */
    model: z.string().optional(),
    
    /** 🔗 Vínculo com a Árvore de Categorias (Obrigatório) */
    categoryId: z.string().uuid('Selecione uma categoria válida'),
    
    /** ⚖️ Vínculo com a Regra Fiscal de Tributação (Obrigatório) */
    taxGroupId: z.string().uuid('Selecione uma regra fiscal válida'),
    
    /** 📦 Unidade de Medida padrão para controle de estoque/venda */
    baseUOM: z.enum(BaseUOM, {
        error: () => ({ message: 'Selecione uma unidade de medida válida' })
    }).default(BaseUOM.UN),
    
    /** 🖼️ Galeria de imagens (URLs) */
    images: z.array(z.url('URL de imagem inválida')).default([]),
    
    /** 🛡️ Controle de visibilidade e disponibilidade comercial */
    isActive: z.boolean().default(true),

    /** ⚙️ Peso bruto para cálculos logísticos */
    weight: z.coerce.number().min(0, 'O peso não pode ser negativo').optional(),

    /** 🧠 Metadados Polimórficos: Onde o JSONB de nicho reside */
    attributes: z.object({
        domain: z.string().optional(), // 🛡️ Permite que o 'domain' exista aqui
    }).catchall(z.any()).default({}), // 🚀 Catchall garante que qualquer outro campo (year, color, etc) seja aceito
});

/**
 * Nota Arquitetural: Este schema não inclui o campo 'type', pois o 'type' 
 * será a nossa chave discriminadora na união final, garantindo que o Zod 
 * saiba exatamente qual sub-schema ativar.
 */