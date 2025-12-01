const db = require('../database/db');

module.exports = {
    /**
     * Cria um novo pedido.
     * Requer 'client' para participar da transação (BEGIN...COMMIT) iniciada no Controller.
     */
    async create(client, orderData) {
        // Atenção às aspas em "Order" pois é palavra reservada do SQL
        const query = `
            INSERT INTO "Order" ("orderId", "value", "creationDate")
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        const values = [
            orderData.orderId, 
            orderData.value, 
            orderData.creationDate
        ];

        const { rows } = await client.query(query, values);
        return rows[0];
    },

    /**
     * Busca um pedido pelo ID.
     * Não precisa de transação, usa o pool (db) direto.
     */
    async findById(id) {
        const query = `
            SELECT * FROM "Order" 
            WHERE "orderId" = $1
        `;
        
        const { rows } = await db.query(query, [id]);
        return rows[0] || null;
    },

    /**
     * Lista todos os pedidos (apenas os dados da tabela Order).
     */
    async findAll() {
        const query = `SELECT * FROM "Order"`;
        const { rows } = await db.query(query);
        return rows;
    },

    /**
     * Atualiza um pedido.
     * Requer 'client' pois faz parte de uma transação de atualização.
     */
    async update(client, id, orderData) {
        const query = `
            UPDATE "Order" 
            SET "value" = $1, "creationDate" = $2
            WHERE "orderId" = $3
            RETURNING *
        `;
        
        const values = [
            orderData.value, 
            orderData.creationDate, 
            id
        ];

        const { rows } = await client.query(query, values);
        return rows[0];
    },

    /**
     * Deleta um pedido.
     */
    async delete(id) {
        const query = `DELETE FROM "Order" WHERE "orderId" = $1`;
        const result = await db.query(query, [id]);
        return result.rowCount > 0;
    }
};