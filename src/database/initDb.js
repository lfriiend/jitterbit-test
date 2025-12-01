const pool = require('./db');

async function initDb() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Tabela de Usuários
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Users" (
                "id" SERIAL PRIMARY KEY,
                "username" VARCHAR(255) UNIQUE NOT NULL,
                "password" VARCHAR(255) NOT NULL
            );
        `);

        // 2. Tabela Order
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Order" (
                "orderId" VARCHAR(255) PRIMARY KEY,
                "value" NUMERIC NOT NULL,
                "creationDate" TIMESTAMP NOT NULL
            );
        `);

        // 3. Tabela Items
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Items" (
                "id" SERIAL PRIMARY KEY,
                "orderId" VARCHAR(255) NOT NULL,
                "productId" INTEGER NOT NULL,
                "quantity" INTEGER NOT NULL,
                "price" NUMERIC NOT NULL,
                CONSTRAINT fk_order FOREIGN KEY ("orderId") REFERENCES "Order"("orderId") ON DELETE CASCADE
            );
        `);

        await client.query('COMMIT');
        console.log('✅ Tabelas verificadas/criadas com sucesso.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erro na inicialização do banco:', error);
    } finally {
        client.release();
    }
}

module.exports = initDb;