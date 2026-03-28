/**
 * ============================================================================
 * 📊 DOMAIN TYPE: ICRMSummary
 * @description Contrato de dados de Business Intelligence para o CRM. 
 * Define a estrutura de resposta da rota /crm/deals/summary.
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Netflix/Google Level):
 * 1. Semantic Grouping: Divide as métricas em blocos lógicos (Pipeline, Won, KPIs),
 * facilitando o consumo por sub-componentes de Dashboard.
 * 2. Financial Integrity: Mapeia explicitamente valores monetários e contagens,
 * permitindo formatações consistentes em toda a aplicação.
 * 3. Type Safety: Garante que o Frontend nunca tente renderizar uma métrica 
 * inexistente ou mal-formatada vinda do Backend.
 * ============================================================================
 */

export interface ICRMSummary {
    /** 🗂️ Dados de Negócios em Aberto (O que está no Funil) */
    pipeline: {
        /** Valor total somado de todas as deals ativas */
        totalValue: number;
        /** Quantidade total de deals em andamento */
        count: number;
    };

    /** 🏆 Dados de Negócios Concluídos com Sucesso */
    won: {
        /** Valor total faturado (VGV Convertido) */
        totalValue: number;
        /** Quantidade de contratos fechados */
        count: number;
    };

    /** ❌ Dados de Negócios Perdidos */
    lost: {
        /** Quantidade de oportunidades descartadas ou perdidas */
        count: number;
    };

    /** 📈 Indicadores de Performance (KPIs Processados) */
    kpis: {
        /** Porcentagem de sucesso (Won / (Won + Lost)) */
        conversionRatePercentage: number;
        /** Valor médio por fechamento de negócio */
        averageTicketValue: number;
    };
}