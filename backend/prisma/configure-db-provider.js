const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load root .env or backend .env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const backendDotEnv = path.join(__dirname, '../.env');

// Ensure backend/.env exists so Prisma CLI automatically gets DATABASE_URL
if (!fs.existsSync(backendDotEnv)) {
  fs.writeFileSync(backendDotEnv, `DATABASE_URL="${dbUrl}"\n`, 'utf8');
} else {
  let content = fs.readFileSync(backendDotEnv, 'utf8');
  if (!content.includes('DATABASE_URL')) {
    content += `\nDATABASE_URL="${dbUrl}"\n`;
    fs.writeFileSync(backendDotEnv, content, 'utf8');
  }
}

const schemaPath = path.join(__dirname, 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');
const isSqlite = dbUrl.startsWith('file:') || dbUrl.includes('.db');
const targetProvider = isSqlite ? 'sqlite' : 'postgresql';

const currentProviderMatch = schema.match(/provider\s*=\s*"([^"]+)"/);
if (currentProviderMatch && currentProviderMatch[1] !== targetProvider) {
  schema = schema.replace(/provider\s*=\s*"[^"]+"/, `provider = "${targetProvider}"`);
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log(`[Prisma Config] Switched datasource provider to '${targetProvider}' based on DATABASE_URL.`);
} else {
  console.log(`[Prisma Config] Datasource provider is already '${targetProvider}'.`);
}
