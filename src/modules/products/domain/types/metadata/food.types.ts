/**
 * ============================================================================
 * 🍕 METADATA TYPE: FoodMetadata
 * @description Define a estrutura de dados dinâmicos (JSONB) para o setor 
 * de alimentação e food service.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Health & Safety: Mapeia rigorosamente ingredientes e alérgenos, 
 * essenciais para conformidade legal e segurança do consumidor.
 * 2. Nutritional Intelligence: Estrutura dados nutricionais de forma 
 * granular para facilitar cálculos de dieta e exibição em cardápios.
 * 3. Logistical Awareness: Inclui controle de temperatura e validade curta, 
 * vitais para a gestão de perecíveis.
 * ============================================================================
 */

export interface FoodMetadata {
    /** 🥗 Lista de ingredientes que compõem o produto */
    ingredients: string[];

    /** ⚠️ Lista de substâncias alérgenas (ex: Glúten, Lactose, Amendoim) */
    allergens: string[];

    /** 🍎 Informações Nutricionais por porção padronizada */
    nutritional_info?: {
        /** Valor energético em calorias (kcal) */
        calories: number;
        /** Quantidade de proteínas (g) */
        proteins: number;
        /** Quantidade de carboidratos (g) */
        carbohydrates: number;
        /** Quantidade de gorduras totais (g) */
        total_fats: number;
        /** Quantidade de sódio (mg) */
        sodium: number;
    };

    /** 🌱 Indicadores Dietéticos */
    dietary_flags: {
        is_vegan: boolean;
        is_vegetarian: boolean;
        is_gluten_free: boolean;
        is_lactose_free: boolean;
    };

    /** ❄️ Instruções de Conservação */
    storage_instructions?: {
        /** Temperatura ideal para armazenamento (°C) */
        target_temperature?: number;
        /** Descrição do método de conservação (ex: "Manter sob refrigeração") */
        storage_method: string;
    };

    /** ⏳ Ciclo de Vida: Validade após produção (em horas ou dias) */
    shelf_life: {
        value: number;
        unit: 'HOURS' | 'DAYS';
    };

    /** 🍽️ Sugestão de Preparo ou Consumo */
    serving_suggestion?: string;
}