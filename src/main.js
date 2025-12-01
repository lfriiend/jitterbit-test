const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const pool = require('./database/db');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/order', orderRoutes);

// Inicializa as tabelas ao rodar o servidor (opcional, mas útil para teste)
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "Order" (
                "orderId" VARCHAR(255) PRIMARY KEY,
                "value" NUMERIC NOT NULL,
                "creationDate" TIMESTAMP NOT NULL
            );
            CREATE TABLE IF NOT EXISTS "Items" (
                "id" SERIAL PRIMARY KEY,
                "orderId" VARCHAR(255) REFERENCES "Order"("orderId") ON DELETE CASCADE,
                "productId" INTEGER NOT NULL,
                "quantity" INTEGER NOT NULL,
                "price" NUMERIC NOT NULL
            );
        `);
        console.log("Tabelas SQL verificadas/criadas.");
    } catch (error) {
        console.error("Erro ao iniciar DB:", error);
    }
};

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
});