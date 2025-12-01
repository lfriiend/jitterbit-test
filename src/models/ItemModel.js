const db = require('../database/db');

module.exports = {
    /**
     * Cria um item no banco de dados.
     * Importante: Recebe o 'client' para participar da transação (BEGIN/COMMIT) do Controller.
     */
    async create(client, itemData) {
        const query = `
            INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const values = [
            itemData.orderId,
            itemData.productId,
            itemData.quantity,
            itemData.price
        ];

        // Usa o client passado (que está dentro da transação)
        const { rows } = await client.query(query, values);
        return rows[0];
    },

    /**
     * Busca todos os itens de um pedido.
     */
    async findByOrderId(orderId) {
        const query = `
            SELECT "productId", "quantity", "price"
            FROM "Items"
            WHERE "orderId" = $1
        `;
        
        // Aqui podemos usar o pool direto (db), pois leitura não exige transação de escrita
        const { rows } = await db.query(query, [orderId]);
        return rows;
    },

    /**
     * Deleta todos os itens de um pedido (Usado no Update).
     * Também recebe 'client' pois faz parte de uma transação.
     */
    async deleteAllByOrderId(client, orderId) {
        const query = `DELETE FROM "Items" WHERE "orderId" = $1`;
        await client.query(query, [orderId]);
    }
};