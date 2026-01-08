import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'frontend-sources.txt');
const srcDir = path.join(projectRoot, 'src');

// Pastas que NÃO queremos ver na árvore para não poluir
const ignoredFolders = ['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', 'package-lock.json' ];

console.log('Iniciando coleta de arquivos...');

let output = '';
let fileCount = 0;
// Centralizei as extensões permitidas
const allowedExtensions = ['.ts', '.yml', '.json', '.tsx', '.md', '.mjs', '.css', '.ico'];

// --- NOVA FUNÇÃO: Gera a árvore de diretórios ---
function generateTree(dir: string, prefix: string = ''): string {
  let treeResult = '';
  
  // Lê o diretório
  let items = fs.readdirSync(dir);
  
  // Filtra itens ignorados
  items = items.filter(item => !ignoredFolders.includes(item));

  // Ordena: pastas primeiro, depois arquivos (opcional, mas fica mais bonito)
  items.sort((a, b) => {
    const statA = fs.statSync(path.join(dir, a));
    const statB = fs.statSync(path.join(dir, b));
    if (statA.isDirectory() && !statB.isDirectory()) return -1;
    if (!statA.isDirectory() && statB.isDirectory()) return 1;
    return a.localeCompare(b);
  });

  items.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    const isLast = index === items.length - 1;
    
    // Define os caracteres do desenho da árvore
    const marker = isLast ? '└── ' : '├── ';
    treeResult += `${prefix}${marker}${item}\n`;

    if (stat.isDirectory()) {
      // Recursão com indentação ajustada
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      treeResult += generateTree(fullPath, newPrefix);
    }
  });

  return treeResult;
}

// --- Helper para adicionar o conteúdo ao output ---
function addFileToOutput(fullPath: string) {
  fileCount++;
  const relativePath = path.relative(projectRoot, fullPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  output += `// ===== FILE: ${relativePath} =====\n\n`;
  output += content;
  output += '\n\n\n';
}

// --- 1. Sua função original para ler 'src' recursivamente ---
function processSrcRecursive(directory: string) {
  if (!fs.existsSync(directory)) return;

  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    // 🛑 TRAVA DE SEGURANÇA (O Pulo do Gato)
    // Se o nome (arquivo ou pasta) estiver na lista de ignorados, aborta este item.
    if (ignoredFolders.includes(file)) return;

    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Como já passamos pela trava acima, é seguro entrar recursivamente
      processSrcRecursive(fullPath); 
    } else if (allowedExtensions.includes(path.extname(file))) {
      addFileToOutput(fullPath);
    }
  });
}

// --- 2. Nova função para ler APENAS arquivos da raiz ---
function processRootFiles(directory: string) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    // 🛑 A MESMA TRAVA DE SEGURANÇA AQUI
    if (ignoredFolders.includes(file)) return;

    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isFile() && allowedExtensions.includes(path.extname(file))) {
      addFileToOutput(fullPath);
    }
  });
}

try {
  // ETAPA 0: Gerar a Árvore de Pastas
  console.log('Gerando árvore de diretórios...');
  const treeStructure = generateTree(projectRoot);
  
  output += '// ==============================\n';
  output += '// PROJECT STRUCTURE (Tree View)\n';
  output += '// ==============================\n';
  output += treeStructure;
  output += '\n\n\n';

  // ETAPA 1: Processa os arquivos da raiz (ex: package.json)
  processRootFiles(projectRoot);

  // ETAPA 2: Processa o diretório 'src' recursivamente (como antes)
  processSrcRecursive(srcDir);
  
  fs.writeFileSync(outputFile, output);
  console.log(`✅ Sucesso! Árvore gerada e ${fileCount} arquivos copiados para ${outputFile}`);
} catch (error) {
  console.error('❌ Erro:', error);
}