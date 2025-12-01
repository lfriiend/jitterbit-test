const express = require('express');
const initDb = require('./database/initDb');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger.json');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Registrando Rotas
app.use('/auth', authRoutes);
app.use('/order', orderRoutes);

const start = async () => {
    try {
        console.log('🔄 Inicializando API...');
        await initDb(); // Garante tabelas antes de abrir porta
        
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
            console.log('Rotas carregadas: /auth e /order');
        });
    } catch (error) {
        console.error('Erro fatal:', error);
    }
};

start();