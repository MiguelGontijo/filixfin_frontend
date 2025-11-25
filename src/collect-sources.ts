import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'frontend-sources.txt');
const srcDir = path.join(projectRoot, 'src');

console.log('Iniciando coleta de arquivos...');

let output = '';
let fileCount = 0;
// Centralizei as extensões permitidas
const allowedExtensions = ['.ts', '.yml', '.json', '.tsx', '.md', '.mjs', '.css', '.ico'];

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
// (Renomeei para clareza)
function processSrcRecursive(directory: string) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processSrcRecursive(fullPath); // Continua recursivo
    } else if (allowedExtensions.includes(path.extname(file))) {
      addFileToOutput(fullPath); // Usa o helper
    }
  });
}

// --- 2. Nova função para ler APENAS arquivos da raiz ---
function processRootFiles(directory: string) {
  const files = fs.readdirSync(directory);

  files.forEach(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    // Se for um ARQUIVO (ignorando pastas como 'src', 'node_modules' etc.)
    // E tiver a extensão correta...
    if (stat.isFile() && allowedExtensions.includes(path.extname(file))) {
      addFileToOutput(fullPath); // Adiciona ao output
    }
  });
}

try {
  // ETAPA 1: Processa os arquivos da raiz (ex: package.json)
  processRootFiles(projectRoot);

  // ETAPA 2: Processa o diretório 'src' recursivamente (como antes)
  processSrcRecursive(srcDir);
  
  fs.writeFileSync(outputFile, output);
  console.log(`✅ Sucesso! ${fileCount} arquivos copiados para backendLeaf-sources.txt`);
} catch (error) {
  console.error('❌ Erro:', error);
}