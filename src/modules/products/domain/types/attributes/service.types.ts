/**
 * ============================================================================
 * 🛠️ Attributes TYPE: ServiceAttributes
 * @description Define a estrutura de dados para o domínio de serviços, 
 * consultorias e assinaturas.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Google/Shopify Level):
 * 1. Time Governance: Gerencia a duração e o ciclo de entrega do serviço.
 * 2. Delivery Model: Especifica se a prestação é remota ou presencial.
 * 3. Subscription Ready: Estrutura preparada para recorrências de faturamento.
 * 4. Pre-requisites: Mapeia dependências necessárias para a execução.
 * ============================================================================
 */

export interface ServiceAttributes {
    /** * 🧬 DNA: domain
     * @description Identificador de ativação do modelo de nicho. 
     * Essencial para o brilho automático e introspecção do Motor CRUD.
     */
    domain: string;
    
    /** ⏱️ Duração estimada da execução do serviço em minutos */
    duration_minutes: number;

    /** 🌐 Indica se o serviço é prestado de forma remota (online) */
    is_remote: boolean;

    /** 🔄 Modelo de recorrência do serviço ou assinatura */
    recurrence: 'NONE' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

    /** 📋 Lista de requisitos ou pré-condições para a execução (ex: "Acesso ao servidor", "Ambiente limpo") */
    requirements?: string[];

    /** 📅 Indica se o serviço requer agendamento prévio no calendário */
    requires_scheduling?: boolean;

    /** 📍 Local da prestação (relevante se não for remoto) */
    location_type?: 'CLIENT_SITE' | 'COMPANY_SITE' | 'PUBLIC_SPACE';
}