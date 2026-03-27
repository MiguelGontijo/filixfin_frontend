/**
 * ============================================================================
 * 📦 EXPORTADOR CENTRAL DE TIPAGENS (Mundo 1 - Core CRUD)
 * @description Ponto único de entrada para contratos do Motor V4.
 * Implementa o Barrel Pattern para abstrair a complexidade da estrutura
 * interna de arquivos de Model (engine vs visual).
 * ============================================================================
 */

// ⚙️ Exportação de Modelos de Execução (Cérebro)
export * from './engine.types';

// 👁️ Exportação de Modelos de Apresentação (Corpo)
export * from './visual.types';

/**
 * Nota Arquitetural: Se no futuro precisarmos de tipos específicos para 
 * Auditoria ou Dashboards de IA dentro do Core, eles serão criados em 
 * arquivos apartados e exportados através deste index, mantendo a 
 * "Figueira Estranguladora" crescendo de forma organizada.
 */