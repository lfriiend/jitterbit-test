const db = require('../database/db');

module.exports = {
    async create(client, data) {
        const query = `INSERT INTO "Items" ("orderId", "productId", "quantity", "price") VALUES ($1, $2, $3, $4)`;
        await client.query(query, [data.orderId, data.productId, data.quantity, data.price]);
    },
    async findByOrderId(orderId) {
        const { rows } = await db.query('SELECT "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1', [orderId]);
        return rows;
    },
    async deleteAllByOrderId(client, orderId) {
        await client.query('DELETE FROM "Items" WHERE "orderId" = $1', [orderId]);
    }
};