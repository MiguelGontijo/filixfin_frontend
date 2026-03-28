/**
 * ============================================================================
 * 🏠 METADATA TYPE: RealEstateMetadata
 * @description Define a estrutura de dados dinâmicos (JSONB) para o setor 
 * imobiliário e de propriedades.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Asset Classification: Categoriza tipos de imóveis (Residencial, Comercial, 
 * Rural) para garantir filtros de busca precisos no catálogo.
 * 2. Spatial Metrics: Estrutura metragens e contagem de cômodos com tipagem 
 * numérica estrita, permitindo cálculos automáticos de preço por m².
 * 3. Fiscal & Maintenance Awareness: Inclui campos para valores de tributos 
 * (IPTU) e taxas associadas (Condomínio), essenciais para análise financeira.
 * ============================================================================
 */

export interface RealEstateMetadata {
    /** 🏘️ Classificação do tipo de propriedade */
    property_type: 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'FARM';

    /** 📐 Área total da propriedade em metros quadrados (m²) */
    area_total_m2: number;

    /** 📐 Área útil/construída da propriedade em metros quadrados (m²) */
    area_useful_m2?: number;

    /** 🛌 Quantidade total de quartos/dormitórios */
    bedrooms: number;

    /** 🚿 Quantidade total de banheiros */
    bathrooms: number;

    /** 🛁 Quantidade de dormitórios com banheiro privativo (suítes) */
    suites?: number;

    /** 🚗 Quantidade de vagas de garagem ou estacionamento */
    parking_spaces: number;

    /** 💰 Valor anual do Imposto Predial e Territorial Urbano (BRL) */
    iptu_value?: number;

    /** 🏢 Valor mensal da taxa de condomínio (BRL) */
    condo_value?: number;

    /** 📑 Lista de diferenciais e amenidades (ex: Piscina, Churrasqueira, Portaria) */
    features?: string[];
}