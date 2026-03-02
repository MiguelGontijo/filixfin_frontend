/**
 * @file AIActionProposal.dto.ts
 * @description Contrato de Dados para a Proposta de Ação.
 * Se este objeto vier preenchido na resposta da IA, o Frontend deve 
 * pausar o chat e mostrar a UI correspondente (SmartCards, Modais, etc).
 * [ESPELHO PERFEITO DA CLASSE AIActionProposal DO BACKEND]
 */

import { UIActionType } from '../enums/AIEnums';

/**
 * @interface AIActionProposal
 * @description A Estrutura da Proposta.
 */
export interface AIActionProposal {
    /**
     * O tipo de componente visual a ser renderizado.
     * (Corrigido de 'ui_action' para 'type' para parear com o backend).
     */
    type: UIActionType;

    /**
     * Título amigável para a ação (Ex: "Cadastrar Novo Cliente").
     */
    label: string;

    /**
     * O payload de dados para a ação.
     * O Frontend usa isso para preencher os campos automaticamente ou exibir tabelas.
     */
    data: Record<string, any>;

    /**
     * (Opcional) A intenção técnica por trás da ação.
     * Ex: 'CREATE_CLIENT', 'UPDATE_STOCK'.
     * Serve para o Frontend saber qual endpoint acionar ao confirmar.
     */
    actionIntent?: string;
}