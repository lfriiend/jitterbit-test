const db = require('../database/db');

module.exports = {
    async findByUsername(username) {
        const { rows } = await db.query('SELECT * FROM "Users" WHERE "username" = $1', [username]);
        return rows[0];
    },
    async create(username, password) {
        const { rows } = await db.query(
            'INSERT INTO "Users" ("username", "password") VALUES ($1, $2) RETURNING id, username',
            [username, password]
        );
        return rows[0];
    }
};