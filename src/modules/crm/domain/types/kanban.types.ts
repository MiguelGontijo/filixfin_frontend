import { CRMDeal } from './deal.types';

export interface KanbanColumnProps {
    id: string;          // UUID do Stage
    title: string;       // Nome do Stage (ex: "Negociação")
    color: string;       // Cor da barra lateral
    deals: CRMDeal[];    // Cards desta coluna
    totalValue: number;  // Soma dos valores da coluna
    
    // Ações do Board
    onAddDeal: () => void;
    onEditDeal: (deal: CRMDeal) => void;
}