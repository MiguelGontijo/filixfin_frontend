import { FiscalList } from '@/modules/fiscal/components/FiscalList';

/**
 * Rota Principal do Módulo Fiscal.
 * * URL: /[tenantId]/dashboard/fiscal
 * * Responsabilidade: Renderizar o Container de Listagem (Smart Component).
 * * Nota: A lógica de estado e dados reside dentro de <FiscalList />.
 */
export default function FiscalPage() {
    return <FiscalList />;
}