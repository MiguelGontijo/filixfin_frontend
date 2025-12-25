import { FiscalForm } from '@/modules/fiscal/components/FiscalForm';

/**
 * Rota de Criação de Grupo Fiscal.
 * * URL: /[tenantId]/dashboard/fiscal/create
 * * Responsabilidade: Renderizar o Formulário de Cadastro (Smart Component).
 */
export default function FiscalCreatePage() {
    return <FiscalForm />;
}