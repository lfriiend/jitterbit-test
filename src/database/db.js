const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgres://root:root@localhost:5432/produtos_db';

const pool = new Pool({
    connectionString: connectionString,
});

// Função para testar conexão com tentativas (Retries)
const connectWithRetry = async (retries = 5, delay = 3000) => {
    while (retries > 0) {
        try {
            console.log(`Tentando conectar ao PostgreSQL... (Restam ${retries} tentativas)`);
            const client = await pool.connect();
            console.log('✅ Base de Dados conectada com sucesso!');
            client.release(); // Libera o cliente imediatamente
            return true; // Sucesso
        } catch (err) {
            console.log(`⏳ Banco indisponível. Retentando em ${delay/1000} segundos...`);
            retries -= 1;
            if (retries === 0) {
                console.error('❌ Não foi possível conectar ao banco de dados após várias tentativas.');
                // Não matamos o processo aqui, deixamos o erro propagar se necessário
            }
            // Espera X segundos antes de tentar de novo
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

// Executa a tentativa de conexão assim que o arquivo é carregado
connectWithRetry();

pool.on('error', (err) => {
    console.error('Erro inesperado no cliente do banco de dados', err);
});

module.exports = pool;