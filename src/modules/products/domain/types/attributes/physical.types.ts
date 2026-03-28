/**
 * @interface PhysicalAttributes
 * @description Metadados para bens de consumo físicos gerais.
 */
export interface PhysicalAttributes {
    /** * 🧬 DNA: domain
     * @description Identificador de ativação do modelo de nicho. 
     * Essencial para o brilho automático e introspecção do Motor CRUD.
     */
    domain: string;
    
    weight_kg?: number;
    dimensions?: {
        height_cm: number;
        width_cm: number;
        depth_cm: number;
    };
    color?: string;
    material?: string;
    size?: string;
    model_code?: string;
    gender?: string;
    age_group?: string;

}