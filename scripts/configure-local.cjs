const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const target = path.join(__dirname, '..', '.env');
if (fs.existsSync(target)) {
  console.log('O .env existente foi preservado.');
} else {
  fs.writeFileSync(target, [
    '# Ambiente local; nao enviar ao servidor ou repositorio.',
    'DATABASE_URL="mysql://root:password@127.0.0.1:3308/database_museu"',
    `JWT_SECRET="${crypto.randomBytes(48).toString('hex')}"`,
    'APP_ORIGIN="http://localhost:3000"',
    'PORT=3000',
    '',
  ].join('\n'), { mode: 0o600, flag: 'wx' });
  console.log('Configuracao local criada sem exibir segredos.');
}
