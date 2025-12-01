const db = require('../database/db');

module.exports = {
    async create(client, data) {
        const query = `INSERT INTO "Order" ("orderId", "value", "creationDate") VALUES ($1, $2, $3) RETURNING *`;
        const { rows } = await client.query(query, [data.orderId, data.value, data.creationDate]);
        return rows[0];
    },
    async findById(id) {
        const { rows } = await db.query('SELECT * FROM "Order" WHERE "orderId" = $1', [id]);
        return rows[0];
    },
    async update(client, id, data) {
        const query = `UPDATE "Order" SET "value" = $1, "creationDate" = $2 WHERE "orderId" = $3`;
        await client.query(query, [data.value, data.creationDate, id]);
    },
    async delete(id) {
        // ON DELETE CASCADE remove os itens automaticamente
        const { rowCount } = await db.query('DELETE FROM "Order" WHERE "orderId" = $1', [id]);
        return rowCount > 0;
    }
};