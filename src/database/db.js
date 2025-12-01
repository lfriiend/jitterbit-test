const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://root:root@localhost:5433/produtos_db';

const pool = new Pool({
    connectionString: connectionString,
});

// Lógica de reconexão
const connectWithRetry = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            console.log('⏳ Tentando conectar ao PostgreSQL...');
            const client = await pool.connect();
            console.log('✅ Base de Dados conectada!');
            client.release();
            return true;
        } catch (err) {
            console.log(`⚠️ Falha na conexão. Tentando novamente em ${delay/1000}s...`);
            retries -= 1;
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error('❌ Não foi possível conectar ao banco.');
    process.exit(1);
};

connectWithRetry();

module.exports = pool;