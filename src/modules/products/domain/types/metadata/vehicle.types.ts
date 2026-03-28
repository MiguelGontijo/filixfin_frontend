/**
 * ============================================================================
 * 🏎️ METADATA TYPE: VehicleMetadata
 * @description Define a estrutura de dados dinâmicos (JSONB) para o setor 
 * automotivo e de transportes.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Shopify Level):
 * 1. Engineering Precision: Mapeia dados técnicos fundamentais (Combustível, 
 * Transmissão, Quilometragem) com tipagem estrita para análise de inventário.
 * 2. Market Standards: Inclui campos de conformidade de mercado brasileiro 
 * como o Código FIPE e Final de Placa para gestão documental.
 * 3. Descriptive Richness: Garante que atributos visuais (Cor, Portas) sejam 
 * preservados para renderização em catálogos e marketplaces.
 * ============================================================================
 */

export interface VehicleMetadata {
    /** 📅 Ano do modelo ou fabricação do veículo */
    year: number;

    /** 🛣️ Quilometragem total acumulada (Hodômetro) */
    mileage: number;

    /** ⛽ Tipo de propulsão / combustível */
    fuel: 'GASOLINE' | 'ETHANOL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'FLEX';

    /** ⚙️ Sistema de transmissão e troca de marchas */
    transmission: 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DUAL_CLUTCH';

    /** 🔢 Último dígito da placa (essencial para gestão de rodízio/IPVA) */
    plate_end?: string;

    /** 🎨 Identificação visual da cor predominante */
    color?: string;

    /** 🚪 Configuração de carroceria (ex: 2, 3, 4 ou 5 portas) */
    doors?: number;

    /** 📋 Identificador único na tabela de referência nacional (FIPE) */
    fipe_code?: string;

    /** 🏷️ Chassi ou número de série para identificação inequívoca (opcional) */
    vin_number?: string;
}