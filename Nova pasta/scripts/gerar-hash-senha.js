// Script para gerar hash bcrypt de senha
// Execute: node scripts/gerar-hash-senha.js

const bcrypt = require('bcryptjs');

// Senha padrão (altere se necessário)
const senha = process.argv[2] || 'admin123';

async function gerarHash() {
  try {
    const hash = await bcrypt.hash(senha, 10);
    console.log('\n========================================');
    console.log('Hash gerado com sucesso!');
    console.log('========================================');
    console.log('Senha:', senha);
    console.log('Hash:', hash);
    console.log('========================================\n');
    
    console.log('Use este hash no script SQL:');
    console.log(`UPDATE usuarios SET senha = '${hash}' WHERE email = 'admin@dashboard.com';`);
    console.log('\nOu para criar novo usuário:');
    console.log(`INSERT INTO usuarios (nome, email, telefone, senha, tipo_conta, is_super_admin, data_cadastro)`);
    console.log(`VALUES (`);
    console.log(`  'Super Administrador',`);
    console.log(`  'admin@berg.com',`);
    console.log(`  '+5511999999999',`);
    console.log(`  '${hash}',`);
    console.log(`  'dono_loja',`);
    console.log(`  true,`);
    console.log(`  CURRENT_DATE`);
    console.log(`);\n`);
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
  }
}

gerarHash();

