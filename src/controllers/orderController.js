const pool = require('../database/db');
const OrderModel = require('../models/OrderModel');
const ItemModel = require('../models/ItemModel');
const mapOrderData = require('../utils/orderMapper');

module.exports = {
    async createOrder(req, res) {
        const client = await pool.connect();
        try {
            const data = mapOrderData(req.body);
            await client.query('BEGIN');
            
            const newOrder = await OrderModel.create(client, data);
            
            for (const item of data.items) {
                await ItemModel.create(client, { ...item, orderId: data.orderId });
            }

            await client.query('COMMIT');
            return res.status(201).json({ ...newOrder, items: data.items });

        } catch (e) {
            await client.query('ROLLBACK');

            if (e.code === '23505') {
                return res.status(409).json({ 
                    error: 'Pedido duplicado', 
                    message: `O pedido com número '${req.body.numeroPedido}' já existe no sistema.` 
                });
            }
            
            return res.status(400).json({ error: 'Erro ao criar pedido', details: e.message });
        } finally { 
            client.release(); 
        }
    },

    async listOrders(req, res) {
        try {
            // Join simples para listar
            const result = await pool.query(`
                SELECT o.*, i."productId", i.quantity, i.price 
                FROM "Order" o LEFT JOIN "Items" i ON o."orderId" = i."orderId"
            `);
            // Aqui você aplicaria o agrupamento se quisesse, retornando raw por enquanto para teste
            return res.json(result.rows); 
        } catch (e) { return res.status(500).json({ error: e.message }); }
    },

    async getOrderById(req, res) {
        try {
            const order = await OrderModel.findById(req.params.id);
            if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
            const items = await ItemModel.findByOrderId(req.params.id);
            return res.json({ ...order, items });
        } catch (e) { return res.status(500).json({ error: e.message }); }
    },

    async updateOrder(req, res) {
        const client = await pool.connect();
        try {
            const { id } = req.params;
            const data = mapOrderData(req.body);

            if (!await OrderModel.findById(id)) return res.status(404).json({ error: 'Pedido não existe' });

            await client.query('BEGIN');
            await OrderModel.update(client, id, data);
            await ItemModel.deleteAllByOrderId(client, id);
            for (const item of data.items) {
                await ItemModel.create(client, { ...item, orderId: id });
            }
            await client.query('COMMIT');

            // Retorna dados atualizados
            const updated = await OrderModel.findById(id);
            const items = await ItemModel.findByOrderId(id);
            return res.json({ ...updated, items });
        } catch (e) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: e.message });
        } finally { client.release(); }
    },

    async deleteOrder(req, res) {
        try {
            const deleted = await OrderModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Pedido não encontrado' });
            return res.json({ message: 'Deletado com sucesso' });
        } catch (e) { return res.status(500).json({ error: e.message }); }
    }
};