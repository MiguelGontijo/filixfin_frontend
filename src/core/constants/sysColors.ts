// ===== FILE: src/core/constants/sysColors.ts =====

/**
 * @file sysColors.ts
 * @description Dicionário Central de Cores do Sistema (Shared Kernel).
 * * 🏆 PADRÃO DE QUALIDADE CLASSE OURO (Enterprise Grade - DDD):
 * 1. Single Source of Truth (SSOT): Centraliza as cores permitidas na aplicação,
 * evitando duplicação de lógicas em módulos distintos (CRM, Tarefas, Financeiro).
 * 2. Imutabilidade e Previsibilidade: Fornece um contrato estrito (Type e Const)
 * para que o Zod e o Banco de Dados trafeguem apenas Hexadecimais válidos e homologados.
 * 3. Acessibilidade (a11y): Utiliza a paleta Tailwind 500, garantindo contraste 
 * perfeito (WCAG) sobre fundos Dark (Gray-800/900).
 */

export type SysColorKey = 
    | 'SLATE' | 'GRAY' | 'ZINC' | 'RED' | 'ORANGE' | 'AMBER' 
    | 'YELLOW' | 'LIME' | 'GREEN' | 'EMERALD' | 'TEAL' | 'CYAN' 
    | 'SKY' | 'BLUE' | 'INDIGO' | 'VIOLET' | 'PURPLE' | 'FUCHSIA' 
    | 'PINK' | 'ROSE';

export interface SysColor {
    key: SysColorKey;
    name: string;        // Nome amigável para exibição na UI (Tooltips)
    hex: string;         // Valor canônico salvo no Banco de Dados
    twClass: string;     // Classe utilitária do Tailwind para renderização rápida
}

/**
 * @constant SYS_COLORS
 * @description Array imutável contendo a paleta de 20 cores premium do sistema.
 */
export const SYS_COLORS: readonly SysColor[] = [
    { key: 'SLATE',   name: 'Ardósia',     hex: '#64748b', twClass: 'bg-slate-500' },
    { key: 'GRAY',    name: 'Cinza',       hex: '#6b7280', twClass: 'bg-gray-500' },
    { key: 'ZINC',    name: 'Zinco',       hex: '#71717a', twClass: 'bg-zinc-500' },
    { key: 'RED',     name: 'Vermelho',    hex: '#ef4444', twClass: 'bg-red-500' },
    { key: 'ORANGE',  name: 'Laranja',     hex: '#f97316', twClass: 'bg-orange-500' },
    { key: 'AMBER',   name: 'Âmbar',       hex: '#f59e0b', twClass: 'bg-amber-500' },
    { key: 'YELLOW',  name: 'Amarelo',     hex: '#eab308', twClass: 'bg-yellow-500' },
    { key: 'LIME',    name: 'Lima',        hex: '#84cc16', twClass: 'bg-lime-500' },
    { key: 'GREEN',   name: 'Verde',       hex: '#22c55e', twClass: 'bg-green-500' },
    { key: 'EMERALD', name: 'Esmeralda',   hex: '#10b981', twClass: 'bg-emerald-500' },
    { key: 'TEAL',    name: 'Cerceta',     hex: '#14b8a6', twClass: 'bg-teal-500' },
    { key: 'CYAN',    name: 'Ciano',       hex: '#06b6d4', twClass: 'bg-cyan-500' },
    { key: 'SKY',     name: 'Céu',         hex: '#0ea5e9', twClass: 'bg-sky-500' },
    { key: 'BLUE',    name: 'Azul',        hex: '#3b82f6', twClass: 'bg-blue-500' },
    { key: 'INDIGO',  name: 'Índigo',      hex: '#6366f1', twClass: 'bg-indigo-500' },
    { key: 'VIOLET',  name: 'Violeta',     hex: '#8b5cf6', twClass: 'bg-violet-500' },
    { key: 'PURPLE',  name: 'Roxo',        hex: '#a855f7', twClass: 'bg-purple-500' },
    { key: 'FUCHSIA', name: 'Fúcsia',      hex: '#d946ef', twClass: 'bg-fuchsia-500' },
    { key: 'PINK',    name: 'Rosa',        hex: '#ec4899', twClass: 'bg-pink-500' },
    { key: 'ROSE',    name: 'Rosa Escuro', hex: '#f43f5e', twClass: 'bg-rose-500' }
] as const;

// ============================================================================
// 🛠️ UTILS (Funções Auxiliares)
// ============================================================================

/**
 * @function getSysColorByHex
 * @description Busca o objeto de cor completo a partir de um valor Hexadecimal.
 * Útil para hidratar a UI com dados vindos da API.
 * @param hex O valor hexadecimal (ex: '#10b981')
 * @returns O objeto SysColor correspondente ou um fallback (SLATE) caso não exista.
 */
export const getSysColorByHex = (hex: string): SysColor => {
    const normalizedHex = hex.toLowerCase().trim();
    return SYS_COLORS.find(c => c.hex === normalizedHex) || SYS_COLORS[0];
};

/**
 * @constant VALID_HEX_COLORS
 * @description Array contendo apenas as strings hexadecimais permitidas.
 * Extraído automaticamente para alimentar o validador Zod.
 */
export const VALID_HEX_COLORS = SYS_COLORS.map(c => c.hex) as [string, ...string[]];