const fs = require('fs');
const path = require('path');

// URL do Heroku
const HEROKU_URL = 'https://esplincorp-manage-flats-0ba3179f0512.herokuapp.com';

// Função para buscar arquivos recursivamente
function findFiles(dir, extensions) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
            // Recursivamente buscar em subdiretórios, excluindo node_modules e dist
            results = results.concat(findFiles(filePath, extensions));
        } else if (extensions.some(ext => file.endsWith(ext))) {
            // Adicionar arquivo se tiver uma das extensões especificadas
            results.push(filePath);
        }
    });

    return results;
}

// Função para substituir URLs em um arquivo
function replaceUrlsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Substituir todas as ocorrências de localhost:8080
        content = content.replace(/http:\/\/localhost:8080/g, HEROKU_URL);

        // Se houve alterações, salvar o arquivo
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Atualizado: ${filePath}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error(`❌ Erro ao processar ${filePath}:`, error.message);
        return false;
    }
}

// Diretório raiz do projeto
const rootDir = path.resolve(__dirname, '..');

// Extensões de arquivos a serem processados
const extensions = ['.js', '.vue', '.ts', '.jsx', '.tsx'];

console.log('🔍 Buscando arquivos...');
const files = findFiles(path.join(rootDir, 'src'), extensions);
console.log(`🔍 Encontrados ${files.length} arquivos para verificar.`);

let updatedCount = 0;

// Processar cada arquivo
files.forEach(file => {
    if (replaceUrlsInFile(file)) {
        updatedCount++;
    }
});

console.log(`\n✅ Concluído! ${updatedCount} arquivos foram atualizados.`);
console.log(`🌐 URL da API atualizada para: ${HEROKU_URL}`); 